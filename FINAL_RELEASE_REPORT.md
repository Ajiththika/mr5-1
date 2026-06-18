# MR5 School — Final Release Report (AWS RC)

**Date:** 2026-06-15  
**Release:** AWS production deployment candidate

---

## What changed

### Documentation (new)
- `AWS_PROJECT_AUDIT.md` — repository discovery for AWS
- `AWS_ARCHITECTURE.md` — service selection and network design
- `AWS_DEPLOYMENT_CHECKLIST.md` — step-by-step go-live list
- `TEST_REPORT.md` — validation results
- `.env.production.example` — unified production template
- `DEPLOYMENT.md` — extended with AWS section

### Infrastructure (new)
- `docker-compose.yml` — local prod-like stack
- `client-main/.dockerignore`, `Mr5-School-API-main/.dockerignore`
- `infra/aws/ecs/task-definition-api.json.example`
- `infra/aws/ecs/task-definition-web.json.example`
- `.github/workflows/aws-deploy.yml` — test → ECR → ECS

### Code fixes (incremental)
- **Dockerfiles:** healthchecks, non-root users, PORT 5001 on API, removed `.env` copy in API image
- **Frontend Dockerfile:** `NEXT_PUBLIC_SITE_URL` build arg, removed hardcoded Cloudinary default
- **Logger:** console-only in ECS (`AWS_EXECUTION_ENV`) for CloudWatch Logs
- **CORS:** `CORS_EXTRA_ORIGINS` env for AWS cutover domains
- **Lint:** removed unused import in `RegionalSettingsContext.tsx`

### Preserved
- All existing routes, classroom weather, student dashboard, auth, Stripe webhook handling
- Existing `ci.yml` workflow
- MongoDB + Mongoose data layer (no RDS migration)

---

## AWS services used

| Required | Optional |
|----------|----------|
| ECS Fargate | CloudFront |
| ALB | WAF |
| ECR | S3 (static assets) |
| Secrets Manager | Auto Scaling |
| Route 53 | AWS Backup |
| ACM | Systems Manager |
| CloudWatch Logs & Alarms | |
| IAM | |
| VPC + NAT | |

**External (not AWS):** MongoDB Atlas, Cloudinary, Stripe, Gemini, OpenWeather, LiveKit

---

## Environment files needed

| File | Use |
|------|-----|
| `client-main/.env.local.example` → `.env.local` | Local dev |
| `Mr5-School-API-main/.env.local.example` → `.env` | Local API |
| `.env.production.example` | AWS / production mapping |
| AWS Secrets Manager | Runtime secrets in ECS |

See **`ENV_AUDIT_REPORT.md`** for full variable list.

---

## Test status

| Check | Status |
|-------|--------|
| `npm run build` (client) | ✅ Pass |
| Client Jest (27 tests) | ✅ Pass |
| Client ESLint | ✅ Pass |
| API Jest (13 tests) | ✅ Pass |
| Playwright smoke (CI) | ✅ Configured |
| Full E2E locally | ⚠️ Needs API + DB running |

---

## Deployment status

| Item | Status |
|------|--------|
| Docker images buildable | ✅ |
| docker-compose | ✅ |
| ECS task definition templates | ✅ |
| GitHub Actions AWS workflow | ✅ (requires secrets) |
| Manual AWS provisioning | ⏳ Operator action |

---

## Known limitations

1. **MongoDB Atlas required** — not Amazon RDS; DocumentDB is a separate migration
2. **Next.js cannot run on S3-only** — must use ECS or Amplify
3. **AWS deploy workflow** — requires OIDC role + ECR + ECS pre-provisioned
4. **NEXT_PUBLIC_* vars** — baked at Docker build time; changing API URL requires rebuild
5. **Cloudinary** — still primary upload path; S3 migration is optional
6. **E2E in CI** — smoke only; full suite needs Mongo service container

---

## Final checklist

- [x] Project audited (`AWS_PROJECT_AUDIT.md`)
- [x] Architecture documented (`AWS_ARCHITECTURE.md`)
- [x] Env templates and audit complete
- [x] Production build passes
- [x] Unit tests pass
- [x] Lint passes
- [x] Docker + compose ready
- [x] CI/CD workflow added
- [x] CloudWatch-friendly logging
- [x] Health checks on containers
- [ ] AWS account provisioned (operator)
- [ ] Secrets in Secrets Manager (operator)
- [ ] First ECS deploy (operator)
- [ ] DNS cutover (operator)
- [ ] Staging browser verification on AWS URL

---

## Important warnings

1. **Rotate Cloudinary credentials** if the old hardcoded API key was ever exposed in git history
2. **Set `CORS_ORIGIN` and `CLIENT_URL`** to your real production frontend URL before go-live
3. **Stripe webhook** must point to the public API ALB URL with HTTPS
4. **Do not** put `JWT_SECRET` or `GEMINI_API_KEY` in `NEXT_PUBLIC_*` variables
5. **Rebuild web image** when changing `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_SITE_URL`

---

## Next operator steps

1. Complete `AWS_DEPLOYMENT_CHECKLIST.md`
2. Run `docker compose up --build` locally to validate images
3. Configure GitHub secrets and trigger `aws-deploy` workflow
4. Verify `https://api.<domain>/health` and app login on AWS URL
5. Enable CloudWatch alarms and WAF if public-facing
