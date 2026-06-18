# MR5 School — AWS Project Audit

**Date:** 2026-06-15  
**Purpose:** Discovery for AWS production deployment

---

## Application summary

| Item | Value |
|------|-------|
| Product | MR5 School — 3D immersive LMS |
| Monorepo | `client-main` + `Mr5-School-API-main` |
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Backend | Express 4 (ES modules), Node 20 |
| Database | **MongoDB** (Mongoose) — Atlas or self-hosted |
| Auth | JWT (httpOnly cookies), optional Google OAuth |
| File storage | **Cloudinary** (primary); S3 optional for static assets |
| Payments | Stripe |
| AI | Gemini (primary), OpenAI, Ollama (dev only) |
| Realtime | LiveKit (optional) |
| Package manager | npm (`package-lock.json` in both apps) |

---

## Frontend (`client-main`)

### Structure
- `app/` — App Router (52+ routes), API routes (`/api/ai/*`, `/api/context/weather`)
- `components/` — UI, 3D classroom, student dashboard
- `middleware.ts` — auth gating, public SEO routes
- `next.config.mjs` — `output: "standalone"`, image optimization, security headers, API rewrites

### Build
```bash
npm run build   # produces .next/standalone for Docker
npm run start   # production server on :3000
```

### Deployment constraint
**Not a static SPA.** Uses SSR, dynamic routes (`/course/[id]/...`), middleware, and server API routes.  
→ **Cannot deploy as S3-only website.** Requires Node runtime (ECS Fargate recommended).

### Current hosting artifacts
- `Dockerfile` (multi-stage, standalone)
- `env.production.example`
- No existing AWS IaC in repo (added: `infra/aws/`, `.github/workflows/aws-deploy.yml`)

---

## Backend (`Mr5-School-API-main`)

### Structure
- `src/app.js` — Express entry, CORS, Stripe webhook (raw body), `/health`
- `src/routes/` — REST API under `/api/*`
- `src/config/env.js` — `validateEnv()` on startup
- `src/config/logger.js` — Winston JSON → stdout (CloudWatch-ready)

### Build / run
```bash
npm start       # node src/app.js (PORT default 5001)
npm test        # Jest + supertest
```

### Database
- **MongoDB** via `MONGO_URI`
- Dev fallback: in-memory MongoDB if local instance unavailable
- **Not PostgreSQL/MySQL** — RDS is not a drop-in replacement; use MongoDB Atlas or Amazon DocumentDB (with compatibility review)

---

## Routes (high level)

| Area | Examples |
|------|----------|
| Public | `/`, `/courses`, `/pricing`, `/login`, `/sitemap.xml`, `/robots.txt` |
| Student | `/student/portal`, `/student/courses`, assignments, grades |
| Admin | `/admin/*` |
| 3D rooms | `/course/[id]/room/classroom` |
| API | `/api/auth`, `/api/courses`, `/api/payments/webhook`, `/api/context/weather` |

---

## Environment variables

Full inventory: **`ENV_AUDIT_REPORT.md`**

| Tier | Required |
|------|----------|
| API | `MONGO_URI`, `JWT_SECRET`, `NODE_ENV` |
| Frontend build | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` (recommended) |
| Secrets (AWS) | Store in **Secrets Manager**, inject into ECS tasks |

---

## Authentication

- Login → API issues JWT in cookies
- `EnhancedUserContext` + Next middleware protect routes
- Production cookies: `secure`, `sameSite: strict`

---

## File storage

- **Current:** Cloudinary (`CLOUDINARY_*` on API, `NEXT_PUBLIC_CLOUDINARY_*` on client)
- **AWS option:** S3 bucket for `public/assets/3d/*` + CloudFront cache — optional migration; not required for initial AWS deploy

---

## Tests

| Suite | Location | Status |
|-------|----------|--------|
| Client Jest | `client-main` | 27 tests |
| API Jest | `Mr5-School-API-main` | 13 tests |
| Playwright E2E | `client-main/e2e` | smoke + feature specs |
| CI | `.github/workflows/ci.yml` | lint, test, smoke E2E |

---

## Existing deployment targets

| Target | Evidence |
|--------|----------|
| Vercel | `vercel.json` (API), docs reference Vercel URLs in CORS |
| Docker | Dockerfiles in both apps |
| Docker Compose | `docker-compose.yml` (added) |
| AWS | **New** — architecture in `AWS_ARCHITECTURE.md` |

---

## AWS readiness gaps (addressed in this release)

| Gap | Resolution |
|-----|------------|
| No AWS CI/CD | `.github/workflows/aws-deploy.yml` |
| API Dockerfile copied `.env.example` | Removed; use Secrets Manager / task env |
| PORT mismatch (5000 vs 5001) | Aligned to 5001 |
| File logs in containers | Console-only when `AWS_EXECUTION_ENV` set |
| No task definitions | `infra/aws/ecs/*.json.example` |
| CORS hardcoded domains | `CORS_EXTRA_ORIGINS` env support |

---

## Recommendation summary

Deploy on **AWS ECS Fargate** behind **ALB** + **CloudFront**, with **MongoDB Atlas**, **Secrets Manager**, **Route 53**, **ACM**, and **CloudWatch**. See `AWS_ARCHITECTURE.md`.
