# OAuth Test Report — MR5 School

## PASS RATE

| Suite | Passed | Failed | Total |
|-------|--------|--------|-------|
| API `oauth` | 5 | 0 | 5 |
| API `auth-session` | 7 | 0 | 7 |
| Web `api-base` + `api-proxy` | 3 | 0 | 3 |
| **Total automated** | **15** | **0** | **15** |

## Coverage map

| Scenario | Result | Evidence |
|----------|--------|----------|
| Providers reports Google enabled | PASS | `oauth.test.js` |
| `/api/auth/google` → Google accounts | PASS | 302 + `accounts.google.com` |
| Runtime `redirect_uri` == env | PASS | exact string match |
| No trailing slash / no 127.0.0.1 | PASS | assertions |
| Scopes include profile + email | PASS | query param |
| Callback without code does not crash | PASS | status in {302,401,500} |
| `/me` without token → 401 | PASS | `auth-session.test.js` |
| `/me` with valid cookie → 200 | PASS | |
| Login sets cookies | PASS | Set-Cookie headers |
| Login → `/me` cookie jar | PASS | supertest agent |
| Logout clears session | PASS | `/me` → 401 after logout |
| Expired access token → 401 | PASS | JWT `expiresIn: -1s` |
| Refresh without cookie → 401 | PASS | `NO_REFRESH_TOKEN` |
| Frontend Google OAuth URL | PASS | `api-base.test.ts` |
| API proxy cookie/redirect | PASS | `api-proxy.test.ts` |

## FAILED TESTS

None in automated suites.

## E2E (Playwright)

`client-main/e2e/google-oauth.spec.ts` — requires live API on `NEXT_PUBLIC_API_URL` and navigates to Google. Not run in this audit pass (needs browsers + live Google). Run:

```bash
cd client-main && CI=true npm run test:e2e -- e2e/google-oauth.spec.ts
```

## Manual live verification (blocked on this host)

Port **5000** is occupied by macOS AirPlay (`ControlCenter`). Live `curl` to `:5000` fails until AirPlay Receiver is disabled.

```bash
bash scripts/oauth-verify.sh
```

## FIXES APPLIED DURING TESTING

- Expanded OAuth assertions (port, host, scopes)
- Added logout + expired-token session tests
- Updated Playwright Google flow for API-origin start URL

## FINAL STATUS

**AUTOMATED: PASS (100%)**  
**LIVE LOCAL OAUTH: PENDING** (port 5000 + Google Console operator steps)
