# MR5 School — Disaster Recovery & Backup Environment

## Current state (from codebase)

| Capability | Status | Notes |
|------------|--------|-------|
| MongoDB persistence | **Required in prod** | `MONGO_URI` — use MongoDB Atlas with backups |
| In-memory MongoDB | Dev/test only | `db.js` — never production |
| File logs | Optional | `LOG_TO_FILE=true` — disabled on ECS (`AWS_EXECUTION_ENV`) |
| Refresh token store | MongoDB | Revoke via `logout-all` |
| Stripe payment records | Stripe + MongoDB | Reconcile from Stripe dashboard |

## Recommended environment variables (NOT in code — configure at infra)

```bash
# MongoDB Atlas (provider UI — not app env)
# BACKUP_ENABLED=true
# BACKUP_RETENTION_DAYS=30
# POINT_IN_TIME_RECOVERY=true

# Optional future app-level backup export
# BACKUP_ENCRYPTION_KEY=
# BACKUP_STORAGE_BUCKET=mr5-backups-prod
# BACKUP_SCHEDULE_CRON=0 2 * * *
```

## Recovery procedures

### API task failure (ECS)

1. Check CloudWatch logs (`awslogs` driver).
2. Verify Secrets Manager values (`MONGO_URI`, `JWT_SECRET`).
3. Roll back ECS task definition to previous revision.

### Database corruption / loss

1. Restore MongoDB Atlas snapshot to new cluster.
2. Update `MONGO_URI` in Secrets Manager.
3. Force ECS service redeploy.
4. Invalidate all `RefreshToken` documents if breach suspected.

### Frontend CDN / assets

1. Redeploy web image from last known good ECR tag.
2. Invalidate CloudFront (`AWS_CLOUDFRONT_DISTRIBUTION_ID`).
3. Verify `NEXT_PUBLIC_CDN_*` URLs.

### Region failure (multi-region — FUTURE)

Requires decision: active-passive vs active-active. Not implemented.

## RTO / RPO targets (proposed — confirm with business)

| Tier | RPO | RTO |
|------|-----|-----|
| Auth / sessions | 1 hour | 30 min |
| Course content | 24 hours | 2 hours |
| Payments | 0 (Stripe source of truth) | 1 hour |

## DR checklist

- [ ] Atlas automated backups enabled
- [ ] Secrets Manager replicated or documented restore
- [ ] ECR image retention policy (min 10 tags)
- [ ] Route 53 health checks on ALB
- [ ] Runbook for `MONGO_URI` rotation after restore
- [ ] Off-site export of legal consent audit logs (if `CONSENT_IP_LOGGING=true`)
