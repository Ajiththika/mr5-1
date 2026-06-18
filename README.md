# MR5 School

Immersive 3D learning platform with AI teachers, live weather classrooms, and student dashboard.

## Monorepo layout

| Directory | Description |
|-----------|-------------|
| [`client-main/`](client-main/) | Next.js 15 frontend |
| [`Mr5-School-API-main/`](Mr5-School-API-main/) | Express API + MongoDB |
| [`docs/`](docs/) | Product documentation |

## Quick start

```bash
# 1. API
cd Mr5-School-API-main
cp .env.local.example .env
# Set MONGO_URI and JWT_SECRET
PORT=5001 NODE_ENV=development node src/app.js

# 2. Frontend
cd client-main
cp .env.local.example .env.local
npm install && npm run dev
```

Open http://localhost:3000

## Documentation

| Document | Purpose |
|----------|---------|
| [ENV_AUDIT_REPORT.md](ENV_AUDIT_REPORT.md) | Complete environment variable inventory |
| [PROJECT_AUDIT.md](PROJECT_AUDIT.md) | Stack, structure, integrations |
| [AWS_PROJECT_AUDIT.md](AWS_PROJECT_AUDIT.md) | AWS deployment discovery |
| [AWS_ARCHITECTURE.md](AWS_ARCHITECTURE.md) | AWS service design |
| [AWS_DEPLOYMENT_CHECKLIST.md](AWS_DEPLOYMENT_CHECKLIST.md) | Go-live checklist |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment steps (incl. AWS) |
| [TEST_REPORT.md](TEST_REPORT.md) | Test validation results |
| [FINAL_RELEASE_REPORT.md](FINAL_RELEASE_REPORT.md) | AWS release candidate summary |
| [ROLLBACK.md](ROLLBACK.md) | Rollback procedures |
| [RELEASE_NOTES.md](RELEASE_NOTES.md) | Release notes |

## Environment setup

Copy example files — **never commit real secrets**:

- `client-main/.env.local.example` → `.env.local`
- `Mr5-School-API-main/.env.local.example` → `.env`

See [ENV_AUDIT_REPORT.md](ENV_AUDIT_REPORT.md) for every variable, required vs optional, and safe placeholders.

## Scripts

```bash
# Frontend
cd client-main && npm run build && npm test

# API
cd Mr5-School-API-main && npm test

# E2E (with dev server running)
cd client-main && npx playwright test
```

## License

Private project.
