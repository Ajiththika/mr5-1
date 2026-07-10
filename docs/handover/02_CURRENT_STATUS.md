# 02 — Current Status

## Overall Production Readiness: 68%

---

## Completed Features

### Authentication
- JWT access tokens + refresh tokens (httpOnly cookies)
- Email/password login with bcrypt hashing
- Google OAuth 2.0 (Passport.js) — backend complete; requires GOOGLE_CLIENT_ID/SECRET env vars
- Session-expiry detection on frontend with redirect to login
- Password reset via email token (Nodemailer)
- Rate limiting on auth endpoints (10 attempts/15min production)
- Forgot password modal on login page

### User Management
- Registration with email validation (Zod schema)
- User roles: student, AI-TEACHER, instructor, employer, partner_school, admin
- Admin RBAC roles (adminRole field): super_admin, power_leader, content_admin, teacher_manager, course_creator, reviewer, analytics_viewer
- MR5 Unique ID (mr5Uid) assignment
- Onboarding flow (post-registration wizard)
- Avatar preset selection
- Profile image via Cloudinary
- Country + certificationId fields for certificate identity

### Courses
- CRUD (create, read, update, delete) — admin-only creation
- Categories, levels (Beginner/Intermediate/Advanced), languages
- Approval workflow (isApproved flag)
- Course discovery endpoint (public, paginated)
- Course thumbnails (Cloudinary)
- Price field (0 = free, >0 = paid via Stripe)

### Lessons
- CRUD per course
- Order field for sequential lessons
- Video URL, content text, duration
- Publish status: draft/pending_review/approved/published

### Enrollment
- POST /api/enrollments — enroll student in course
- Progress tracking (percentage)
- Stripe payment integration — enrollment created on webhook success
- CourseAccessGate component (frontend)

### Progress Tracking
- LessonProgress model — per-lesson completion
- Enrollment.progress field (overall %)
- UserLearningStats — aggregated XP, streaks

### 3D Classroom
- React Three Fiber (R3F) classroom scene
- Classroom GLB model (public/assets/3d/rooms/classroom.glb)
- Teacher character (procedural R3F meshes)
- Ganesha welcome guide GLB (CC BY 4.0 — credit required)
- Performance profiles: low (mobile), medium (desktop), high
- Fan, board, environment components
- PlaytimePanel: XP, Level, Stars, Streak — client-side Zustand store
- ProgressTracker UI
- 3D Model credit system (ModelCreditNotice component)

### Payments
- Stripe checkout integration
- Stripe webhook handler (/api/payments/webhook)
- Payment model tracking
- PricingRule model for dynamic pricing
- Enrollment creation on payment success

### Virtual Shop
- ShopItem catalog (hat, shirt, accessory, book types)
- ShopOrder model
- OwnStore catalog (Own Store items)
- UserInventory model
- Avatar teacher purchases (purchasedTeacherAvatars)
- Equipped items on User model (clock, fan, bell, music, transport, activity pack)

### Certification System (Backend Complete)
- Certificate model with blockchain-style verification hash
- Certificate ID format: MR5-CERT-2026-SL-000001
- Student certification ID: MR5-2026-SL-000001
- Approval workflow: pending_instructor -> pending_admin -> issued
- Rejection and revocation support
- QR code generation (qrcode package)
- PDF generation (pdfkit)
- Public certificate verification endpoint: /api/verify/:id
- Verification hash validation
- VerificationLog for audit trail

### Legal Consent Engine
- LegalDocument + LegalDocumentVersion models
- LegalAcceptance recording per user per document version
- ConsentAuditLog for GDPR audit trail
- Next.js middleware enforcement: consent-protected paths redirect to /legal/accept
- legalConsentService with full CRUD
- Auto-seed legal documents on server start

### Identity/Gamification
- IdentityFriend (friend connections)
- IdentityNotification model
- Identity search + gamification (badges, levels)
- Public profile pages at /u/[uid]

### Power Admin Hub (APIs Complete, UI ~60%)
- /api/power-admin/overview — dashboard KPIs
- /api/power-admin/teachers — teacher CRUD + clone + archive
- /api/power-admin/classrooms — classroom CRUD
- /api/power-admin/approvals — content approval queue
- /api/power-admin/analytics — engagement data
- /api/power-admin/roles — RBAC role assignments
- /api/power-admin/ai/lesson-assist — AI lesson generation
- Admin frontend pages scaffolded at /admin/*

### AI Features
- Multi-provider AI service: Gemini (default), OpenAI, Ollama
- Course generation from topic (AI-generated structure + lessons)
- Auto-grading student answers against rubric
- AI chat memory (ChatMemory model)
- Avatar support agent (AI-powered support chat)
- TTS (Azure Speech SDK)
- Regional detection via AI

### Security
- Helmet security headers
- express-mongo-sanitize (NoSQL injection prevention)
- XSS sanitization
- Rate limiting (API + auth endpoints)
- JWT httpOnly cookie-based auth
- CORS allowlist with *.vercel.app dynamic support
- ensureDbConnected middleware (blocks API traffic until MongoDB ready)

---

## In Progress Features

### Power Admin Hub UI (~60%)
- Teacher management list and detail pages exist
- Course Factory wizard — partially scaffolded
- Classroom Builder — scaffolded, not fully wired
- Approval Queue — partially wired
- Analytics charts — placeholder, recharts not fully integrated

### Certificate Frontend
- Certificate viewer page at /certificate exists
- PDF download button — wired to /api/certificates/:id/pdf
- QR display — component exists (qrcode.react installed)
- Certificate approval flow in admin — not yet fully built in Power Admin UI

### AI Tutor Chat
- Backend routes complete (/api/ai/*)
- Frontend AI assistant page exists (/ai-assistant)
- Chat memory storage works
- Voice Q&A pipeline (TTS/STT) — partial

### Student Dashboard
- Dashboard page exists at /app/dashboard
- Enrollment list — wired
- Progress display — basic
- Grades/transcript view — exists at /api/transcripts

---

## Broken Features

### E2E Tests (Critical)
- **All Playwright tests fail** with "Executable doesn't exist at ..."
- **Root Cause:** Browser binaries not installed
- **Fix:** `cd client-main && npx playwright install chromium`

### Google OAuth Button (Fixed in Previous Session)
- The `GoogleSignInButton` component now correctly reads `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED`
- **Note:** OAuth will only work if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in backend .env

### Backend Production DB Connection
- If `MONGO_URI` is not set in production, the server exits with error
- In development, auto-falls back to in-memory MongoDB (data lost on restart)
- **Fix for production:** Set `MONGO_URI=mongodb+srv://...` in environment

---

## Known Bugs

| # | Bug | Severity | File | Status |
|---|-----|----------|------|--------|
| 1 | Playwright browser binaries missing | Critical | client-main/ | Open |
| 2 | `studentController.js` is 0 bytes (empty file) | High | Mr5-School-API-main/src/controllers/ | Open |
| 3 | `passport.deserializeUser` uses deprecated callback API | Medium | src/config/passport.js L68 | Open |
| 4 | `next.config.mjs` rewrite fallback uses port 5000, backend runs on 5001 | Medium | client-main/next.config.mjs L104 | Open |
| 5 | Google OAuth callback URL must exactly match Google Console config | High | src/config/passport.js L16 | Env-config issue |
| 6 | No email verification on registration | Medium | authController.js | Open |
| 7 | `weatherController.js` exists but weather route not in app.js | Low | src/controllers/ | Open |

---

## Temporary Workarounds

| Workaround | Location | Reason |
|------------|----------|--------|
| In-memory MongoDB auto-fallback in dev | src/config/db.js | No local MongoDB needed for dev |
| `getGoogleOAuthUrl()` skips window in test env | lib/api-base.ts | Prevents Jest crashes |
| CORS allows all `*.vercel.app` origins | src/app.js L126 | Supports Vercel preview deployments |
| Demo credentials shown in login form (dev only) | app/login/page.tsx L103 | Quick dev testing |
| `postinstall: playwright install chromium || true` | client-main/package.json | Prevents install crash if in CI without display |

---

## Production Readiness Checklist

| Item | Status |
|------|--------|
| MongoDB Atlas connection | Requires MONGO_URI env var |
| Google OAuth | Requires GOOGLE_CLIENT_ID + SECRET + CALLBACK_URL |
| Stripe payments | Requires STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET |
| JWT secret (32+ chars) | Requires JWT_SECRET env var |
| CORS origin configured | Requires CORS_ORIGIN=https://app.mr5school.com |
| Cloudinary | Requires CLOUD_NAME + API_KEY + API_SECRET |
| Email (Nodemailer) | Requires SMTP config |
| AI features | Requires GEMINI_API_KEY or OPENAI_API_KEY |
| LiveKit | Requires LIVEKIT_API_KEY + SECRET |
| E2E tests passing | NOT READY (browser install needed) |
| Unit tests passing | PASSING (backend Jest suite) |
| TypeScript no errors | PARTIAL (some any types exist) |
