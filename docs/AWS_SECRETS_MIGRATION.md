# AWS Secrets Manager — MR5 School Migration Guide

This document defines how to migrate MR5 School from flat `.env` files to **AWS Secrets Manager**, without storing real values in git.

> **Treat any value that ever lived in a committed file as compromised. Rotate before migrating.**

---

## Secret naming convention

```
mr5-school/<environment>/<secret-name>
```

| Environment | Prefix | Example |
|-------------|--------|-----------|
| Production | `mr5-school/prod/` | `mr5-school/prod/jwt-secret` |
| Staging | `mr5-school/staging/` | `mr5-school/staging/jwt-secret` |
| Development | `mr5-school/dev/` | `mr5-school/dev/jwt-secret` |

Each secret is a **single string** (one env var per secret) for fine-grained IAM and rotation. Alternatively, use **JSON secrets** with multiple keys — ECS `valueFrom` supports both patterns (see task definitions).

---

## Secret migration table

| Old environment variable | AWS Secrets Manager path (prod) | Service | Notes |
|--------------------------|----------------------------------|---------|-------|
| `MONGO_URI` / `MONGODB_URI` | `mr5-school/prod/mongo-uri` | API | Atlas connection string |
| `JWT_SECRET` | `mr5-school/prod/jwt-secret` | API | Min 32 bytes random |
| `GEMINI_API_KEY` | `mr5-school/prod/gemini-api-key` | API, Web | Google AI Studio |
| `OPENAI_API_KEY` | `mr5-school/prod/openai-api-key` | API, Web | Optional |
| `WEATHER_API_KEY` | `mr5-school/prod/weather-api-key` | API, Web | OpenWeather |
| `STRIPE_SECRET_KEY` | `mr5-school/prod/stripe-secret-key` | API | `sk_live_*` |
| `STRIPE_WEBHOOK_SECRET` | `mr5-school/prod/stripe-webhook-secret` | API | `whsec_*` |
| `CLOUDINARY_API_SECRET` | `mr5-school/prod/cloudinary-api-secret` | API | Server-only |
| `CLOUDINARY_API_KEY` | `mr5-school/prod/cloudinary-api-key` | API | Can be SM or plain env |
| `GOOGLE_CLIENT_SECRET` | `mr5-school/prod/google-client-secret` | API | OAuth |
| `LIVEKIT_API_SECRET` | `mr5-school/prod/livekit-api-secret` | API | |
| `EMAIL_PASS` | `mr5-school/prod/email-pass` | API | App password |
| `SMTP_PASS` | `mr5-school/prod/smtp-pass` | API | |
| `AZURE_SPEECH_KEY` | `mr5-school/prod/azure-speech-key` | API | |
| `AVATHOR_SECRET_TOKEN` | `mr5-school/prod/avathor-secret-token` | API | |
| `CONSENT_IP_SALT` | `mr5-school/prod/consent-ip-salt` | API | If IP logging enabled |

### Non-secret (plain ECS/Vercel environment)

| Variable | Value type | Where |
|----------|------------|-------|
| `NODE_ENV` | `production` | API, Web |
| `PORT` | `5001` / `3000` | API / Web |
| `CORS_ORIGIN` | `https://app.mr5school.com` | API |
| `CLIENT_URL` | `https://app.mr5school.com` | API |
| `CLOUDINARY_CLOUD_NAME` | Public name | API |
| `GOOGLE_CLIENT_ID` | Public OAuth client ID | API |
| `NEXT_PUBLIC_SITE_URL` | `https://app.mr5school.com` | Web |
| `NEXT_PUBLIC_API_URL` | `https://api.mr5school.com` | Web |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_*` | Web |

---

## Bootstrap script

Run once per environment after replacing placeholders:

```bash
./scripts/create-secrets.sh prod
# or: ./scripts/create-secrets.sh staging
```

See `scripts/create-secrets.sh` for the full list of secrets created.

---

## ECS integration

Task definitions map secrets to container environment variables:

```json
{
  "name": "JWT_SECRET",
  "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:mr5-school/prod/jwt-secret-AbCdEf"
}
```

Full definitions:

- `infra/ecs/mr5-api-task-definition.json`
- `infra/ecs/mr5-web-task-definition.json`

### Execution role

ECS **execution role** needs `secretsmanager:GetSecretValue` on `arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:mr5-school/*`.

Policy template: `infra/iam/ecs-secrets-policy.json`

### Task role

API **task role** needs S3/CloudWatch permissions as required by app features — separate from secrets access.

---

## IAM policies

| File | Purpose |
|------|---------|
| `infra/iam/ecs-secrets-policy.json` | Attach to `mr5-ecs-execution-role` |
| `infra/iam/github-actions-deploy-policy.json` | OIDC deploy role for CI/CD |

---

## Rotation procedure

1. Generate new secret value in Secrets Manager (`PutSecretValue` or console).
2. For **JWT_SECRET**: plan session invalidation — all users re-login.
3. Force ECS deployment: `aws ecs update-service --force-new-deployment`.
4. For Vercel: update encrypted env → redeploy.
5. Revoke old API keys at provider (Stripe, Cloudinary, Atlas, etc.).

---

## Vercel vs ECS split

| Component | Hosting | Secrets |
|-----------|---------|---------|
| Next.js frontend | **Vercel** (recommended) or ECS | Vercel encrypted env for `GEMINI_API_KEY`, `WEATHER_API_KEY` |
| Express API | **ECS Fargate** | Secrets Manager via task definition |
| MongoDB | **Atlas** | Connection string in `mr5-school/prod/mongo-uri` |

See `docs/VERCEL_ENVIRONMENT.md` for frontend-specific configuration.

---

## Backward compatibility

- Local dev continues using `.env` / `.env.local` (gitignored).
- ECS injects secrets as **environment variables** at container start — **no application code changes required**.
- Existing `src/config/env.js` reads `process.env.*` unchanged.

---

## Verification

```bash
# List secrets (names only)
aws secretsmanager list-secrets \
  --filters Key=name,Values=mr5-school/prod/

# Test API task can start (after task def registered)
aws ecs run-task \
  --cluster mr5-production \
  --task-definition mr5-api \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=DISABLED}"
```

---

## Compliance notes

- Enable **Secrets Manager rotation** for `mongo-uri` via Atlas integration where supported.
- Enable **CloudTrail** logging for `GetSecretValue` and `PutSecretValue`.
- Restrict secret access to production deployment roles only — developers use `mr5-school/dev/*` or local `.env`.
