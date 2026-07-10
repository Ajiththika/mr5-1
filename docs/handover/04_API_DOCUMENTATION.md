# 04 — API Documentation

All routes are mounted in `Mr5-School-API-main/src/app.js`.
Base URL (local dev): `http://localhost:5001`
Base URL (production): `https://api.mr5school.com` (via ECS/EC2)
Frontend proxies all `/api/*` via Next.js rewrites to the backend.

Authentication uses **httpOnly cookies**: `access_token` and `refresh_token`.

---

## Authentication (`/api/auth`)

### POST /api/auth/register
Register a new user.
- **Auth:** None
- **Body:** `{ name, email, password }`
- **Response:** `{ user, tokens }` — sets httpOnly cookies
- **Errors:** 400 validation fail, 409 email exists

### POST /api/auth/login
Email + password login.
- **Auth:** None
- **Body:** `{ email, password }`
- **Response:** `{ user }` — sets access_token + refresh_token cookies
- **Errors:** 401 invalid credentials, 403 account not approved

### POST /api/auth/logout
Revoke refresh token, clear cookies.
- **Auth:** Cookie (access_token)
- **Response:** `{ message: "Logged out" }`

### POST /api/auth/refresh
Exchange refresh token for new access token.
- **Auth:** Cookie (refresh_token)
- **Response:** New access_token cookie set

### POST /api/auth/forgot-password
Send password reset email.
- **Auth:** None
- **Body:** `{ email }`
- **Response:** `{ message: "Email sent" }`

### PUT /api/auth/reset-password/:token
Reset password using token from email.
- **Auth:** None
- **Body:** `{ password }`
- **Response:** `{ message: "Password reset" }`

### GET /api/auth/me
Get current authenticated user.
- **Auth:** Cookie required
- **Response:** `{ user }` (without password)

### GET /api/auth/google
Initiates Google OAuth flow (redirects to Google consent screen).
- **Auth:** None
- **Note:** Only active if GOOGLE_CLIENT_ID + SECRET are configured

### GET /api/auth/google/callback
Google OAuth callback — issues JWT cookies and redirects to frontend.
- **Auth:** Google OAuth
- **Redirects:** `CLIENT_URL/dashboard` on success, `CLIENT_URL/login?error=oauth_failed` on failure

### GET /api/auth/providers
Returns which OAuth providers are enabled.
- **Auth:** None
- **Response:** `{ google: boolean }`

---

## Users (`/api/users`)

### GET /api/users/profile
Get current user profile.
- **Auth:** Required
- **Response:** `{ user }`

### PUT /api/users/profile
Update user profile fields.
- **Auth:** Required
- **Body:** `{ name, country, language, timezone, educationLevel, ... }`

### PUT /api/users/avatar
Update avatar URL or preset.
- **Auth:** Required
- **Body:** `{ avatarUrl, avatarPreset }`

### POST /api/users/welcome-message
Set user welcome message.
- **Auth:** Required
- **Body:** `{ welcomeMessage }` (max 80 chars)

---

## Courses (`/api/courses`)

### GET /api/courses
List all approved courses.
- **Auth:** None
- **Query:** `?page=1&limit=10&category=&level=&search=`

### GET /api/courses/:id
Get course detail.
- **Auth:** None

### POST /api/courses
Create course.
- **Auth:** Admin required
- **Body:** `{ title, description, category, level, language, price, thumbnail }`

### PUT /api/courses/:id
Update course.
- **Auth:** Admin required

### DELETE /api/courses/:id
Delete course.
- **Auth:** Admin required

---

## Course Discovery (`/api/courses/discovery`)

### GET /api/courses/discovery
Public course search with filters.
- **Auth:** None
- **Query:** `?q=search&category=&level=&page=&limit=`
- **Response:** `{ courses, total, page, pages }`

---

## Lessons (`/api/lessons`)

### GET /api/lessons/:courseId
List lessons for a course.
- **Auth:** Enrolled student or admin

### GET /api/lessons/:courseId/:lessonId
Get specific lesson.
- **Auth:** Enrolled student or admin

### POST /api/lessons/:courseId
Create lesson.
- **Auth:** Admin

### PUT /api/lessons/:courseId/:lessonId
Update lesson.
- **Auth:** Admin

---

## Enrollments (`/api/enrollments`)

### POST /api/enrollments
Enroll in a course.
- **Auth:** Required
- **Body:** `{ courseId }`
- **Note:** Free courses enroll directly; paid courses require Stripe payment first

### GET /api/enrollments/my
Get current user's enrollments.
- **Auth:** Required

### PUT /api/enrollments/:id/progress
Update enrollment progress.
- **Auth:** Required
- **Body:** `{ progress: 0-100 }`

---

## Student Learning (`/api/students/me`)

### GET /api/students/me/dashboard
Student dashboard data (enrollments, progress, stats).
- **Auth:** Required (student)

### GET /api/students/me/stats
Learning statistics (XP, level, streak).
- **Auth:** Required

---

## Payments (`/api/payments`)

### POST /api/payments/checkout
Create Stripe checkout session.
- **Auth:** Required
- **Body:** `{ courseId }`
- **Response:** `{ sessionUrl }` — redirect to Stripe

### POST /api/payments/webhook
Stripe webhook handler. Raw body required.
- **Auth:** Stripe signature header
- **Note:** Mounted BEFORE express.json() middleware

### GET /api/payments/history
User's payment history.
- **Auth:** Required

---

## Certifications (`/api/certificates`)

### POST /api/certificates/generate
Generate a new certificate for a student.
- **Auth:** Admin / Instructor
- **Body:** `{ studentId, courseId, finalScore, grade, completionDate }`
- **Response:** `{ certificate }` with certificateId and verificationHash

### GET /api/certificates/my
Get current user's certificates.
- **Auth:** Required

### GET /api/certificates/:id
Get certificate by ID.
- **Auth:** Required

### GET /api/certificates/:id/pdf
Download certificate as PDF.
- **Auth:** Required

### POST /api/certificates/:id/approve/instructor
Instructor approves certificate.
- **Auth:** Instructor or admin

### POST /api/certificates/:id/approve/admin
Admin approves certificate (moves to issued).
- **Auth:** Admin

### POST /api/certificates/:id/reject
Reject certificate with reason.
- **Auth:** Instructor or admin
- **Body:** `{ reason }`

### POST /api/certificates/:id/revoke
Revoke an issued certificate.
- **Auth:** Admin

---

## Verification (`/api/verify`)

### GET /api/verify/:certificateId
Public certificate verification.
- **Auth:** None (public)
- **Response:** `{ valid, certificate }` or `{ valid: false, reason }`
- **Note:** Increments verificationCount

### POST /api/verify/hash
Verify by verification hash.
- **Auth:** None
- **Body:** `{ verificationHash }`

---

## AI Routes (`/api/ai`)

### POST /api/ai/chat
Chat with AI tutor.
- **Auth:** Required
- **Body:** `{ messages: [{ role, content }], provider?, model? }`
- **Response:** `{ choices: [{ message }] }`

### POST /api/ai/generate-course
Generate course structure from topic.
- **Auth:** Admin
- **Body:** `{ topic, intent? }`
- **Response:** `{ title, modules, lessons }` (JSON structure)

### POST /api/ai/grade
Auto-grade student submission.
- **Auth:** Instructor or admin
- **Body:** `{ studentAnswer, rubric }`
- **Response:** `{ score, feedback, strengths, improvements }`

### POST /api/ai/moderate
Content moderation check.
- **Auth:** Admin
- **Body:** `{ text }`

### GET /api/ai/assistant
Get AI assistant for student.
- **Auth:** Required

---

## Avatar & TTS (`/api/avatar`, `/api/tts`)

### POST /api/avatar/generate
Generate avatar configuration.
- **Auth:** Required

### GET /api/avatar/teachers
List available teacher avatars.
- **Auth:** Required

### POST /api/tts/synthesize
Text-to-speech synthesis via Azure.
- **Auth:** Required
- **Body:** `{ text, voice?, speed? }`
- **Response:** Audio buffer

### GET /api/livekit/token
Get LiveKit room token for classroom.
- **Auth:** Required
- **Query:** `?room=&identity=`

---

## Admin (`/api/admin`)

### GET /api/admin/users
List all users (paginated).
- **Auth:** Admin

### PUT /api/admin/users/:id/status
Approve or reject user.
- **Auth:** Admin
- **Body:** `{ status: approved | rejected }`

### GET /api/admin/courses
List all courses including unapproved.
- **Auth:** Admin

### POST /api/admin/courses/:id/approve
Approve a course.
- **Auth:** Admin

---

## Power Admin Hub (`/api/power-admin`)

### GET /api/power-admin/overview
Dashboard KPIs: user counts, course counts, revenue, recent activity.
- **Auth:** Admin (any adminRole)

### GET /api/power-admin/activity
Recent admin activity log.
- **Auth:** Admin

### GET /api/power-admin/teachers
List teacher profiles (paginated).
- **Auth:** Admin (teacher_manager+)

### GET /api/power-admin/teachers/:id
Teacher detail.
- **Auth:** Admin

### POST /api/power-admin/teachers
Create teacher profile.
- **Auth:** Admin (teacher_manager+)

### PUT /api/power-admin/teachers/:id
Update teacher.
- **Auth:** Admin

### POST /api/power-admin/teachers/:id/clone
Clone a teacher profile.
- **Auth:** Admin

### PATCH /api/power-admin/teachers/:id/archive
Archive teacher.
- **Auth:** Admin

### GET /api/power-admin/classrooms
List classrooms.
- **Auth:** Admin

### POST /api/power-admin/classrooms
Create classroom.
- **Auth:** Admin

### PUT /api/power-admin/classrooms/:id
Update classroom.
- **Auth:** Admin

### GET /api/power-admin/approvals
Content approval queue.
- **Auth:** Admin (reviewer+)

### POST /api/power-admin/approvals/:id/approve
Approve content.
- **Auth:** Admin (reviewer+)

### POST /api/power-admin/approvals/:id/reject
Reject content with reason.
- **Auth:** Admin

### GET /api/power-admin/analytics
Analytics data for dashboard charts.
- **Auth:** Admin (analytics_viewer+)

### GET /api/power-admin/roles
Role definitions + user assignments.
- **Auth:** Super admin

### PATCH /api/power-admin/roles/:userId
Assign hub role to user.
- **Auth:** Super admin
- **Body:** `{ adminRole }`

### POST /api/power-admin/ai/lesson-assist
AI-assisted lesson generation.
- **Auth:** Admin (course_creator+)
- **Body:** `{ topic, courseContext }`

---

## Legal (`/api/legal`)

### GET /api/legal/documents
List mandatory legal documents with current versions.
- **Auth:** None

### GET /api/legal/status
Check if current user has accepted all mandatory documents.
- **Auth:** Required

### POST /api/legal/accept
Record user acceptance of document versions.
- **Auth:** Required
- **Body:** `{ versionIds: [string] }`

---

## Identity (`/api/identity`)

### GET /api/identity/profile
Get identity profile (public data, badges, stats).
- **Auth:** Required

### GET /api/identity/search
Search users by name or MR5 UID.
- **Auth:** Required
- **Query:** `?q=`

### POST /api/identity/friend-request
Send friend request.
- **Auth:** Required
- **Body:** `{ recipientId }`

### PUT /api/identity/friend-request/:id
Accept or decline friend request.
- **Auth:** Required
- **Body:** `{ action: accept | decline }`

---

## Shop (`/api/shop`)

### GET /api/shop
List all shop items.
- **Auth:** Required

### POST /api/shop/purchase
Purchase a shop item.
- **Auth:** Required
- **Body:** `{ itemId }`

### POST /api/shop/equip
Equip a purchased item.
- **Auth:** Required
- **Body:** `{ itemId, slot }`

---

## Transcripts (`/api/transcripts`)

### GET /api/transcripts/my
Get student transcript.
- **Auth:** Required

### GET /api/transcripts/:studentId
Get transcript for specific student.
- **Auth:** Admin or own student

---

## Upload (`/api/upload`)

### POST /api/upload/image
Upload image to Cloudinary.
- **Auth:** Required
- **Body:** multipart/form-data with `file` field
- **Response:** `{ url, publicId }`

### POST /api/upload/pdf
Upload PDF document.
- **Auth:** Admin

---

## Health Endpoints

### GET /health
Application health check (no auth).
- **Response:** `{ status: "OK", database: "connected"|"disconnected", timestamp }`

### GET /ready
Readiness check (no auth).
- **Response:** `{ status: "READY"|"NOT_READY" }` — 503 if DB not connected

---

## Missing / Incomplete APIs

| API | Status | Notes |
|-----|--------|-------|
| PUT /api/users/password | Not found in routes | Password change for authenticated user |
| GET /api/certificates/verify-batch | Missing | Bulk verification for employers |
| POST /api/ai/voice-qa | Incomplete | Voice Q&A pipeline not finalized |
| GET /api/notifications | Partially wired | IdentityNotification model exists, route not fully built |
| DELETE /api/users/account | Missing | Account deletion (GDPR right to erasure) |
| GET /api/courses/:id/analytics | Missing | Per-course analytics for instructors |
