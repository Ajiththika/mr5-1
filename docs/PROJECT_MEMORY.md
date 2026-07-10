# Project Memory: MR5 School

## 1. Project Overview
**MR5 School** (mr5school.com) is an immersive, AI-powered online learning platform featuring 3D virtual classrooms, AI teacher avatars, gamified progression (XP, levels, streaking), blockchain-style certificate verification, and a comprehensive Power Admin Hub. The platform targets K-12 and post-secondary students in emerging markets (e.g., Sierra Leone, India) and diaspora communities.

---

## 2. Tech Stack

### Frontend (`client-main/`)
* **Framework:** Next.js 15 (App Router, React 19)
* **Styling:** Tailwind CSS 3, shadcn/ui, Radix UI
* **3D Engine:** React Three Fiber (R3F), Three.js, Drei
* **State Management:** React Context (EnhancedUserContext) & Zustand (PlaytimePanel store)
* **Payments:** Stripe React SDK
* **Media & Assets:** Cloudinary (`next-cloudinary`)
* **Real-time Voice/Video:** LiveKit (WebRTC)
* **AI Client:** Browser-side Gemini API (via server-side proxy)

### Backend (`Mr5-School-API-main/`)
* **Runtime:** Node.js 20 (ES Modules)
* **Framework:** Express 4
* **Database:** MongoDB (Mongoose 8)
* **Authentication:** JWT (httpOnly cookies) + Passport.js (Google OAuth 2.0)
* **AI Service:** Google Gemini, OpenAI SDK, Ollama (local fallback)
* **Payments:** Stripe (webhooks, checkout)
* **Storage & Utilities:** Cloudinary SDK, `pdfkit` (Certificate PDF), `qrcode` (Base64 QR codes)
* **Real-time Server:** LiveKit Server SDK
* **Email:** Nodemailer

### Infrastructure
* **Frontend Hosting:** Vercel
* **Backend Hosting:** AWS ECS Fargate / EC2
* **Database:** MongoDB Atlas
* **CDN / Storage:** AWS CloudFront & S3
* **Secrets:** AWS Secrets Manager

---

## 3. Folder Structure

```
Mr5/                                   <- Monorepo root
├── client-main/                       <- Next.js 15 frontend
│   ├── app/                           <- App Router pages
│   │   ├── admin/                     <- Power Admin Hub (/admin/*)
│   │   ├── student/                   <- Student portal (dashboard, courses)
│   │   ├── course/[id]/               <- 3D classroom scene & lessons
│   │   ├── legal/                     <- GDPR & Legal consent flow
│   │   └── onboarding/                <- Country selection & avatar setup
│   ├── components/                    <- 3D, auth, layout, and UI primitives
│   ├── contexts/                      <- EnhancedUserContext (auth state)
│   ├── features/                      <- Zustand store (classroom, XP)
│   ├── lib/                           <- Utilities & translations
│   ├── services/                      <- API clients (e.g., certificate.service.ts)
│   └── tests/                         <- Playwright (e2e) & Jest (unit)
│
├── Mr5-School-API-main/               <- Express backend
│   ├── src/
│   │   ├── app.js                     <- Express app entry & middleware
│   │   ├── config/                    <- DB, passport, roles, and env validation
│   │   ├── controllers/               <- 31 API route controllers
│   │   ├── middleware/                <- Auth, rate-limiter, legal consent
│   │   ├── models/                    <- 37+ Mongoose schemas
│   │   ├── routes/                    <- Route definitions
│   │   ├── services/                  <- Business services (AI, Identity)
│   │   └── utils/                     <- PDF, QR, and certificate hash generators
│   └── tests/                         <- Jest integration tests
│
└── docs/                              <- Project documentation and handovers
```

---

## 4. Core Modules

* **3D Classroom & Gamification:** R3F environment rendering teacher avatar, interactive objects (fan, board), and local state tracking for XP, streaking, and levels.
* **Power Admin Hub:** Central admin console for managing teacher profiles, monitoring classroom performance, approving AI-generated course content, reviewing analytics, and managing roles.
* **Legal Consent Engine:** Enforces GDPR compliance via Next.js middleware, blocking user access until consent is recorded for the active document versions.
* **Payments & Virtual Shop:** Stripe checkout integration to purchase courses. virtual shop allows buying accessories, teacher avatars, and room items using gamified rewards or direct currency.
* **Certification System:** Generates blockchain-style verifiable certificates with a unique hash, a verification QR code, and a stylized PDF delivered via Cloudinary.

---

## 5. Authentication

Authentication operates on **JWT access and refresh tokens stored in httpOnly cookies**, preventing client-side script access (XSS defense).
* **Strategy:** Local Email/Password (hashed with bcrypt, 10 rounds) + Google OAuth 2.0 (handled via Passport.js on backend).
* **Security Middleware:** CORS dynamic origin allowance, Helmet HTTP headers, express-rate-limit (10 requests per 15 mins on auth, 100 on API), and express-mongo-sanitize (NoSQL injection guard).
* **Verification:** Missing email verification flow for local registration.

---

## 6. Database (MongoDB)

All schemas are managed through Mongoose 8. Key models include:
* **User:** Holds credentials, role, status, country, avatar configurations, and inventory.
* **Certificate / CertificationProfile:** Stores unique certificate IDs, hashes, approval states (`pending_instructor` -> `pending_admin` -> `issued`), and metadata.
* **Enrollment:** Compound unique index on student and course. Monitors overall course progress percentage.
* **ChatMemory:** Stores chronological conversation arrays for the AI Assistant and Support Agent.
* **LegalDocument / LegalAcceptance:** Manages versions of terms and documents alongside user consent mappings.

---

## 7. API Summary

Mounted in `src/app.js` with root prefix `/api/`:

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | None | Registers user, hashes password, sets JWT cookies. |
| `/api/auth/login` | `POST` | None | Authenticates, issues access/refresh tokens. |
| `/api/auth/google` | `GET` | None | Initiates Google OAuth redirection. |
| `/api/auth/me` | `GET` | Cookie | Retrieves active user payload. |
| `/api/users/profile` | `PUT` | Cookie | Updates profile settings and localization. |
| `/api/courses` | `GET` | None | Fetches public course catalogs. |
| `/api/enrollments` | `POST` | Cookie | Enrolls student (checks Stripe payment if paid). |
| `/api/certificates` | `POST` | Cookie | Initiates a certificate request. |
| `/api/certificates/:id/approve` | `PUT` | Admin | Approves a certificate request and triggers PDF generation. |
| `/api/verify/:id` | `GET` | None | Publicly validates a certificate by ID or hash. |
| `/api/ai/chat` | `POST` | Cookie | Passes query to chosen LLM provider (Gemini/OpenAI). |
| `/api/tts/synthesize` | `POST` | Cookie | Converts text to speech using Azure Speech SDK. |

---

## 8. AI Integrations

* **Multi-Provider Architecture:** `ai.service.js` integrates Google Gemini (`gemini-1.5-flash`), OpenAI (`gpt-3.5-turbo`), and Ollama (`llama2` for offline dev). Supported via custom prompt files in `src/prompts/`.
* **AI Course Generation (Course Factory):** Generates outline, modules, lessons, summaries, and quizzes based on topic prompt inputs.
* **Auto-Grading:** Automates student assessment by comparing responses against predefined rubrics.
* **Avatar Support Agent:** Renders interactive, role-based chatbot assistant utilizing conversation history stored in `ChatMemory`.
* **Text-To-Speech (TTS):** Generates character dialogue for 3D avatars via Azure Cognitive Speech SDK.

---

## 9. Current Project Status

* **Total Completion:** ~77% (Enhanced by recent certification, admin/student UI, onboarding progress, and the first production-stability fixes).
* **Completed Work:**
  * PDF and QR Code generation for certificates (`pdfGenerator.js`, `qrCodeGenerator.js`).
  * Backend and Frontend for Certificate Approval workflow.
  * Google OAuth client integration (GoogleSignInButton handles toggles gracefully).
  * Legal Consent Engine implementation.
  * R3F 3D Classroom rendering and local play store setup.
  * Backend compatibility shim for the student controller.
  * Frontend API proxy fallback aligned to port 5001.
  * Passport deserialization updated for current Mongoose compatibility.
* **Remaining Work:**
  * Server synchronization of R3F/Zustand Classroom XP to DB.
  * Drag-and-drop lesson reordering in the admin Course Factory UI.
  * Local/Staging Playwright environment setup (`npx playwright install chromium`).
  * Email verification flow on initial student signup.
  * Analytics chart integration in Admin Dashboard using Recharts.

---

## 10. Critical Risks

1. **Broken E2E Tests:** Playwright tests are still failing in CI/CD and local environments until browser binaries are installed.
2. **In-Memory Rate Limiting:** The backend uses an in-memory rate limiter which does not share states across multiple scaled AWS ECS Fargate instances (needs Redis).
3. **Environment Configuration:** Production OAuth, Stripe, and AI provider credentials still need to be configured for full external-service verification.
4. **Google OAuth Config Matches:** Missing or mismatched Redirect URIs in Google Cloud Console relative to production domain credentials will fail OAuth.

---

## 11. Architecture Decisions

* **No Direct DB Access for Frontend:** The Next.js frontend is decoupled from MongoDB. All database transactions must transit the Express API. Next.js API routes act as proxy tunnels only.
* **Cookie-Based Token Storage:** httpOnly cookies are chosen over localStorage for JWTs to minimize exposure to XSS attacks.
* **In-Memory MongoDB fallback in Dev:** If `MONGO_URI` is omitted locally, an in-memory server is spun up, lowering setup friction.

---

## 12. Unrewritable Directories & Files

Do not modify or rewrite the following completed and audited files:
* `docs/handover/07_AI_FEATURES.md`
* `docs/handover/08_PENDING_TASKS.md`
* `docs/handover/09_BUG_REPORT.md`
* `docs/handover/10_SECURITY_AUDIT.md`
* `docs/handover/11_PERFORMANCE_AUDIT.md`
* `client-main/middleware.ts` (Legal consent and auth route protection logic)
* `Mr5-School-API-main/src/middleware/legalConsentMiddleware.js`
