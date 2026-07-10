# 08 — Pending Tasks Roadmap

Prioritized by impact and dependency order.

---

## CRITICAL (Blockers — Must Fix Before Production)

### C1: Install Playwright Browser Binaries
**Description:** E2E tests fail because Playwright cannot find Chromium executable.
**Why needed:** Cannot run any E2E tests — smoke tests, login tests, all fail.
**Command:** `cd client-main && npx playwright install chromium`
**Estimated difficulty:** Trivial (1 command)
**Dependencies:** None

### C2: Set Production Environment Variables
**Description:** All production env vars must be configured before deploying.
**Why needed:** Without MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID, STRIPE keys — the app will not function.
**Files:** `Mr5-School-API-main/.env.example`, `client-main/.env.example`
**Required vars (backend):**
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Min 32 chars
- `CORS_ORIGIN` — `https://app.mr5school.com`
- `CLIENT_URL` — `https://app.mr5school.com`
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` — `https://api.mr5school.com/api/auth/google/callback`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- `GEMINI_API_KEY` or `OPENAI_API_KEY`
- `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`
- `EMAIL_USER` + `EMAIL_PASS` + SMTP config
**Required vars (frontend):**
- `NEXT_PUBLIC_API_URL` — `https://api.mr5school.com`
- `NEXT_PUBLIC_SITE_URL` — `https://app.mr5school.com`
- `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` — `true`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY` (server-only for Next.js API routes)
**Estimated difficulty:** Easy (configuration, no code changes)
**Dependencies:** Accounts with Google, Stripe, MongoDB Atlas, Cloudinary

### C3: Fix next.config.mjs API Rewrite Port Mismatch
**Description:** The API rewrite fallback uses port 5000, but the backend runs on 5001.
**File:** `client-main/next.config.mjs` L104
**Current code:** `'http://127.0.0.1:5000/api/:path*'`
**Fix:** Change to `'http://127.0.0.1:5001/api/:path*'`
**Why needed:** API calls will fail locally if NEXT_PUBLIC_API_URL is not set.
**Estimated difficulty:** Trivial (1-line fix)
**Dependencies:** None

### C4: Fix Empty studentController.js
**Description:** `src/controllers/studentController.js` is 0 bytes.
**Why needed:** Any routes that import from this file will crash the server.
**File:** `Mr5-School-API-main/src/controllers/studentController.js`
**Fix:** Audit all routes that import from studentController — either implement the controller or redirect to studentLearningController.
**Estimated difficulty:** Low (need to check what routes use it)
**Dependencies:** None

---

## HIGH Priority (Core UX — Complete Within First Sprint)

### H1: Complete Certificate Admin UI in Power Admin Hub
**Description:** The backend approval workflow is complete, but no admin UI exists to approve/reject certificates.
**Why needed:** Admins cannot issue certificates without this UI.
**Files to create/modify:**
- `client-main/app/admin/certificates/page.tsx` (new)
- Wire to `services/certificate.service.ts` methods: `approveCertificate`, `rejectCertificate`
- Add to admin navigation
**Estimated difficulty:** Medium (2-3 days)
**Dependencies:** H2

### H2: Complete Power Admin Hub Course Factory Wizard
**Description:** The Course Factory page exists but lesson drag-drop ordering is not implemented.
**Why needed:** Admins cannot reorder lessons within AI-generated courses.
**Files:** `client-main/app/admin/course-factory/[id]/page.tsx`
**Estimated difficulty:** Medium (drag-drop: @dnd-kit recommended)
**Dependencies:** None

### H3: Wire Analytics Charts in Admin Dashboard
**Description:** The analytics page returns data from `/api/power-admin/analytics` but the charts are placeholders.
**Why needed:** Admins have no visibility into platform usage.
**Files:** `client-main/app/admin/analytics/page.tsx`
**Implementation:** Use `recharts` (already installed) to render student activity, enrollment counts, revenue
**Estimated difficulty:** Medium (1-2 days)
**Dependencies:** None

### H4: Server-Sync Classroom XP
**Description:** XP, level, streak in 3D classroom are stored only in Zustand (client-side) — lost on page refresh.
**Why needed:** Gamification is meaningless if progress is not persisted.
**Files:** 
- `features/classroom/store/classroom.store.tsx` — add API sync
- Backend: `/api/students/me/xp` endpoint (may need creating)
- `src/models/UserLearningStats.js` — model exists
**Estimated difficulty:** Medium (2 days)
**Dependencies:** None

### H5: Fix passport.deserializeUser Deprecated API
**Description:** `User.findById(id, callback)` deprecated in Mongoose 8 — should use promise-based API.
**File:** `Mr5-School-API-main/src/config/passport.js` L68
**Fix:**
```javascript
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
```
**Estimated difficulty:** Trivial
**Dependencies:** None

### H6: Complete Approval Queue UI
**Description:** The admin approval queue page is partially wired but not fully functional.
**Why needed:** Content cannot be reviewed and published without it.
**Files:** `client-main/app/admin/approvals/page.tsx`
**Estimated difficulty:** Low-Medium (1-2 days)
**Dependencies:** None

### H7: Email Verification on Registration
**Description:** New users are auto-approved without verifying their email.
**Why needed:** Security and data quality — prevents fake registrations.
**Files:** `Mr5-School-API-main/src/controllers/authController.js`
**Implementation:** Send verification email with token → verify endpoint → set status to approved
**Estimated difficulty:** Medium (2 days, requires email config)
**Dependencies:** SMTP credentials (C2)

---

## MEDIUM Priority (Enhancement — Second Sprint)

### M1: Compress Ganesha GLB Asset
**Description:** Ganesha GLB is 26MB — must be reduced for production performance.
**Target:** Under 8MB using Draco compression.
**Why needed:** 26MB asset causes slow load times, especially mobile.
**Tool:** `gltf-pipeline` or `glTF-Transform`
**Command example:** `npx gltf-pipeline -i indigo-ganesha.glb -o indigo-ganesha-draco.glb --draco.compressionLevel 10`
**Estimated difficulty:** Low (tool usage)
**Dependencies:** `@react-three/drei` DracoLoader must be configured

### M2: Add GDPR Account Deletion
**Description:** No endpoint or UI exists for users to delete their accounts (right to erasure).
**Why needed:** GDPR compliance requirement.
**Files:**
- New: `DELETE /api/users/account` endpoint
- Anonymize or delete: User, ChatMemory, ConsentAuditLog (keep for 7 years), etc.
- Frontend: Settings page delete account button
**Estimated difficulty:** Medium (data cascade handling)
**Dependencies:** Legal review of retention requirements

### M3: Student Grades/Transcript Page UI
**Description:** `/api/transcripts/my` exists but the frontend transcript page is basic.
**Why needed:** Students need a clear view of their academic record.
**Files:** `client-main/app/student/grades/page.tsx` or similar
**Estimated difficulty:** Low (fetch and display data)
**Dependencies:** None

### M4: Notification System Frontend
**Description:** `IdentityNotification` model exists with backend but no frontend notification bell/list.
**Why needed:** Friend requests, certificate status changes are invisible to users.
**Files:** 
- New notification bell in navbar
- `services/identity.service.ts` has notification methods
**Estimated difficulty:** Medium (1-2 days)
**Dependencies:** None

### M5: Voice Q&A Pipeline in Classroom
**Description:** Azure TTS works but STT (speech-to-text) is not fully wired in classroom.
**Why needed:** Core product differentiator — voice interaction with AI teacher.
**Files:** `lib/audio/`, Azure Speech SDK STT implementation
**Estimated difficulty:** High (3-4 days)
**Dependencies:** `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` env vars

### M6: Mobile Responsive Admin Pages
**Description:** Power Admin Hub pages are not optimized for mobile/tablet.
**Why needed:** Admins may access hub from mobile.
**Estimated difficulty:** Medium (CSS/layout work)
**Dependencies:** None

### M7: Real-time Analytics in Admin
**Description:** Analytics charts show historical data but no real-time updates.
**Why needed:** Admins want live visibility into active students.
**Implementation:** WebSocket or SSE from Express, or polling
**Estimated difficulty:** High (requires WebSocket integration)
**Dependencies:** H3

---

## LOW Priority (Future Phases)

### L1: Multi-tenant School Support
**Description:** Allow multiple schools to operate independently on the platform.
**Why needed:** Enterprise licensing and white-label opportunities.
**Estimated difficulty:** Very High (complete data isolation redesign)
**Dependencies:** All core features stable

### L2: PostgreSQL Analytics Warehouse
**Description:** Add PostgreSQL for analytical queries alongside MongoDB.
**Why needed:** Complex aggregations are slow in MongoDB.
**Estimated difficulty:** Very High
**Dependencies:** L1

### L3: Elasticsearch for Course Search
**Description:** Replace MongoDB text search with Elasticsearch.
**Why needed:** Better full-text search relevance.
**Estimated difficulty:** High
**Dependencies:** AWS OpenSearch or Elastic Cloud setup

### L4: Live Classroom (WebRTC)
**Description:** LiveKit server SDK is installed but live video classroom is not fully built.
**Why needed:** Premium live teaching sessions.
**Dependencies:** LiveKit Cloud account + `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET`
**Estimated difficulty:** High

### L5: Advanced Certificate Features
**Description:** Batch certificate issuance, employer verification portal, LinkedIn sharing integration.
**Estimated difficulty:** Medium per feature
**Dependencies:** H1

### L6: Knowledge Tree / Learning Map UI
**Description:** Visual prerequisite-based course progression map.
**Why needed:** Guides student learning paths.
**Estimated difficulty:** High (React Flow or D3.js)
**Dependencies:** None

### L7: Course Reviews and Ratings
**Description:** Students leave course ratings/reviews.
**Why needed:** Social proof for course discovery.
**Estimated difficulty:** Low-Medium
**Dependencies:** None
