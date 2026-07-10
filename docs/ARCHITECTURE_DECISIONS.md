# Architecture Decisions

## Overall Architecture Decisions

### Decoupled Frontend & Backend Monorepo
* **Decision:** Monorepo architecture splitting the Next.js 15 frontend (`client-main/`) and the Express 4 backend (`Mr5-School-API-main/`). The frontend must not query the database directly.
* **Why:** Decoupled architecture simplifies deployment (Vercel vs. AWS ECS containerization), makes backend routing reusable for potential mobile or third-party client apps, and establishes clear separation of concerns.
* **Current implementation:** Next.js proxies `/api/*` endpoint routes to Express backend. Express handles all DB communication.
* **Related files:** [next.config.mjs](file:///Users/mr.ushantha/Downloads/Mr5/client-main/next.config.mjs), [app.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/app.js)
* **Future AI warning:** Do not add direct Mongoose or database connections inside Next.js server components or Next.js API routes. All transactions must run through Express backend controllers.

---

## Frontend Decisions

### Next.js App Router & Edge Middleware
* **Decision:** App Router (`client-main/app/`) structure with Edge middleware handling legal consent verification.
* **Why:** Next.js App Router provides built-in routing optimizations and layout nesting. Edge middleware allows instantaneous validation of cookies (such as GDPR consent verification) before page render.
* **Current implementation:** App Router directories define routes. Edge middleware validates token presence and consent checks before serving protected dashboard resources.
* **Related files:** [middleware.ts](file:///Users/mr.ushantha/Downloads/Mr5/client-main/middleware.ts), [package.json](file:///Users/mr.ushantha/Downloads/Mr5/client-main/package.json)
* **Future AI warning:** Ensure all heavy libraries (such as LiveKit, Recharts, or Speech SDKs) are dynamically/lazy loaded to prevent blocking the Next.js main execution thread.

---

## Backend Decisions

### Express with ES Modules (ESM)
* **Decision:** Node.js 20 backend runtime written in modern ES Modules format rather than CommonJS.
* **Why:** Unified JS language features, clean syntax (`import/export`), and alignment with contemporary package standards.
* **Current implementation:** Application controllers, routes, and services use standard ESM syntax.
* **Related files:** [app.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/app.js), [package.json](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/package.json)
* **Future AI warning:** Do not use `require` or `module.exports` when creating new files. Keep the DB connectivity check middleware (`ensureDbConnected`) at the top of the middleware stack.

---

## Database Decisions

### MongoDB Mongoose ODM with In-Memory Dev Fallback
* **Decision:** MongoDB Atlas database accessed using Mongoose 8. Falls back to an in-memory database (`mongodb-memory-server`) locally if `MONGO_URI` is omitted.
* **Why:** Scalable document modeling ideal for courses and lesson nodes, combined with low developer friction during onboarding.
* **Current implementation:** connection check in `db.js` handles Atlas URI routing or installs/spins up an in-memory instance.
* **Related files:** [db.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/config/db.js), [models/](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/models/)
* **Future AI warning:** Dev data in the in-memory database resets on every server restart. Use a persistent local connection string for long-term dev workflows.

---

## Authentication Decisions

### httpOnly Cookie-Based JWT & Google OAuth 2.0
* **Decision:** Token validation utilizing JWT access and refresh tokens stored strictly within httpOnly cookies. Google OAuth configured via Passport.js on the backend.
* **Why:** Prevents token theft through Client-Side Cross-Site Scripting (XSS) by blocking browser JS access to cookies.
* **Current implementation:** JWT generation and cookies setup in `authController.js`; Passport.js setup handles OAuth strategies.
* **Related files:** [authController.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/controllers/authController.js), [passport.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/config/passport.js)
* **Future AI warning:** Do not save or read JWT tokens using localStorage. If Mongoose issues deprecation warnings, replace the callback interface in `passport.deserializeUser` with promise/async handlers.

---

## API Design Decisions

### Standard REST Routes & Next.js Rewrite Proxies
* **Decision:** Strict RESTful JSON endpoints. Frontend routing proxying handles local port rewrites dynamically.
* **Why:** Simple structure standardizing client-server data flows while concealing direct backend port routes from browser networks.
* **Current implementation:** Backend controllers structure endpoint responses. Next.js rewrite rules route local requests from `localhost:3000/api/*` to backend port `5001`.
* **Related files:** [routes/](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/routes/), [next.config.mjs](file:///Users/mr.ushantha/Downloads/Mr5/client-main/next.config.mjs)
* **Future AI warning:** Always ensure the proxy rewrite URL ports inside `next.config.mjs` match the active port in the backend's environment variables (default 5001).

---

## AI System Decisions

### Multi-Provider Interface Layer
* **Decision:** Single class `aiService` wrapper routing queries dynamically based on `AI_PROVIDER` configuration.
* **Why:** Flexibility to swap providers (Gemini, OpenAI) or test locally via Ollama without changing service consumers.
* **Current implementation:** AI service proxies core prompts in `src/prompts/` to selected client wrappers.
* **Related files:** [ai.service.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/services/ai.service.js), [prompts/](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/prompts/)
* **Future AI warning:** Never store or expose AI API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) within Next.js components that bundle to the client browser. Use API routes as server-side boundaries.

---

## 3D/Avatar Decisions

### R3F Adaptive Canvas Rendering
* **Decision:** 3D environments rendered in Next.js using React Three Fiber. Incorporates Low/Medium/High runtime performance tiers.
* **Why:** Supports interactive elements (avatars, items) without introducing heavy compile steps. Adaptive performance profiles prevent WebGL canvas crashes on low-spec mobile hardware.
* **Current implementation:** Three.js environments dynamically toggle shadow mapping and model loads based on client hardware specs.
* **Related files:** [components/3d/](file:///Users/mr.ushantha/Downloads/Mr5/client-main/components/3d/)
* **Future AI warning:** Large GLB models must be compressed using Draco compression (e.g., Ganesha model compressed below 8MB) to protect page load speeds.

---

## Deployment Decisions

### Standalone Edge / Container Hosting
* **Decision:** Next.js deployed via Vercel Edge, backend Express deployed containerized via AWS ECS Fargate.
* **Why:** Serverless hosting is optimal for frontend delivery speed, whereas persistent WebSockets and voice connections (LiveKit/Azure TTS/Stripe webhooks) require persistent Express nodes.
* **Current implementation:** Standalone build output enabled on frontend. Backend contains AWS-ready Dockerfile and task parameters.
* **Related files:** [next.config.mjs](file:///Users/mr.ushantha/Downloads/Mr5/client-main/next.config.mjs), [Dockerfile](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/Dockerfile)
* **Future AI warning:** Register Stripe webhooks in the dashboard to direct events directly to the production domain endpoint on AWS ECS.

---

## Security Decisions

### Global Security Middleware Stack
* **Decision:** Backend protected via Helmet security headers, Mongo injection sanitizers, and request rate-limiters.
* **Why:** Mitigates risk of NoSQL injection, cross-site scripting (XSS), request-spamming, and cross-site framing.
* **Current implementation:** Helmet, sanitizers, and rate-limiting modules mounted as global Express middlewares.
* **Related files:** [security.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/middleware/security.js), [app.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/app.js)
* **Future AI warning:** Adding third-party libraries that call external endpoints (e.g., speech or analytics) requires adding their host domain names to the Helmet Content Security Policy (CSP) configuration.

---

## Performance Decisions

### Next.js Standalone Build & Static Assets CDN
* **Decision:** Standalone Next.js configuration, caching headers on static assets, and dynamic imports.
* **Why:** Standalone Next.js outputs only necessary runtime dependencies, decreasing dockerized payload size. Asset caching prevents redundant downloads.
* **Current implementation:** Next.js build config maps standalone folders. Assets utilize Cache-Control guidelines.
* **Related files:** [next.config.mjs](file:///Users/mr.ushantha/Downloads/Mr5/client-main/next.config.mjs)
* **Future AI warning:** Always ensure Playwright browser dependencies are installed in your pipeline using `npx playwright install chromium` before firing tests.
