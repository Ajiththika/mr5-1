# OAuth Security Audit — MR5 School

## Risk summary

| Area | Risk Level | Status |
|------|------------|--------|
| Client secret exposure to browser | Critical | **Mitigated** — backend only |
| redirect_uri_mismatch / open redirect | High | **Mitigated** — fixed URI + path-only post-auth redirects |
| Session cookies | Medium | **Mitigated** — httpOnly, SameSite=Lax, Secure in prod |
| JWT secret strength | Medium | Dev placeholder present — **must rotate in production** |
| CSRF on cookie auth | Medium | SameSite=Lax + same-site localhost ports; production needs HTTPS |
| Token in logs | Low | No secret logging; callback URL logged only |
| PKCE | Low | N/A for confidential server-side OAuth client |
| Refresh token rotation | Low | Implemented in `authService.refreshAccessToken` |

## OWASP-oriented checks

| Check | Result |
|-------|--------|
| CSRF | PASS for OAuth (top-level redirect). Cookie API uses SameSite=Lax |
| XSS token theft | PASS — httpOnly cookies, not `localStorage` |
| Token leakage | PASS — no tokens in frontend env |
| Secret exposure | PASS in code; **rotate** if secret was pasted in chat |
| Session fixation | PASS — new tokens issued on login/OAuth |
| Replay (refresh) | PASS — refresh tokens rotated/revoked |
| Open redirects | PASS — `getPostAuthRedirectPath` returns internal paths only |
| Cookie flags | PASS — httpOnly; secure in production; clear matches set |
| Weak JWT | WARN — replace `JWT_SECRET` in production (≥32 chars) |
| HTTPS enforcement | WARN — production must use HTTPS + Secure cookies |
| PKCE | N/A (server-side confidential client) |
| State parameter | PASS — passport-oauth2 generates/validates `state` |

## Security improvements applied

1. Callback URL never falls back to frontend origin
2. Cookie clear includes `secure` in production
3. Consent cookie cleared on logout
4. Guest-session guard reduces unauthenticated refresh spam
5. Auth middleware rejects missing/invalid/expired tokens with 401
6. OAuth verify script for pre-deploy checks

## Remaining recommendations

1. **Rotate `GOOGLE_CLIENT_SECRET`** if it appeared in chat or commits
2. Use AWS Secrets Manager / Vercel secrets in production (never commit `.env`)
3. Set `JWT_SECRET` to a unique ≥32 character value in production
4. Publish OAuth consent screen or restrict test users
5. Prefer persistent `MONGO_URI` so refresh tokens survive API restarts
6. Add rate limiting review on `/api/auth/google` (auth limiter already on password routes)

## Production readiness

| Criterion | Status |
|-----------|--------|
| Code security posture | **PASS** |
| Secrets management (ops) | **OPERATOR** |
| Live Google Console alignment | **OPERATOR** |

**Production Readiness (code): PASS with operator checklist**
