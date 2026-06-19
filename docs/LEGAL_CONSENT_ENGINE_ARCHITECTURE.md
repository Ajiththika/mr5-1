# MR5 School 3D LMS — Legal Consent Engine Architecture

> **LEGAL REVIEW REQUIRED:** This document is an engineering framework, not legal advice.
> All policy text, retention periods, and jurisdictional rules must be reviewed by qualified counsel before production deployment.

## 1. System Snapshot (As-Built)

| Layer | Technology | Location |
|-------|------------|----------|
| Frontend | Next.js 15, React 19, R3F/Three.js, Tailwind | `client-main/` |
| API | Express 4, Mongoose 8, JWT cookies | `Mr5-School-API-main/` |
| Database | MongoDB (Atlas or in-memory dev) | `src/models/` |
| Auth | JWT httpOnly cookies, bcrypt, optional Google OAuth | `authMiddleware.js` |
| Route guard | Next.js middleware (cookie presence only) | `client-main/middleware.ts` |

**52 app routes** including 3D rooms (`/course/[id]/room/*`), student/admin dashboards, and marketing pages.

---

## 2. Target Architecture (Consent-Aware)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC SURFACE (no 3D)                          │
│  /, /courses, /pricing, /terms, /privacy, /login, /register           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTH LAYER (existing JWT + cookies)                  │
│  register/login → issue tokens → /api/auth/me                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              LEGAL CONSENT GATE (NEW — server-enforced)                 │
│  GET /api/legal/required → current mandatory document versions          │
│  GET /api/legal/status   → user acceptance state vs required            │
│  POST /api/legal/accept  → immutable acceptance record + audit log      │
│  Middleware: block /dashboard, /student/*, /admin/*, /course/*/room/*   │
│              until platform_terms + privacy_policy accepted               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────────────────────┐
│   FEATURE CONSENT MODULES    │   │         LMS CORE (existing)          │
│  ai_features (opt-in)         │   │  courses, enrollments, assignments   │
│  spatial_telemetry (opt-in)   │   │  payments, notifications             │
│  camera_mic (browser prompt)  │   │  progress, certificates              │
│  analytics (separate toggle)  │   └──────────────────────────────────────┘
└──────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    3D IMMERSIVE LAYER (gated)                           │
│  R3F classrooms, principal room, practical room                         │
│  Asset delivery: signed URLs / CDN tokens (IP protection)               │
│  Spatial logs: ONLY when spatial_telemetry consent = true               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Separation of Concerns

| Module | Responsibility |
|--------|----------------|
| `legal/` API routes | Document versions, acceptance, audit |
| `consentMiddleware` | API-side gate before protected resources |
| `ConsentGateProvider` (client) | Fetch status, render blocking modal |
| Next.js middleware extension | Redirect to `/legal/accept` if cookie/token valid but consent missing |
| `PermissionsManager` (existing) | Browser capability prompts — separate from legal consent |
| `AIConsentModal` (existing) | Upgrade to server-backed `ai_features` consent |

---

## 3. Consent Gate Rules

### Mandatory (blocks LMS + 3D entry)

| Document slug | When required |
|---------------|---------------|
| `platform_terms` | Before first dashboard/3D access |
| `privacy_policy` | Before first dashboard/3D access |
| `cookie_notice` | Before non-essential cookies (if used) |

### Re-consent trigger

When `legal_document_versions.is_current = true` changes and `requires_reacceptance = true`:
- User's latest `legal_acceptances` for that document must match new `version_number`.
- API returns `403 CONSENT_REQUIRED` with `{ requiredDocuments: [...] }`.
- Client redirects to `/legal/accept`.

### Feature-level (opt-in, does not block catalog browsing)

| Consent type | Default | Blocks |
|--------------|---------|--------|
| `ai_features` | false | AI tutor, voice, auto-grading AI |
| `spatial_telemetry` | false | 3D movement/position logging |
| `marketing_email` | false | Promotional emails |
| `analytics_enhanced` | false | Non-essential analytics |

### COPPA / child safety hook

> **LEGAL REVIEW REQUIRED:** Age threshold and parental consent workflow must be defined by counsel.

- If `user.age < 13` (configurable via `COPPA_AGE_THRESHOLD`), require `parental_consent` document acceptance before any data collection beyond account creation.
- Store `guardian_email` and `parental_consent_acceptance_id` only after legal review.

---

## 4. Data Minimization for Consent Records

| Field | Store? | Notes |
|-------|--------|-------|
| `user_id` | Yes | Required |
| `document_version_id` | Yes | Immutable reference |
| `accepted_at` | Yes | UTC timestamp |
| `acceptance_method` | Yes | `clickwrap`, `oauth_register`, `admin_override` |
| `ip_address` | Configurable | Hash or truncate per jurisdiction — **LEGAL REVIEW REQUIRED** |
| `user_agent` | Optional | Truncated to 256 chars |
| `locale` | Yes | Language of document shown |
| `source` | Yes | `web`, `mobile`, `api` |

**Never overwrite** acceptance rows. New acceptance = new row. Revocation = separate `consent_audit_logs` entry.

---

## 5. 3D Asset IP Protection (planned hooks)

> **LEGAL REVIEW REQUIRED:** License terms for each 3D asset pack.

- Serve GLB/texture via short-lived signed URLs (Cloudinary or S3 presigned).
- Disable right-click save on canvas overlay (UX deterrent, not security).
- Watermark session ID in dev builds only.
- Rate-limit `/api/courses/:id/room` asset manifest endpoints.

---

## 6. API Endpoints (Phase 2 implementation)

```
GET  /api/legal/documents              Public — list published documents
GET  /api/legal/documents/:slug        Public — current version content
GET  /api/legal/required               Auth — mandatory docs for user context
GET  /api/legal/status                 Auth — acceptance state
POST /api/legal/accept                 Auth — record acceptance
GET  /api/legal/preferences            Auth — feature consent toggles
PATCH /api/legal/preferences           Auth — update opt-in toggles
GET  /api/legal/audit/:userId          Admin — audit trail (admin only)
```

---

## 7. Frontend Routes (Phase 2)

| Route | Purpose |
|-------|---------|
| `/terms` | Render current `platform_terms` version |
| `/privacy` | Render current `privacy_policy` version |
| `/legal/accept` | Blocking consent gate UI |
| `/legal/preferences` | Feature consent management |

---

## 8. Deployment Notes

- Works on **Vercel (frontend) + AWS ECS (API)** as currently documented.
- Consent documents stored in MongoDB; HTML/Markdown content in `legal_document_versions.content`.
- Seed initial document versions via `scripts/seedLegalDocuments.js` (Phase 2).
- Environment: `COPPA_AGE_THRESHOLD`, `CONSENT_IP_LOGGING`, `LEGAL_RECONSENT_ENFORCED`.

---

## 9. PostgreSQL Migration Path

If migrating to PostgreSQL/Prisma later, see `docs/legal-consent-engine.prisma` for equivalent relational schema. Mongoose models in `Mr5-School-API-main/src/models/legal/` are the **source of truth** for the current stack.
