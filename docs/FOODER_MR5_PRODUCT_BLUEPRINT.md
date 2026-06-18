# Fooder / MR5 AI 3D LMS — Product Blueprint

**Version:** 1.0  
**Date:** June 2026  
**Status:** Strategic roadmap + first implementation plan  
**Stack:** Next.js 15 · React 19 · Express 4 · MongoDB · Three.js/R3F · Gemini/OpenAI · Stripe

---

## 1. Executive Summary

**Fooder / MR5 AI 3D LMS** is an AI-powered, immersive learning platform that combines:

- A traditional LMS (courses, lessons, enrollments, assignments, payments)
- **3D virtual campuses** (classroom, principal office, cafeteria/mensa, and more)
- **AI tutoring** with voice, chat, memory, and personalized learning paths
- **SEO-driven content** for organic growth in education and food-science niches

This is **not** a generic course website. The product differentiator is:

> *Learn inside a 3D world, guided by an AI teacher who remembers you.*

### Current maturity (honest assessment)

| Layer | Maturity | Notes |
|-------|----------|-------|
| Auth & roles | **Strong** | JWT cookies, student/admin/AI-TEACHER roles |
| 3D campus | **Strong** | GLB rooms, classroom camera, campus navigation |
| AI tutor | **Good** | Chat, voice, welcome onboarding, chat memory (new) |
| Course commerce | **Good** | Stripe per-course checkout |
| Student dashboard | **Good** | Portal, courses, assignments, grades |
| Admin panel | **Good** | Users, courses, payments; revenue/reports mocked |
| SEO foundation | **Partial** | Metadata, JSON-LD, sitemap; no blog/clusters |
| Teacher dashboard | **Missing** | Nav defined, no `/teacher/*` routes |
| Quizzes | **API only** | AI can generate quiz JSON; no student UI |
| Certificates | **Missing** | Mentioned on pricing only |
| Subscriptions | **Marketing only** | No Stripe subscription backend |
| Blog / CMS | **Missing** | No content engine |
| Food / nutrition vertical | **Missing** | Strategic positioning, not yet built |

**Recommendation:** Extend the existing MR5 codebase rather than rebuild. The foundation is solid; the next work is **product completion**, **vertical content (food science)**, and **SEO growth**.

---

## 2. Product Vision & Positioning

### Brand architecture

| Brand | Role |
|-------|------|
| **MR5 School** | Platform brand — technology, trust, edtech |
| **Fooder** | Vertical / category brand — food science, nutrition, culinary education |

**Public messaging:**

- Primary: *AI tutor + 3D classroom + personalized learning*
- Vertical: *Food science, nutrition, and culinary skills in an immersive LMS*
- Business: *Sell courses, subscriptions, and certificates to students worldwide*

### Target keywords (SEO + product)

**Platform keywords**
- AI tutor online
- personalized learning platform
- 3D interactive lessons
- online learning platform
- educational LMS
- smart learning platform
- virtual classroom software

**Vertical keywords (Fooder)**
- food science education
- nutrition courses online
- culinary learning platform
- food safety certification online
- diet and nutrition classes
- hospitality training LMS

### Core personas

| Persona | Goals | Key pages |
|---------|-------|-----------|
| **Student** | Learn, get certified, track progress | Home, courses, 3D room, AI tutor, dashboard |
| **Teacher / AI-TEACHER** | Create content, monitor students | Teacher dashboard, course builder, analytics |
| **Admin** | Manage users, revenue, content | Admin panel, payments, approvals |
| **Visitor (SEO)** | Discover topics, compare, convert | Blog clusters, landing pages, pricing |

---

## 3. Current Codebase Map

```
Mr5/
├── client-main/                 # Next.js 15 frontend
│   ├── app/                     # App Router pages
│   ├── components/              # UI, 3D, AI, auth, admin
│   ├── contexts/                # Auth, theme, regional settings
│   ├── services/                # API clients
│   ├── lib/                     # SEO, prompts, utilities
│   ├── hooks/                   # Voice, analytics, etc.
│   ├── types/                   # TypeScript models
│   └── public/assets/3d/        # GLB classroom/campus assets
│
├── Mr5-School-API-main/         # Express API
│   ├── src/models/              # Mongoose schemas
│   ├── src/controllers/         # Business logic
│   ├── src/routes/              # REST endpoints
│   ├── src/services/            # AI, auth, courses
│   └── api/index.js             # Vercel serverless entry
│
└── docs/                        # Product & engineering docs (this file)
```

### Working routes today

**Public:** `/`, `/about`, `/contact`, `/courses`, `/pricing`, `/course/[id]`, `/course/[id]/lesson/[lessonId]`, `/course/[id]/room/*`  
**Auth:** `/login`, `/register`, `/reset-password/[token]`, `/onboarding`  
**Student:** `/student/portal`, `/student/courses`, `/student/assignments`, `/student/grades`  
**Admin:** `/admin/*` (12 pages)  
**AI:** `/ai-assistant`, homepage `TeachingAIModal`, lesson AI tutor  
**Commerce:** Stripe checkout, `/payment/success`, `/shop`

### Known gaps (do not break; fill incrementally)

1. No `app/teacher/` — teacher navigation is orphaned
2. No quiz UI or `Quiz` model
3. No certificate issuance
4. No blog/CMS
5. Admin revenue/reports use mock data
6. Sitemap has 5 static URLs (no courses/blog)
7. Contact form has no API
8. No food/nutrition course category or content

---

## 4. Target Information Architecture

### Public site (SEO + conversion)

```
/                           → Hero, 3D preview, AI CTA, social proof
/features/ai-tutoring       → AI tutor landing (cluster pillar)
/features/3d-learning       → 3D classroom landing (cluster pillar)
/features/lms               → LMS features landing
/learn/food-science         → Fooder vertical pillar
/learn/nutrition            → Nutrition pillar
/learn/culinary             → Culinary pillar
/courses                    → Catalog (filter by category)
/courses/[slug]             → Course detail (SEO slug, not only ID)
/pricing                    → Free + Premium plans
/blog                       → EdTech + food education content
/blog/[slug]                → Article pages
/about, /contact, /support  → Trust pages
```

### Authenticated app

```
/dashboard                  → Role redirect hub
/student/*                  → Student LMS (exists)
/teacher/*                  → Teacher workspace (to build)
/admin/*                    → Admin (exists)
/course/[id]/lesson/[id]    → Lesson + AI tutor (exists)
/course/[id]/room/*         → 3D rooms (exists)
/ai-assistant               → Full AI page (exists)
/profile                    → Profile & settings (exists)
```

### URL rules (SEO)

- Use **kebab-case slugs** for courses and blog: `/courses/introduction-to-food-science`
- One **primary keyword per page** in title, H1, meta description
- Canonical URLs via `lib/seo.ts` (already exists)
- Internal links: every blog post → 1 pillar page + 1 course + 1 feature page

---

## 5. Recommended Folder Structure (Target State)

Extend the current structure; do not reorganize everything at once.

### Frontend additions

```
client-main/
├── app/
│   ├── (marketing)/                    # Route group — shared marketing layout
│   │   ├── features/
│   │   │   ├── ai-tutoring/page.tsx
│   │   │   ├── 3d-learning/page.tsx
│   │   │   └── lms/page.tsx
│   │   ├── learn/
│   │   │   ├── food-science/page.tsx
│   │   │   ├── nutrition/page.tsx
│   │   │   └── culinary/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── layout.tsx                  # Marketing nav + footer + SEO
│   │
│   ├── (dashboard)/                    # Route group — auth shell
│   │   ├── teacher/                    # NEW
│   │   │   ├── page.tsx                # Overview
│   │   │   ├── courses/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── lessons/page.tsx
│   │   │   └── analytics/page.tsx
│   │   └── layout.tsx
│   │
│   └── sitemap.ts                      # Extend: courses + blog dynamic
│
├── components/
│   ├── marketing/                      # NEW — landing sections, CTAs, FAQ
│   ├── blog/                           # NEW — post card, TOC, related links
│   ├── quiz/                           # NEW — quiz runner, results
│   ├── certificates/                   # NEW — certificate view/download
│   ├── lms/                            # NEW — reusable lesson blocks
│   └── 3d/
│       └── LearningRoomContainer.tsx   # NEW — reusable 3D wrapper + fallback
│
├── content/                            # NEW — MDX or JSON blog posts (phase 2)
│   ├── blog/
│   └── seo-clusters.json
│
└── lib/
    ├── seo.ts                          # Extend cluster metadata helpers
    ├── ai/
    │   ├── build-student-ai-prompt.ts  # Exists
    │   ├── recommend-courses.ts        # NEW
    │   └── quiz-generator.ts           # NEW — client wrapper
    └── constants/
        └── product.ts                  # NEW — plans, categories, nav
```

### Backend additions

```
Mr5-School-API-main/src/
├── models/
│   ├── Quiz.js                         # NEW
│   ├── QuizAttempt.js                  # NEW
│   ├── Certificate.js                  # NEW
│   ├── BlogPost.js                     # NEW (or file-based CMS first)
│   ├── Subscription.js                 # NEW
│   └── CourseCategory.js             # NEW — food-science, nutrition, etc.
│
├── controllers/
│   ├── teacherController.js            # NEW
│   ├── quizController.js               # NEW
│   ├── certificateController.js        # NEW
│   ├── blogController.js               # NEW
│   └── contactController.js            # NEW
│
└── routes/
    ├── teacherRoutes.js                # NEW — /api/teacher/*
    ├── quizRoutes.js                   # NEW
    ├── certificateRoutes.js            # NEW
    └── blogRoutes.js                   # NEW
```

---

## 6. Design System & UX Guidelines

### Visual direction

**Style:** Modern, dark-first, premium edtech — futuristic but approachable.

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a0f` → slate-950 | Page base |
| Surface | `white/5` + blur | Cards, bento grid |
| Primary | Indigo/violet gradient | CTAs, links, AI accents |
| Success | Green pulse | Progress, online status |
| Typography | Bold H1, light subheads | Hero hierarchy |
| Radius | `rounded-xl` / `rounded-3xl` | Cards, 3D preview |
| Motion | Framer Motion, subtle | Page enter, modals |

**Existing UI library:** shadcn/ui (new-york) + Tailwind + Lucide — keep using this.

### UX principles

1. **Mobile-first** — bento grid stacks; 3D preview degrades gracefully
2. **One primary CTA per screen** — “Start Learning”, “Open AI Tutor”, “Enroll”
3. **Progress everywhere** — streaks, lesson %, badges, milestones
4. **3D is optional, learning is required** — always show 2D fallback
5. **AI feels human** — letter-style welcome, voice option, memory continuity
6. **Beginner-safe** — no jargon on first visit; tooltips in dashboard

### Page templates

| Template | Sections |
|----------|----------|
| **Landing** | Hero + 3D preview + benefits + social proof + CTA + FAQ |
| **Feature** | H1 keyword + problem/solution + screenshots + internal links |
| **Course** | Outcomes + syllabus + instructor + price + enroll CTA + schema |
| **Lesson** | Sidebar progress + content + AI tutor FAB + mark complete |
| **Dashboard** | Stats row + cards + recent activity + next lesson CTA |
| **Blog** | H1 + author/date + TOC + related posts + course CTA |

### Component patterns (reuse)

- `BentoGrid` / `BentoItem` — homepage and dashboards
- `CourseAccessGate` — enrollment guard for premium content
- `TeachingAIModal` — AI tutor shell
- `ClassroomMiniPreview` — 3D marketing embed
- `StructuredData` — JSON-LD injection
- `PricingCard` — plan comparison

---

## 7. AI System Design

### AI feature map

| Feature | Status | Location | Provider |
|---------|--------|----------|----------|
| AI tutor chat | Live | `TeachingAIModal`, `/ai-assistant` | Gemini primary |
| Voice interaction | Live | `useVoiceInteraction`, Azure TTS | Gemini + Azure |
| Student welcome onboarding | Live | `StudentWelcomeChat` | Gemini + Web Speech |
| Chat memory | Live | `ChatMemory` model, `/api/students/me/chat-memory` | MongoDB |
| Personalized system prompt | Live | `build-student-ai-prompt.ts` | Profile + memory |
| Lesson guidance | Live | Lesson page + AI modal | Gemini |
| AI course generator | Live | `AICourseGenerator` | `/api/ai/generate-course` |
| AI grading | Partial | `grading-panel`, `/api/ai/grade` | Admin/teacher |
| Quiz generation | API only | `/api/ai/summary` returns quiz JSON | Needs UI |
| Smart recommendations | Missing | — | Phase 2 |
| Learning path AI | Missing | — | Phase 3 |

### AI architecture (target)

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Next.js)                      │
│  TeachingAIModal · StudentWelcomeChat · Lesson AI FAB       │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   /api/ai/gemini    /api/students/me/*   /api/ai-assistant-*
   (Next proxy)      (learning profile)    (interaction log)
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express API (Mr5-School-API)               │
│  ai.service.js · studentLearningController · ChatMemory      │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
              Gemini / OpenAI / Ollama (dev)
```

### AI prompt layers (keep modular)

1. **Base system prompt** — MR5 teacher persona, safety, tone
2. **Student context** — age, education level, goals (`User` + learning profile)
3. **Chat memory** — last N messages from `ChatMemory`
4. **Lesson context** — course title, lesson content, progress %
5. **Vertical context** — food science vs general (future)

**Rule:** Never send full DB history; summarize after N turns (Phase 2).

### AI UX rules

- Consent modal before voice/camera (`consent-modal.tsx`)
- Show “AI is typing” and streaming responses
- Fallback message if API fails — never blank screen
- Rate-limit per user (backend already has rate limiting)
- Log interactions to `ai-assistant-interaction` for analytics

### Phase 1 AI deliverables

1. Stabilize welcome chat + memory (in progress)
2. Wire quiz UI to existing `/api/ai/summary` quiz output
3. Add “Recommended next lesson” card on student portal (rule-based first, AI second)

---

## 8. 3D Learning System Design

### Current 3D assets

```
public/assets/3d/
├── school-campus.glb      # Campus hub with room hotspots
├── rooms/
│   ├── classroom.glb      # Main teaching room
│   ├── principal.glb
│   ├── mensa.glb          # Cafeteria — future Fooder anchor
│   └── bathroom.glb
```

### 3D feature map

| Feature | Status | File |
|---------|--------|------|
| Full classroom | Live | `classroom-room-scene.tsx` |
| Campus navigation | Live | `school-campus-scene.tsx` |
| Homepage mini preview | Live | `ClassroomMiniPreview.tsx` |
| Student/teacher camera toggle | Live | Classroom scene |
| Teacher playtime panel | Live | `teacher-playtime-panel.tsx` |
| Reusable container + fallback | Missing | Build `LearningRoomContainer` |
| Mensa as food-science room | Partial | Room exists, no food content |
| Asset lazy loading | Live | `dynamic()` + Suspense |
| WebGL fallback | Partial | Loading spinner only |

### `LearningRoomContainer` (Phase 1 build)

```tsx
// components/3d/LearningRoomContainer.tsx — spec
interface Props {
  room: "classroom" | "mensa" | "principal" | "campus";
  courseId?: string;
  fallbackImage?: string;
  onHotspotClick?: (id: string) => void;
}
// - Detect WebGL; show static image + "Open lesson" if unavailable
// - Lazy load scene by room type
// - Single loading UI pattern
// - Mobile: touch orbit controls, reduced DPR
```

### 3D + Fooder strategy

Use **mensa (cafeteria)** as the Fooder-branded 3D entry:
- Hotspots: nutrition station, food safety board, recipe lab
- Link hotspots to lessons and blog articles
- SEO page `/features/3d-learning` embeds mensa preview

---

## 9. SEO Strategy

### Technical SEO (existing + extend)

| Item | Status | Action |
|------|--------|--------|
| `generateMetadata()` | Done | Use on every new page |
| JSON-LD Organization | Done | `app/layout.tsx` |
| JSON-LD EducationalOrganization | Done | `app/layout.tsx` |
| WebPage schema | Done | `app/page.tsx` |
| Course schema | Partial | Extend to `/course/[id]` |
| `sitemap.ts` | Static 5 URLs | Add courses + blog dynamic |
| `robots.ts` | Done | Keep blocking `/admin`, `/student` |
| Canonical URLs | Done | `lib/seo.ts` |
| Core Web Vitals | Partial | Lazy 3D, image optimization |

### Topic cluster plan

```
                    ┌─────────────────┐
                    │  Homepage (/)   │
                    │ AI 3D LMS hub   │
                    └────────┬────────┘
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ AI Tutoring    │ │ 3D Learning    │ │ LMS Features   │
│ /features/ai-* │ │ /features/3d-* │ │ /features/lms  │
└───────┬────────┘ └───────┬────────┘ └───────┬────────┘
        │                  │                  │
        └──────────┬───────┴───────┬──────────┘
                   ▼               ▼
         ┌─────────────────────────────────┐
         │     Blog (supporting articles)   │
         │  /blog/ai-tutor-benefits         │
         │  /blog/3d-classroom-guide        │
         │  /blog/food-science-careers      │
         └─────────────────┬───────────────┘
                           ▼
         ┌─────────────────────────────────┐
         │  Vertical pillars (Fooder)       │
         │  /learn/food-science             │
         │  /learn/nutrition                │
         │  /learn/culinary                 │
         └─────────────────┬───────────────┘
                           ▼
                   /courses?category=*
```

### Page-level SEO template

```ts
// Every major page exports:
export const metadata = generateMetadata({
  title: "Primary Keyword Phrase",           // 50–60 chars
  description: "Benefit + CTA + keyword.",   // 150–160 chars
  keywords: ["...", "..."],
  url: "/path",
  type: "website" | "article",
});
```

### Blog launch topics (first 12 articles)

**AI cluster**
1. What is an AI tutor and how does it help students?
2. Personalized learning paths explained
3. AI vs traditional online courses

**3D cluster**
4. How 3D classrooms improve engagement
5. Immersive learning for food science students
6. Getting started with virtual campus tours

**Fooder cluster**
7. Introduction to food science careers
8. Nutrition basics every student should know
9. Food safety certifications online
10. Culinary skills vs food science degrees
11. How to learn hospitality online
12. Best practices for meal planning education

Each article links to: 1 feature page, 1 `/learn/*` pillar, 1 relevant course.

---

## 10. Business Model & Monetization

### Plans

| Plan | Price | Includes |
|------|-------|----------|
| **Free** | $0 | Limited courses, basic AI chat quota, no certificate |
| **Premium** | $X/mo | Unlimited AI, all courses, certificates, 3D rooms |
| **Per-course** | Variable | Stripe one-time (already works) |

### Revenue streams

1. **Course sales** — Stripe checkout (live)
2. **Subscriptions** — Stripe Billing (to build)
3. **Certificates** — Paid add-on or premium included (to build)
4. **Avatar shop** — Cosmetic items (live)
5. **B2B / school licenses** — Future phase

### Conversion funnel

```
SEO / Ads → Landing page → Register → Onboarding →
Welcome AI chat → First lesson → Enroll / Subscribe →
Dashboard retention → Certificate → Referral
```

### Analytics events (implement)

- `signup_completed`, `onboarding_completed`, `welcome_chat_completed`
- `course_viewed`, `checkout_started`, `payment_success`
- `lesson_completed`, `quiz_passed`, `ai_chat_started`
- `3d_room_entered`, `certificate_issued`

Use existing `useAnalytics` hook; extend `hooks/useAnalytics.ts`.

---

## 11. Phased Roadmap

### Phase 0 — Stabilize (Week 1–2) ✅ mostly done

- [x] 3D classroom interior camera + homepage preview
- [x] Homepage SEO split (server metadata + JSON-LD)
- [x] Student welcome chat + learning profile + chat memory
- [ ] Fix production build lint errors
- [ ] Dynamic sitemap for published courses
- [ ] Contact form API

### Phase 1 — Product completeness (Week 3–6) ← **START HERE**

**Goal:** Make the platform feel “complete” for students and teachers.

| # | Feature | Priority | Effort |
|---|---------|----------|--------|
| 1 | Teacher dashboard (`/teacher/*`) | P0 | Medium |
| 2 | Quiz UI + `Quiz`/`QuizAttempt` models | P0 | Medium |
| 3 | `LearningRoomContainer` + WebGL fallback | P0 | Small |
| 4 | Marketing feature pages (AI, 3D, LMS) | P0 | Medium |
| 5 | Course categories (food-science, nutrition, culinary) | P1 | Small |
| 6 | Real admin revenue from `Payment` model | P1 | Small |
| 7 | Certificate model + PDF view | P1 | Medium |
| 8 | SEO: course slugs + dynamic sitemap | P1 | Medium |

### Phase 2 — Growth & Fooder vertical (Week 7–10)

- Blog (MDX or `BlogPost` model)
- `/learn/*` pillar pages
- First 6 food/nutrition courses (seed content)
- Mensa room hotspots → food lessons
- Stripe subscription billing
- AI course recommendations (rule + AI hybrid)
- Student schedule (calendar from enrollments)

### Phase 3 — Scale (Week 11–16)

- Teacher course builder (WYSIWYG lessons)
- Advanced analytics dashboards
- Discussion forums per course
- Mobile PWA polish
- Multi-language (i18n)
- B2B school admin tier
- Live classes (LiveKit — SDK already installed)

---

## 12. Phase 1 — First Implementation Plan (Detailed)

### Sprint 1.1 — Teacher dashboard (Days 1–4)

**Why first:** Navigation already references teacher routes; AI-TEACHER role exists but has no home.

**Files to create**

```
client-main/app/teacher/layout.tsx
client-main/app/teacher/page.tsx
client-main/app/teacher/courses/page.tsx
client-main/app/teacher/students/page.tsx
client-main/app/teacher/lessons/page.tsx
client-main/services/teacherDashboard.service.ts
Mr5-School-API-main/src/routes/teacherRoutes.js
Mr5-School-API-main/src/controllers/teacherController.js
```

**Files to update**

```
client-main/data/navigation.ts          # Point hrefs to real routes
client-main/app/dashboard/page.tsx      # Redirect AI-TEACHER → /teacher
Mr5-School-API-main/src/app.js          # Mount /api/teacher
client-main/middleware.ts               # Protect /teacher/*
```

**API endpoints**

```
GET  /api/teacher/stats           # Courses taught, active students
GET  /api/teacher/courses         # Courses where user is teacher
GET  /api/teacher/students        # Enrolled students across courses
GET  /api/teacher/assignments     # Pending submissions to grade
```

**Acceptance criteria**
- AI-TEACHER logs in → lands on `/teacher`
- Sees course list and student count from real API
- Cannot access `/admin` (existing role guard)

---

### Sprint 1.2 — Quiz system (Days 5–8)

**Why:** Backend already generates quiz JSON; students need assessment UX.

**Files to create**

```
Mr5-School-API-main/src/models/Quiz.js
Mr5-School-API-main/src/models/QuizAttempt.js
Mr5-School-API-main/src/controllers/quizController.js
Mr5-School-API-main/src/routes/quizRoutes.js
client-main/components/quiz/QuizRunner.tsx
client-main/components/quiz/QuizResults.tsx
client-main/services/quiz.service.ts
```

**Files to update**

```
client-main/app/course/[id]/lesson/[lessonId]/page.tsx   # Add quiz tab
Mr5-School-API-main/src/routes/ai.routes.js            # Save generated quiz
```

**Flow**
1. Student completes lesson → “Take quiz” CTA
2. Load quiz from API (or generate via AI if none)
3. Submit answers → score stored in `QuizAttempt`
4. Pass (≥70%) → mark lesson complete + show badge

---

### Sprint 1.3 — Marketing & SEO pages (Days 9–12)

**Files to create**

```
client-main/app/(marketing)/layout.tsx
client-main/app/(marketing)/features/ai-tutoring/page.tsx
client-main/app/(marketing)/features/3d-learning/page.tsx
client-main/app/(marketing)/features/lms/page.tsx
client-main/components/marketing/FeatureHero.tsx
client-main/components/marketing/FeatureGrid.tsx
client-main/components/marketing/CTASection.tsx
client-main/components/marketing/FAQSection.tsx
```

**Each page includes**
- Server `metadata` via `generateMetadata()`
- H1 with primary keyword
- 3–5 H2 sections
- Internal links to `/courses`, `/pricing`, `/blog`
- JSON-LD `WebPage` + `FAQPage` where applicable
- CTA: “Start Learning Free”

**Update**

```
client-main/app/sitemap.ts    # Add new URLs
client-main/components/layout/navbar.tsx   # Add Features dropdown
```

---

### Sprint 1.4 — 3D container + categories (Days 13–15)

**Files to create**

```
client-main/components/3d/LearningRoomContainer.tsx
client-main/lib/webgl.ts                    # isWebGLAvailable()
Mr5-School-API-main/src/models/CourseCategory.js
```

**Files to update**

```
Mr5-School-API-main/src/models/Course.js  # Add category field
client-main/app/courses/page.tsx          # Category filters
client-main/app/course/[id]/page.tsx      # Use LearningRoomContainer
```

**Categories (seed)**
- `general`
- `food-science`
- `nutrition`
- `culinary`
- `hospitality`

---

### Sprint 1.5 — Certificates + revenue (Days 16–20)

**Certificates**

```
Mr5-School-API-main/src/models/Certificate.js
Mr5-School-API-main/src/controllers/certificateController.js
client-main/app/student/certificates/page.tsx
client-main/components/certificates/CertificateCard.tsx
```

**Trigger:** Course progress = 100% + quiz average ≥ 70% → issue certificate.

**Admin revenue**

```
client-main/app/admin/revenue/page.tsx   # Replace mock with Payment aggregation
```

---

## 13. Implementation Order (Copy-Paste Checklist)

Execute in this exact order to avoid breaking existing features:

```
□ 1. Fix build/lint (WelcomeAvatar types, TeachingAIModal unused vars)
□ 2. Mount teacher API routes + smoke test
□ 3. Create /teacher layout + overview page
□ 4. Wire dashboard redirect for AI-TEACHER role
□ 5. Add Quiz + QuizAttempt models + routes
□ 6. Build QuizRunner component
□ 7. Integrate quiz into lesson page
□ 8. Create marketing layout + 3 feature pages
□ 9. Extend sitemap.ts
□ 10. Add LearningRoomContainer with WebGL fallback
□ 11. Add course categories to API + catalog filters
□ 12. Certificate model + student certificates page
□ 13. Replace admin revenue mock data
□ 14. Contact form API endpoint
□ 15. Playwright E2E: home → register → lesson → quiz
```

---

## 14. Non-Goals (Phase 1)

Do **not** build these in Phase 1 (prevents scope creep):

- Full CMS with admin WYSIWYG blog editor
- Native iOS/Android apps
- SCORM/LTI integration
- Multi-tenant schools
- Live proctoring
- Blockchain certificates

---

## 15. Success Metrics (90 days)

| Metric | Target |
|--------|--------|
| Organic impressions (GSC) | +200% from blog + feature pages |
| Homepage → register conversion | ≥ 3% |
| Lesson completion rate | ≥ 40% |
| AI chat sessions / active student | ≥ 2/week |
| Course checkout completion | ≥ 60% of started checkouts |
| Lighthouse performance (mobile) | ≥ 85 |
| Teacher dashboard adoption | 100% of AI-TEACHER users |

---

## 16. Risk Register

| Risk | Mitigation |
|------|------------|
| 3D hurts mobile performance | Lazy load, DPR cap, static fallback image |
| AI API costs | Per-user quotas on free plan; cache common responses |
| SEO thin content | Minimum 800 words per pillar; unique course descriptions |
| Teacher role confusion (AI-TEACHER vs human) | Clear UI labels; separate onboarding |
| Scope creep | Phase gates; ship weekly demos |
| Mock admin data misleads stakeholders | Replace revenue/reports in Sprint 1.5 |

---

## 17. Environment & Deployment

| Service | Local | Production |
|---------|-------|------------|
| Frontend | `localhost:3000` | Vercel (`mr5school.com`) |
| API | `localhost:5001` | Vercel serverless / PM2 |
| DB | MongoDB Atlas or in-memory dev | MongoDB Atlas |
| Stripe | Test keys | Live keys + webhook |
| AI | Gemini API key | Gemini + rate limits |
| Assets | `/public/assets/3d/` | CDN / Vercel static |

**Required env vars (minimum)**

```
# client-main
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# API
MONGO_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GEMINI_API_KEY=
```

---

## 18. Summary — What to Build First

**Immediate next sprint (this week):**

1. **Teacher dashboard** — unlocks AI-TEACHER role, unblocks content creators
2. **Quiz UI** — turns existing AI output into a real LMS feature
3. **Three SEO feature pages** — starts organic growth without a full CMS

**Brand move:**

- Keep **MR5 School** as platform name in code and auth
- Introduce **Fooder** as the food-education vertical in `/learn/*`, mensa 3D room, and course categories
- Homepage H1 already targets “3D Virtual Classroom” — add Fooder sub-brand in footer and `/learn/food-science`

**Single source of truth:** This document. Update version when a phase ships.

---

*Document owner: Product / Engineering*  
*Next review: After Phase 1 Sprint 1.1 completion*
