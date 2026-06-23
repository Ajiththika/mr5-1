# MR5 School v2.0.0 — AWS Final Deployment Guide

Enterprise release candidate. Run `npm run verify` at repo root before deploying.

---

## Architecture (AWS)

```
Route 53 → ALB → ECS Fargate (web :3000)
              → ECS Fargate (api :5001) → MongoDB Atlas
              → Secrets Manager / CloudWatch Logs
GitHub Actions → ECR → ECS rolling deploy
```

---

## Prerequisites

| Item | Notes |
|------|--------|
| AWS account | ECS Fargate, ECR, ALB, Secrets Manager, Route 53 |
| MongoDB Atlas | Production cluster + IP allowlist / VPC peering |
| Domain + ACM certs | HTTPS on ALB |
| GitHub repo | `main` branch with secrets configured |

---

## Step 1 — Verify locally (zero errors)

**API must have a valid `MONGO_URI` before login will work.**

```bash
cd Mr5-School-API-main
cp .env.production.example .env
# Required: MONGO_URI, JWT_SECRET (32+ chars), CORS_ORIGIN, CLIENT_URL
PORT=5001 NODE_ENV=development node src/app.js
```

Wait for: `Connected to MongoDB successfully` before testing login.

```bash
cd /path/to/Mr5
npm run verify
```

Or Docker production stack:

```bash
cp Mr5-School-API-main/.env.production.example Mr5-School-API-main/.env
# Edit MONGO_URI, JWT_SECRET (32+ chars), CORS_ORIGIN, CLIENT_URL

cp .env.production.example .env
# Set GEMINI_API_KEY, WEATHER_API_KEY if needed

docker compose up --build
```

- Web: http://localhost:3000  
- API health: http://localhost:5001/health  

---

## Step 2 — AWS infrastructure

1. **ECR** — create repositories: `mr5-api`, `mr5-web`
2. **ECS** — Fargate cluster `mr5-production`
3. **ALB** — two target groups (api:5001, web:3000) + HTTPS listeners
4. **Secrets Manager** — secret `mr5/production/api` (JSON keys from `.env.production.example`)
5. **Secrets Manager** — secret `mr5/production/web` (`GEMINI_API_KEY`, `WEATHER_API_KEY`)
6. **CloudWatch** — log groups `/ecs/mr5-api`, `/ecs/mr5-web`
7. **IAM** — ECS execution role (ECR + logs + secrets), task roles per service

Task definition templates: [`infra/aws/ecs/`](infra/aws/ecs/)

---

## Step 3 — GitHub Actions secrets

| Secret | Example |
|--------|---------|
| `AWS_REGION` | `us-east-1` |
| `AWS_ROLE_ARN` | OIDC deploy role ARN |
| `ECR_REPOSITORY_API` | `mr5-api` |
| `ECR_REPOSITORY_WEB` | `mr5-web` |
| `ECS_CLUSTER` | `mr5-production` |
| `ECS_SERVICE_API` | `mr5-api` |
| `ECS_SERVICE_WEB` | `mr5-web` |

GitHub **Variables**:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api.mr5school.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://app.mr5school.com` |

Workflow: [`.github/workflows/aws-deploy.yml`](.github/workflows/aws-deploy.yml)

---

## Step 4 — Deploy

```bash
git push origin main
```

Or manual workflow dispatch in GitHub Actions → **AWS Deploy**.

Pipeline: test → build/push images → ECS force new deployment → wait for stable.

---

## Step 5 — Post-deploy checklist

- [ ] `GET https://api.<domain>/health` → `status: "OK"`, `version: "2.0.0"`
- [ ] `https://app.<domain>` loads homepage
- [ ] Register / login works (cookies + CORS)
- [ ] `/pricing` — 5-hour trial starts via API
- [ ] Stripe webhook URL points to `https://api.<domain>/api/payments/webhook`
- [ ] MongoDB Atlas shows active connections
- [ ] CloudWatch logs streaming for both services

---

## Environment reference

| File | Purpose |
|------|---------|
| [`.env.production.example`](.env.production.example) | AWS Secrets Manager key list |
| [`Mr5-School-API-main/.env.production.example`](Mr5-School-API-main/.env.production.example) | API production vars |
| [`ENV_AUDIT_REPORT.md`](ENV_AUDIT_REPORT.md) | Full variable inventory |
| [`ROLLBACK.md`](ROLLBACK.md) | Rollback procedures |

---

## Rollback

```bash
aws ecs update-service --cluster mr5-production --service mr5-api \
  --task-definition mr5-api:PREVIOUS_REVISION --force-new-deployment
aws ecs update-service --cluster mr5-production --service mr5-web \
  --task-definition mr5-web:PREVIOUS_REVISION --force-new-deployment
```

---

## Support

- CI: `.github/workflows/ci.yml`
- Full deployment: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- Architecture: [`AWS_ARCHITECTURE.md`](AWS_ARCHITECTURE.md)
