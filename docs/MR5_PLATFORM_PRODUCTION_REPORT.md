# MR5 School — Platform Production Report

**Version:** MVP+1  
**Date:** June 2026  
**Status:** Production-path upgrades applied (no route/auth/payment breaks)

---

## Executive Summary

MR5 School is a **Next.js 15 + Express/MongoDB** learning platform with 3D classrooms, AI teachers, payments, and a Power Admin Hub. This report documents architecture, what was upgraded, deployment path, and QA checklist.

**Golden rule followed:** Extend — do not rebuild.

---

## Folder Structure (Current)

```
Mr5/
├── client-main/                 # Next.js frontend
│   ├── app/                     # App Router pages
│   │   ├── admin/               # Power Admin Hub
│   │   ├── student/             # Student portal
│   │   ├── course/[id]/         # Course + 3D classroom
│   │   └── api/                 # Next.js API proxies
│   ├── components/
│   │   ├── 3d/                  # R3F scenes, Ganesha guide, credits
│   │   ├── power-admin/         # Admin hub UI
│   │   └── ui/                  # shadcn primitives
│   ├── features/classroom/      # Environment, playtime, XP
│   ├── lib/
│   │   ├── 3d/                  # Model registry, performance profile
│   │   └── learning/            # XP, levels, streaks
│   ├── public/assets/3d/
│   │   ├── rooms/               # classroom.glb
│   │   └── avatars/             # indigo-ganesha.glb (CC BY 4.0)
│   └── services/                # API clients
├── Mr5-School-API-main/         # Express API
│   └── src/models|routes|services
└── docs/
    ├── POWER_ADMIN_HUB.md
    └── MR5_PLATFORM_PRODUCTION_REPORT.md
```

---

## Component Tree (Key UX Surfaces)

```
RootLayout
├── Public: Landing, Courses, Pricing, Instructors
├── Auth: Login, Register, Onboarding
├── Student: Portal, Courses, Shop, Grades
├── Admin: Power Admin Hub (/admin/*)
└── 3D Classroom
    ├── ClassroomRoomScene
    │   ├── ClassroomModel (room GLB)
    │   ├── TeacherCharacter (procedural)
    │   ├── GaneshaWelcomeGuide (CC BY 4.0, lazy)
    │   ├── Environment + Fan + Board
    │   └── PlaytimePanel + ProgressTracker (XP/Level/Streak)
    └── ModelCreditNotice (footer, loader, scene)
```

---

## Database Plan

| Layer | Technology | Notes |
|-------|------------|-------|
| **Current** | MongoDB (Mongoose) | Users, Courses, Lessons, Payments, Teachers, Classrooms |
| **Future scale** | PostgreSQL optional | For analytics warehouse; not required for MVP |
| **3D assets** | Filesystem / S3 | GLB in `public/` dev; **AWS S3 + CloudFront** prod |
| **Progress** | MongoDB + localStorage | Server progress via LessonProgress; classroom XP client-side MVP |

### Core entities (existing + extended)

- `User` — roles: student, AI-TEACHER, admin; `adminRole` for hub RBAC
- `Teacher` — profile + `studio` (3D/voice config)
- `Course` — `publishStatus`, modules, certificate rules
- `Classroom` — theme, panels, modes
- `ContentApproval` — review pipeline
- `Payment` / `Enrollment` — unchanged

---

## Avatar Architecture

| Type | Implementation | Style |
|------|----------------|-------|
| **AI Teacher (in-class)** | Procedural R3F meshes | Semi-realistic, professional, warm |
| **Welcome Guide** | Indigo Ganesha GLB | Cultural statue near entrance — CC BY 4.0 |
| **Student Avatar** | `/apps/avatar-creator` presets | Customizable face/hair/clothes |

### Performance (Mac Air M3 8GB)

- `get3DPerformanceProfile()` — tier low/medium/high
- Medium tier: DPR 1–1.25, Ganesha enabled, 30 FPS target
- Low tier (mobile): Ganesha disabled, no shadows
- Lazy dynamic import of Ganesha component
- Material tuning: reduced shadows, anisotropy 4

### Optimization TODO (Phase 2)

- Draco-compress Ganesha GLB (26MB → target &lt;8MB)
- KTX2 / 1024px texture bake
- LOD variant for distant view

---

## 3D License & Credit System (Mandatory)

**Credit (exact):**  
`Indigo Ganesha - Avatar (https://skfb.ly/6FRHv) by ultranique is licensed under CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/)`

**Appears in:**

| Location | Component |
|----------|-----------|
| Classroom loader | `ModelCreditNotice` variant=loading |
| Classroom HUD | variant=scene |
| Site footer | variant=footer |
| About page | `#3d-attributions` + schema.org 3DModel |

Registry: `client-main/lib/3d/model-registry.ts`

---

## Learning Game System (Non-violent)

| Mechanic | Status |
|----------|--------|
| XP | ✅ Classroom playtime store |
| Level | ✅ `xpToLevel()` every 100 XP |
| Stars / Badges | ✅ Existing playtime |
| Daily streak | ✅ `touchDailyStreak()` |
| Missions | 📋 Defined in `MISSION_TYPES` — wire to lessons next |
| Focus mode | 📋 Flag in progression types |
| Knowledge tree | 📋 Phase 2 UI |

---

## Admin System

Power Admin Hub at `/admin`:

- Teacher Database, 3D Studio, Course Factory, Classroom Builder
- Approval Queue, Analytics, Roles, Activity Logs
- API: `/api/power-admin/*`

Legacy admin routes preserved.

---

## Payment System

**Unchanged** — Stripe webhooks, enrollment on success, CourseAccessGate.

---

## AWS Deployment Architecture

```
                    ┌─────────────┐
                    │ CloudFront  │
                    └──────┬──────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ S3 (GLB)    │   │ Amplify /   │   │ API (EC2 /  │
    │ assets      │   │ Vercel      │   │ ECS/Lambda) │
    └─────────────┘   │ Next.js     │   └──────┬──────┘
                      └─────────────┘          │
                                               ▼
                                        ┌─────────────┐
                                        │ MongoDB     │
                                        │ Atlas       │
                                        └─────────────┘
```

### Env vars (production)

- `NEXT_PUBLIC_API_URL`, `JWT_SECRET`, `STRIPE_*`, `GEMINI_API_KEY`
- `AWS_S3_BUCKET`, `CLOUDFRONT_URL` for 3D CDN

### Steps

1. Build client: `cd client-main && npm run build`
2. Deploy API to EC2/ECS with PM2 or Docker
3. Upload GLB to S3, serve via CloudFront
4. Point `NEXT_PUBLIC_SITE_URL` to production domain
5. Enable HTTPS, CORS, rate limits (existing middleware)

---

## Security

- JWT httpOnly cookies ✅
- RBAC on admin APIs ✅
- Legal consent middleware ✅
- Sanitize Mongo queries ✅
- No secrets in client bundle ✅

---

## SEO

- `generateMetadata` on course pages ✅
- Organization + EducationalOrganization schema ✅
- 3DModel schema on About ✅
- sitemap/robots ✅

---

## Testing & QA Checklist

| Area | Test |
|------|------|
| Auth | Login student/admin — no regression |
| Payments | Purchase flow → enrollment |
| Classroom | Loads room + optional Ganesha on desktop |
| Credits | Visible in loader, footer, about |
| Admin | `/admin` overview loads |
| Mobile | Ganesha off on low tier; classroom usable |
| Performance | 30+ FPS target on M3 Air (medium tier) |

```bash
cd client-main && npx tsc --noEmit
cd client-main && npm run build
cd Mr5-School-API-main && npm test  # if configured
```

---

## MVP vs Scale Roadmap

### MVP (now)

- Ganesha welcome guide in classroom
- License system
- Performance profiles
- XP / level / streak in classroom
- Power Admin Hub foundation

### Phase 2

- Compress Ganesha asset
- Server-synced student progression
- Knowledge map UI
- Live teacher GLB swap from Admin Studio
- Real-time analytics charts

### Phase 3

- PostgreSQL analytics
- Multi-school tenancy
- Voice Q&A pipeline polish

---

## Files Changed (This Upgrade)

- `public/assets/3d/avatars/indigo-ganesha.glb`
- `lib/3d/model-registry.ts`, `performance-profile.ts`
- `lib/learning/progression.ts`
- `components/3d/GaneshaWelcomeGuide.tsx`, `ModelCreditNotice.tsx`
- `components/3d/classroom-room-scene.tsx`
- `components/layout/footer.tsx`
- `app/about/page.tsx`
- `features/classroom/store/classroom.store.tsx`
- `features/classroom/ui/ProgressTracker.tsx`

**No routes, auth, or payment logic modified.**
