# MR5 School — CI/CD Secret Requirements

## GitHub Actions — `ci.yml`

| Variable | Type | Required | Purpose |
|----------|------|----------|---------|
| `JWT_SECRET` | env (inline) | Yes | API tests |
| `MONGO_URI` | env (inline) | Yes | API tests |
| `NODE_ENV=test` | env | Yes | Test mode |
| `CI=true` | auto | Yes | Playwright retries |

## GitHub Actions — `aws-deploy.yml`

### Secrets (repository)

| Secret | Required | Purpose |
|--------|----------|---------|
| `AWS_ROLE_ARN` | Yes | OIDC assume role for deploy |
| `AWS_REGION` | Yes | ECR / ECS region |
| `ECR_REPOSITORY_API` | Yes | API image repo name |
| `ECR_REPOSITORY_WEB` | Yes | Web image repo name |
| `ECS_CLUSTER` | Yes | Target cluster |
| `ECS_SERVICE_API` | Yes | API service name |
| `ECS_SERVICE_WEB` | Yes | Web service name |

### Variables (repository — non-secret)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Docker build-arg for web |
| `NEXT_PUBLIC_SITE_URL` | Docker build-arg for web |

### Build-time env (workflow)

| Variable | Job | Purpose |
|----------|-----|---------|
| `NEXT_PUBLIC_API_URL` | client build | Production URL smoke |
| `NEXT_PUBLIC_SITE_URL` | client build | Canonical URL smoke |

## NOT in CI (runtime only — AWS Secrets Manager)

`MONGO_URI`, `JWT_SECRET`, `STRIPE_*`, `GEMINI_API_KEY`, `CLOUDINARY_API_SECRET`, all SMTP credentials.

## Security rules

- Never commit `.env`, `.env.local`, or `.env.production` with real values.
- OIDC preferred over long-lived `AWS_ACCESS_KEY_ID` in GitHub.
- Rotate `AWS_ROLE_ARN` trust policy if repo ownership changes.
