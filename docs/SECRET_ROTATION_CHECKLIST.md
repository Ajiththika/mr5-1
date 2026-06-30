# MR5 School — Secret Rotation Checklist

| Secret | Rotation cadence | Owner | Procedure |
|--------|------------------|-------|-----------|
| `JWT_SECRET` | 90 days (or on breach) | Platform | Issue new secret → dual-verify window → revoke all refresh tokens → deploy |
| `STRIPE_SECRET_KEY` | On Stripe dashboard rotation | Billing | Roll keys in Stripe → update Secrets Manager → rolling ECS deploy |
| `STRIPE_WEBHOOK_SECRET` | When endpoint recreated | Billing | Stripe webhook settings → update API env |
| `CLOUDINARY_API_SECRET` | 90 days | Media | Cloudinary console → update API + verify uploads |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | 90 days or on leak | AI | Provider console → update web + API tasks |
| `GOOGLE_CLIENT_SECRET` | 90 days | Auth | Google Cloud Console → update API |
| `MONGO_URI` password | 90 days | DBA | Atlas user rotation → update Secrets Manager → restart API |
| `EMAIL_PASS` / `SMTP_PASS` | 90 days | Ops | Regenerate app password → update API |
| `AVATHOR_SECRET_TOKEN` | On integration change | Integrations | Update API → notify Avathor webhook |
| `CONSENT_IP_SALT` | Annually (invalidates old IP hashes) | Legal/Compliance | Update salt → document in audit log |
| `LIVEKIT_API_SECRET` | Per LiveKit policy | Video | LiveKit dashboard |
| `AZURE_SPEECH_KEY` | Per Azure policy | TTS | Azure portal |
| `SEED_*` / `ADMIN_PASSWORD` | Never in production | Dev only | Delete from prod; use admin UI |

## Emergency rotation (compromise)

1. Revoke exposed secret at provider immediately.
2. `POST /api/auth/logout-all` for affected users (or global token purge in DB).
3. Deploy new secret via Secrets Manager (no git commits).
4. Audit `LoginAttempt`, `RefreshToken`, and access logs.
5. Document incident in security log.

## Post-rotation verification

- [ ] Login / refresh / logout
- [ ] Stripe checkout + webhook test event
- [ ] Password reset email
- [ ] AI tutor chat
- [ ] Cloudinary upload
- [ ] Google OAuth sign-in
