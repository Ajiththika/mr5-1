# MR5 School — Intelligent Search-to-Course System

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STUDENT (Browser)                                │
│  Search Box → Course Cards → Discovery Panel → Classroom View            │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                    Next.js BFF (client-main/app/api/courses/*)
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                    Express API (Mr5-School-API-main)                     │
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐   │
│  │ Search Intent   │  │ Course Matching  │  │ Content Assembly    │   │
│  │ Service         │→ │ Service          │→ │ Service             │   │
│  └─────────────────┘  └──────────────────┘  └─────────────────────┘   │
│           │                     │                      │               │
│           └─────────────────────┼──────────────────────┘               │
│                                 ▼                                        │
│                    Course Generation Service (Orchestrator)              │
│                                 │                                        │
│                    ┌────────────┴────────────┐                          │
│                    ▼                         ▼                          │
│              AI Service (Gemini)      MongoDB Persistence               │
│              + Prompt Templates         Course / Lesson / Job / Source  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Module | Purpose |
|-------|--------|---------|
| Search Understanding | `searchIntentService.js` | Extract topic, level, intent, subtopics |
| Course Matching | `courseMatchingService.js` | Score existing courses, detect partial content |
| Content Assembly | `contentAssemblyService.js` | Persist syllabus → Course + Lessons + Sources |
| Orchestration | `courseGenerationService.js` | Job lifecycle, async pipeline |
| AI Generation | `ai.service.js` + `courseGeneration.prompts.js` | Guarded JSON course structure generation |
| Access Control | Existing auth/enrollment/payment | Unchanged — checked before classroom entry |
| Classroom UI | `features/classroom/*` + 3D scene | Existing immersive teaching environment |

---

## 2. Database Schema

### Existing Models (Extended)

**Course** — added fields:
- `learningOutcomes: [String]`
- `estimatedWeeks: Number`
- `isGenerated: Boolean`
- `generationJob: ObjectId → CourseGenerationJob`
- `syllabusSnapshot: Mixed`

**Lesson** — added fields:
- `moduleTitle: String`
- `objectives: [String]`
- `example: String`
- `practiceTask: String`
- `quiz: [Mixed]`

### New / Scaffolded Models

**CourseGenerationJob**
```
query, intent { topic, level, intentType, subtopics, durationWeeks }
status: queued | matching | assembling | generating | completed | failed
recommendation: open_existing | assemble_new | merge_partial
matchedCourseIds[], course, requestedBy, syllabus, sources[]
reviewStatus: pending_review | approved | rejected
auditLog[], error
```

**ContentSource**
```
title, url, sourceType, licenseType, attribution
course, lesson, notes
```

### Related Existing Models (Unchanged)
- User, Enrollment, Payment, LessonProgress, Assignment, ChatMemory, AIInteraction

---

## 3. Search-to-Course Flow

```
Student types query
       │
       ▼
GET /api/courses/discovery/suggestions?q=...
       │  → intent preview + autocomplete
       ▼
GET /api/courses?search=...  (catalog search)
       │
       ▼
POST /api/courses/discovery/discover  (logged-in)
       │
       ├── recommendation: open_existing
       │        → redirect to /course/:id
       │
       ├── recommendation: merge_partial
       │        → show "Assemble Complete Course" CTA
       │
       └── recommendation: assemble_new
                → show "Create New Course" CTA
                       │
                       ▼
              POST /api/courses/discovery/generate
                       │
                       ▼
              Background pipeline (CourseGenerationJob)
                1. matching
                2. assembling (merge existing if partial)
                3. generating (AI syllabus)
                4. persist Course + Lessons + ContentSources
                       │
                       ▼
              GET /api/courses/discovery/jobs/:id  (poll)
                       │
                       ▼
              /course/:id/room/classroom
```

---

## 4. Course Generation Pipeline

1. **Intent parsing** — deterministic keywords + AI fallback (`buildSearchIntentPrompt`)
2. **Matching** — text index + regex scoring; partial lesson detection
3. **Decision** — `open_existing` (score ≥ 80) | `merge_partial` (40–79 or partial lessons) | `assemble_new`
4. **AI generation** — `buildCourseStructurePrompt` → full syllabus JSON
5. **Merge** — skip lessons that already exist by title
6. **Persistence** — Course, Lessons (with quiz/practice), ContentSources, final Assignment
7. **Review** — `isApproved: false`, `reviewStatus: pending_review`

---

## 5. Classroom UI Flow

After course resolution:
1. `/course/:id` — landing, access check, enroll/paywall
2. `/course/:id/lesson/start` — first lesson
3. `/course/:id/room/classroom` — 3D classroom with:
   - AI teacher avatar
   - Environment controls (fan, lights, curtains)
   - Progress tracker
   - Chat/tutor via `POST /api/ai/tutor`
   - Step-by-step lesson unlock via progress service

**Camera / Privacy Rules**
- Camera only with explicit consent
- Used for presence, attention UI, speaking indicator, hand raise
- No emotion inference, no grading from biometrics
- Confusion detected from chat interaction only

---

## 6. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/courses/discovery/suggestions?q=` | Public | Autocomplete + intent preview |
| POST | `/api/courses/discovery/discover` | JWT | Full intent + match analysis |
| POST | `/api/courses/discovery/generate` | JWT | Start generation job |
| GET | `/api/courses/discovery/jobs/:jobId` | JWT | Poll job status |
| POST | `/api/ai/generate-course` | JWT | Direct AI structure (legacy) |
| GET | `/api/courses` | Public | Catalog search (existing) |
| GET | `/api/enrollments/check/:courseId` | JWT | Access gate (existing) |

### Next.js BFF Proxies
- `GET/POST /api/courses/discover`
- `POST /api/courses/generate`
- `GET /api/courses/generation/[jobId]`
- `GET /api/courses/search` (existing)

---

## 7. Reusable Components

| Component | Path |
|-----------|------|
| `CourseDiscoveryPanel` | `client-main/components/courses/CourseDiscoveryPanel.tsx` |
| `GenerationProgressCard` | `client-main/components/courses/GenerationProgressCard.tsx` |
| `courseDiscoveryService` | `client-main/services/courseDiscovery.service.ts` |
| Classroom store/UI | `client-main/features/classroom/` |
| `TeachingAIModal` | `client-main/components/ai/TeachingAIModal.tsx` |
| `CourseAccessGate` | `client-main/components/course/CourseAccessGate.tsx` |

---

## 8. Prompt Templates

Located in `Mr5-School-API-main/src/prompts/courseGeneration.prompts.js`:

- `SEARCH_INTENT_SYSTEM` + `buildSearchIntentPrompt` — query understanding
- `COURSE_STRUCTURE_SYSTEM` + `buildCourseStructurePrompt` — full syllabus
- `buildSummaryQuizPrompt` — lesson recap + quiz

**Safety rules embedded in prompts:**
- Original instructional material only
- No copying protected text
- JSON-only structured output
- Resource links with license tags

---

## 9. Safety & Privacy Rules

### Content Safety
- Only approved source types: LMS internal, official docs, OER, API, teacher upload, AI-generated
- `ContentSource` stores provenance, license, attribution per item
- Generated courses default to `isApproved: false` — admin review required
- Full audit log on every `CourseGenerationJob`
- Basic content moderation on AI chat (`moderateContent`)

### Privacy
- Camera: opt-in only, no hidden surveillance
- No mood/emotion inference from camera
- No access/grading decisions from face analysis
- Confusion adaptation via chat signals only

---

## 10. Production Code Structure

```
Mr5-School-API-main/src/
├── models/
│   ├── Course.js              (extended)
│   ├── Lesson.js              (extended)
│   ├── CourseGenerationJob.js
│   └── ContentSource.js
├── services/
│   ├── searchIntentService.js
│   ├── courseMatchingService.js
│   ├── contentAssemblyService.js
│   ├── courseGenerationService.js
│   └── ai.service.js          (extended)
├── prompts/
│   └── courseGeneration.prompts.js
├── controllers/
│   └── courseDiscoveryController.js
└── routes/
    └── courseDiscoveryRoutes.js

client-main/
├── app/api/courses/
│   ├── discover/route.ts
│   ├── generate/route.ts
│   └── generation/[jobId]/route.ts
├── app/courses/page.tsx       (intelligent search UI)
├── components/courses/
│   ├── CourseDiscoveryPanel.tsx
│   └── GenerationProgressCard.tsx
└── services/
    └── courseDiscovery.service.ts
```

---

## Performance Notes

- Intent cache: 10 min
- Match cache: 3 min
- Course list cache: 5 min (existing)
- Background job via `setImmediate` — upgrade to queue (Bull/Redis) at scale
- Reuses existing lessons on merge — avoids duplicate content
- Text index on Course for relevance ranking
