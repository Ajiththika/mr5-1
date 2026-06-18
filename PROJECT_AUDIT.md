# MR5 School — Project Audit

**Date:** 2026-06-15  
**Repository:** `Mr5` (monorepo)

---

## Stack overview

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| 3D | Three.js, React Three Fiber, Drei |
| Backend | Express 4, Node 20+, ES modules |
| Database | MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookies) + optional Google OAuth |
| AI | Gemini (primary), OpenAI, Ollama (dev) |
| Payments | Stripe |
| Media | Cloudinary |
| Realtime | LiveKit (optional) |
| Tests | Jest (unit), Playwright (E2E) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |

---

## Repository structure

```
Mr5/
├── client-main/              # Next.js frontend (port 3000)
│   ├── app/                  # App Router pages + API routes
│   ├── components/           # UI, 3D, classroom
│   ├── contexts/             # React context providers
│   ├── lib/                  # SEO, env, utilities
│   ├── e2e/                  # Playwright tests
│   └── services/             # API client services
├── Mr5-School-API-main/      # Express API (port 5001)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── config/
│   └── tests/
└── docs/                     # Product blueprint, etc.
```

---

## Package managers & commands

| App | Install | Dev | Build | Test | Lint |
|-----|---------|-----|-------|------|------|
| Frontend | `npm ci` | `npm run dev` | `npm run build` | `npm test` | `npm run lint` |
| API | `npm ci` | `node src/app.js` | N/A | `npm test` | — |

---

## Routing

- **Public:** `/`, `/courses`, `/pricing`, `/login`, `/register`, SEO routes (`/sitemap.xml`, `/robots.txt`)
- **Student:** `/student/*` (portal, courses, assignments, grades, schedule, shop)
- **Admin:** `/admin/*`
- **Immersive:** `/course/[id]/room/classroom` (live weather 3D classroom)
- **API proxy:** Next rewrites `/api/*` → `NEXT_PUBLIC_API_URL` (except local Next routes like `/api/context/weather`)

---

## Authentication flow

1. Login → API `/api/auth/login` → JWT in cookies
2. `EnhancedUserContext` + middleware protect routes
3. Onboarding gate for new students

---

## Key integrations

| Integration | Config | Status |
|-------------|--------|--------|
| MongoDB | `MONGO_URI` | Required |
| Gemini AI | `GEMINI_API_KEY` | Optional (AI features) |
| OpenWeather | `WEATHER_API_KEY` | Optional (mock fallback) |
| Stripe | `STRIPE_*` | Optional |
| Cloudinary | `CLOUDINARY_*` | Optional |
| LiveKit | `LIVEKIT_*`, `NEXT_PUBLIC_LIVEKIT_URL` | Optional |
| Google OAuth | `GOOGLE_CLIENT_*` | Optional |

---

## Deployment status

| Component | Ready | Notes |
|-----------|-------|-------|
| Frontend production build | ✅ | 52 routes, passes `npm run build` |
| API | ✅ | `validateEnv()` on startup |
| Dockerfiles | ✅ | Both apps have Dockerfiles |
| Vercel | Partial | API has `vercel.json` |
| CI | ✅ | API tests, client lint/test, smoke E2E |
| SEO | ✅ | Metadata, sitemap, robots, JSON-LD |
| Env templates | ✅ | See `ENV_AUDIT_REPORT.md` |

---

## Known limitations

1. E2E full suite requires running API + seeded student account
2. Geolocation/weather needs HTTPS in production
3. `JWT_REFRESH_SECRET` in old docs is unused
4. OpenAI route (`/api/ai/openai`) uses Gemini internally (legacy naming)
5. Admin SMTP settings UI stores values in component state only (not persisted to env)

---

## Recommended next steps (post-audit)

1. Restart API after pulling env/route changes
2. Set production env vars per `DEPLOYMENT.md`
3. Run Playwright smoke before each release
4. Rotate any credentials that were ever hardcoded in Cloudinary config
