# MR5 School — Frontend

Next.js app for the MR5 School immersive 3D learning platform, including the live weather classroom experience.

## Prerequisites

- Node.js 20+
- Running API (`Mr5-School-API-main`) on port **5001**
- OpenWeatherMap API key on the **backend** (see below)

## Setup

```bash
cd client-main
cp .env.example .env.local
npm install
```

### Weather API key

Weather is fetched by `GET /api/context/weather` (Next.js server route with graceful fallback).

1. Create a free key at [OpenWeatherMap](https://openweathermap.org/api)
2. Add to `client-main/.env.local` (or `Mr5-School-API-main/.env` if using API-only):

```env
WEATHER_API_KEY=your_openweather_api_key
```

The classroom calls `GET /api/context/weather?lat=&lon=` (public, rate-limited). If geolocation or the API fails, the scene falls back to default clear weather without breaking the UI.

## Run locally

```bash
# Terminal 1 — API
cd Mr5-School-API-main
PORT=5001 NODE_ENV=development node src/app.js

# Terminal 2 — Frontend
cd client-main
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo student: `student@mr5school.com` / `Student@123456`.

### Classroom route

After enrolling in a course, open:

`/course/<courseId>/room/classroom`

## Classroom environment features

| Feature | Description |
|--------|-------------|
| Live weather | Geolocation + OpenWeatherMap via API |
| Local time | Morning / afternoon / evening / night lighting |
| Atmosphere | Rain on windows, lightning, wind curtain, fog, ceiling lights at night |
| Status panel | Weather, temperature, location, time period |
| Dev overrides | **Env Debug** button (development only) — Morning, Evening, Night, Rain, Thunder, Sunny, Cold, Fog, Wind |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |
| `npx playwright test` | E2E tests |

## Testing the classroom

1. **Unit tests:** `npm test -- lib/classroom-environment.test.ts`
2. **E2E:** `npx playwright test e2e/classroom-environment.spec.ts`
3. **Manual:** Open classroom → confirm status panel → click **Env Debug** → try Night + Rain overrides
4. **Fallback:** Deny geolocation in browser → scene should still load with default weather message

## Deployment

1. Set production env vars (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`)
2. Set `WEATHER_API_KEY` on the API service
3. Build frontend: `npm run build && npm run start`
4. Ensure `/api/*` is proxied to the API (see `next.config` rewrites)

### Vercel + separate API

- Deploy `client-main` to Vercel
- Deploy `Mr5-School-API-main` to your Node host (Railway, Render, EC2, etc.)
- Point `NEXT_PUBLIC_API_URL` at the API origin and configure rewrites or CORS accordingly

## Limitations

- Geolocation requires HTTPS in production (or localhost)
- OpenWeatherMap free tier has rate limits; the API route is rate-limited to 30 req/min/IP
- Weather themes map from OpenWeather `main` conditions; exotic codes may appear as cloudy/sunny
- Dev override panel is hidden in production builds (`NODE_ENV === "production"`)

## Project structure (classroom)

```
client-main/
├── app/course/[id]/room/classroom/   # Route + SEO layout
├── components/3d/
│   ├── classroom-room-scene.tsx        # Main 3D classroom
│   └── classroom/ClassroomAtmosphere.tsx
├── components/classroom/
│   ├── ClassroomStatusPanel.tsx
│   └── EnvironmentDevPanel.tsx
├── contexts/ClassroomEnvironmentContext.tsx
└── lib/classroom-environment.ts        # Time/weather → lighting
```
