# MR5 School — Production Architecture

Enterprise reference architecture for the MR5 School immersive learning platform.

---

## High-level diagram

```
                    ┌─────────────┐
                    │   Users     │
                    │  (Browser)  │
                    └──────┬──────┘
                           │ HTTPS
                           ▼
                    ┌─────────────┐
                    │ CloudFront  │  Static assets, CDN cache, WAF (optional)
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   Vercel    │           │     ALB     │
       │  (Next.js)  │           │             │
       │  app.mr5…   │           └──────┬──────┘
       └──────┬──────┘                  │
              │ API proxy / fetch       │
              └────────────┬────────────┘
                           ▼
                    ┌─────────────┐
                    │ ECS Fargate │
                    │  mr5-api    │  Express API :5001
                    │  mr5-web*   │  (* optional if not on Vercel)
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │  MongoDB    │   │   Secrets   │   │ CloudWatch  │
  │   Atlas     │   │   Manager   │   │ Logs/Metrics│
  └─────────────┘   └─────────────┘   └─────────────┘
```

---

## Components

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| **Web** | Next.js 15 (React 19) | SSR, API routes (Gemini proxy), 3D classroom UI |
| **API** | Node.js / Express | Auth, courses, shop, enrollments, AI tutor |
| **Database** | MongoDB Atlas | Users, courses, progress, shop catalog |
| **Secrets** | AWS Secrets Manager | Credentials injection into ECS tasks |
| **Compute** | ECS Fargate | Serverless containers, auto-scaling |
| **Load balancer** | ALB | TLS termination, health checks, routing |
| **CDN** | CloudFront | 3D models, images, edge caching |
| **CI/CD** | GitHub Actions | Lint, test, scan, build, deploy |
| **Monitoring** | CloudWatch + optional Datadog | Logs, metrics, synthetics |

---

## Security boundaries

```
┌──────────────────────────────────────────────────────────────┐
│ Public Internet                                               │
│  CloudFront / Vercel Edge — TLS 1.2+, HSTS                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│ DMZ — ALB security group                                       │
│  Inbound: 443 from 0.0.0.0/0                                   │
│  Outbound: ECS tasks only                                      │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│ Private subnets — ECS tasks                                    │
│  No public IPs; NAT for outbound provider APIs                 │
│  SG: allow 5001/3000 from ALB only                            │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│ Data plane — MongoDB Atlas (VPC peering / private endpoint)    │
│  IP allowlist: ECS NAT + Vercel (if direct — prefer API only)  │
└──────────────────────────────────────────────────────────────┘
```

### IAM roles

| Role | Purpose |
|------|---------|
| `mr5-ecs-execution-role` | Pull ECR images, read Secrets Manager, write logs |
| `mr5-api-task-role` | Runtime AWS API access (S3 uploads if needed) |
| `mr5-web-task-role` | Minimal — Next.js server runtime |
| `github-actions-deploy` | OIDC — ECR push, ECS update, CloudFront invalidation |

Policies: `infra/iam/`

---

## Scaling strategy

### ECS Fargate

| Service | CPU | Memory | Min tasks | Max tasks | Scale metric |
|---------|-----|--------|-----------|-----------|--------------|
| `mr5-api` | 512 | 1024 MB | 2 | 10 | ALB `RequestCountPerTarget`, CPU > 70% |
| `mr5-web` (ECS) | 1024 | 2048 MB | 2 | 8 | ALB requests, CPU |

**Target tracking:** 70% CPU, scale-out cooldown 60s, scale-in 300s.

### Vercel

Automatic edge scaling for frontend. No manual task management.

### MongoDB Atlas

- M10+ for production
- Enable auto-scaling storage
- Read preference `primary` for writes; optional secondary for analytics

---

## Disaster recovery

| Asset | RPO | RTO | Strategy |
|-------|-----|-----|----------|
| MongoDB | 1 h | 4 h | Atlas continuous backup + point-in-time restore |
| Secrets | 0 | 1 h | Secrets Manager versioning + documented rotation |
| Container images | 0 | 30 min | ECR immutable tags per git SHA |
| Static assets | 24 h | 2 h | S3 versioning + CloudFront |
| Vercel deployment | 0 | 15 min | Instant rollback in Vercel dashboard |

**Quarterly:** restore Atlas backup to staging cluster and run smoke tests.

---

## Backup strategy

1. **Atlas:** automated backups, 7-day retention minimum (30-day recommended).
2. **S3:** versioning on `mr5-assets` bucket; lifecycle to Glacier after 90 days.
3. **Secrets:** enable rotation schedules; document in runbook.
4. **Infrastructure:** Terraform/CDK state in encrypted S3 (future).

---

## Monitoring strategy

| Signal | Source | Alert |
|--------|--------|-------|
| API 5xx rate | ALB + CloudWatch | > 1% for 5 min |
| API latency p95 | ALB | > 2s for 10 min |
| ECS task health | `/ready` failures | Any task unhealthy |
| MongoDB connections | Atlas metrics | > 80% pool |
| Auth failures | API logs | Spike detection |
| Certificate expiry | ACM | 30 days before |

Optional: Datadog synthetics (`client-main/.github/workflows/datadog-synthetics.yml`).

---

## Deployment flow

```
git push main
    → GitHub Actions (deploy.yml)
        → lint + test
        → gitleaks + npm audit
        → docker build
        → Trivy scan (fail on CRITICAL)
        → push ECR
        → ECS force-new-deployment
        → CloudFront invalidation
        → Vercel production deploy (parallel or webhook)
```

---

## Environment matrix

| | Development | Staging | Production |
|---|-------------|---------|------------|
| Web | localhost:3000 | Vercel preview | Vercel prod |
| API | localhost:5001 | ECS staging | ECS prod |
| Secrets prefix | `mr5-school/dev/` | `mr5-school/staging/` | `mr5-school/prod/` |
| MongoDB | In-memory / dev cluster | Staging cluster | Prod cluster |

---

## Related files

- `infra/ecs/mr5-api-task-definition.json`
- `infra/ecs/mr5-web-task-definition.json`
- `docs/AWS_SECRETS_MIGRATION.md`
- `docs/VERCEL_ENVIRONMENT.md`
- `.github/workflows/deploy.yml`
- `SECURITY_REPORT.md`
