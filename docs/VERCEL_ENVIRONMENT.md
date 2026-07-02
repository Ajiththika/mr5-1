# MR5 School — Vercel Production Environment

Guide for deploying `client-main` to **Vercel** with secure environment separation.

> Never store secrets in `NEXT_PUBLIC_*` variables. Vercel encrypts server-only env at rest.

---

## Recommended topology

| Layer | Host | Domain example |
|-------|------|----------------|
| Web (Next.js) | **Vercel** | `https://app.mr5school.com` |
| API (Express) | **ECS Fargate + ALB** | `https://api.mr5school.com` |
| Static 3D / media | **CloudFront + S3** or Vercel static | CDN URLs via `NEXT_PUBLIC_CDN_*` |
| Database | **MongoDB Atlas** | Private endpoint recommended |

---

## Environment separation

| Vercel environment | Branch / trigger | Purpose |
|--------------------|------------------|---------|
| **Production** | `main` | Live users |
| **Preview** | PR branches | QA, design review |
| **Development** | Local only | `npm run dev` + `.env.local` |

---

## Production variables (Vercel Dashboard → Settings → Environment Variables)

### Public (browser-safe) — `NEXT_PUBLIC_*`

| Variable | Example | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SITE_URL` | `https://app.mr5school.com` | ✅ |
| `NEXT_PUBLIC_API_URL` | `https://api.mr5school.com` | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | If payments |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | your cloud name | If uploads |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | unsigned preset name | If uploads |
| `NEXT_PUBLIC_LIVEKIT_URL` | `wss://...` | If live classes |
| `NEXT_PUBLIC_CDN_BASE_URL` | `https://cdn.mr5school.com` | Optional |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console token | Optional |

### Server-only (encrypted, **never** `NEXT_PUBLIC_`)

| Variable | Scope | Required |
|----------|-------|----------|
| `GEMINI_API_KEY` | Production, Preview | ✅ for AI routes |
| `WEATHER_API_KEY` | Production | ✅ for classroom weather |
| `OPENAI_API_KEY` | Production | Optional fallback AI |

Set **Environment** checkboxes:

- Production: all prod values
- Preview: use staging API URL + staging keys
- Development: leave empty (use `.env.local`)

---

## Domain configuration

1. Add custom domain `app.mr5school.com` in Vercel → Domains.
2. DNS: CNAME `app` → `cname.vercel-dns.com` (or Vercel nameservers).
3. Enable **automatic HTTPS** (Let's Encrypt).
4. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL.

### API proxy

`next.config.mjs` rewrites `/api/*` to `NEXT_PUBLIC_API_URL` when configured. Ensure:

- API `CORS_ORIGIN` includes `https://app.mr5school.com`
- Cookies use `Secure`, `SameSite=Lax` in production

---

## CDN support

For large GLB/3D assets:

1. Upload to S3 + CloudFront.
2. Set `NEXT_PUBLIC_CDN_BASE_URL` and per-model `NEXT_PUBLIC_CDN_*` vars.
3. Invalidate CloudFront on deploy (see `deploy.yml`).

Vercel's edge caches static files from `public/` automatically.

---

## Preview environments

Preview deployments should **not** use production secrets:

```
NEXT_PUBLIC_API_URL=https://api.staging.mr5school.com
NEXT_PUBLIC_SITE_URL=https://<preview-url>.vercel.app
GEMINI_API_KEY=<staging key from mr5-school/staging/gemini-api-key>
```

Use Vercel **Environment Variable** scoping: Preview ≠ Production.

---

## Security checklist

- [ ] No `sk_*`, `JWT_SECRET`, or `MONGO_URI` in Vercel web project
- [ ] `GEMINI_API_KEY` marked server-only (not exposed to client)
- [ ] Preview branches cannot reach production Atlas (separate DB)
- [ ] Vercel deployment protection enabled for production
- [ ] OWASP: disable directory listing, enable security headers (Next.js middleware)

---

## Local development

```bash
cp client-main/.env.local.example client-main/.env.local
# Edit placeholders — never commit .env.local
npm run dev
```

---

## ECS alternative (self-hosted web)

If hosting Next.js on ECS instead of Vercel, use `infra/ecs/mr5-web-task-definition.json` and the same env split (public env + Secrets Manager for server keys).

---

## Related docs

- `client-main/.env.local.example`
- `docs/AWS_SECRETS_MIGRATION.md`
- `docs/ARCHITECTURE.md`
- `SECURITY_REPORT.md`
