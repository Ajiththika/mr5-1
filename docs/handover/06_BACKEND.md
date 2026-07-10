# 06 — Backend Documentation

Backend: `Mr5-School-API-main/` — Express 4, Node.js 20 (ES Modules)

---

## Entry Point

**`src/app.js`** — Main Express application file.

**Startup sequence:**
1. Load `.env` via dotenv
2. Initialize Passport (Google OAuth strategy)
3. Validate required env vars (`validateEnv()`)
4. Configure CORS (dynamic origin matching)
5. Apply security middleware (Helmet, rate limiter, mongo sanitize)
6. Mount Stripe webhook (before JSON parser — raw body needed)
7. Apply JSON body parser
8. Mount `ensureDbConnected` middleware for all `/api/*` routes
9. Mount all 31 route files
10. Mount health check endpoints (`/health`, `/ready`)
11. Mount error handler
12. Start server with MongoDB connection (skipped on Vercel)

---

## Controllers (31 files)

### `authController.js`
**Handles:** Registration, login, logout, token refresh, password reset, Google OAuth callback

**Key logic:**
- `register`: Validate Zod schema → bcrypt hash password → create User → issue JWT cookies
- `login`: Find user → bcrypt compare → check status/isActive → issue JWT access + refresh tokens
- `logout`: Revoke refresh token in DB → clear cookies
- `googleCallback`: Triggered by Passport after OAuth → issue JWT cookies → redirect to CLIENT_URL
- `refreshToken`: Validate refresh token cookie → check DB → issue new access token
- `forgotPassword`: Generate reset token → hash → save to User → send email
- `resetPassword`: Validate token → hash new password → clear token

**Auth issues observed:**
- `passport.deserializeUser` uses deprecated callback API (line 68) — needs update to promise-based

---

### `certificateController.js` (17KB — most complex)
**Handles:** Certificate generation, approval workflow, PDF download, verification

**Key functions:**
- `generateCertificate`: Creates Certificate doc with auto-generated certificateId, verificationHash, QR code
- `instructorApprove`: Updates status to `pending_admin`
- `adminApprove`: Updates status to `issued`, generates PDF via pdfkit, uploads to Cloudinary
- `rejectCertificate`: Moves to rejected with reason
- `revokeCertificate`: Moves to revoked
- `getCertificatePdf`: Streams PDF from Cloudinary or regenerates
- `verifyCertificate`: Public — finds by certificateId or verificationHash, validates status

---

### `powerAdminController.js`
**Handles:** Dashboard overview, teacher CRUD, classroom CRUD, content approvals, analytics, RBAC

**Key functions:**
- `getOverview`: Aggregates User count, Course count, Enrollment count, Revenue from Payments
- `getTeachers`: Paginated teacher list with populate
- `createTeacher`: Creates Teacher profile + links to User
- `approveContent`: Updates ContentApproval status via approvalWorkflowService

---

### `courseController.js`
**Handles:** Course CRUD with admin authorization

---

### `enrollmentController.js`
**Handles:** Enroll, get enrollments, update progress, check access

**Key logic:**
- Free course: direct enrollment
- Paid course: check payment existence before enrolling

---

### `paymentController.js`
**Handles:** Stripe checkout creation, webhook handling, payment history

**Key logic:**
- `handleStripeWebhook`: Verifies Stripe signature → processes `checkout.session.completed` → creates Enrollment
- Raw body parsing required (mounted before `express.json()`)

---

### `verificationController.js`
**Handles:** Public certificate verification, verification logging

---

### `transcriptController.js`
**Handles:** Academic transcript generation per student (aggregates course grades)

---

### `aiAssistantController / ai.routes.js`
**Handles:** Multi-provider AI chat, course generation, grading, moderation

---

### `avatarSupportAgentController.js`
**Handles:** AI-powered avatar support chat with conversation context

---

### `identityController.js`
**Handles:** Public identity profiles, friend requests, search

---

### `legalController.js`
**Handles:** Document listing, consent recording, status check

---

### `teacherAvatarController.js`
**Handles:** Teacher avatar purchase and equip

---

### `ownStoreController.js` (13KB)
**Handles:** Full own-store virtual goods shop — catalog, purchase, equip, inventory management

---

### `studentController.js`
**STATUS: EMPTY FILE (0 bytes)** — This is a bug. Student-specific controller functions may be missing.

---

## Services (26 files)

### `authService.js`
- `issueTokens(user, res)` — generates JWT access + refresh token, sets httpOnly cookies, stores refresh token in DB
- `verifyAccessToken(token)` — decodes JWT
- `revokeRefreshToken(token)` — marks refresh token revoked

**JWT Config:**
- Access token: 15 minutes (JWT_EXPIRE env)
- Refresh token: 7 days (REFRESH_TOKEN_EXPIRE_DAYS env)
- Both stored as httpOnly cookies

---

### `ai.service.js`
**Purpose:** Unified AI provider abstraction.

**Providers:**
| Provider | Config | Model |
|----------|--------|-------|
| Gemini | GEMINI_API_KEY env | gemini-1.5-flash (default) |
| OpenAI | OPENAI_API_KEY env | gpt-3.5-turbo (configurable) |
| Ollama | OLLAMA_HOST env (default: localhost:11434) | llama2 (configurable) |

**Methods:**
- `chatCompletion({ messages, provider, model, temperature, max_tokens })`
- `generateCourseStructure(topic, intent)` — returns AI-generated JSON course outline
- `generateCourseSummaryAndQuiz(content)` — returns summary + quiz questions
- `moderateContent(text)` — simple keyword blocking + AI check
- `autoGrade({ studentAnswer, rubric })` — returns `{ score, feedback, strengths, improvements }`

---

### `legalConsentService.js`
- `seedLegalDocumentsIfEmpty()` — seeds Terms/Privacy on first startup
- `getMandatoryVersionIds()` — returns IDs of all mandatory document versions
- `recordAcceptances(userId, versionIds, metadata)` — records user consent
- `getUserConsentStatus(userId)` — checks if all mandatory docs accepted
- `requireLegalConsent` — Express middleware (used on protected routes)

---

### `identityService.js` (17KB)
- `ensureIdentityForUser(user)` — creates MR5 UID, CertificationProfile if not exists
- `verifyCertificate(id)` — checks Certificate model first, falls back to UserCertificate
- Friend management, notifications, search

---

### `powerAdminService.js`
- Teacher CRUD, classroom CRUD, approval workflow delegation

---

### `approvalWorkflowService.js`
- Manages ContentApproval lifecycle: draft → pending_review → approved → published

---

### `courseGenerationService.js`
- Orchestrates AI course generation + saves to DB as CourseGenerationJob

---

### `loginSecurityService.js`
- Records LoginAttempt
- Checks for brute force patterns

---

### `avatarService.js`
- Teacher avatar configuration helpers

---

### `supportService.js`
- Avatar support agent conversation management

---

## Middleware

### `src/middleware/auth.js`
**`verifyToken`** — Express middleware:
1. Reads `access_token` cookie (or `Authorization: Bearer` header fallback)
2. Verifies JWT signature
3. Attaches `req.user` (decoded payload with userId, role)
4. Returns 401 if missing/invalid, 403 if expired

**`requireRole(...roles)`** — RBAC middleware:
- Checks `req.user.role` is in allowed roles
- Returns 403 if unauthorized

### `src/middleware/dbMiddleware.js`
**`ensureDbConnected`** — Applied to all `/api/*` routes:
- Checks `mongoose.connection.readyState`
- If not connected, attempts `connectDB()`
- Returns 503 if still not connected after retry
- Prevents Mongoose "buffering timed out" errors in serverless environments

### `src/middleware/security.js`
- `securityHeaders` — Helmet with CSP
- `apiLimiter` — 100 req/15min in production, 10,000 in dev
- `authLimiter` — 10 req/15min in production, 10,000 in dev
- `sanitizeMongo` — strips `$` operators from request body/params/query
- `sanitizeInput(input)` — XSS sanitization helper

### `src/middleware/errorHandler.js`
- Global Express error handler (last middleware)
- Formats error responses: `{ success: false, error: message }`
- Logs errors to Winston logger
- In production: hides stack traces

### `src/middleware/legal.js`
- `requireLegalConsent` — checks if user has accepted all mandatory legal docs
- Returns 403 with redirect info if consent missing

---

## Authentication Flow (Detailed)

```
1. POST /api/auth/login
   -> authController.login
   -> User.findOne({ email }) (password select: false, must select it)
   -> bcrypt.compare(password, user.password)
   -> authService.issueTokens(user, res)
      -> JWT access token (15min, HS256)
      -> JWT refresh token (7 days)
      -> Store refresh token hash in RefreshToken collection
      -> Set httpOnly secure cookies: access_token, refresh_token

2. Subsequent API requests:
   -> middleware/auth.js: verifyToken reads cookie
   -> JWT.verify(token, JWT_SECRET)
   -> req.user = { userId, role, adminRole }

3. Token refresh:
   -> POST /api/auth/refresh
   -> Read refresh_token cookie
   -> Verify JWT + check RefreshToken collection (not revoked)
   -> Issue new access_token cookie

4. Google OAuth:
   -> GET /api/auth/google -> Passport redirects to Google
   -> User consents -> Google calls /api/auth/google/callback
   -> Passport strategy: find or create user
   -> authService.issueTokens(user, res)
   -> Redirect to CLIENT_URL/dashboard
```

---

## Authorization (RBAC)

**Route-level:** `verifyToken` + `requireRole('admin')` middleware chain

**Admin sub-roles** (Power Admin Hub):
```
super_admin > power_leader > content_admin > teacher_manager > course_creator > reviewer > analytics_viewer
```

Permission matrix in `src/config/adminRoles.js`

---

## Validation

- Zod schemas used in auth routes (registration, login)
- express-validator used in some admin routes
- `sanitizeMongo` strips NoSQL injection operators
- `sanitizeInput(xss)` strips XSS from string inputs

---

## Configuration Files

### `src/config/env.js`
- `validateEnv()` — checks all required env vars exist, throws on missing production vars
- `envConfig` — exported config object with all env vars

### `src/config/db.js`
- `connectDB()` — singleton connection with caching for serverless
- Auto-falls back to `mongodb-memory-server` in dev/test if MONGO_URI not set
- Seeds dev data on startup (users, courses, shop items, legal docs)
- `bufferCommands: false` — fast-fail instead of buffering

### `src/config/passport.js`
- Registers GoogleStrategy only if credentials are configured
- `isGoogleOAuthEnabled` exported boolean

### `src/config/cloudinary.js`
- Cloudinary SDK initialization

### `src/config/adminRoles.js`
- Role hierarchy and permission definitions

---

## Deployment Modes

**Local (non-Vercel):**
- `app.listen()` is called in `app.js`
- MongoDB connects on startup, server starts

**Vercel Serverless:**
- `app.js` exports `app` but does NOT call `listen()`
- `api/index.js` (or `vercel.json` routes) import `app` for serverless handler
- MongoDB connection is cached per serverless instance
- `ensureDbConnected` middleware ensures reconnection on cold start
