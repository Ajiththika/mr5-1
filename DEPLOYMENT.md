# MR5 School — Deployment Guide

## Architecture

```
[Browser] → [Next.js frontend] → rewrite /api/* → [Express API] → [MongoDB]
                ↓
         Next API routes (/api/context/weather, /api/ai/gemini)
```

---

## Prerequisites

- Node.js 20+
- MongoDB Atlas or self-hosted MongoDB
- Domain + HTTPS (required for geolocation and secure cookies)
- API keys per `ENV_AUDIT_REPORT.md`

---

## 1. Local development

```bash
# API
cd Mr5-School-API-main
cp .env.local.example .env
# Edit MONGO_URI, JWT_SECRET, optional keys
PORT=5001 NODE_ENV=development node src/app.js

# Frontend (new terminal)
cd client-main
cp .env.local.example .env.local
npm install
npm run dev
```

Verify:

- http://localhost:3000 — homepage
- http://localhost:5001/health — API health
- http://localhost:3000/api/context/weather?lat=6.9&lon=79.9 — weather route

---

## 2. Production build (frontend)

```bash
cd client-main
npm ci
npm run build
npm run start   # or platform-native start command
```

Set on hosting platform:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://mr5school.com` |
| `NEXT_PUBLIC_API_URL` | `https://api.mr5school.com` |
| `GEMINI_API_KEY` | server env (encrypted) |
| `WEATHER_API_KEY` | server env (encrypted) |

---

## 3. Production API

Deploy `Mr5-School-API-main` to Railway, Render, Fly.io, EC2, or Vercel serverless.

**Minimum env vars:**

```env
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://...
JWT_SECRET=<32+ char random>
CORS_ORIGIN=https://your-frontend-domain.com
CLIENT_URL=https://your-frontend-domain.com
```

Start command: `node src/app.js`

---

## 4. Vercel (frontend)

1. Import `client-main` as project root
2. Add environment variables from `.env.production.example`
3. Build command: `npm run build`
4. Output: Next.js default

Ensure `NEXT_PUBLIC_API_URL` points to your deployed API origin (no `/api` suffix).

---

## 5. Docker

```bash
# Frontend
cd client-main
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud \
  -t mr5-frontend .

# API
cd Mr5-School-API-main
docker build -t mr5-api .
docker run -p 5001:5001 --env-file .env mr5-api
```

---

## 6. Stripe webhooks

1. Create webhook endpoint: `https://api.example.com/api/payments/webhook` (verify exact path in `paymentRoutes.js`)
2. Set `STRIPE_WEBHOOK_SECRET` on API
3. Use live keys in production

---

## 7. Post-deploy verification

- [ ] Homepage loads, no console errors
- [ ] Login works
- [ ] Student dashboard routes load
- [ ] Classroom scene + environment panel
- [ ] `/sitemap.xml` and `/robots.txt` accessible
- [ ] `curl /health` on API returns 200

---

## 8. CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR:

- API unit tests
- Client Jest + ESLint
- Playwright smoke (`e2e/smoke.spec.ts`)

Extend with full E2E when API test DB is available in CI.

---

## 9. AWS production (recommended)

Full architecture: **`AWS_ARCHITECTURE.md`**  
Checklist: **`AWS_DEPLOYMENT_CHECKLIST.md`**

### Overview

| Component | AWS service |
|-----------|-------------|
| Frontend (Next.js SSR) | ECS Fargate + ALB |
| Backend (Express) | ECS Fargate + ALB |
| Database | MongoDB Atlas (external) |
| Secrets | Secrets Manager |
| DNS | Route 53 |
| SSL | ACM |
| CDN (optional) | CloudFront → ALB |
| Logs | CloudWatch Logs |
| Images | ECR |

**Not used:** S3-only static hosting (app requires Node SSR), RDS (MongoDB codebase), Lambda API.

### Quick start

1. Provision VPC, ALB, ECS cluster, ECR repos (see checklist)
2. Store secrets in Secrets Manager (`mr5/production/api`, `mr5/production/web`)
3. Register task definitions from `infra/aws/ecs/*.json.example`
4. Configure GitHub secrets for `.github/workflows/aws-deploy.yml`
5. Push to `main` or run workflow manually

### Docker Compose (local prod simulation)

```bash
cp Mr5-School-API-main/.env.local.example Mr5-School-API-main/.env
# Edit MONGO_URI, JWT_SECRET
docker compose up --build
```

### Environment template

Copy **`.env.production.example`** — map each key to Secrets Manager or ECS task env.

### Stripe on AWS

Webhook URL: `https://api.<your-domain>/api/payments/webhook`  
Route must receive **raw body** (already configured in `app.js` before `express.json()`).

### Rollback

See **`ROLLBACK.md`** — ECS previous task revision or ECR image tag revert.
