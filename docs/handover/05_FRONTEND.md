# 05 — Frontend Documentation

Frontend: `client-main/` — Next.js 15 (App Router, React 19)

---

## Routing Map

All routes use the Next.js App Router (`app/` directory).

### Public Routes (no auth required)
| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page |
| `/login` | `app/login/page.tsx` | Login form + Google OAuth button |
| `/register` | `app/register/page.tsx` | Registration form |
| `/courses` | `app/courses/page.tsx` | Public course catalog |
| `/course/[id]` | `app/course/[id]/page.tsx` | Course detail page |
| `/pricing` | `app/pricing/page.tsx` | Pricing tiers |
| `/about` | `app/about/page.tsx` | About + 3D model attribution |
| `/contact` | `app/contact/page.tsx` | Contact form |
| `/instructors` | `app/instructors/page.tsx` | Instructor profiles |
| `/shop` | `app/shop/page.tsx` | Virtual goods shop (public view) |
| `/terms` | `app/terms/page.tsx` | Terms of Service |
| `/privacy` | `app/privacy/page.tsx` | Privacy Policy |
| `/accessibility` | `app/accessibility/page.tsx` | Accessibility statement |
| `/u/[uid]` | `app/u/[uid]/page.tsx` | Public student profile |
| `/certificate` | `app/certificate/page.tsx` | Certificate viewer |
| `/legal/accept` | `app/legal/accept/page.tsx` | Legal consent acceptance |
| `/ai-assistant` | `app/ai-assistant/page.tsx` | AI chat (public, limited) |

### Auth-Protected Routes (cookie required + legal consent)
| Route | Description |
|-------|-------------|
| `/dashboard` | Student dashboard |
| `/student/*` | Student portal pages |
| `/profile` | User profile editor |
| `/onboarding` | Post-registration wizard |
| `/payment/*` | Stripe checkout |
| `/avatar` | Avatar creator |
| `/avatar-shop` | Avatar purchase store |
| `/inventory` | User inventory |
| `/apps/*` | Mini-apps (avatar creator, etc.) |
| `/course/[id]/room/*` | 3D classroom session |

### Admin Routes
| Route | Description |
|-------|-------------|
| `/admin` | Power Admin Hub overview dashboard |
| `/admin/teachers` | Teacher database |
| `/admin/teachers/[id]` | Teacher profile detail |
| `/admin/teacher-studio` | 3D teacher studio configuration |
| `/admin/course-factory` | AI course generation and list |
| `/admin/course-factory/[id]` | Course detail editing |
| `/admin/classrooms` | Classroom list |
| `/admin/classrooms/[id]` | Classroom editor |
| `/admin/approvals` | Content approval queue |
| `/admin/analytics` | Platform analytics |
| `/admin/roles` | RBAC role management |
| `/admin/content-library` | Published content index |
| `/admin/activity` | Activity log |
| `/admin/settings` | Platform settings |

### Dev-Only Routes (blocked in production by middleware)
| Route | Description |
|-------|-------------|
| `/nebula` | Development sandbox |
| `/demo` | Component demos |

---

## Middleware (`middleware.ts`)

The Next.js middleware runs at the Edge on every request.

**Flow:**
1. Static asset check → pass through (no auth needed)
2. Public path check → pass through
3. No token + protected path → redirect to `/login?redirect=...`
4. Has token + on login/register → redirect to `/dashboard`
5. Has token + consent-protected path + no `mr5_consent_ok` cookie → redirect to `/legal/accept?redirect=...`
6. Dev-only paths in production → redirect to `/`

**Cookies checked:**
- `access_token` (primary JWT)
- `refresh_token` (fallback check only, real refresh happens server-side)
- `mr5_consent_ok` (legal consent gate)

---

## Key Components

### Authentication

#### `components/auth/GoogleSignInButton.tsx`
- Renders Google Sign-in button conditionally based on `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` env var
- Calls `/api/auth/providers` to check if Google OAuth is configured on backend
- Renders nothing if OAuth is disabled

#### `components/auth/forgot-password-modal.tsx`
- Modal for triggering forgot password flow
- Used in login page

#### `app/api/auth/providers/route.ts`
- Next.js API route (server-side)
- Calls backend `/api/auth/providers`
- Returns `{ google: boolean }` based on env var `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` AND backend response

### 3D Classroom

#### `components/3d/classroom-room-scene.tsx`
- Main 3D scene component using React Three Fiber
- Includes: ClassroomModel, TeacherCharacter, GaneshaWelcomeGuide, ProgressTracker

#### `components/3d/GaneshaWelcomeGuide.tsx`
- Renders the Ganesha GLB model (26MB — `public/assets/3d/avatars/indigo-ganesha.glb`)
- Lazy dynamically imported for performance
- Disabled on low-performance tier
- CC BY 4.0 license — credit REQUIRED in footer, loader, and about page

#### `components/3d/ModelCreditNotice.tsx`
- Renders CC attribution notice
- Variants: `loading`, `scene`, `footer`
- Required by license to appear in 3 locations

#### `lib/3d/model-registry.ts`
- Central registry for 3D model metadata
- Tracks name, URL, license for each model

#### `lib/3d/performance-profile.ts`
- `get3DPerformanceProfile()` returns: `{ tier: 'low'|'medium'|'high', ... }`
- Based on device GPU/memory capabilities
- Controls Ganesha visibility, shadow quality, DPR, FPS target

### Power Admin Hub

#### `components/power-admin/`
- `AdminDashboardShell.tsx` — Layout wrapper for admin pages
- KPI cards, activity feed, teacher list components

#### `lib/power-admin/`
- Admin-specific utilities and type definitions

#### `services/power-admin.service.ts`
- API client for all `/api/power-admin/*` endpoints
- Methods: `getOverview()`, `getTeachers()`, `createTeacher()`, etc.

### Layout

#### `components/layout/footer.tsx`
- Contains `ModelCreditNotice variant="footer"` (mandatory for 3D license)
- Navigation links, social links

#### `app/layout.tsx`
- Root layout with: ThemeProvider, EnhancedUserContext, Toaster (Sonner)
- Google Fonts loaded
- SEO metadata

---

## State Management

### `contexts/EnhancedUserContext.tsx`
The primary application state manager for authentication.

**Provides:**
```typescript
{
  user: User | null,
  loading: boolean,
  login(email, password, redirect?): Promise<void>,
  logout(): Promise<void>,
  refreshUser(): Promise<void>,
  isAdmin: boolean,
  isStudent: boolean,
}
```

**Auth flow:**
1. On mount: calls `/api/auth/me` to restore session from cookie
2. `login()` calls `/api/auth/login`, sets user state, redirects
3. `logout()` calls `/api/auth/logout`, clears state

### `features/classroom/store/classroom.store.tsx`
Zustand store for 3D classroom runtime state.

**State:**
- XP, level, stars, streak (gamification — client-side only, not persisted to DB yet)
- Current room, active lesson
- Playtime timer

---

## API Client Layer

### `lib/api-base.ts`
- `getApiBaseUrl()` — smart URL resolver
  - On browser + production domain: returns `""` (relative path, goes via Next.js proxy)
  - On browser + localhost: returns `http://localhost:5001`
  - On server: returns `NEXT_PUBLIC_API_URL` env value
- `getGoogleOAuthUrl()` — returns OAuth initiation URL

### `lib/api-proxy.ts`
- Server-side proxy helpers for Next.js API routes
- Forwards cookies transparently to backend

### `lib/apiClient.ts`
- Axios instance with interceptors
- Auto-attaches cookies via `withCredentials: true`
- 401 → triggers refresh token flow

### `services/` (30 service files)
One service file per domain area:
- `auth.service.ts` — login, register, logout, refresh
- `course.service.ts` — course CRUD
- `enrollment.service.ts` — enroll, get enrollments
- `certificate.service.ts` — cert generation, PDF download
- `admin.service.ts` — admin CRUD
- `power-admin.service.ts` — Power Admin Hub API client
- `ai.service.ts` — AI chat, generation
- `identity.service.ts` — profile, friends, search
- `legal.service.ts` — consent documents and acceptance
- `shop.service.ts` — shop items, purchase, equip
- `student.service.ts` — student dashboard data
- `payment.service.ts` — Stripe checkout
- `cloudinary.service.ts` — upload helpers
- `greeting.service.ts` — Tamil/English AI greetings

---

## Reusable UI Components

All from `components/ui/` (shadcn/ui):
- Button, Input, Label, Select, Dialog, AlertDialog
- Card, Badge, Avatar, Progress
- Tabs, Collapsible, NavigationMenu
- Tooltip, Popover, DropdownMenu, Switch
- ScrollArea, Separator

Custom components:
- `GoogleSignInButton` (auth)
- `ModelCreditNotice` (3D license)
- `GaneshaWelcomeGuide` (3D avatar)
- `PlaytimePanel` (classroom XP)
- `ProgressTracker` (classroom progress)
- `CourseAccessGate` (enrollment gate)
- `ForgotPasswordModal` (password reset)

---

## Localization & i18n
- `lib/translations.ts` — custom translation dictionary (English + Tamil)
- `lib/tamil-greetings.ts` — time-based Tamil greetings
- `locales/` — locale files
- No external i18n library (custom implementation)

---

## SEO
- `lib/seo.ts` — SEO helpers and metadata builders
- `generateMetadata()` on course pages
- Organization + EducationalOrganization schema.org JSON-LD
- 3DModel schema.org on About page
- `app/sitemap.ts` — dynamic sitemap
- `app/robots.ts` — robots.txt
- `app/manifest.ts` — PWA manifest

---

## Testing

### Unit Tests (`tests/`)
Run with: `cd client-main && npm test`
- `lib/api-base.test.ts` — URL resolver tests
- `lib/api-proxy.test.ts` — proxy tests
- `lib/classroom-environment.test.ts` — R3F environment tests
- `lib/classroom-seat.test.ts` — seat placement tests
- `lib/cloudinary.config.test.ts` — Cloudinary config tests
- `lib/greeting-schedule.test.ts` — greeting schedule tests
- `lib/hdri-presets.test.ts` — HDRI preset tests
- `lib/time-utils.test.ts` — time utility tests

### E2E Tests (`e2e/`)
Run with: `cd client-main && npm run test:e2e`

**CRITICAL:** Requires browser install: `npx playwright install chromium`

| Spec | Tests |
|------|-------|
| `smoke.spec.ts` | App loads, basic navigation |
| `login-dashboard.spec.ts` | Login flow |
| `student-dashboard.spec.ts` | Student portal |
| `google-oauth.spec.ts` | Google OAuth button visibility |
| `comprehensive-lms.spec.ts` | Full LMS flows |
| `classroom-environment.spec.ts` | 3D classroom loads |
| `seo.spec.ts` | SEO meta tags |
| `light-theme.spec.ts` | Theme switching |
| `platform-upgrade.spec.ts` | Platform upgrade checks |
| `greeting-schedule.spec.ts` | Greeting timing |
| `capture-demo-screenshots.spec.ts` | Screenshot capture (excluded from default run) |

---

## Pending UI Work

| Area | Work Needed |
|------|-------------|
| Power Admin Hub | Course Factory wizard — complete drag-drop lesson ordering |
| Power Admin Hub | Approval queue — full review workflow UI |
| Power Admin Hub | Analytics — wire recharts to real API data |
| Certificate Admin | Build approval flow in admin UI |
| AI Tutor | Voice Q&A pipeline UI completion |
| Student Dashboard | Grades/transcript display |
| Classroom | Server-synced XP (currently client-side Zustand only) |
| 3D Assets | Draco-compress Ganesha GLB (26MB → target <8MB) |
| Notifications | Wire IdentityNotification to UI |
| Mobile | Full responsive polish on admin pages |
