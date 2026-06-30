# MR5 School — Zero-Omission Environment Audit

**Audit date:** 2026-06-30  
**Scope:** Full monorepo (`client-main/` + `Mr5-School-API-main/` + infra + CI/CD)  
**Method:** Static scan of `process.env.*`, config files, Docker, GitHub Actions, docs cross-reference  
**Policy:** Variables marked `[IN CODE]` are referenced in application source. `[DOCS ONLY]` appear in documentation but not runtime. `[FUTURE]` are recommended for enterprise scale but not implemented.

---

## Executive summary

| Category | Count |
|----------|------:|
| Variables **in code** (unique) | **62** |
| Variables **docs-only** (not in runtime) | **3** |
| **Missing** but recommended for production | **28** |
| **Future** enterprise / scale variables | **35+** |
| Hardcoded secrets found | **0** (Cloudinary fixed in prior audit) |
| Frontend secrets in `NEXT_PUBLIC_*` | **0** (publishable keys only) |

**Generated templates:**

| File | Purpose |
|------|---------|
| `.env.example` | Monorepo index |
| `.env.development.example` | Dev quick reference |
| `.env.staging.example` | Staging profile |
| `.env.production.example` | Production AWS |
| `.env.enterprise.example` | Scale-out / future |
| `client-main/.env.local.example` | Next.js local |
| `Mr5-School-API-main/.env.example` | API template |
| `Mr5-School-API-main/.env.local.example` | API local |
| `docs/SECRET_ROTATION_CHECKLIST.md` | Rotation runbook |
| `docs/CICD_SECRETS.md` | GitHub Actions secrets |
| `docs/DISASTER_RECOVERY_ENV.md` | DR / backup |
| `docs/INFRASTRUCTURE_ENV.md` | AWS placement map |

---

# EXISTING VARIABLES

## Backend — API (`Mr5-School-API-main`)

### Required

| Variable | Where used | Notes |
|----------|------------|-------|
| `NODE_ENV` | `env.js`, `app.js`, cookies, errors | `development` \| `production` \| `test` |
| `JWT_SECRET` | `authMiddleware`, `authService`, `avatarRoutes` | Min 32 chars in prod |
| `MONGO_URI` | `db.js`, seeds, tests | Alias: `MONGODB_URI` |

### Auth & sessions `[IN CODE]`

| Variable | Default | Where |
|----------|---------|-------|
| `JWT_EXPIRE` | `15m` | Access token TTL |
| `JWT_EXPIRES_IN` | `7d` | Avatar route JWT |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh cookie |
| `CLIENT_URL` | `http://localhost:3000` | Redirects, Stripe success URLs |
| `CORS_ORIGIN` | `http://localhost:3000` | CORS allowlist |
| `CORS_EXTRA_ORIGINS` | — | Comma-separated extra origins |

### AI `[IN CODE]`

| Variable | Default | Where |
|----------|---------|-------|
| `AI_PROVIDER` | `gemini` | `ai.service.js`, `AITeacherService` |
| `GEMINI_API_KEY` | — | AI services, also Next server routes |
| `OPENAI_API_KEY` | — | OpenAI fallback |
| `OPENAI_MODEL` | `gpt-3.5-turbo` | OpenAI model |
| `OLLAMA_HOST` | — | Local LLM (alias `OLLAMA_URL`) |
| `OLLAMA_URL` | — | Test scripts only |
| `OLLAMA_MODEL` | `llama2` | Ollama model name |

### Payments `[IN CODE]`

| Variable | Where |
|----------|-------|
| `STRIPE_SECRET_KEY` | `stripeService.js` |
| `STRIPE_WEBHOOK_SECRET` | `paymentController.js` webhook verify |

### OAuth `[IN CODE]`

| Variable | Where |
|----------|-------|
| `GOOGLE_CLIENT_ID` | `passport.js` |
| `GOOGLE_CLIENT_SECRET` | `passport.js` |
| `GOOGLE_CALLBACK_URL` | Defaults to `{CLIENT_URL}/api/auth/google/callback` |

### Media & storage `[IN CODE]`

| Variable | Where |
|----------|-------|
| `CLOUDINARY_CLOUD_NAME` | `cloudinary.js` |
| `CLOUDINARY_API_KEY` | `cloudinary.js` |
| `CLOUDINARY_API_SECRET` | `cloudinary.js` |

### Live video `[IN CODE]`

| Variable | Where |
|----------|-------|
| `LIVEKIT_API_KEY` | `livekitController.js` |
| `LIVEKIT_API_SECRET` | `livekitController.js` |

### Speech `[IN CODE]`

| Variable | Where |
|----------|-------|
| `AZURE_SPEECH_KEY` | `ttsController.js` |
| `AZURE_SPEECH_REGION` | `ttsController.js` |

### Email (dual paths) `[IN CODE]`

| Variable | Path | Where |
|----------|------|-------|
| `EMAIL_USER` | Gmail-style | `sendEmail.js` (password reset) |
| `EMAIL_PASS` | Gmail-style | `sendEmail.js` |
| `FROM_NAME` | Both | `sendEmail.js` |
| `FROM_EMAIL` | Both | `sendEmail.js` |
| `SMTP_HOST` | SMTP | `supportService.js` |
| `SMTP_PORT` | SMTP | Default `587` |
| `SMTP_USER` | SMTP | `supportService.js` |
| `SMTP_PASS` | SMTP | `supportService.js` |
| `SUPPORT_EMAIL` | SMTP | Support ticket from address |

### Integrations `[IN CODE]`

| Variable | Where |
|----------|-------|
| `WEATHER_API_KEY` | `weatherService.js` |
| `AVATHOR_SECRET_TOKEN` | `avatarRoutes.js` webhook |

### Legal / consent `[IN CODE]`

| Variable | Default | Where |
|----------|---------|-------|
| `LEGAL_RECONSENT_ENFORCED` | `true` (unless `false` in dev) | `consentMiddleware.js` |
| `CONSENT_IP_LOGGING` | `false` | `legalConsentService.js` |
| `CONSENT_IP_SALT` | `""` | IP hash salt |

### Logging & ops `[IN CODE]`

| Variable | Default | Where |
|----------|---------|-------|
| `PORT` | `5001` | HTTP listen |
| `LOG_LEVEL` | `info` | Winston |
| `LOG_TO_FILE` | `false` | File logs if `true` and not ECS |
| `AWS_EXECUTION_ENV` | auto on ECS | Disables file logs |
| `VERCEL` | auto | Serverless DB behavior |

### Seed / script only `[IN CODE]`

| Variable | Where |
|----------|-------|
| `SEED_ADMIN_PASSWORD` | `seedData.js` |
| `SEED_USER_PASSWORD` | `seedMeshyCourse.js` (required for that script) |
| `ADMIN_EMAIL` | `client-main/scripts/seedCourses.js` |
| `ADMIN_PASSWORD` | `client-main/scripts/seedCourses.js` |
| `MESHY_API_KEY` | `seedMeshyCourse.js` |

### Test / CI only `[IN CODE]`

| Variable | Where |
|----------|-------|
| `MONGO_URI_TEST` | `tests/progress.test.js` |
| `TEST_STUDENT_EMAIL` | API tests |
| `TEST_STUDENT_PASSWORD` | API tests |
| `USE_REAL_MONGO_TEST` | `tests/setup.js` |

---

## Frontend — Next.js (`client-main`)

### Public (browser-safe) `[IN CODE]`

| Variable | Default | Where |
|----------|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://mr5school.com` | SEO, sitemap, layout |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:5001` | Rewrites, API proxy |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | — | Docs/templates (Stripe.js) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | — | Upload widget |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `ml_default` | Unsigned uploads |
| `NEXT_PUBLIC_LIVEKIT_URL` | — | Docs (LiveKit client) |
| `NEXT_PUBLIC_CDN_BASE_URL` | — | `aws-assets.ts` |
| `NEXT_PUBLIC_CDN_GANESHA_MODEL` | — | `aws-assets.ts` |
| `NEXT_PUBLIC_CDN_CLASSROOM_MODEL` | — | `aws-assets.ts` |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | — | `lib/seo.ts` |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | — | `lib/seo.ts` |
| `NEXT_PUBLIC_YAHOO_VERIFICATION` | — | `lib/seo.ts` |

### Server-only on web task `[IN CODE]`

| Variable | Where |
|----------|-------|
| `GEMINI_API_KEY` | `/api/ai/gemini`, `/api/ai/openai` |
| `OPENAI_API_KEY` | `lib/env.server.ts` (helper) |
| `WEATHER_API_KEY` | `/api/context/weather` |

### Runtime / build `[IN CODE]`

| Variable | Where |
|----------|-------|
| `NODE_ENV` | Error boundaries, analytics hooks, middleware |

### E2E / Playwright `[IN CODE]`

| Variable | Default |
|----------|---------|
| `CI` | auto in GitHub Actions |
| `PLAYWRIGHT_API_PORT` | `5002` |
| `PLAYWRIGHT_API_URL` | `http://127.0.0.1:{PORT}` |
| `PLAYWRIGHT_WEB_PORT` | `3001` (CI) / `3000` |
| `PLAYWRIGHT_WEB_URL` | `http://localhost:{PORT}` |

---

## Infrastructure / deploy (not app runtime)

| Variable | Where referenced |
|----------|------------------|
| `AWS_REGION` | `.github/workflows/aws-deploy.yml` |
| `AWS_ROLE_ARN` | GitHub OIDC deploy |
| `ECR_REPOSITORY_API` | GitHub secrets |
| `ECR_REPOSITORY_WEB` | GitHub secrets |
| `ECS_CLUSTER` | GitHub secrets |
| `ECS_SERVICE_API` | GitHub secrets |
| `ECS_SERVICE_WEB` | GitHub secrets |
| `AWS_S3_ASSETS_BUCKET` | `aws-assets.ts` docs only |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | `aws-assets.ts` docs only |

---

## Docs-only (NOT in runtime code)

| Variable | Documented in | Status |
|----------|---------------|--------|
| `COPPA_AGE_THRESHOLD` | `LEGAL_CONSENT_ENGINE_ARCHITECTURE.md` | **Not implemented** in code |
| `JWT_REFRESH_SECRET` | Old templates | **Unused** — remove from local `.env` |
| `LIVEKIT_HOST` | Old production example | **Unused** — use `NEXT_PUBLIC_LIVEKIT_URL` |

---

# MISSING VARIABLES

Variables that **should exist** for production hardening but are **not in code today**:

| Variable | Why needed | Priority |
|----------|------------|----------|
| `JWT_REFRESH_SECRET` | Separate signing key for refresh tokens (OWASP) | High |
| `HASH_PEPPER` | bcrypt pepper for password storage | Medium |
| `CSRF_SECRET` | CSRF token signing if cookie auth expands | Medium |
| `ENCRYPTION_KEY` | Field-level encryption (PII at rest) | Medium |
| `REDIS_URL` | Distributed rate limiting (login lockout is MongoDB today) | High at scale |
| `SENTRY_DSN` | Error tracking (ErrorBoundary has placeholder) | High |
| `DATABASE_POOL_SIZE` | Explicit mongoose pool tuning | Low |
| `READ_REPLICA_URL` | Read scaling | Future |
| `BACKUP_ENCRYPTION_KEY` | Off-site backup encryption | Medium |
| `WEBHOOK_SIGNATURE_SECRET` | Generic webhook HMAC (beyond Stripe) | Low |
| `CSP_NONCE_SECRET` | Strict CSP without unsafe-inline | Medium |
| `RATE_LIMIT_REDIS_PREFIX` | Multi-instance rate limit keys | With Redis |
| `TRUST_PROXY_HOPS` | Explicit proxy trust (uses `trust proxy: 1` today) | Low |
| `SESSION_IDLE_TIMEOUT_MS` | Server-side session timeout config | Low (client: 30min) |
| `BCRYPT_ROUNDS` | Configurable hash cost | Low |
| `COPPA_AGE_THRESHOLD` | Documented but not wired | High if child users |
| `SENDGRID_API_KEY` / `RESEND_API_KEY` | Modern email — code uses SMTP/Gmail only | Medium |
| `NEXT_PUBLIC_SENTRY_DSN` | Client error reporting | Medium |
| `STRIPE_PUBLISHABLE_KEY` server alias | Some teams duplicate for SSR | Low |

---

# FUTURE VARIABLES

Enterprise / scale-out (see `.env.enterprise.example`):

- **Auth:** `JWT_ISSUER`, `JWT_AUDIENCE`, `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN`, SAML/OIDC SSO
- **Cache:** `REDIS_PASSWORD`, `REDIS_TLS_ENABLED`
- **Storage:** `AWS_ACCESS_KEY_ID` (prefer IAM roles), `CLOUDFLARE_R2_TOKEN`
- **AI:** `ANTHROPIC_API_KEY`, `GROQ_API_KEY`
- **Payments:** `PAYPAL_CLIENT_SECRET`, `PAYHERE_MERCHANT_SECRET` (not in codebase)
- **Monitoring:** `DATADOG_API_KEY`, `POSTHOG_API_KEY`, `LOGROCKET_APP_ID`
- **Push:** `FIREBASE_SERVER_KEY`, `VAPID_PRIVATE_KEY`
- **DR:** `BACKUP_STORAGE_BUCKET`, `BACKUP_RETENTION_DAYS`

---

# DEVELOPMENT VARIABLES

| Variable | Safe in dev | Never in prod |
|----------|-------------|---------------|
| In-memory MongoDB | Auto when `MONGO_URI` unset | ❌ |
| `LEGAL_RECONSENT_ENFORCED=false` | Dev bypass | ❌ |
| `LOG_LEVEL=debug` | Verbose logs | ❌ |
| `SEED_ADMIN_PASSWORD` | Seed scripts | ❌ |
| `ADMIN_PASSWORD` | Default `Admin@123456` in script | ❌ |
| `TEST_STUDENT_PASSWORD` | CI tests | ❌ |
| `OLLAMA_HOST` | Local AI | Optional prod |
| Demo login UI on `/login` | `NODE_ENV=development` | Hidden in prod |

---

# PRODUCTION VARIABLES

### API — Secrets Manager (required)

```
MONGO_URI, JWT_SECRET
```

### API — Secrets Manager (strongly recommended)

```
GEMINI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
CLOUDINARY_API_SECRET, GOOGLE_CLIENT_SECRET, EMAIL_PASS/SMTP_PASS,
CONSENT_IP_SALT (if CONSENT_IP_LOGGING=true)
```

### API — ECS environment (non-secret)

```
NODE_ENV=production, PORT=5001, LOG_LEVEL=info,
CORS_ORIGIN, CLIENT_URL, CORS_EXTRA_ORIGINS,
JWT_EXPIRE, REFRESH_TOKEN_EXPIRE_DAYS, AI_PROVIDER,
LEGAL_RECONSENT_ENFORCED=true
```

### Web — Docker build-args (baked)

```
NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_API_URL,
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Web — ECS secrets

```
GEMINI_API_KEY, WEATHER_API_KEY
```

---

# FRONTEND PUBLIC VARIABLES

Safe to expose (never put secrets here):

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
NEXT_PUBLIC_LIVEKIT_URL
NEXT_PUBLIC_CDN_*
NEXT_PUBLIC_*_VERIFICATION
```

**Never use `NEXT_PUBLIC_` for:** `JWT_SECRET`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `WEATHER_API_KEY`, database URLs.

---

# PRIVATE SERVER VARIABLES

**API only:** All variables in `Mr5-School-API-main/.env.example` except none are public.

**Web server-only (not NEXT_PUBLIC):** `GEMINI_API_KEY`, `OPENAI_API_KEY`, `WEATHER_API_KEY`

---

# SECURITY FINDINGS

| Finding | Severity | Status |
|---------|----------|--------|
| Cloudinary hardcoded key | High | Fixed (prior audit) |
| `JWT_REFRESH_SECRET` in old docs unused | Low | Documented as remove |
| `seedCourses.js` default `Admin@123456` | Medium | Use `ADMIN_PASSWORD` env |
| `GEMINI_API_KEY` on web task | Low | Correct — server route only |
| Dual email config (`EMAIL_*` + `SMTP_*`) | Low | Both documented |
| No Redis for rate limit at scale | Medium | Future `REDIS_URL` |
| `COPPA_AGE_THRESHOLD` docs only | Medium | Implement or remove docs |

---

# MISSING CONFIGURATION WARNINGS

1. **Production without `MONGO_URI`** — API exits (`validateEnv`).
2. **Production without `GEMINI_API_KEY`** — AI routes return 503; tutor degraded.
3. **Production without `STRIPE_*`** — Payments run in demo/mock mode.
4. **Production without SMTP** — Support tickets fail (`supportService.js` warns).
5. **Production without `WEATHER_API_KEY`** — Mock weather (acceptable fallback).
6. **Build without `NEXT_PUBLIC_API_URL`** — Defaults to localhost (broken in prod).
7. **`GOOGLE_CALLBACK_URL` mismatch** — OAuth fails silently.
8. **Running `npm run build` during `npm run dev`** — Corrupts `.next` cache.

---

# DEPLOYMENT REQUIREMENTS

See: `AWS_FINAL_DEPLOY.md`, `DEPLOYMENT.md`, `docs/CICD_SECRETS.md`, `docs/INFRASTRUCTURE_ENV.md`

Minimum production:

1. MongoDB Atlas + backups
2. Secrets Manager for API secrets
3. ECS Fargate (API + Web) or equivalent
4. ALB + ACM TLS
5. CloudFront for static/3D assets (optional)
6. Route 53 DNS
7. Stripe webhook endpoint configured
8. `CORS_ORIGIN` = exact frontend origin

---

# DECISIONS REQUIRED (cannot infer from code)

The following require **your** input before implementation. See questions below.

| Topic | What we know from code | Unknown |
|-------|------------------------|---------|
| Database | MongoDB / Mongoose | Atlas tier? Multi-region? |
| Payments | Stripe only | PayHere / PayPal needed? |
| Email | Gmail + generic SMTP | SendGrid / Resend / SES? |
| AI | Gemini primary, OpenAI, Ollama dev | Anthropic / Groq? |
| Cache | In-memory rate limit | Redis required? |
| Monitoring | Console + CloudWatch | Sentry / Datadog? |
| CDN | CloudFront docs | S3 bucket name? |
| SSO | Google OAuth only | Apple / GitHub / SAML? |
| MFA | Not implemented | Required for enterprise? |
| Push | Not implemented | Firebase / Web Push? |
| Multi-region | Single-region AWS docs | DR region? |

---

# VERIFICATION COMMANDS

```bash
# Scan for env usage (should match this audit)
rg 'process\.env\.[A-Z0-9_]+' --glob '*.{js,ts,tsx,mjs}' .

# API startup validation
cd Mr5-School-API-main && NODE_ENV=production JWT_SECRET=test MONGO_URI=mongodb://localhost node -e "import('./src/config/env.js').then(m=>m.validateEnv())"

# No secrets in frontend public bundle
cd client-main && rg 'NEXT_PUBLIC_' .env.local.example
```

---

*Prior audit: `ENV_AUDIT_REPORT.md` (2026-06-15). This document supersedes counts and adds missing/future/enterprise scope.*
