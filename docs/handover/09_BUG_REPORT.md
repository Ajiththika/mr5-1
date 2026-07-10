# 09 — Bug Report

All known bugs identified from codebase analysis.

---

## CRITICAL

### BUG-001: Playwright Browser Binaries Missing
- **Status:** Open
- **Severity:** Critical (blocks all E2E testing)
- **Root Cause:** Playwright requires browser binaries to be installed separately from npm packages. The `postinstall` script uses `|| true` to silently fail in some environments.
- **Error:** `Error: Executable doesn't exist at /Users/.../chrome-linux/chrome`
- **Files Involved:** `client-main/playwright.config.ts`, `client-main/package.json`
- **Suggested Fix:** Run `cd client-main && npx playwright install chromium` before running tests
- **Production Fix:** Add to CI/CD pipeline: `npx playwright install --with-deps chromium`

---

### BUG-002: Empty studentController.js
- **Status:** Open
- **Severity:** Critical (server crash risk)
- **Root Cause:** `src/controllers/studentController.js` is 0 bytes. Any route file that imports from this will throw a module resolution error.
- **Files Involved:** `Mr5-School-API-main/src/controllers/studentController.js`
- **Suggested Fix:** Check which routes import from studentController. If none currently import it, add a placeholder export. If routes do import it, implement the missing functions (likely moved to `studentLearningController.js`).
- **Investigation needed:** Run `grep -r "studentController" Mr5-School-API-main/src/routes/` to find callers.

---

## HIGH

### BUG-003: next.config.mjs Fallback Port Mismatch
- **Status:** Open
- **Severity:** High (API calls fail locally without NEXT_PUBLIC_API_URL)
- **Root Cause:** The Next.js rewrite rule falls back to port 5000, but the backend server starts on port 5001 (per `.env.example` PORT=5001).
- **File:** `client-main/next.config.mjs` line 104
- **Current:** `'http://127.0.0.1:5000/api/:path*'`
- **Fix:** Change to `'http://127.0.0.1:5001/api/:path*'`
- **Impact:** Developers without `NEXT_PUBLIC_API_URL` set will get connection refused errors.

---

### BUG-004: Passport deserializeUser Deprecated API
- **Status:** Open
- **Severity:** High (session-based auth may produce runtime warnings/errors in newer Mongoose)
- **Root Cause:** `User.findById(id, callback)` is the deprecated Mongoose callback API. Mongoose 8 removed callback support for most methods.
- **File:** `Mr5-School-API-main/src/config/passport.js` lines 68-70
- **Current Code:**
```javascript
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});
```
- **Fix:**
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

---

### BUG-005: Google OAuth Callback URL Must Match Google Console Exactly
- **Status:** Configuration-dependent
- **Severity:** High (OAuth will fail if mismatch)
- **Root Cause:** The `GOOGLE_CALLBACK_URL` in `.env` must exactly match the "Authorized redirect URIs" configured in the Google Cloud Console OAuth credentials.
- **File:** `Mr5-School-API-main/src/config/passport.js` line 16
- **Common Issue:** Developers often configure `http://localhost:5000/api/auth/google/callback` in Google Console but set `GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback` in .env (port mismatch).
- **Production Fix:** Set `GOOGLE_CALLBACK_URL=https://api.mr5school.com/api/auth/google/callback` and add this URL to Google Console.

---

### BUG-006: In-Memory MongoDB Data Loss on Restart
- **Status:** By design in dev, but confusing
- **Severity:** High (developer experience)
- **Root Cause:** In development without `MONGO_URI`, the system auto-creates a `mongodb-memory-server` instance. This instance resets every time the server restarts — all login sessions, courses created, etc. are lost.
- **Files:** `Mr5-School-API-main/src/config/db.js`
- **Suggested Fix for Developers:** Set `MONGO_URI=mongodb://127.0.0.1:27017/mr5school` in `.env` to use a persistent local MongoDB (requires local MongoDB installation).
- **Note:** This is documented but commonly misunderstood.

---

## MEDIUM

### BUG-007: weatherController.js Exists But Route Not Mounted
- **Status:** Open
- **Severity:** Medium (dead code, wasted resources)
- **Root Cause:** `weatherController.js` and `weatherService.js` exist and are implemented, but no route file imports them, and they are not mounted in `app.js`.
- **Files:** `src/controllers/weatherController.js`, `src/services/weatherService.js`
- **Fix Option A:** Mount the route if weather features are needed
- **Fix Option B:** Delete the files if weather features are not planned
- **Required Env:** `WEATHER_API_KEY` (OpenWeatherMap)

---

### BUG-008: No Email Verification on Registration
- **Status:** Open
- **Severity:** Medium (security gap)
- **Root Cause:** Users register and are immediately set to `status: approved` with no email confirmation step. Anyone can register with a fake/random email.
- **Files:** `Mr5-School-API-main/src/controllers/authController.js`
- **Fix:** Add email verification token flow:
  1. Set new users to `status: pending_verification`
  2. Send verification email with signed JWT token link
  3. `GET /api/auth/verify-email/:token` → set status to approved

---

### BUG-009: getApiBaseUrl() Returns localhost:5001 but Backend Port May Differ
- **Status:** Open
- **Severity:** Medium
- **Root Cause:** `lib/api-base.ts` hardcodes port 5001 as fallback, but `.env.example` says `PORT=5000`.
- **File:** `client-main/lib/api-base.ts` line 23
- **Fix:** Change hardcoded 5001 to read from `NEXT_PUBLIC_API_URL` or standardize the port to 5001 across both configs.

---

### BUG-010: CSP Header Blocks Some External Connections
- **Status:** Open
- **Severity:** Medium
- **Root Cause:** The Content Security Policy in `src/middleware/security.js` only allows specific `connectSrc` domains. Any new external API added (analytics, etc.) will be silently blocked by CSP.
- **File:** `Mr5-School-API-main/src/middleware/security.js` line 17
- **Fix:** Update `connectSrc` array when adding new external services.

---

### BUG-011: Classroom XP Not Persisted to Database
- **Status:** Open (known limitation)
- **Severity:** Medium
- **Root Cause:** XP, level, streak in classroom are stored in Zustand (client memory) only. No API call saves them to `UserLearningStats`.
- **Files:** `client-main/features/classroom/store/classroom.store.tsx`
- **Fix:** Add `saveXpToServer()` action that calls `/api/students/me/xp` on lesson completion.

---

### BUG-012: Missing CORS for Azure Speech SDK WebSocket
- **Status:** Open
- **Severity:** Medium
- **Root Cause:** Azure Speech SDK uses WebSocket connections that may be blocked by CSP or CORS policies.
- **Fix:** Ensure CSP `connectSrc` and `mediaSrc` directives allow Azure Speech endpoints.

---

## LOW

### BUG-013: TypeScript `any` Types in Service Files
- **Status:** Open
- **Severity:** Low (code quality)
- **Root Cause:** Multiple service files use `any` types instead of proper TypeScript interfaces.
- **Impact:** Potential runtime type errors that TypeScript cannot catch.
- **Fix:** Define proper interfaces in `types/` directory and apply throughout services.

---

### BUG-014: Console.log Statements in Production Code
- **Status:** Open
- **Severity:** Low
- **Root Cause:** Several controllers and services have `console.log` statements that should use the Winston logger instead.
- **Files:** Multiple files in `src/controllers/` and `src/services/`
- **Fix:** Replace `console.log` with `logger.info/debug` from `src/config/logger.js`

---

### BUG-015: Missing Error Boundary for 3D Components
- **Status:** Open
- **Severity:** Low (user experience)
- **Root Cause:** React Three Fiber components can fail (WebGL context lost, GLB load error) and crash the page without a proper error boundary.
- **Files:** `components/3d/` components
- **Fix:** Wrap 3D scenes in React Error Boundary with fallback 2D content.

---

### BUG-016: Stripe Webhook Endpoint Not Validated for Production URL
- **Status:** Configuration-dependent
- **Severity:** Low (but breaks payments in production)
- **Root Cause:** The Stripe webhook endpoint must be registered in the Stripe Dashboard for the production domain. Development uses Stripe CLI forwarding.
- **Fix:** Register `https://api.mr5school.com/api/payments/webhook` in Stripe Dashboard → Webhooks.

---

### BUG-017: Course Thumbnail Images Use Local Paths in Dev Seed
- **Status:** Open
- **Severity:** Low
- **Root Cause:** Dev seed data uses `/assets/dashboard/course-icon-1.png` as thumbnail — this path may not exist in production or may give 404.
- **File:** `Mr5-School-API-main/src/config/db.js` line 120
- **Fix:** Use Cloudinary URLs for all seeded thumbnails, or ensure the asset exists at the public path.
