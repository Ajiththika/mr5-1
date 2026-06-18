# MR5 School — Environment Audit Report

**Generated:** 2026-06-15  
**Scope:** `client-main/` (Next.js 15) + `Mr5-School-API-main/` (Express 4)

---

## Executive summary

| Metric | Count |
|--------|------:|
| Unique variables referenced in code | 52 |
| Required for API startup | 3 (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV`) |
| Required for frontend build | 0 (all have safe defaults) |
| Security issues fixed in this audit | 1 (hardcoded Cloudinary API key removed) |
| Inconsistent names documented | 6 |
| Unused / legacy variables | 1 (`JWT_REFRESH_SECRET`) |

Template files created/updated:

- `/.env.example` (monorepo index)
- `client-main/.env.example`, `.env.local.example`, `.env.production.example`
- `Mr5-School-API-main/.env.example`, `.env.local.example`, `.env.production.example`

---

## Complete variable inventory

| Variable | Where used | Why needed | Required | Default if missing | Safe placeholder | Side | Deployment |
|----------|------------|------------|----------|-------------------|------------------|------|------------|
| `NODE_ENV` | Both apps | Runtime mode, cookies, error stacks | **Yes** (API) | `development` | `development` | Both | All |
| `PORT` | API `app.js`, `env.js`, Docker | HTTP listen port | Optional | `5001` | `5001` | Backend | API host |
| `MONGO_URI` | API `db.js`, seeds, tests | MongoDB connection | **Yes** | — | `mongodb://127.0.0.1:27017/mr5school` | Backend | API host |
| `MONGODB_URI` | API `db.js` | Alias for `MONGO_URI` | Optional | Falls back to `MONGO_URI` | same as MONGO_URI | Backend | API host |
| `JWT_SECRET` | Auth middleware, tokens | Sign/verify JWT | **Yes** | Auth fails | `min_32_char_random_string` | Backend | API host |
| `JWT_EXPIRE` | `authService.js`, `env.js` | Access token TTL | Optional | `15m` | `15m` | Backend | API host |
| `JWT_EXPIRES_IN` | `avatarRoutes.js` | Avatar JWT TTL | Optional | `7d` | `7d` | Backend | API host |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `authController.js`, `authService.js` | Refresh cookie days | Optional | `7` | `7` | Backend | API host |
| `JWT_REFRESH_SECRET` | `.env.example` only | **UNUSED** — legacy | No | N/A | Remove from local `.env` | — | — |
| `CORS_ORIGIN` | API `app.js` | Allowed browser origin | Optional | `http://localhost:3000` | `https://your-domain.com` | Backend | API host |
| `CLIENT_URL` | Auth, password reset, OAuth | Frontend redirect URLs | Optional | `http://localhost:3000` | `https://your-domain.com` | Backend | API host |
| `LOG_LEVEL` | `logger.js`, `env.js` | Winston log level | Optional | `info` | `info` | Backend | API host |
| `GEMINI_API_KEY` | API AI services, Next `/api/ai/*` | Google Gemini | Optional* | AI routes 503 / mock | `your_gemini_api_key` | Both | Both hosts |
| `OPENAI_API_KEY` | API `ai.service.js`, `AITeacherService` | OpenAI chat | Optional | OpenAI disabled | `sk-...` | Backend | API host |
| `OPENAI_MODEL` | `ai.service.js` | OpenAI model name | Optional | `gpt-3.5-turbo` | `gpt-3.5-turbo` | Backend | API host |
| `AI_PROVIDER` | `ai.service.js`, `AITeacherService` | Default AI backend | Optional | `gemini` | `gemini` | Backend | API host |
| `OLLAMA_HOST` | `ai.service.js`, `AITeacherService` | Local Ollama URL | Optional | `http://127.0.0.1:11434` | `http://127.0.0.1:11434` | Backend | Dev only |
| `OLLAMA_URL` | `test-ollama-simple.mjs` | Legacy alias → use `OLLAMA_HOST` | Optional | Same as OLLAMA_HOST | same | Backend | Dev only |
| `OLLAMA_MODEL` | `ai.service.js`, test scripts | Ollama model | Optional | `llama2` | `llama2` | Backend | Dev only |
| `WEATHER_API_KEY` | API `weatherService.js`, Next weather route | OpenWeatherMap | Optional | Mock weather | `your_openweather_key` | Both | Both hosts |
| `STRIPE_SECRET_KEY` | `stripeService.js`, payments | Stripe server API | Optional | Payments disabled | `sk_live_xxxxx` | Backend | API host |
| `STRIPE_WEBHOOK_SECRET` | `paymentController.js` | Webhook signature | Optional | Webhooks fail | `whsec_xxxxx` | Backend | API host |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Referenced in docs/templates | Stripe.js client | Optional | Checkout unavailable | `pk_live_xxxxx` | Frontend | Frontend host |
| `GOOGLE_CLIENT_ID` | `passport.js` | Google OAuth | Optional | OAuth routes disabled | `your_client_id` | Backend | API host |
| `GOOGLE_CLIENT_SECRET` | `passport.js` | Google OAuth | Optional | OAuth disabled | `your_client_secret` | Backend | API host |
| `GOOGLE_CALLBACK_URL` | `passport.js` | OAuth callback | Optional | `http://localhost:5001/api/auth/google/callback` | production API URL | Backend | API host |
| `CLOUDINARY_CLOUD_NAME` | API `cloudinary.js` | Media uploads | Optional | Upload fails | `your_cloud_name` | Backend | API host |
| `CLOUDINARY_API_KEY` | API `cloudinary.js` | Media uploads | Optional | Upload fails | `your_api_key` | Backend | API host |
| `CLOUDINARY_API_SECRET` | API `cloudinary.js` | Media uploads | Optional | Upload fails | `your_api_secret` | Backend | API host |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `cloudinary.service.ts`, upload UI | Client uploads | Optional | Upload widget fails | `your_cloud_name` | Frontend | Frontend host |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `cloudinary.service.ts`, upload UI | Unsigned preset | Optional | `ml_default` | `your_preset` | Frontend | Frontend host |
| `LIVEKIT_API_KEY` | `livekitController.js` | LiveKit tokens | Optional | Live video fails | `your_key` | Backend | API host |
| `LIVEKIT_API_SECRET` | `livekitController.js` | LiveKit tokens | Optional | Live video fails | `your_secret` | Backend | API host |
| `NEXT_PUBLIC_LIVEKIT_URL` | `ClassroomRoom.tsx` | WebSocket URL | Optional | LiveKit UI fails | `wss://...` | Frontend | Frontend host |
| `LIVEKIT_HOST` | `env.production.example` only | **Not used in code** — use `NEXT_PUBLIC_LIVEKIT_URL` on client | — | — | — | — | — |
| `AZURE_SPEECH_KEY` | `ttsController.js` | Azure TTS | Optional | TTS 503 | `your_azure_key` | Backend | API host |
| `AZURE_SPEECH_REGION` | `ttsController.js` | Azure region | Optional | TTS 503 | `eastus` | Backend | API host |
| `EMAIL_USER` | `sendEmail.js` | Gmail SMTP user | Optional | Email fails | `you@gmail.com` | Backend | API host |
| `EMAIL_PASS` | `sendEmail.js` | Gmail app password | Optional | Email fails | `app_password` | Backend | API host |
| `FROM_NAME` | `sendEmail.js` | Email sender name | Optional | `MR5 School` | `MR5 School` | Backend | API host |
| `FROM_EMAIL` | `sendEmail.js` | Email sender address | Optional | Uses `EMAIL_USER` | `noreply@domain.com` | Backend | API host |
| `SMTP_HOST` | `supportService.js` | Support mail host | Optional | `smtp.ethereal.email` | `smtp.gmail.com` | Backend | API host |
| `SMTP_PORT` | `supportService.js` | SMTP port | Optional | `587` | `587` | Backend | API host |
| `SMTP_USER` | `supportService.js` | SMTP auth | Optional | placeholder | `user` | Backend | API host |
| `SMTP_PASS` | `supportService.js` | SMTP password | Optional | placeholder | `pass` | Backend | API host |
| `SUPPORT_EMAIL` | `supportService.js` | From header | Optional | default string | `support@mr5school.com` | Backend | API host |
| `AVATHOR_SECRET_TOKEN` | `avatarRoutes.js` | Avatar webhook auth | Optional | Route 500 | `random_secret` | Backend | API host |
| `NEXT_PUBLIC_SITE_URL` | SEO, sitemap, robots, layout | Canonical/OG URLs | Optional | `https://mr5school.com` | `https://your-domain.com` | Frontend | Frontend host |
| `NEXT_PUBLIC_API_URL` | `next.config.mjs`, sitemap, E2E | API proxy target | Optional | `http://127.0.0.1:5001` | `https://api.domain.com` | Frontend | Frontend host |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | `lib/seo.ts` | Google Search Console | Optional | omitted | meta token | Frontend | Frontend host |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | `lib/seo.ts` | Yandex verification | Optional | omitted | token | Frontend | Frontend host |
| `NEXT_PUBLIC_YAHOO_VERIFICATION` | `lib/seo.ts` | Yahoo verification | Optional | omitted | token | Frontend | Frontend host |
| `VERCEL` | API `app.js`, `db.js` | Serverless mode | Auto-set | — | — | Backend | Vercel |
| `CI` | Playwright, GitHub Actions | CI behavior | Auto-set | — | `true` | Both | CI |
| `API_URL` | E2E `comprehensive-lms.spec.ts` | E2E API override | Optional | `127.0.0.1:5001` | same as API | Test | CI/local |
| `MONGO_URI_TEST` | `tests/progress.test.js` | Test database | Optional | uses `MONGO_URI` | `mongodb://127.0.0.1:27017/mr5-test` | Test | CI |
| `TEST_STUDENT_EMAIL` | API tests | Test credentials | Optional | seeded default | `student@...` | Test | CI |
| `TEST_STUDENT_PASSWORD` | API tests | Test credentials | Optional | seeded default | `Student@...` | Test | CI |
| `ADMIN_EMAIL` | `scripts/seedCourses.js` | Seed script | Optional | default admin | email | Script | Dev |
| `ADMIN_PASSWORD` | `scripts/seedCourses.js` | Seed script | Optional | default password | password | Script | Dev |

\*Gemini is optional for build but required for AI tutor features in production.

---

## Hardcoded values converted or flagged

| Location | Issue | Action taken |
|----------|-------|--------------|
| `Mr5-School-API-main/src/config/cloudinary.js` | Hardcoded `api_key: "835476267536328"` | **Removed** — now requires env vars |
| `Mr5-School-API-main/src/config/cloudinary.js` | Default `cloud_name: "mr5school"` | **Removed** — warn if unset |
| `client-main/lib/seo.ts` | Default `https://mr5school.com` | Kept as documented fallback; set `NEXT_PUBLIC_SITE_URL` in prod |
| `Mr5-School-API-main/src/config/env.js` | Default `PORT=5000` | **Fixed** → `5001` to match project convention |
| `client-main/Dockerfile` | `NEXT_PUBLIC_API_URL` default port 5000 | **Fixed** → `5001` |

---

## Duplicate / inconsistent names

| Names | Resolution |
|-------|------------|
| `MONGO_URI` vs `MONGODB_URI` | Both supported; prefer `MONGO_URI` |
| `OLLAMA_HOST` vs `OLLAMA_URL` | Consolidated via `getOllamaHost()` helper |
| `JWT_EXPIRE` vs `JWT_EXPIRES_IN` | Different contexts (access vs avatar); both documented |
| `LIVEKIT_HOST` vs `NEXT_PUBLIC_LIVEKIT_URL` | Server uses API key/secret; client uses `NEXT_PUBLIC_LIVEKIT_URL` only |
| `EMAIL_*` vs `SMTP_*` | Two email paths (`sendEmail.js` vs `supportService.js`); both documented |
| `API_URL` vs `NEXT_PUBLIC_API_URL` | E2E accepts both; prefer `NEXT_PUBLIC_API_URL` |

---

## Dangerous secret exposure

| Finding | Severity | Status |
|---------|----------|--------|
| Cloudinary API key hardcoded in `cloudinary.js` | **High** | **Fixed** |
| `debugEnv.js`, `testEnv.js` log secret prefixes | Medium | Dev-only scripts; do not run in prod |
| `GEMINI_API_KEY` in frontend `.env.local` | Low | Server-only in Next (not `NEXT_PUBLIC_*`) — correct |
| `.envcopy` in API repo | Medium | Contains key names; ensure not committed with real values |

---

## Missing references (code expects, templates now include)

All variables found in code are now in the appropriate `.env.example` files.

---

## Unused variables (safe to omit)

- `JWT_REFRESH_SECRET` — listed in old `.env.example` but never read by application code.

---

## Frontend vs backend separation

| Secret | Must stay server-side |
|--------|----------------------|
| `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | API only |
| `GEMINI_API_KEY`, `WEATHER_API_KEY` | Next server routes / API — **not** `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_*` | Safe for browser bundle (publishable keys, URLs, cloud name) |

---

## Runtime validation

| App | Mechanism |
|-----|-----------|
| API | `validateEnv()` in `src/config/env.js` — exits on missing `MONGO_URI`, `JWT_SECRET`, `NODE_ENV` |
| Frontend | `lib/env.server.ts` — helpers for API routes; returns 503 when Gemini missing |
| Weather route | Graceful mock fallback when `WEATHER_API_KEY` unset |

---

## Setup checklist

### Local development

- [ ] Copy `client-main/.env.local.example` → `client-main/.env.local`
- [ ] Copy `Mr5-School-API-main/.env.local.example` → `Mr5-School-API-main/.env`
- [ ] Set `MONGO_URI` and `JWT_SECRET` on API
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:5001`
- [ ] Add `GEMINI_API_KEY` (optional but needed for AI)
- [ ] Add `WEATHER_API_KEY` (optional; classroom weather)
- [ ] Start API: `PORT=5001 node src/app.js`
- [ ] Start frontend: `npm run dev`
- [ ] Verify: `curl http://localhost:3000/api/context/weather?lat=0&lon=0`

### Production

- [ ] Set all **Required** API vars on backend host
- [ ] Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL` on frontend
- [ ] Set `CORS_ORIGIN` and `CLIENT_URL` to production frontend URL
- [ ] Configure Stripe webhook URL + `STRIPE_WEBHOOK_SECRET`
- [ ] Configure Cloudinary on API (and public cloud name on frontend if using widget)
- [ ] Run `npm run build` in `client-main`
- [ ] Run smoke E2E or manual login + classroom check

---

## Code changes in this audit

1. Removed hardcoded Cloudinary credentials
2. Expanded `Mr5-School-API-main/src/config/env.js` inventory + default PORT 5001
3. Added `src/utils/ollamaEnv.js` for `OLLAMA_HOST` / `OLLAMA_URL` consolidation
4. Added `client-main/lib/env.server.ts` for server route helpers
5. Updated all `.env*.example` templates
6. Fixed Dockerfile and E2E API URL defaults

---

## AWS deployment notes

| Variable | AWS placement |
|----------|---------------|
| `MONGO_URI`, `JWT_SECRET`, `STRIPE_*`, `CLOUDINARY_API_SECRET` | Secrets Manager → ECS API task |
| `GEMINI_API_KEY`, `WEATHER_API_KEY` | Secrets Manager → ECS web + API tasks |
| `NEXT_PUBLIC_*` | ECS web task **environment** (non-secret); bake at Docker build |
| `CORS_ORIGIN`, `CLIENT_URL` | ECS API task environment |
| `CORS_EXTRA_ORIGINS` | ECS API — comma-separated CloudFront/ALB URLs during cutover |
| `LOG_LEVEL` | ECS task environment; logs → CloudWatch via `awslogs` driver |

Production template: **`.env.production.example`**  
Do not commit `.env.production` with real values — use Secrets Manager.
