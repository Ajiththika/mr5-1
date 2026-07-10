# Environment Setup

## 1. Required Software
* **Node.js:** Version 20.x (LTS recommended)
* **npm:** Version 10.x or higher
* **Git:** Version 2.x or higher
* **Docker & Docker Compose:** (Optional, for containerized running)
* **MongoDB:** (Optional, local installation for persistent local database storage)

---

## 2. Dependencies Setup

### Frontend (`client-main/`)
* **Core:** Next.js 15, React 19, TypeScript
* **Styling:** Tailwind CSS 3, shadcn/ui, Radix UI primitives
* **3D:** React Three Fiber (R3F), Three.js, `@react-three/drei`
* **Integrations:** Stripe SDK, LiveKit client, Cloudinary SDK
* **Testing:** Playwright (e2e), Jest + Testing Library (unit)

### Backend (`Mr5-School-API-main/`)
* **Core:** Express 4, Node ES Modules (ESM)
* **Database:** MongoDB, Mongoose 8, mongodb-memory-server
* **AI/Integrations:** `@google/generative-ai` (Gemini), `openai`, `ollama` client, Azure Speech SDK, Stripe, Cloudinary
* **Utilities:** `pdfkit` (PDF generation), `qrcode` (QR code generation), Nodemailer (emails)
* **Security:** Helmet, express-rate-limit, express-mongo-sanitize, xss, bcryptjs

---

## 3. Installation Commands

Navigate to the monorepo root and install dependencies for both applications:

```bash
# Install frontend dependencies
cd client-main
npm install

# Install backend dependencies
cd ../Mr5-School-API-main
npm install
```

---

## 4. Environment Variables Setup

Create local environment files by copying the templates provided:

```bash
# In client-main/
cp .env.example .env

# In Mr5-School-API-main/
cp .env.example .env
```

### Verified Environment Variables

#### Backend (`Mr5-School-API-main/.env`)
* **Core Configuration:**
  * `NODE_ENV` (e.g., `development`, `production`)
  * `PORT` (Default: `5001` or `5000` for development consistency)
  * `LOG_LEVEL` (e.g., `info`, `debug`)
  * `MONGO_URI` (MongoDB connection string; leave empty in dev for auto-fallback to in-memory server)
* **Auth Settings:**
  * `JWT_SECRET` (minimum 32 characters in production)
  * `JWT_EXPIRE` (e.g., `15m`)
  * `REFRESH_TOKEN_EXPIRE_DAYS` (e.g., `7`)
* **Routing Boundaries:**
  * `CORS_ORIGIN` (Frontend origin URL, e.g., `http://localhost:3000`)
  * `CLIENT_URL` (Frontend URL for OAuth redirects, e.g., `http://localhost:3000`)
* **AI Configurations:**
  * `AI_PROVIDER` (Default: `gemini`; accepts `gemini`, `openai`, `ollama`)
  * `GEMINI_API_KEY` (Required for Google Gemini integration)
  * `OPENAI_API_KEY` (Required if provider set to `openai`)
  * `OLLAMA_HOST` (Default: `http://127.0.0.1:11434`)
  * `OLLAMA_MODEL` (Default: `llama2`)
* **Third-Party Integrations:**
  * `STRIPE_SECRET_KEY`
  * `STRIPE_WEBHOOK_SECRET`
  * `GOOGLE_CLIENT_ID`
  * `GOOGLE_CLIENT_SECRET`
  * `GOOGLE_CALLBACK_URL` (e.g., `http://localhost:5001/api/auth/google/callback`)
  * `CLOUDINARY_CLOUD_NAME`
  * `CLOUDINARY_API_KEY`
  * `CLOUDINARY_API_SECRET`
  * `AZURE_SPEECH_KEY`
  * `AZURE_SPEECH_REGION`
  * `LIVEKIT_API_KEY`
  * `LIVEKIT_API_SECRET`

#### Frontend (`client-main/.env`)
* **Client-Safe Variables (Prefix: `NEXT_PUBLIC_`):**
  * `NEXT_PUBLIC_SITE_URL` (e.g., `http://localhost:3000`)
  * `NEXT_PUBLIC_API_URL` (Proxy boundary URL, e.g., `http://localhost:3000` or direct API `http://localhost:5001`)
  * `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` (Boolean, triggers Google buttons UI)
  * `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  * `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (Unsigned Cloudinary upload preset)
  * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  * `NEXT_PUBLIC_LIVEKIT_URL`
* **Server-Only Routes Configuration:**
  * `GEMINI_API_KEY` (Next.js server-side route backup key)
  * `OPENAI_API_KEY`
  * `WEATHER_API_KEY`

---

## 5. Development Commands

Run local servers concurrently for testing:

```bash
# Start backend in development watch mode (runs on port 5001/5000)
cd Mr5-School-API-main
npm run dev

# Start frontend in Next.js development mode (runs on port 3000)
cd client-main
npm run dev
```

---

## 6. Build Commands

Compile frontend components for production deployment:

```bash
cd client-main
npm run build
```

---

## 7. Testing Commands

Run unit and integration test suites:

```bash
# Backend unit & integration tests (Jest)
cd Mr5-School-API-main
npm test

# Frontend unit tests (Jest)
cd client-main
npm test

# Frontend E2E tests (Playwright)
npm run test:e2e
```

---

## 8. Deployment Preparation
* **Frontend:** Standard Next.js hosting via Vercel. Standard config exists in `vercel.json`.
* **Backend:** Deploy via AWS ECS (Fargate) with the provided [Dockerfile](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/Dockerfile) or run via PM2 on an EC2 instance:
  ```bash
  # Run backend via PM2
  cd Mr5-School-API-main
  npm run prod
  ```
* **Production Variables:** Set `NODE_ENV=production` and manage keys securely using AWS Secrets Manager. Follow instructions in [AWS_SECRETS_MIGRATION.md](file:///Users/mr.ushantha/Downloads/Mr5/docs/AWS_SECRETS_MIGRATION.md).

---

## 9. Common Setup Problems

### Blocker: Playwright Tests Failing
* **Problem:** Playwright runs fail locally with "browser executable missing".
* **Solution:** Install browser binaries by running:
  ```bash
  cd client-main
  npx playwright install chromium
  ```

### macOS Port Conflict (Port 5000)
* **Problem:** Backend server fails to start on port `5000` because it's already in use.
* **Reason:** macOS AirPlay Receiver listens on port 5000 by default.
* **Solution:** Disable AirPlay Receiver in System Settings -> General -> Sharing, or run the backend on port `5001`. Ensure `next.config.mjs` rewrite target matches.

### DB Resetting on Server Restart
* **Problem:** Created courses, users, and progress records vanish whenever the backend restarts.
* **Reason:** No `MONGO_URI` is provided, triggering auto-fallback to an ephemeral in-memory database server.
* **Solution:** Install MongoDB locally or create a MongoDB Atlas cluster, and assign the connection string to `MONGO_URI` in `Mr5-School-API-main/.env`.

### CORS Failures
* **Problem:** Browser console reports blocked API access due to CORS.
* **Solution:** Ensure `CORS_ORIGIN` in backend `.env` matches the port and host of the frontend (typically `http://localhost:3000` for local dev).
