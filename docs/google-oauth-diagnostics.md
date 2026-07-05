# Google OAuth Diagnostics — MR5 School

## Error under investigation

```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
```

Google request detail (from user browser):

```
redirect_uri=http://localhost:3000/api/auth/google/callback
```

That URI was **not** registered (or no longer matches current config).

## Environment variables (verified)

| Variable | Value | Role |
|----------|-------|------|
| `GOOGLE_CLIENT_ID` | `127586661756-…apps.googleusercontent.com` | Public client id |
| `GOOGLE_CLIENT_SECRET` | set (backend only) | Confidential |
| `GOOGLE_CALLBACK_URL` | `http://localhost:5000/api/auth/google/callback` | Passport `callbackURL` |
| `PORT` | `5000` | API listen port |
| `CLIENT_URL` | `http://localhost:3000` | Post-login browser redirect |
| `CORS_ORIGIN` | `http://localhost:3000` | CORS allowlist |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Frontend → API |
| `NEXTAUTH_URL` / `AUTH_URL` | **not used** | No NextAuth |

Runtime print:

```
GOOGLE CALLBACK: http://localhost:5000/api/auth/google/callback
PORT: 5000
```

## ROOT CAUSE

The application previously sent a **different** `redirect_uri` than Google Cloud Console authorized:

| Time | App sent | Console expected | Result |
|------|----------|------------------|--------|
| Earlier | `…:3000/…/callback` | `…:5000/…/callback` | **mismatch** |
| Interim | `…:5001/…/callback` | `…:5000/…/callback` | **mismatch** |
| Now (code) | `…:5000/…/callback` | must be `…:5000/…/callback` | **aligned** |

Google requires **character-exact** match. Port, host (`localhost` vs `127.0.0.1`), and trailing slash all count.

## FIX IMPLEMENTED

1. `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`
2. `PORT=5000`
3. Passport: `callbackURL: envConfig.GOOGLE_CALLBACK_URL` only
4. Frontend starts OAuth at `http://localhost:5000/api/auth/google`
5. Fallback callback uses API port, never frontend port
6. Unit test asserts runtime `redirect_uri` equals `http://localhost:${PORT}/api/auth/google/callback`

## URLS TO ADD TO GOOGLE CONSOLE

### AUTHORIZED JAVASCRIPT ORIGINS

```
http://localhost:3000
http://localhost:5000
```

### AUTHORIZED REDIRECT URIS

```
http://localhost:5000/api/auth/google/callback
```

**Remove** any of:

- `http://localhost:3000/api/auth/google/callback`
- `http://localhost:5001/api/auth/google/callback`
- `http://127.0.0.1:5000/api/auth/google/callback`

### Production (when deploying)

```
https://api.YOUR_DOMAIN/api/auth/google/callback
```

Origins:

```
https://app.YOUR_DOMAIN
https://YOUR_DOMAIN
```

## VERIFICATION STATUS

| Step | Status |
|------|--------|
| Code emits correct `redirect_uri` | **PASS** (unit tests) |
| Google Console updated by operator | **OPERATOR ACTION REQUIRED** |
| API listening on port 5000 | **FAIL on this Mac** (AirPlay) until Receiver is off |

### Operator checklist

1. [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) → OAuth client `127586661756-…`
2. Set redirect URI exactly as above → Save → wait ~60s
3. macOS: **System Settings → General → AirDrop & Handoff → AirPlay Receiver → Off**
4. `cd Mr5-School-API-main && npm run dev` → must log `GOOGLE CALLBACK: http://localhost:5000/...` and listen on **5000**
5. `bash scripts/oauth-verify.sh`
6. Open `http://localhost:3000/login` → Google
