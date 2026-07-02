# MR5 School v2.0.0

Immersive 3D learning platform with AI teachers, live weather classrooms, and student dashboard. **Enterprise release — AWS-ready.**

## Monorepo layout

| Directory | Description |
|-----------|-------------|
| [`client-main/`](client-main/) | Next.js 15 frontend (`mr5-school-web`) |
| [`Mr5-School-API-main/`](Mr5-School-API-main/) | Express API + MongoDB (`mr5-school-api`) |
| [`infra/aws/`](infra/aws/) | ECS task definition templates |
| [`docs/`](docs/) | Product documentation |

## Quick start (development)

```bash
# 1. API
cd Mr5-School-API-main
cp .env.example .env
# Set MONGO_URI and JWT_SECRET (32+ chars)
npm run dev

# 2. Frontend
cd client-main
cp .env.example .env
npm install && npm run dev
```

Open http://localhost:3000

## Production verify (before AWS deploy)

```bash
npm run verify          # lint + test + build (all packages)
# or
docker compose up --build
```

## AWS deployment

**Start here:** [AWS_FINAL_DEPLOY.md](AWS_FINAL_DEPLOY.md)

Push to `main` → GitHub Actions runs tests, builds Docker images, pushes to ECR, rolls ECS services.

## Documentation

| Document | Purpose |
|----------|---------|
| [AWS_FINAL_DEPLOY.md](AWS_FINAL_DEPLOY.md) | **AWS go-live guide (start here)** |
| [FINAL_RELEASE_REPORT.md](FINAL_RELEASE_REPORT.md) | v2.0.0 release validation |
| [ENV_AUDIT_REPORT.md](ENV_AUDIT_REPORT.md) | Environment variable inventory |
| [DEPLOYMENT.md](DEPLOYMENT.md) | General deployment options |
| [AWS_ARCHITECTURE.md](AWS_ARCHITECTURE.md) | AWS service design |
| [ROLLBACK.md](ROLLBACK.md) | Rollback procedures |

## Environment setup

Copy example files — **never commit real secrets**:

- `Mr5-School-API-main/.env.example` → `Mr5-School-API-main/.env` (API port **5000**)
- `client-main/.env.example` → `client-main/.env` (web port **3000**)

## Scripts

```bash
npm run verify          # Full release check (recommended before deploy)
npm run test            # API + web tests
npm run build           # Production web build
npm run docker:up       # Docker Compose stack
```

## License

Private project.
