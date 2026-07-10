# 11 — Performance Audit

---

## Frontend Performance

### Next.js Configuration
- **Standalone output** in production (`output: 'standalone'`) — optimized Docker image
- **Compress: true** — gzip compression enabled
- **generateEtags: true** — browser caching for static assets
- **optimizeCss: true** — experimental CSS optimization (Critters)
- **Image formats:** AVIF + WebP via `next/image`
- **reactStrictMode: true** — helps catch performance issues in dev

### Images
- Remote patterns configured for Cloudinary, Unsplash, Pexels
- AVIF + WebP format conversion via Next.js Image
- **Missing:** `priority` prop on above-the-fold images (LCP risk)
- **Missing:** Explicit `width` and `height` on all images (CLS risk)

### 3D Assets (Most Critical Performance Issue)
| Asset | Size | Status |
|-------|------|--------|
| `indigo-ganesha.glb` | 26MB | CRITICAL — must compress to <8MB |
| `classroom.glb` | Unknown | Need to verify |

**3D Performance Mitigation in place:**
- `get3DPerformanceProfile()` — adaptive quality tiers
- Low tier: Ganesha disabled, no shadows, DPR 1.0
- Medium tier: Ganesha enabled, DPR 1.0-1.25, 30 FPS target
- High tier: Full quality
- Ganesha dynamically imported (lazy-loaded)
- Material tuning: anisotropy capped at 4

**Missing 3D optimizations:**
- Draco compression on GLB files (target <8MB for Ganesha)
- KTX2 texture compression
- LOD (Level of Detail) variants for distant view
- Progressive loading of 3D scenes

### JavaScript Bundle
- R3F/Three.js excluded from server bundle via `serverExternalPackages`
- Recharts — installed but verify tree-shaking is working
- `@mediapipe/*` packages (camera, face_mesh) are heavy — verify lazy loading
- `microsoft-cognitiveservices-speech-sdk` — large SDK, verify it's only loaded when TTS is active
- `livekit-client` — heavy, should be lazy loaded per classroom session

### Fonts
- Google Fonts used — loaded at build time via Next.js font optimization
- Ensure `font-display: swap` is configured

### Animations
- Framer Motion — used throughout. Verify heavy animations are disabled on `prefers-reduced-motion`
- CSS animations via `tailwindcss-animate` and `tw-animate-css`

### CSS
- Tailwind CSS — PurgeCSS eliminates unused classes in production build
- Global CSS at `app/globals.css` (9.7KB) — acceptable

---

## Backend Performance

### Express Server
- **Body limit:** 10MB — appropriate for file uploads
- **trust proxy: 1** — correct for behind ALB/Cloudflare

### Rate Limiting
- API: 100 req/15min per IP in production
- Auth: 10 req/15min per IP in production
- Identity search: 60 req/min
- **Concern:** Very low rate limits may impact legitimate high-traffic scenarios (need monitoring)

### Middleware Stack Performance
All middleware applied per request:
1. CORS (fast)
2. Helmet (fast)
3. Mongo sanitize (fast)
4. Passport initialize (fast)
5. Rate limiter (Redis-backed in production? Currently in-memory — does not share state across multiple instances)
6. JSON body parser (fast for small requests)
7. `ensureDbConnected` (DB state check — fast after initial connection)

**WARNING:** The in-memory rate limiter does not share state across multiple ECS task instances. For multi-instance production deployment, a Redis-backed rate limiter is needed (e.g., `rate-limit-redis`).

---

## Database Performance

### MongoDB Atlas Configuration
**Recommended tier:** M10+ for production (2 vCPUs, 2GB RAM)

### Connection Pooling
```javascript
maxPoolSize: 10,
minPoolSize: 1,
maxIdleTimeMS: 10000,
```
This is appropriate for serverless. For persistent ECS, consider increasing `maxPoolSize` to 20-50.

### Existing Indexes (from models)
| Collection | Indexes |
|------------|---------|
| User | email (unique), googleId (unique sparse), mr5Uid (unique sparse), certificationId (unique sparse), role, status, createdAt desc, name text |
| Certificate | student+course, certificationId, status+createdAt desc, verificationHash, issuedAt desc |
| Enrollment | student+course (compound unique) |
| LessonProgress | (implied by student+lesson queries) |
| VerificationLog | certificateId, timestamp |

**Missing Indexes (potential slow queries):**
| Query Pattern | Suggested Index |
|---------------|-----------------|
| Course search by category + level | `{ category: 1, level: 1, isApproved: 1 }` |
| Enrollment by course (for enrollment counts) | `{ course: 1 }` |
| Lessons by course + order | `{ course: 1, order: 1 }` |
| Payment by stripeSessionId | `{ stripeSessionId: 1 }` |
| ChatMemory by user | `{ user: 1 }` |
| ContentApproval by status + createdAt | `{ status: 1, createdAt: -1 }` |

### N+1 Query Risks
- `powerAdminController.getOverview()` — does multiple separate count queries. Consider `Promise.all()` for parallel execution.
- Course listing with teacher populate — verify `.lean()` is used for read-only queries.

---

## Caching

### Current State: NO CACHING IMPLEMENTED
- No Redis cache
- No HTTP response caching for API responses
- No CDN caching rules for API responses

### Recommended Caching Strategy
| Data | Cache Strategy | TTL |
|------|----------------|-----|
| Course catalog (public) | CloudFront + API cache headers | 5 min |
| Course detail (public) | CloudFront + API cache headers | 10 min |
| User profile (private) | Browser cache (stale-while-revalidate) | 30s |
| Legal documents | API + browser cache | 1 hour |
| Shop catalog | API cache | 15 min |
| AI chat responses | None (real-time) | — |

**Implementation:** Add `Cache-Control` headers to GET responses. For dynamic invalidation, use `PATCH`/`DELETE` to clear cache on mutation.

---

## Image Optimization

### Cloudinary (Images)
- Cloudinary CDN for profile images, thumbnails — GOOD
- `next-cloudinary` component with auto-format, auto-quality — GOOD
- Unsigned upload preset configured — verify size limits (default 10MB in Cloudinary)

### 3D Assets (GLB/GLTF)
- Currently served from Next.js `public/` directory in development
- For production: Must move to S3 + CloudFront CDN
- Set `Cache-Control: public, max-age=31536000` for immutable 3D assets

---

## Lazy Loading

### Implemented
- Ganesha 3D component — `dynamic(() => import(...), { ssr: false })`
- R3F canvas — rendered client-side only

### Missing
- MediaPipe SDKs should be lazy loaded (only load when camera feature is active)
- LiveKit client — should be lazy loaded (only load in classroom session)
- Azure Speech SDK — should be lazy loaded (only load when TTS/STT active)
- Recharts — verify that tree-shaking eliminates unused chart types

---

## Core Web Vitals Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | Unknown — 3D scene may delay LCP |
| INP (Interaction to Next Paint) | < 200ms | Unknown — R3F may block main thread |
| CLS (Cumulative Layout Shift) | < 0.1 | Risk if images missing width/height |

**To measure:** Run Lighthouse CI in GitHub Actions.

---

## Performance Recommendations (Priority Order)

1. **URGENT:** Compress Ganesha GLB from 26MB to <8MB (Draco)
2. **HIGH:** Move 3D assets to S3 + CloudFront CDN
3. **HIGH:** Add Redis-backed rate limiter for multi-instance production
4. **HIGH:** Add database indexes for course catalog queries
5. **MEDIUM:** Lazy load MediaPipe, LiveKit, Azure Speech SDK
6. **MEDIUM:** Add HTTP caching headers to GET API responses
7. **LOW:** Add Lighthouse CI to GitHub Actions
8. **LOW:** Implement stale-while-revalidate for static data API calls
