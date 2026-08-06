import { chromium } from 'playwright';

const REFRESH_TOKEN = 'AMf-vByr3Bz4Y_UGGU-jSKApa648yTRjY7N8BBaCDtcdkK1ihTSX9BGrYoQqY2aXB2VghQOVjCROugSg1MlebDvvm8cRHro-xbzTy6OkynHjVoZcZLc8cgm5qvRD4Ixk7OlJeXLkeS6Ma_jQrkc1jUYi95LCYocLGq-cM5u2Y5dGUZ3IuF7cMC3BWzEUQQ_yxb21-bodRkqfD8YgIfgn2Ma0WS2I6kgiMFsxWbVHy8JP2mGNZsjUPa-Lseu7zHZEqW_Xe1W6eweGO5tymCtqzmkuE-oqTZo7hx4YBoXtC0cIJPpYdWjSKevgN4szP_YFw3Z9MIFMECkizHqJEemf_2FD7oj-oaoUXzMqDDXB8taII_U9QiEzhI9Oym3ZXIeUU-E1tcmNG4uZ3WyOZqOSDcKDrjv7wY5u_OogP9EM8re_StcqRyLlMpkkOALfQmawJAIYhp14LMBt';

async function main() {
  console.log('Launching headed browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Step 1: Get ID token
  console.log('Getting ID token...');
  const tokenResp = await context.request.post('https://securetoken.googleapis.com/v1/token?key=AIzaSyAzUV2NNUOlLTL04jwmUw9oLhjteuv6Qr4', {
    form: { grant_type: 'refresh_token', refresh_token: REFRESH_TOKEN }
  });
  const { id_token: idToken } = await tokenResp.json();
  console.log('Got ID token, length:', idToken.length);

  // Step 2: Create session cookie
  console.log('Creating session...');
  const sessionResp = await context.request.post('https://www.mage.space/creations', {
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
      'Accept': 'text/x-component',
      'next-action': '60fa7da54d8662813645f7077455339d23096f391c',
      'x-deployment-id': 'dpl_GLUqzVNVADQR5wogKksDvu1m3BdH',
      'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D'
    },
    data: JSON.stringify([idToken, undefined])
  });
  const setCookie = sessionResp.headers()['set-cookie'];
  const cookieValue = setCookie.split(';')[0].replace('__session=', '');
  console.log('Session cookie obtained, length:', cookieValue.length);

  // Set cookie in browser context
  await context.addCookies([{
    name: '__session',
    value: cookieValue,
    domain: '.mage.space',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  }]);

  // Inject Firebase auth into IndexedDB
  await page.goto('https://www.mage.space');
  await page.evaluate(({ idToken, refreshToken }) => {
    return new Promise((resolve) => {
      const request = indexedDB.open('firebaseLocalStorageDb');
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('firebaseLocalStorage', 'readwrite');
        const store = tx.objectStore('firebaseLocalStorage');
        store.put({
          fbase_key: 'firebase:authUser:AIzaSyAzUV2NNUOlLTL04jwmUw9oLhjteuv6Qr4:[DEFAULT]',
          value: {
            uid: 'r7gvVxS5NCeTiajvYiRRsNO0hiW2',
            email: 'n.olivieriachille@gmail.com',
            emailVerified: true,
            isAnonymous: false,
            providerData: [{ providerId: 'google.com', uid: '107616614450831697950', email: 'n.olivieriachille@gmail.com' }],
            apiKey: 'AIzaSyAzUV2NNUOlLTL04jwmUw9oLhjteuv6Qr4',
            appName: '[DEFAULT]',
            stsTokenManager: { refreshToken, accessToken: idToken, expirationTime: Date.now() + 3600000 },
            lastLoginAt: String(Date.now()),
            createdAt: '1716000000000'
          }
        });
        tx.oncomplete = () => resolve('done');
      };
    });
  }, { idToken, refreshToken: REFRESH_TOKEN });

  // Step 3: Set up network interception for generation requests
  const capturedRequests = [];
  page.on('request', (req) => {
    if (req.url().includes('/creations') && req.method() === 'POST') {
      const headers = req.headers();
      if (headers['next-action'] === '402c09c1b4694e5bb273a949a41a2f36ca82eff394') {
        console.log('\n=== CAPTURED runArchitecture REQUEST ===');
        console.log('Headers:', JSON.stringify(headers, null, 2));
        console.log('Body:', req.postData());
        capturedRequests.push({ headers, body: req.postData() });
      }
    }
  });

  page.on('response', async (resp) => {
    if (resp.url().includes('/creations') && resp.request().method() === 'POST') {
      const headers = resp.request().headers();
      if (headers['next-action'] === '402c09c1b4694e5bb273a949a41a2f36ca82eff394') {
        const body = await resp.text();
        console.log('\n=== CAPTURED runArchitecture RESPONSE ===');
        console.log('Status:', resp.status());
        console.log('Body:', body.substring(0, 500));
      }
    }
  });

  // Step 4: Navigate to generation page
  console.log('\nNavigating to generation page...');
  await page.goto('https://www.mage.space/play/mango-v3-pro-aLoo0cd8c7ed2e554d0f98f20c8cf8c0f7c');
  
  console.log('\n>>> The browser is now open. Please:');
  console.log('>>> 1. Wait for the page to load fully (might take 10-15s for App Check)');
  console.log('>>> 2. Type a simple prompt (e.g. "a red apple")');
  console.log('>>> 3. Click Generate');
  console.log('>>> The script will capture the request automatically.');
  console.log('>>> Press Ctrl+C when done.\n');

  // Wait for user to interact (up to 5 minutes)
  await new Promise(resolve => setTimeout(resolve, 300000));
  
  if (capturedRequests.length > 0) {
    const fs = await import('fs');
    fs.writeFileSync('/tmp/mage-generation-capture.json', JSON.stringify(capturedRequests, null, 2));
    console.log('\nSaved captured requests to /tmp/mage-generation-capture.json');
  }

  await browser.close();
}

main().catch(console.error);
