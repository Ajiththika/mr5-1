# 01 — Project Overview

## Project Name
**MR5 School** (mr5school.com)

---

## Project Vision
MR5 School is an immersive, AI-powered online learning platform featuring 3D virtual classrooms, AI teacher avatars, gamified progression, certifications, and a full-featured administrative hub. The platform targets K-12 and post-secondary students in emerging markets (notably Sierra Leone, India, and diaspora communities) and aims to deliver high-quality education via an engaging, technology-first experience.

---

## Business Goal
- Deliver interactive, AI-tutored courses via 3D environments
- Certify students with blockchain-style tamper-proof certificates
- Monetize via Stripe-powered course enrollments and a virtual goods shop
- Scale to multi-school tenancy and enterprise white-labelling in future phases

---

## Target Users
| Role | Description |
|------|-------------|
| `student` | Primary learners — enroll in courses, earn XP, get certificates |
| `AI-TEACHER` | AI-generated teacher profiles that guide students |
| `instructor` | Human instructors who review and approve content |
| `admin` | Platform administrators with full Power Admin Hub access |
| `employer` | Employers who verify student certificates |
| `partner_school` | Partner institutions with delegated access |

---

## Tech Stack

### Frontend (`client-main/`)
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| Styling | Tailwind CSS 3, shadcn/ui, Radix UI |
| 3D Engine | React Three Fiber (R3F), Three.js, Drei |
| Animation | Framer Motion |
| State | React Context (EnhancedUserContext) |
| Forms | React Hook Form + Zod |
| Payments | Stripe React SDK |
| Media | Cloudinary (next-cloudinary) |
| Real-time | LiveKit (WebRTC) |
| AI | Google Gemini, OpenAI SDK |
| Charts | Recharts |
| PDF | @react-pdf/renderer |
| QR | qrcode.react |
| i18n | Custom translation system (lib/translations.ts) |
| Testing | Jest + Testing Library (unit), Playwright (e2e) |

### Backend (`Mr5-School-API-main/`)
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (ES Modules) |
| Framework | Express 4 |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (httpOnly cookies) + Passport.js + Google OAuth 2.0 |
| AI | Google Gemini, OpenAI, Ollama (local) |
| Payments | Stripe (webhooks, checkout) |
| Storage | Cloudinary (images/avatars), pdfkit (cert PDF), qrcode |
| Real-time | LiveKit Server SDK |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, xss |
| Logging | Winston |
| Dev DB | mongodb-memory-server (auto-fallback) |
| Process | PM2 (production) |
| Testing | Jest + Supertest |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Frontend Hosting | Vercel |
| Backend Hosting | AWS ECS Fargate (or EC2) |
| Database | MongoDB Atlas |
| CDN | AWS CloudFront |
| Static Assets | AWS S3 |
| CI/CD | GitHub Actions |
| Secrets | AWS Secrets Manager |
| Monitoring | AWS CloudWatch |

---

## Folder Structure

```
Mr5/                                   <- Monorepo root
+-- client-main/                       <- Next.js 15 frontend
|   +-- app/                           <- App Router pages
|   |   +-- admin/                     <- Power Admin Hub (/admin/*)
|   |   +-- student/                   <- Student portal
|   |   +-- course/[id]/               <- Course detail + 3D classroom
|   |   +-- login/, register/          <- Auth pages
|   |   +-- onboarding/                <- Post-registration flow
|   |   +-- dashboard/                 <- Student dashboard
|   |   +-- shop/, avatar-shop/        <- Virtual goods stores
|   |   +-- certificate/               <- Certificate viewer
|   |   +-- legal/                     <- Legal consent flow
|   |   +-- payment/                   <- Stripe checkout
|   |   +-- profile/, avatar/          <- User profile + avatar creator
|   |   +-- ai-assistant/              <- AI chat interface
|   |   +-- api/                       <- Next.js API routes (proxies + Gemini)
|   +-- components/
|   |   +-- 3d/                        <- R3F scenes, Ganesha, credits
|   |   +-- auth/                      <- Login form, Google OAuth button
|   |   +-- power-admin/               <- Admin hub components
|   |   +-- layout/                    <- Navbar, footer, shell
|   |   +-- ui/                        <- shadcn/ui primitives
|   +-- contexts/                      <- EnhancedUserContext (auth state)
|   +-- features/classroom/            <- 3D classroom store, XP system
|   +-- hooks/                         <- Custom React hooks
|   +-- lib/                           <- Utilities, 3D registry, learning system
|   +-- services/                      <- API client services (one per domain)
|   +-- types/                         <- TypeScript type definitions
|   +-- e2e/                           <- Playwright tests
|   +-- tests/                         <- Jest unit tests
|   +-- middleware.ts                  <- Edge auth + consent middleware
|   +-- next.config.mjs                <- Next config + API rewrites
|
+-- Mr5-School-API-main/               <- Express backend
|   +-- src/
|   |   +-- app.js                     <- Express app, CORS, route mounting
|   |   +-- config/                    <- DB, env, passport, cloudinary, roles
|   |   +-- controllers/               <- 31 route controllers
|   |   +-- middleware/                <- auth, security, error, db, legal
|   |   +-- models/                    <- 37+ Mongoose models
|   |   +-- routes/                    <- 31 route files
|   |   +-- services/                  <- 26 business logic services
|   |   +-- utils/                     <- PDF gen, email, helpers
|   |   +-- prompts/                   <- AI prompt templates
|   +-- tests/                         <- Jest + Supertest tests
|   +-- api/                           <- Vercel serverless handler
|   +-- public/3d/                     <- Static 3D assets
|
+-- docs/                              <- Architecture + audit docs
+-- infra/                             <- ECS task definitions, IAM
+-- scripts/                           <- CI/deployment scripts
+-- docker-compose.yml                 <- Local dev stack
+-- vercel.json                        <- Root-level Vercel config
```

---

## Architecture

```
Browser
  |
  v
Vercel (Next.js 15 SSR + Edge)
  |  next.config.mjs rewrites: /api/* -> Express API
  |
  v
Express API (port 5001 / ECS Fargate)
  |  JWT httpOnly cookies, Passport.js, rate limiting, Helmet
  |
  +-> MongoDB Atlas (primary data store)
  +-> Cloudinary (images, PDFs, avatars)
  +-> Stripe (payments + webhooks)
  +-> LiveKit (WebRTC video)
  +-> Google OAuth 2.0 (passport-google-oauth20)
  +-> AI Providers (Gemini / OpenAI / Ollama)
```

**Key design pattern:** The Next.js frontend never talks to MongoDB directly. All data flows through the Express API. The Next.js API routes are thin proxies for auth and Gemini calls only.

---

## Development Status
**Version:** 2.0.0 (MVP+1)
**Overall Completion:** ~68%

| Area | Status |
|------|--------|
| Authentication (JWT + Google OAuth) | Functional (minor OAuth env config issues) |
| Course + Lesson CRUD | Complete |
| Student enrollment + progress | Complete |
| 3D Classroom (R3F) | Complete |
| Payments (Stripe) | Complete |
| Certification system | Backend complete, frontend partial |
| Power Admin Hub | ~60% -- APIs done, UI scaffolded |
| AI Tutor / Chat | Backend done, frontend wired partially |
| Legal Consent Engine | Complete |
| Avatar + Shop system | Complete |
| E2E Tests | BROKEN -- Browser binaries missing (requires `npx playwright install`) |
| Production deployment | Env vars need configuration |
