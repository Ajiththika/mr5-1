# 10 — Security Audit

---

## Authentication

### Status: GOOD (with caveats)

**Strengths:**
- JWT tokens stored in httpOnly cookies — not accessible to JavaScript, prevents XSS token theft
- Refresh token stored in MongoDB with revocation support
- bcrypt password hashing (10 rounds) — sufficient for production
- Rate limiting on auth endpoints: 10 attempts / 15 min in production
- `loginSecurityService` tracks failed attempts
- Session expiry detection on frontend

**Weaknesses:**
- No email verification on registration — anyone can register with any email
- `passport.deserializeUser` uses deprecated callback API (minor)
- No account lockout after N failed attempts (rate limiter limits rate but doesn't lock)
- Refresh token stored in DB but no automatic rotation on each use
- No MFA/2FA support

**Recommendation:**
- Implement email verification (HIGH priority)
- Add account lockout after 10 consecutive failures
- Implement refresh token rotation (issue new refresh token on each use, revoke old)

---

## Authorization (RBAC)

### Status: GOOD

**Strengths:**
- `verifyToken` middleware applied to all protected routes
- `requireRole()` middleware for role-based gating
- Power Admin Hub has fine-grained adminRole-based permissions
- `permissionMiddleware` per endpoint in admin hub

**Weaknesses:**
- Some admin endpoints may rely only on `role: admin` check without verifying `adminRole` sub-role
- `studentController.js` is empty — any routes using it have no authorization
- No audit trail on standard API calls (only admin actions go to ActivityLog)

**Recommendation:**
- Audit all admin routes to ensure both `verifyToken` AND `requireRole` are applied
- Add audit logging to sensitive student data access endpoints

---

## Secrets and Environment Variables

### Status: MODERATE RISK

**Strengths:**
- `.env` files in `.gitignore` — secrets not committed
- AWS Secrets Manager documented for production (`docs/AWS_SECRETS_MIGRATION.md`)
- `NEXT_PUBLIC_` prefix discipline — only safe values exposed to browser
- `lib/env.server.ts` — server-only env var access guard
- AI API keys are accessed server-side only (via Next.js API routes or Express)

**Weaknesses:**
- Backend `.env` file committed to the repo history (if MONGO_URI with credentials was ever in .env and committed)
- `GEMINI_API_KEY` appears in both backend `.env.example` and frontend `.env.example` — there's a risk of accidental exposure if not carefully handled
- No secret scanning CI step confirmed (`.pre-commit-config.yaml` has detect-secrets but not verified active)
- `JWT_EXPIRE=15m` is fine, but if `JWT_SECRET` is weak (less than 32 chars), tokens can be brute-forced

**Recommendation:**
- Run `git log --all --full-history -- '*.env'` to verify no secrets were ever committed
- Enforce minimum 64-char JWT_SECRET in production (`validateEnv()` should check length)
- Enable `gitleaks` in GitHub Actions CI (already in `deploy.yml` comment)

---

## Input Validation

### Status: MODERATE

**Strengths:**
- `express-mongo-sanitize` — strips `$` operators from all request inputs
- `xss` library available via `sanitizeInput()` helper
- Zod validation on auth registration/login
- `express.json({ limit: '10mb' })` — body size limit

**Weaknesses:**
- Not all endpoints use Zod or express-validator for input validation
- `sanitizeInput()` is a helper but must be called manually — not applied globally to all routes
- File upload endpoint (`/api/upload`) — need to verify file type validation (Cloudinary handles some, but MIME type spoofing is possible)
- Some endpoints accept freeform text without length limits (e.g., course descriptions)

**Recommendation:**
- Add global request validation middleware or ensure all routes validate with Zod
- Add file type whitelist validation to upload endpoints
- Add max length constraints to all text inputs at the API level

---

## OWASP Top 10 Assessment

### A01: Broken Access Control
**Risk:** MEDIUM
- Some endpoints may not properly check authorization
- `studentController.js` is empty — could expose unprotected routes
- Horizontal privilege escalation possible if student can access another student's data
**Mitigations in place:** verifyToken + requireRole on most routes

### A02: Cryptographic Failures
**Risk:** LOW-MEDIUM
- Passwords are bcrypt-hashed (good)
- JWT uses HS256 (acceptable, RS256 would be stronger)
- MongoDB connection string in env (not in code)
- HTTPS enforced via HSTS header in production
**Concern:** If JWT_SECRET is weak, HS256 tokens can be cracked

### A03: Injection
**Risk:** LOW
- `express-mongo-sanitize` prevents NoSQL injection
- `xss` library available for XSS prevention
- Parameterized queries via Mongoose (no raw MongoDB query construction)
**Remaining risk:** Manual `sanitizeInput()` calls are inconsistent

### A04: Insecure Design
**Risk:** LOW-MEDIUM
- Authentication flow is well-designed (httpOnly cookies, token rotation)
- No email verification is a design gap
- Legal consent is enforced by middleware

### A05: Security Misconfiguration
**Risk:** MEDIUM
- CSP allows `'unsafe-eval'` and `'unsafe-inline'` for scripts (React/Next.js requirement, hard to avoid)
- Helmet applied with custom CSP
- CORS allows all `*.vercel.app` — acceptable for preview deployments but broad

### A06: Vulnerable and Outdated Components
**Risk:** UNKNOWN
- Latest package versions used (npm audit recommended)
- `Trivy` container scan mentioned in CI/CD
**Action:** Run `npm audit` in both `client-main` and `Mr5-School-API-main`

### A07: Identification and Authentication Failures
**Risk:** MEDIUM
- Rate limiting on auth (good)
- No account lockout (gap)
- No email verification (gap)
- No MFA (gap for high-value accounts like admins)

### A08: Software and Data Integrity Failures
**Risk:** LOW
- Stripe webhook signature verification (good)
- Certificate verification hash (SHA-256, good)
- No npm lockfile integrity violations expected

### A09: Security Logging and Monitoring Failures
**Risk:** MEDIUM
- Winston logger configured
- ActivityLog for admin actions
- No centralized log aggregation confirmed
- No alerting on suspicious activity (brute force spikes, etc.)

### A10: Server-Side Request Forgery (SSRF)
**Risk:** LOW
- No user-supplied URLs are fetched server-side
- Cloudinary URLs are from trusted source
- Weather API uses env-configured endpoint only

---

## Production Security Checklist

| Item | Status | Notes |
|------|--------|-------|
| HTTPS enforced | Via Vercel + ALB | Good |
| HSTS header | Set by Helmet | Good |
| httpOnly JWT cookies | Implemented | Good |
| CORS whitelist | Dynamic *.vercel.app | Acceptable |
| Rate limiting | 100 req/15min | Good |
| MongoDB sanitization | Applied | Good |
| XSS protection | Partial (manual calls) | Needs improvement |
| Helmet CSP | Applied with exceptions | Acceptable |
| Email verification | Missing | HIGH risk |
| MFA for admins | Missing | Medium risk |
| Account lockout | Missing | Medium risk |
| Dependency audit | Not run in analysis | Run before deploy |
| Secret scanning | Pre-commit hook | Verify active |
| Stripe webhook signature | Implemented | Good |
| Certificate hash verification | SHA-256 | Good |
| File upload validation | Partial | Needs review |

---

## Environment Variable Security

### Never expose these in browser/logs:
- `JWT_SECRET`
- `MONGO_URI` (contains credentials)
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_API_SECRET`
- `GEMINI_API_KEY` / `OPENAI_API_KEY`
- `AZURE_SPEECH_KEY`
- `LIVEKIT_API_SECRET`
- Email credentials (`SMTP_PASS`, `EMAIL_PASS`)

### Safe to expose (NEXT_PUBLIC_):
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_LIVEKIT_URL`
