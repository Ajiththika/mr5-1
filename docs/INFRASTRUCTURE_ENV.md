# MR5 School — Infrastructure Environment Map

## Architecture (current — from `AWS_ARCHITECTURE.md`)

```
Users → CloudFront (optional) → ALB → ECS Web (Next.js)
                              → ALB → ECS API (Express)
                                        ↓
                                  MongoDB Atlas
                                        ↓
                              Secrets Manager
```

## Where each variable lives

| Variable group | AWS placement | Access |
|----------------|---------------|--------|
| `MONGO_URI`, `JWT_SECRET`, `STRIPE_*`, `CLOUDINARY_API_SECRET`, `GOOGLE_CLIENT_SECRET`, email passwords | **Secrets Manager** → ECS API task | API task IAM role |
| `GEMINI_API_KEY`, `WEATHER_API_KEY` | **Secrets Manager** → ECS Web task | Web task IAM role |
| `CORS_ORIGIN`, `CLIENT_URL`, `LOG_LEVEL`, `AI_PROVIDER`, legal flags | ECS API **environment** | Plain env |
| `NEXT_PUBLIC_*` | Docker **build-arg** + ECS Web env | Public |
| `AWS_REGION`, `ECR_*`, `ECS_*` | **GitHub Secrets** | CI/CD only |
| 3D assets | **S3** + **CloudFront** | `NEXT_PUBLIC_CDN_*` URLs |

## IAM principle of least privilege

| Task | Needs |
|------|-------|
| API task role | Secrets Manager read (api secret), CloudWatch logs |
| Web task role | Secrets Manager read (web secret), CloudWatch logs |
| GitHub OIDC role | ECR push, ECS update-service, no Secrets Manager write |
| Developers | No production secrets in local `.env` — use staging |

## Network

| Port | Service |
|------|---------|
| 443 | ALB HTTPS (public) |
| 5001 | API container (private) |
| 3000 | Web container (private) |

## Logging & monitoring

| Source | Destination |
|--------|-------------|
| API stdout/stderr | CloudWatch Logs (`awslogs`) |
| Web stdout/stderr | CloudWatch Logs |
| `LOG_TO_FILE=true` | **Disabled on ECS** (`AWS_EXECUTION_ENV` set) |

## 3D asset CDN

| Env | Purpose |
|-----|---------|
| `NEXT_PUBLIC_CDN_BASE_URL` | CloudFront distribution URL |
| `AWS_S3_ASSETS_BUCKET` | Upload target (deploy scripts) |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | Cache invalidation on deploy |

## Docker Compose (local)

See root `docker-compose.yml` — passes `Mr5-School-API-main/.env` to API; web build-args for `NEXT_PUBLIC_*`.

## Related docs

- `AWS_FINAL_DEPLOY.md` — go-live steps
- `AWS_DEPLOYMENT_CHECKLIST.md` — checklist
- `infra/aws/ecs/task-definition-*.json.example` — ECS task templates
- `docs/CICD_SECRETS.md` — GitHub secrets
- `docs/DISASTER_RECOVERY_ENV.md` — backup / restore
