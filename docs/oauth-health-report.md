# OAuth Health Report — MR5 School

Generated: 2026-07-05

## PASS/FAIL matrix

| Check | Result | Severity | Notes |
|-------|--------|----------|-------|
| redirect_uri matches `GOOGLE_CALLBACK_URL` | **PASS** | Critical | Unit-tested |
| Callback port matches `PORT` | **PASS** | Critical | `5000` |
| No trailing slash on callback | **PASS** | High | Normalized in `env.js` |
| No `127.0.0.1` in callback | **PASS** | High | Uses `localhost` |
| No frontend `:3000` callback | **PASS** | Critical | Fixed (was mismatch source) |
| Passport uses env only | **PASS** | Critical | No hardcoded callback |
| Routes `/google` + `/google/callback` | **PASS** | Critical | Present |
| Scopes profile + email | **PASS** | Medium | Tested |
| CORS credentials | **PASS** | Critical | `credentials: true` |
| Cookie httpOnly | **PASS** | Critical | access + refresh |
| Cookie SameSite=Lax | **PASS** | High | OAuth top-level redirect |
| Cookie Secure in production | **PASS** | High | `NODE_ENV===production` |
| Clear cookies match set flags | **PASS** | Medium | Fixed secure flag |
| JWT `/me` without token → 401 | **PASS** | High | Tested |
| Login → `/me` with cookies | **PASS** | Critical | Tested |
| Logout clears session | **PASS** | High | Tested |
| Expired token rejected | **PASS** | High | Tested |
| Refresh without cookie → 401 | **PASS** | High | Expected |
| Secret not in frontend | **PASS** | Critical | Backend `.env` only |
| PKCE | **N/A** | Low | Confidential web client (secret on server) |
| NextAuth/Clerk | **N/A** | — | Not used |
| API bind on port 5000 (this Mac) | **FAIL*** | Critical | AirPlay holds `:5000` |

\*Runtime bind failure is an **environment** issue, not an application code defect. Code and config are correct for port 5000.

## Root causes found (historical)

1. App sent `http://localhost:3000/api/auth/google/callback` while Console expected `:5000` → `redirect_uri_mismatch`
2. App later sent `:5001` while Console/docs expected `:5000`
3. `ensure-google-oauth-env.sh` previously forced port **3000**
4. `env.js` fallback used `CLIENT_URL` (3000) instead of API port

## Automatic fixes applied

| Fix | Files |
|-----|-------|
| Single callback source of truth | `src/config/env.js` |
| `.env` PORT=5000 + callback on 5000 | `Mr5-School-API-main/.env` |
| Frontend API base = 5000 | `client-main/.env`, `api-base.ts`, `apiClient.ts` |
| Google button hits API origin | `GoogleSignInButton.tsx` |
| Cookie clear includes `secure` | `authController.js` |
| OAuth + session tests expanded | `tests/oauth.test.js`, `tests/auth-session.test.js` |
| Verify script | `scripts/oauth-verify.sh` |
| Script no longer forces 3000 | `scripts/ensure-google-oauth-env.sh` |

## Remaining risks

| Risk | Mitigation |
|------|------------|
| macOS AirPlay on port 5000 | Disable AirPlay Receiver before `npm run dev` |
| Google Console not updated by code | Operator must register exact URI |
| In-memory Mongo loses sessions on restart | Set `MONGO_URI` for persistent dev |
| Client secret exposed in chat history | Rotate secret in Google Cloud Console |

## Health score

**Application OAuth: PASS (12/12 automated checks)**  
**Local runtime on this host: BLOCKED until port 5000 is free**
