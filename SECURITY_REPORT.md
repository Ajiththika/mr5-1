# MR5 School — Security Audit Report

**Audit date:** 2026-06-30  
**Scope:** Monorepo (`client-main`, `Mr5-School-API-main`, CI/CD, infra templates, env examples)  
**Auditor role:** Principal DevSecOps / Security review  
**Risk score:** **7.8 / 10** (High — immediate credential rotation required)

> **No secret values are reproduced in this document.** Any previously committed credentials are treated as **compromised** and must be rotated.

---

## Executive summary

MR5 School has solid application-layer controls (Helmet, rate limiting, Mongo sanitization, XSS filtering, JWT auth, consent middleware). However, **production example files previously contained real database and third-party API credentials**, dev seed passwords are hardcoded, and CI/CD lacks mandatory secret scanning and container vulnerability gates. This report prioritizes credential rotation, Secrets Manager migration, and pipeline hardening without breaking existing features.

---

## Critical findings

| ID | Finding | Impact | Remediation |
|----|---------|--------|-------------|
| C-01 | **Real credentials in `Mr5-School-API-main/.env.production.example`** — MongoDB connection string with username/password and Cloudinary API credentials were present in a tracked example file | Full database and media storage compromise if repo was ever public or shared | **Rotate MongoDB Atlas user password immediately.** Rotate Cloudinary API key/secret. File sanitized to placeholders (this audit). Audit git history with `gitleaks` / `trufflehog`. |
| C-02 | **Local `.env` files may exist on developer machines** (gitignored but not scanned in CI) | Credential leakage via backups, screenshots, or accidental commit | Enforce pre-commit hooks (`detect-secrets`, `gitleaks`). Never commit `.env*`. Use Secrets Manager in prod. |
| C-03 | **No automated secret scanning in default CI pipeline** | Regressions can re-introduce secrets | Add `deploy.yml` gates (gitleaks, Trivy, npm audit). Fail build on high-severity findings. |

---

## High findings

| ID | Finding | Impact | Remediation |
|----|---------|--------|-------------|
| H-01 | **Hardcoded dev seed passwords** in `Mr5-School-API-main/src/config/db.js` (`Admin@123456`, `Student@123456`, etc.) | Predictable credentials if dev DB exposed to network | Acceptable for local in-memory dev only. **Disable auto-seed in production** (already gated by `NODE_ENV`). Document that these accounts must never exist in prod. |
| H-02 | **E2E/tests reference default passwords** (`e2e/`, `tests/`) | Test creds mistaken for production | Keep test-only; use `TEST_STUDENT_PASSWORD` env in CI (already partially done). |
| H-03 | **JWT secret length only warned, not enforced in production** | Weak signing keys | Enforce `JWT_SECRET.length >= 32` and fail startup in `NODE_ENV=production`. |
| H-04 | **Duplicate JWT expiry vars** (`JWT_EXPIRE` vs `JWT_EXPIRES_IN`) | Misconfiguration, token lifetime bugs | Document canonical vars in `.env.example`; deprecate one in a future release. |
| H-05 | **ECS task definitions not standardized** on `mr5-school/prod/*` secret naming | Ops drift | Use `infra/ecs/mr5-*-task-definition.json` and `docs/AWS_SECRETS_MIGRATION.md`. |

---

## Medium findings

| ID | Finding | Impact | Remediation |
|----|---------|--------|-------------|
| M-01 | **`NEXT_PUBLIC_*` surface area** — API URL, Stripe pk_, Cloudinary cloud name, CDN paths | Expected public config; mislabeling secrets would expose them | Never prefix secrets with `NEXT_PUBLIC_`. Audit: current usage is appropriate. |
| M-02 | **`client-main/env.production.example` at repo root** duplicates `client-main/.env.local.example` | Confusion | Consolidate on `.env.local.example`; keep root `.env.production.example` as AWS/Vercel index only. |
| M-03 | **No dependency review / SCA in CI** | Vulnerable npm packages | Add `npm audit --audit-level=high` and Trivy image scan to `deploy.yml`. |
| M-04 | **Cloudinary unsigned upload preset in browser** | Abuse if preset allows arbitrary uploads | Restrict preset in Cloudinary dashboard; add upload size/type limits. |
| M-05 | **Gemini/OpenAI keys in Next.js server routes** | Correct pattern (server-only) but keys in Vercel env UI | Use Vercel encrypted env + rotation policy. |
| M-06 | **CORS defaults to `localhost:3000`** | Misconfiguration in prod if unset | Require explicit `CORS_ORIGIN` in production validation. |

---

## Low findings

| ID | Finding | Impact | Remediation |
|----|---------|--------|-------------|
| L-01 | **Browserslist data stale** (build warning) | Minor supply-chain hygiene | Run `npx update-browserslist-db@latest` periodically. |
| L-02 | **Mongoose duplicate index warning** | Noise in logs | Clean schema index definitions. |
| L-03 | **`.envcopy` in gitignore** but nonstandard | Accidental commits | Covered by `.env.*` ignore rules. |
| L-04 | **Admin scripts with default passwords** (`seedCourses.js`, `FINAL_SEED.js`) | Dev-only risk | Gate with `NODE_ENV` and env vars only. |

---

## Security controls present (strengths)

| Control | Location | Status |
|---------|----------|--------|
| Helmet security headers | `Mr5-School-API-main/src/middleware/security.js` | ✅ |
| Rate limiting (API, auth, identity) | `security.js`, route limiters | ✅ |
| MongoDB query sanitization | `express-mongo-sanitize` | ✅ |
| XSS input filtering | `xss` package | ✅ |
| JWT authentication | `authService`, middleware | ✅ |
| Legal consent middleware | `consentMiddleware.js` | ✅ |
| Health / readiness probes | `/health`, `/ready` | ✅ |
| Env validation (partial) | `src/config/env.js` | ⚠️ Strengthen prod rules |
| Git ignores `.env` | `.gitignore` | ✅ Enhanced in this audit |
| OIDC AWS deploy workflow | `.github/workflows/aws-deploy.yml` | ✅ Extend with scans |

---

## Browser-exposed variables audit (`NEXT_PUBLIC_*`)

| Variable | Safe? | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public canonical URL |
| `NEXT_PUBLIC_API_URL` | ✅ | Public API origin (not a secret) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Designed for browser (`pk_*` only) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Public identifier |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ⚠️ | Public but scope preset permissions tightly |
| `NEXT_PUBLIC_CDN_*` | ✅ | Asset URLs only |
| `NEXT_PUBLIC_*_VERIFICATION` | ✅ | SEO tokens |

**No `sk_*`, JWT, or database credentials use `NEXT_PUBLIC_` prefix** — correct.

---

## Recommendations (prioritized)

### Immediate (0–48 hours)

1. **Rotate all credentials** that ever appeared in example files or git history (MongoDB, Cloudinary, any API keys).
2. Deploy sanitized `.env.production.example` (completed in this audit).
3. Enable **GitHub secret scanning** and run `gitleaks detect` locally.
4. Store production secrets only in **AWS Secrets Manager** / Vercel encrypted env.

### Short term (1–2 weeks)

5. Register ECS task definitions from `infra/ecs/`.
6. Enable **`deploy.yml`** pipeline with Trivy + npm audit + gitleaks.
7. Enforce **JWT_SECRET >= 32 chars** at API startup in production.
8. Add **WAF** on ALB / CloudFront (AWS WAF rate rules).

### Medium term (1–3 months)

9. MongoDB Atlas **IP allowlist** + private endpoint for ECS.
10. **Centralized logging** (CloudWatch → SIEM), alerts on 5xx and auth failures.
11. **Quarterly access review** for IAM, Atlas, Vercel, Stripe dashboards.
12. **Disaster recovery drills** — Atlas backup restore test.

---

## Risk score breakdown

| Category | Score (0–10) | Weight |
|----------|--------------|--------|
| Secret management | 9 | 30% |
| Application security | 4 | 25% |
| Infrastructure | 6 | 20% |
| CI/CD | 7 | 15% |
| Compliance / logging | 5 | 10% |
| **Weighted total** | **7.8** | |

---

## Files delivered in this hardening pass

- `SECURITY_REPORT.md` (this file)
- `client-main/.env.local.example`
- `Mr5-School-API-main/.env.example` (updated)
- `Mr5-School-API-main/.env.production.example` (sanitized)
- `docs/AWS_SECRETS_MIGRATION.md`
- `docs/VERCEL_ENVIRONMENT.md`
- `docs/ARCHITECTURE.md`
- `infra/ecs/mr5-api-task-definition.json`
- `infra/ecs/mr5-web-task-definition.json`
- `infra/iam/ecs-secrets-policy.json`
- `infra/iam/github-actions-deploy-policy.json`
- `scripts/create-secrets.sh`
- `.github/workflows/deploy.yml`
- `.gitignore` (hardened)
- `.pre-commit-config.yaml`

---

## Sign-off checklist

- [ ] MongoDB credentials rotated
- [ ] Cloudinary credentials rotated
- [ ] JWT_SECRET rotated in production
- [ ] Secrets created in AWS Secrets Manager (`scripts/create-secrets.sh`)
- [ ] ECS services updated with new task definitions
- [ ] Vercel env vars audited (no secrets in `NEXT_PUBLIC_*`)
- [ ] Pre-commit hooks installed (`pre-commit install`)
- [ ] First green `deploy.yml` run on main
