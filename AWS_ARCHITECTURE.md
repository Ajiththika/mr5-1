# MR5 School — AWS Architecture

**Version:** 1.0  
**Stack:** Next.js 15 + Express API + MongoDB

---

## Architecture diagram

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │ app.mr5school.com│
                    │ api.mr5school.com│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   CloudFront    │  ← ACM SSL (us-east-1 for CF)
                    │  (optional CDN) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  ALB (HTTPS)    │  ← ACM cert (regional)
                    │  :443           │
                    └───┬─────────┬───┘
                        │         │
              ┌─────────▼──┐  ┌───▼──────────┐
              │ ECS Service │  │ ECS Service  │
              │  mr5-web    │  │  mr5-api     │
              │  Fargate    │  │  Fargate     │
              │  :3000      │  │  :5001       │
              └─────────────┘  └──────┬───────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
     ┌────────▼────────┐   ┌─────────▼────────┐   ┌────────▼────────┐
     │ Secrets Manager │   │ MongoDB Atlas     │   │ Cloudinary      │
     │ JWT, Stripe, AI │   │ (existing DB)     │   │ (media uploads) │
     └─────────────────┘   └───────────────────┘   └─────────────────┘

     ┌─────────────────┐   ┌──────────────────┐
     │ CloudWatch Logs │   │ S3 (optional)    │
     │ /ecs/mr5-*      │   │ static 3D assets │
     └─────────────────┘   └──────────────────┘
```

---

## Service decisions

### Frontend — ECS Fargate (not S3-only)

| Option | Verdict | Why |
|--------|---------|-----|
| **S3 + CloudFront static** | ❌ Not suitable | App uses SSR, middleware, dynamic routes, server API routes |
| **ECS Fargate + ALB** | ✅ **Recommended** | Matches `output: "standalone"` Docker image; full Next.js feature set |
| **AWS Amplify Hosting** | ⚠️ Alternative | Simpler if you accept Amplify's Next.js adapter; less control than ECS |
| **Lambda** | ❌ Not suitable | Long-lived 3D sessions, WebSocket/LiveKit, large cold starts |

**CloudFront role:** Cache `/_next/static/*` and `public/*` at the edge; origin = ALB. Dynamic HTML still from ECS.

### Backend — ECS Fargate (not Lambda)

| Option | Verdict | Why |
|--------|---------|-----|
| **ECS Fargate** | ✅ **Recommended** | Long-running Express server, Stripe webhooks, file uploads, WebSockets potential |
| **Lambda + API Gateway** | ❌ Not suitable | Would require major refactor; mongoose connections, raw Stripe body |
| **EC2** | ⚠️ Optional | More ops overhead; use if you need persistent local disk or custom AMIs |

### Database — MongoDB Atlas (not RDS)

| Option | Verdict | Why |
|--------|---------|-----|
| **MongoDB Atlas** | ✅ **Recommended** | Codebase uses Mongoose/MongoDB throughout |
| **Amazon DocumentDB** | ⚠️ Migration project | Mongo-compatible but not 100%; requires testing |
| **Amazon RDS (PostgreSQL)** | ❌ Not suitable | Would require full data layer rewrite |

Connect from ECS tasks via Atlas IP allowlist or VPC peering / PrivateLink.

### Storage — S3 (optional) + Cloudinary (current)

| Service | Role |
|---------|------|
| **Cloudinary** | Primary uploads (courses, avatars) — keep unless migrating |
| **S3** | Optional: host large GLB files under `public/assets/3d/` with CloudFront OAC |
| **S3** | ALB/CloudFront access logs (optional) |

### Secrets — AWS Secrets Manager

| Secret | Service |
|--------|---------|
| `MONGO_URI`, `JWT_SECRET` | API task |
| `GEMINI_API_KEY`, `STRIPE_*`, `CLOUDINARY_API_SECRET` | API task |
| `GEMINI_API_KEY`, `WEATHER_API_KEY` | Web task (server routes) |

**Do not** bake secrets into Docker images or `.env` in images.

### DNS — Route 53

| Record | Target |
|--------|--------|
| `app.mr5school.com` | CloudFront or ALB alias |
| `api.mr5school.com` | ALB alias (API target group) |

### SSL — ACM

- **Regional cert** on ALB (same region as ECS)
- **us-east-1 cert** if using CloudFront with custom domain

### Monitoring — CloudWatch

| Component | Setup |
|-----------|--------|
| **Logs** | ECS `awslogs` driver → `/ecs/mr5-api`, `/ecs/mr5-web` |
| **Metrics** | ALB request count, 5xx, target health; ECS CPU/memory |
| **Alarms** | 5xx > threshold, unhealthy targets, CPU > 80% |
| **Dashboard** | API health + ALB + ECS service count |

API already logs JSON to stdout in production → CloudWatch Logs compatible.

### Security — IAM

| Role | Permissions |
|------|-------------|
| `mr5-ecs-execution-role` | ECR pull, Secrets Manager read, CloudWatch Logs write |
| `mr5-api-task-role` | Optional S3 read (if using S3 assets) |
| `mr5-web-task-role` | Minimal (or S3 if needed) |
| GitHub OIDC role | ECR push, ECS update-service |

**Principle of least privilege** — no `*` on `secretsmanager:GetSecretValue` beyond `mr5/production/*`.

### Optional services

| Service | When to use |
|---------|-------------|
| **WAF** | Public ALB/CloudFront; rate limit, geo block, OWASP rules |
| **Auto Scaling** | ECS service CPU/memory target tracking (recommended for prod) |
| **AWS Backup** | If you add RDS/EFS later; not needed for Atlas |
| **Systems Manager** | ECS Exec for debug shells (disable in strict prod) |

### What NOT to use

| Service | Why skip |
|---------|----------|
| RDS PostgreSQL | Wrong database engine for this codebase |
| Lambda for API | Architecture mismatch |
| S3-only frontend | Breaks Next.js SSR/middleware |
| ElastiCache | No Redis usage in codebase today |
| Cognito | Custom JWT auth already implemented |

---

## Network layout (recommended)

```
VPC 10.0.0.0/16
├── Public subnets (2 AZ)  → ALB
├── Private subnets (2 AZ) → ECS tasks (no public IP)
└── NAT Gateway            → Atlas, Cloudinary, Stripe, Gemini APIs
```

---

## CI/CD flow

```
GitHub push (main)
  → test (Jest + lint + build)
  → docker build api + web
  → push to ECR
  → ecs update-service --force-new-deployment
```

Workflow: `.github/workflows/aws-deploy.yml`  
Task definitions: `infra/aws/ecs/*.json.example`

---

## Cost-conscious starter sizing

| Service | Size |
|---------|------|
| ECS web | 1 vCPU / 2 GB, 1–2 tasks |
| ECS api | 0.5 vCPU / 1 GB, 1–2 tasks |
| ALB | 1 |
| NAT | 1 (cost driver — consider VPC endpoints for ECR/S3) |
| Atlas | M10 shared or serverless |

---

## Rollback

1. ECS: deploy previous task definition revision or re-tag `latest` in ECR to last good SHA
2. CloudFront: invalidate `/*` if static assets changed
3. See `ROLLBACK.md`
