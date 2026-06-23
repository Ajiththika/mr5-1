# AWS Infrastructure Templates

## ECS task definitions

| File | Service |
|------|---------|
| `ecs/task-definition-api.json.example` | Express API (port 5001) |
| `ecs/task-definition-web.json.example` | Next.js web (port 3000) |

Replace placeholders before registering:

- `ACCOUNT_ID` — AWS account ID
- `REGION` — e.g. `us-east-1`
- Image URIs — ECR repository URLs
- Secret ARNs — Secrets Manager paths

## Register task definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://infra/aws/ecs/task-definition-api.json
```

## Required secrets (API)

`MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `CLIENT_URL`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDINARY_API_SECRET`

## Health checks

- API: `GET /health` — returns 200 when MongoDB connected
- Web: `GET /` — returns 200

## Deploy automation

See root [`AWS_FINAL_DEPLOY.md`](../../AWS_FINAL_DEPLOY.md) and [`.github/workflows/aws-deploy.yml`](../../.github/workflows/aws-deploy.yml).
