# Authentication API

## Overview

Mage.space uses Firebase Authentication. The library needs a **refresh token** to operate autonomously. All other tokens are derived from it.

## Token Chain

```
Refresh Token (permanent, from browser)
    → ID Token (1h, via Firebase REST API)
        → Session Cookie (24h, via createUserSession action)
```

## Step 1: Exchange Refresh Token for ID Token

**Endpoint:** `POST https://securetoken.googleapis.com/v1/token?key=AIzaSyAzUV2NNUOlLTL04jwmUw9oLhjteuv6Qr4`

```
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=<MAGE_REFRESH_TOKEN>
```

**Response:**
```json
{
  "id_token": "<jwt>",
  "refresh_token": "<new_refresh_token>",
  "user_id": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
  "expires_in": "3600"
}
```

**Notes:**
- Firebase API key: `AIzaSyAzUV2NNUOlLTL04jwmUw9oLhjteuv6Qr4`
- Project: `magedotspace`
- The `id_token` is a standard Firebase JWT (issuer: `https://securetoken.google.com/magedotspace`)
- Refresh 5 minutes before expiry (`exp` claim - 300s)

## Step 2: Create Session Cookie

**Action Hash:** `60fa7da54d8662813645f7077455339d23096f391c`
**Function:** `createUserSession`

```
POST https://www.mage.space/creations
accept: text/x-component
content-type: text/plain;charset=UTF-8
next-action: 60fa7da54d8662813645f7077455339d23096f391c
x-deployment-id: <deployment_id>
```

**Request Body:**
```json
["<id_token>"]
```

**Response Headers:**
```
Set-Cookie: __session=<session_jwt>; Path=/; ...
```

**Response Body:** RSC re-render (ignore).

**Notes:**
- The session cookie is a Firebase Session JWT (issuer: `https://session.firebase.google.com/magedotspace`)
- Duration: ~24h (check `exp` claim)
- The cookie is `HttpOnly` — extract from `Set-Cookie` response header
- Refresh 5 minutes before expiry

## Step 3: Use Tokens in API Calls

All generation/write operations need:
1. `Cookie: __session=<session_cookie>` header
2. `authToken: <id_token>` in the request body

Read-only operations (like `getMentionSuggestionsParallel`) only need the `uid` in the body.

## Getting the Refresh Token

The refresh token must be extracted manually from a browser session:

1. Log into mage.space in Chrome
2. Open DevTools → Application → IndexedDB → `firebaseLocalStorageDb` → `firebaseLocalStorage`
3. Find the entry with key `firebase:authUser:AIzaSyAzUV2NNUOlLTL04jwmUw9oLhjteuv6Qr4:[DEFAULT]`
4. Copy `value.stsTokenManager.refreshToken`

The refresh token does not expire (unless revoked or account is deleted).

## Error Handling

| Error | Meaning |
|-------|---------|
| Token refresh returns 400 | Refresh token is invalid/revoked |
| `createUserSession` clears cookie | ID token validation failed on server |
| `error_code: 401` in generation | authToken expired — need refresh |
| `error_code: 400` in generation | Wrong `generationMode` for user's tier |

## User Tier Detection

After creating the session, call `getUserHydrationData`:

**Action Hash:** `40314a83b96c226af04a264d1e076a06dbf3cc73b2`

```json
[{"recentCharacterIds": []}]
```

Response includes `userMembership` field:
- `"free"` → use `generationMode: "play"`
- `"pro"` → use `generationMode: "unlimited"` (limited models)
- `"pro_plus"` → use `generationMode: "unlimited"` (all models)
- `"max"` → use `generationMode: "unlimited"` (all models + video)
