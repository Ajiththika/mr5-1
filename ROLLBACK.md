# MR5 School — Rollback Procedure

## When to rollback

- Production build fails after deploy
- Auth or payments broken
- API health check failing
- Critical runtime errors in classroom or student flows

---

## Frontend (Vercel / static host)

### Vercel

1. Open project → **Deployments**
2. Find last known-good deployment
3. Click **⋯** → **Promote to Production**

### Docker / VM

```bash
# Tag previous image
docker pull mr5-frontend:previous
docker stop mr5-frontend-current
docker run -d --name mr5-frontend -p 3000:3000 mr5-frontend:previous
```

### Git-based

```bash
git checkout <last-good-tag-or-commit>
cd client-main && npm ci && npm run build
# Redeploy artifact
```

---

## API

### Process manager (PM2)

```bash
pm2 list
pm2 restart mr5-api --update-env
# Or restore previous release directory and restart
```

### Vercel / serverless

Promote previous deployment in dashboard (same as frontend).

### Database caution

**Do not** roll back MongoDB data unless a migration caused corruption. App rollback is code-only; DB changes may need manual revert scripts.

---

## Environment rollback

If a bad env var caused the issue:

1. Open hosting dashboard → Environment Variables
2. Restore values from secure backup / password manager
3. Redeploy (Vercel: trigger redeploy without code change)

Common mistakes:

- Wrong `NEXT_PUBLIC_API_URL` (CORS / 502 on login)
- `CORS_ORIGIN` mismatch with frontend URL
- Invalid `JWT_SECRET` (logs everyone out)

---

## Verification after rollback

1. `curl https://api.example.com/health`
2. Login as test student
3. Open `/student/portal` and one classroom route
4. Check error monitoring (if configured)

---

## Prevention

- Tag releases: `git tag v1.2.3`
- Keep `RELEASE_NOTES.md` per deploy
- Run `npm run build` and smoke E2E before promote
