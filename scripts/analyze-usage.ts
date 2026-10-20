/**
 * Usage analysis: count how many generations the authenticated account made,
 * grouped by month, architecture/model and resolution, then estimate what the
 * same volume would cost on the pay-per-generation Gems API.
 *
 * It only READS history (getHistoryPaginated). It never creates or deletes
 * anything.
 *
 * Run:
 *   set -a; . ./.env; set +a; npx tsx scripts/analyze-usage.ts
 *
 * Optional env:
 *   MAGE_REFRESH_TOKEN  (required) Firebase refresh token.
 *   USAGE_MAX_PAGES     cap on pages fetched (default 500; 500 * 50 = 25k items).
 *   USAGE_PAGE_SIZE     items per page (default 50).
 */
import { MageSpaceClient } from '../lib/index.js';
import type { HistoryItem } from '../lib/types.js';

/**
 * Default-settings Gems price per generation, keyed by architecture.
 * Source: https://www.mage.space/developers/models/* (checked 2026-10).
 * Only the architectures we are likely to find are listed; anything unknown
 * falls back to the Mango price with a flag in the report.
 */
const GEMS_PRICE_BY_ARCHITECTURE: Record<string, number> = {
  mango: 135, // Mango 3, default settings — https://www.mage.space/developers/models/mango
  flux2: 40, // Flux 2, default — https://www.mage.space/developers/models/flux-2
  nanoBananaV2: 51, // Nano Banana 2, "from 51 Gems"
};
const FALLBACK_GEMS_PRICE = 135;

/** USD per Gem on the cheapest (largest) purchased pack: 100k+10k bonus for $100. */
const USD_PER_GEM_BEST = 100 / 110_000; // ≈ $0.000909
/** USD per Gem on the standard pack: 10k for $10. */
const USD_PER_GEM_STANDARD = 10 / 10_000; // $0.001

const PRO_PLUS_MONTHLY_USD = 60;

interface Bucket {
  count: number;
  gems: number;
}

function monthKey(iso: string | undefined): string {
  if (!iso) return 'unknown';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function archOf(item: HistoryItem): string {
  return item.architecture ?? item.architecture_config?.architecture ?? 'unknown';
}

function resolutionOf(item: HistoryItem): string {
  return item.architecture_config?.resolution ?? 'default';
}

function gemsFor(item: HistoryItem): { gems: number; known: boolean } {
  const arch = archOf(item);
  const price = GEMS_PRICE_BY_ARCHITECTURE[arch];
  return price !== undefined
    ? { gems: price, known: true }
    : { gems: FALLBACK_GEMS_PRICE, known: false };
}

async function main(): Promise<void> {
  const refreshToken = process.env.MAGE_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error('MAGE_REFRESH_TOKEN is not set. Run: set -a; . ./.env; set +a');
  }
  const pageSize = Number(process.env.USAGE_PAGE_SIZE ?? 50);
  const maxPages = Number(process.env.USAGE_MAX_PAGES ?? 500);

  const client = new MageSpaceClient({ refreshToken });

  // Action hashes change on every Vercel deploy; the bundled seed may be stale.
  // Force a live re-discovery before we start so createUserSession uses fresh hashes.
  console.log('Discovering current Server Action hashes...');
  try {
    const snap = await client.refreshActions();
    console.log(`  deployment: ${snap.deploymentId || '(unknown)'}\n`);
  } catch (err) {
    console.log(`  discovery warning: ${(err as Error).message}\n`);
  }

  console.log('Fetching generation history (this reads only, never deletes)...\n');

  const items: HistoryItem[] = [];
  let offset = 0;
  for (let page = 0; page < maxPages; page++) {
    const res = await client.listHistory({ limit: pageSize, offset, status: 'all' });
    items.push(...res.histories);
    process.stdout.write(`\r  fetched ${items.length} items...`);
    if (!res.hasMore || res.histories.length === 0) break;
    offset += res.histories.length;
  }
  process.stdout.write('\n\n');

  if (items.length === 0) {
    console.log('No history items found.');
    return;
  }

  // --- Aggregations ---------------------------------------------------------
  const byMonth = new Map<string, Bucket>();
  const byArch = new Map<string, Bucket>();
  const byResolution = new Map<string, number>();
  const byStatus = new Map<string, number>();
  let unknownPriced = 0;

  for (const item of items) {
    const { gems, known } = gemsFor(item);
    if (!known) unknownPriced++;

    const m = monthKey(item.created_at);
    const mb = byMonth.get(m) ?? { count: 0, gems: 0 };
    mb.count++;
    mb.gems += gems;
    byMonth.set(m, mb);

    const a = archOf(item);
    const ab = byArch.get(a) ?? { count: 0, gems: 0 };
    ab.count++;
    ab.gems += gems;
    byArch.set(a, ab);

    const r = resolutionOf(item);
    byResolution.set(r, (byResolution.get(r) ?? 0) + 1);

    const s = String(item.status ?? 'unknown');
    byStatus.set(s, (byStatus.get(s) ?? 0) + 1);
  }

  const months = [...byMonth.keys()].filter((m) => m !== 'unknown').sort();
  const firstMonth = months[0];
  const lastMonth = months.at(-1);

  // Monthly figures are projected from the OBSERVED day span, not divided by the
  // number of distinct calendar months. History is capped around 600 items / ~30
  // days of retention, so dividing by month count under-counts when the data only
  // covers part of two calendar months. A days-based rate scaled to 30 days is the
  // honest monthly figure. Undated items are excluded from the span and the rate.
  let datedCount = 0;
  let datedGems = 0;
  let oldest = Number.POSITIVE_INFINITY;
  let newest = Number.NEGATIVE_INFINITY;
  for (const item of items) {
    if (!item.created_at) continue;
    const t = new Date(item.created_at).getTime();
    if (Number.isNaN(t)) continue;
    datedCount++;
    datedGems += gemsFor(item).gems;
    if (t < oldest) oldest = t;
    if (t > newest) newest = t;
  }
  const noDateBucket = byMonth.get('unknown');
  const noDateCount = noDateBucket?.count ?? 0;
  const spanDays = datedCount > 0 ? (newest - oldest) / 86_400_000 : 0;
  const gensPerDay = spanDays > 0 ? datedCount / spanDays : 0;
  const avgPerMonth = spanDays > 0 ? gensPerDay * 30 : datedCount;
  const avgGemsPerMonth = spanDays > 0 ? (datedGems / spanDays) * 30 : datedGems;

  // --- Report ---------------------------------------------------------------
  const fmt = (n: number) => n.toLocaleString('en-US');
  const usd = (n: number) => `$${n.toFixed(2)}`;

  console.log('='.repeat(64));
  console.log('  MAGE.SPACE USAGE ANALYSIS');
  console.log('='.repeat(64));
  console.log(`Total generations analyzed : ${fmt(items.length)}`);
  console.log(`  with a valid date        : ${fmt(datedCount)}`);
  console.log(`  without a date           : ${fmt(noDateCount)}`);
  console.log(`Date range                 : ${firstMonth ?? '?'} → ${lastMonth ?? '?'}`);
  console.log(`Months covered             : ${months.length}`);
  console.log(`Observed span (dated)      : ${spanDays.toFixed(1)} days`);
  console.log(`Observed rate              : ${gensPerDay.toFixed(1)} gens/day`);
  console.log('');

  console.log('Per month:');
  console.log('  month      count     gems (est.)');
  for (const m of months) {
    const b = byMonth.get(m) as Bucket;
    console.log(`  ${m}   ${String(b.count).padStart(6)}   ${fmt(b.gems).padStart(10)}`);
  }
  if (byMonth.has('unknown')) {
    const b = byMonth.get('unknown') as Bucket;
    console.log(`  (no date) ${String(b.count).padStart(6)}   ${fmt(b.gems).padStart(10)}`);
  }
  console.log('');

  console.log('By architecture:');
  for (const [a, b] of [...byArch.entries()].sort((x, y) => y[1].count - x[1].count)) {
    const price = GEMS_PRICE_BY_ARCHITECTURE[a];
    const priceLabel =
      price !== undefined ? `${price} gems/gen` : `? (assumed ${FALLBACK_GEMS_PRICE})`;
    console.log(`  ${a.padEnd(16)} ${String(b.count).padStart(6)}   (${priceLabel})`);
  }
  console.log('');

  console.log('By resolution:');
  for (const [r, c] of [...byResolution.entries()].sort((x, y) => y[1] - x[1])) {
    console.log(`  ${r.padEnd(10)} ${String(c).padStart(6)}`);
  }
  console.log('');

  console.log('By status:');
  for (const [s, c] of [...byStatus.entries()].sort((x, y) => y[1] - x[1])) {
    console.log(`  ${s.padEnd(10)} ${String(c).padStart(6)}`);
  }
  console.log('');

  console.log('='.repeat(64));
  console.log('  COST SIMULATION — if these generations were paid in Gems');
  console.log('='.repeat(64));
  if (unknownPriced > 0) {
    console.log(
      `Note: ${unknownPriced} items had an unknown architecture and were priced at ${FALLBACK_GEMS_PRICE} gems (Mango).`,
    );
  }
  console.log(
    `Average generations / month : ${avgPerMonth.toFixed(0)}  (${gensPerDay.toFixed(1)} gens/day × 30, from the observed span)`,
  );
  console.log(`Average gems / month (est.) : ${fmt(Math.round(avgGemsPerMonth))}`);
  console.log('');
  const usdBest = avgGemsPerMonth * USD_PER_GEM_BEST;
  const usdStd = avgGemsPerMonth * USD_PER_GEM_STANDARD;
  console.log(`Monthly API cost @ best pack  ($100/110k) : ${usd(usdBest)}`);
  console.log(`Monthly API cost @ standard   ($10/10k)   : ${usd(usdStd)}`);
  console.log('');
  console.log(`Your Pro Plus membership                  : ${usd(PRO_PLUS_MONTHLY_USD)}/month`);
  console.log(
    `  (includes 3,500 free gems ≈ ${Math.floor(3500 / FALLBACK_GEMS_PRICE)} Mango gens before extra cost)`,
  );
  console.log('');

  const breakEvenGens = Math.floor(PRO_PLUS_MONTHLY_USD / (FALLBACK_GEMS_PRICE * USD_PER_GEM_BEST));
  console.log(
    `Break-even (Mango @ best pack): ~${breakEvenGens} gens/month cost ${usd(PRO_PLUS_MONTHLY_USD)} in gems.`,
  );
  if (avgPerMonth > breakEvenGens) {
    const ratio = avgPerMonth / breakEvenGens;
    console.log(
      `\n  → You average ${avgPerMonth.toFixed(0)}/month, ~${ratio.toFixed(1)}x the break-even.`,
    );
    console.log('  → Unlimited scraping (Pro Plus) is MUCH cheaper than the Gems API for you.');
  } else {
    console.log(`\n  → You average ${avgPerMonth.toFixed(0)}/month, BELOW the break-even.`);
    console.log('  → The Gems API could be cheaper (and removes scraping fragility).');
  }
  console.log('='.repeat(64));
}

main().catch((err) => {
  console.error('\nAnalysis failed:', err);
  process.exit(1);
});
