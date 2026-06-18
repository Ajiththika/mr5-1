# MR5 School — Release Notes (RC1)

**Release candidate:** Environment audit + production readiness  
**Date:** 2026-06-15

---

## Highlights

### Immersive classroom
- Live weather via geolocation + OpenWeatherMap (with mock fallback)
- Time-of-day lighting (morning / afternoon / evening / night)
- Atmospheric effects: rain, lightning, wind, fog, ceiling lights
- Status panel + dev-only environment override panel
- Practical lab bench in 3D scene

### Environment & security
- Complete env variable inventory (`ENV_AUDIT_REPORT.md`)
- Templates: `.env.example`, `.env.local.example`, `.env.production.example` (frontend + API)
- **Removed hardcoded Cloudinary API key** from server config
- Consolidated `OLLAMA_HOST` / `OLLAMA_URL` resolution
- Default API port aligned to **5001** across docs, env, Docker
- Next.js weather route (`/api/context/weather`) works without API restart

### SEO
- Dynamic sitemap, robots.txt, per-page metadata
- JSON-LD (Organization, WebSite, Course)
- Classroom route SEO layout

### Testing & CI
- Unit tests for classroom environment logic
- E2E specs for student dashboard, SEO, classroom environment
- GitHub Actions: API tests, client lint/test, Playwright smoke

### Documentation
- `PROJECT_AUDIT.md`, `DEPLOYMENT.md`, `ROLLBACK.md`
- Updated `client-main/README.md`

---

## Breaking changes

None intended. Cloudinary uploads now require explicit env vars (previously used insecure defaults).

---

## Upgrade steps

1. Pull latest code
2. Copy new env templates; fill missing values
3. Set `CLOUDINARY_*` if using uploads
4. Restart API and frontend
5. Run `npm run build` in `client-main`

---

## Known issues

- Full Playwright E2E requires API + seeded DB on CI runner
- `JWT_REFRESH_SECRET` documented as unused legacy name
- `/api/ai/openai` route name is legacy (uses Gemini)

---

## Verification checklist

- [x] `npm run build` (client-main)
- [x] `npm test -- lib/classroom-environment.test.ts`
- [x] Weather route returns JSON
- [ ] Full E2E suite (requires live API + credentials)
- [ ] Manual browser: login → classroom → env overrides
