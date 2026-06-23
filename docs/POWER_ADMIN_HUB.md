# MR5 Power Admin Hub — Architecture & Implementation Plan

## Vision

The **Power Admin Hub** is the central command center for MR5 School — a Learning Operating System where admins create teachers, build courses, configure classrooms, approve content, and monitor student learning from one premium interface.

Built **on top of** the existing MR5 stack (Next.js 15 + Express/MongoDB), not as a rewrite.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MR5 Power Admin Hub (Next.js)                 │
│  /admin/*  — Dashboard, Teachers, Studio, Factory, Classrooms   │
├─────────────────────────────────────────────────────────────────┤
│  UI Layer          │  State / Hooks      │  Services            │
│  power-admin/*     │  useAdminPermissions│  power-admin.service │
│  AdminDashboardShell│ EnhancedUserContext │  admin.service       │
├─────────────────────────────────────────────────────────────────┤
│              API Proxy (/api/* → Express :5001)                  │
├─────────────────────────────────────────────────────────────────┤
│                    Express API — /api/power-admin/*              │
│  Controllers → Services → Mongoose Models                        │
│  RBAC: adminRole + permissionMiddleware                          │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB: User, Teacher, Course, Lesson, Classroom,              │
│           ContentApproval, ContentVersion, ActivityLog,          │
│           AnalyticsEvent, Enrollment, LessonProgress             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control

| Hub Role | Key Permissions |
|----------|-----------------|
| **Super Admin** | Full access — all modules |
| **Power Leader** | Teachers, classrooms, analytics, approvals |
| **Content Admin** | Courses, lessons, content library, approvals |
| **Teacher Manager** | Teacher CRUD, 3D studio, assignments |
| **Course Creator** | Course factory, lesson builder, drafts |
| **Reviewer** | Approval queue, comments, publish/reject |
| **Analytics Viewer** | Read-only analytics & activity logs |

Stored on `User.adminRole` (defaults to `super_admin` when `role === "admin"`).

Legacy `role: admin` users without `adminRole` are treated as **Super Admin**.

---

## Data Model

### Extended / New Entities

| Entity | Purpose |
|--------|---------|
| `User.adminRole` | Hub RBAC role |
| `Teacher` (extended) | 3D avatar, voice, tone, studio config |
| `Course.publishStatus` | draft → pending_review → approved → published |
| `Lesson` (extended) | subtopics, recap, scenarios, publishStatus |
| `Classroom` | Linked course + teacher, theme, panels, modes |
| `ContentApproval` | Review pipeline with comments & reasons |
| `ContentVersion` | Version history for lessons/courses |
| `ActivityLog` | Audit trail for admin actions |
| `AnalyticsEvent` | Engagement & performance events |

### Classroom Modes

`normal` | `demo` | `discussion` | `quiz` | `exam` | `revision` | `live_interaction`

### Content States

`draft` | `pending_review` | `approved` | `published` | `rejected` | `archived`

---

## API Surface (`/api/power-admin`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/overview` | Hub dashboard KPIs + health |
| GET | `/activity` | Recent activity log |
| GET | `/teachers` | Teacher database (paginated) |
| GET | `/teachers/:id` | Teacher profile detail |
| POST | `/teachers` | Create teacher profile |
| PUT | `/teachers/:id` | Update teacher |
| POST | `/teachers/:id/clone` | Clone teacher |
| PATCH | `/teachers/:id/archive` | Archive teacher |
| GET | `/classrooms` | List classrooms |
| POST | `/classrooms` | Create classroom |
| PUT | `/classrooms/:id` | Update classroom |
| GET | `/approvals` | Approval queue |
| POST | `/approvals/:id/approve` | Approve content |
| POST | `/approvals/:id/reject` | Reject with reason |
| GET | `/analytics` | Insights dashboard data |
| GET | `/roles` | Role definitions + user assignments |
| PATCH | `/roles/:userId` | Assign hub role |
| POST | `/ai/lesson-assist` | AI-assisted lesson generation |
| GET | `/content-library` | Published + draft content index |

Existing routes (`/api/admin`, `/api/courses`, `/api/users`) remain for backward compatibility.

---

## Frontend Route Map

| Page | Route |
|------|-------|
| Overview Dashboard | `/admin` |
| Teacher Management | `/admin/teachers` |
| Teacher Profile | `/admin/teachers/[id]` |
| 3D Teacher Studio | `/admin/teacher-studio` |
| Course Factory | `/admin/course-factory` |
| Course Detail | `/admin/course-factory/[id]` |
| Classroom Builder | `/admin/classrooms` |
| Classroom Editor | `/admin/classrooms/[id]` |
| Approval Queue | `/admin/approvals` |
| Analytics | `/admin/analytics` |
| Roles & Permissions | `/admin/roles` |
| Content Library | `/admin/content-library` |
| Activity Logs | `/admin/activity` |
| Settings | `/admin/settings` |

Legacy routes (`/admin/users`, `/admin/courses`, etc.) redirect or remain linked from nav.

---

## Module Workflows

### Course Factory (guided flow)

```
Topic → Module → Lesson → Example → Quiz → Practice → Recap → Review → Publish
```

### Content Approval

```
Creator saves draft → Submit for review → Reviewer comments → Approve/Reject → Publish
```

### 3D Teacher Studio

```
Select avatar → Voice + speed → Tone presets → Preview → Assign to course/classroom → Save template
```

---

## Implementation Phases

### Phase 1 — Foundation (current)
- RBAC config + middleware
- Core models + `/api/power-admin` CRUD
- Hub shell, navigation, overview dashboard
- Teacher management + studio UI
- Course factory list + detail scaffold
- Classroom builder scaffold
- Approval queue wired to API

### Phase 2 — Depth
- Drag-and-drop lesson ordering
- Full version history UI
- Real-time analytics charts
- AI lesson assist polish + Tamil-English style
- Classroom 3D preview integration

### Phase 3 — Scale
- Bulk operations, exports
- Webhook notifications
- Multi-tenant school support
- Advanced search (Elasticsearch)

---

## Design Tokens

- **Style:** Clean neutral enterprise (matches existing MR5 light theme)
- **Layout:** Sidebar + max-w-7xl content, card-based KPIs
- **Components:** Reuse shadcn/ui + new `power-admin/*` primitives
- **Motion:** Framer Motion for page transitions (subtle)

---

## Security

- JWT + httpOnly cookies (existing)
- `verifyToken` + `requireLegalConsent` on all hub routes
- `permissionMiddleware` per endpoint
- `ActivityLog` on mutating actions
- Input validation via express-validator / zod on client
