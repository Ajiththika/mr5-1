# Task Handover: Continue MR5 School Implementation

You are an AI developer taking over the development of **MR5 School**, an AI-powered 3D online learning platform. Your task is to resolve remaining bugs, critical blockers, and finish implementing high-priority features.

---

## 1. Context & Reference Files
Before making changes, refer to the following completed documentation:
* [docs/PROJECT_MEMORY.md](file:///Users/mr.ushantha/Downloads/Mr5/docs/PROJECT_MEMORY.md) (Tech stack, architecture, APIs, database, AI setup)
* [docs/handover/08_PENDING_TASKS.md](file:///Users/mr.ushantha/Downloads/Mr5/docs/handover/08_PENDING_TASKS.md) (Full categorized task list)
* [docs/handover/09_BUG_REPORT.md](file:///Users/mr.ushantha/Downloads/Mr5/docs/handover/09_BUG_REPORT.md) (All known bugs and root causes)

> [!WARNING]
> Do NOT rewrite or modify files listed under section 12 of `PROJECT_MEMORY.md` unless explicitly fixing a critical bug.

---

## 2. Next High-Priority Tasks

### Task 1: Fix Empty `studentController.js` (Blocker)
* **File:** [studentController.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/controllers/studentController.js) (Currently 0 bytes).
* **Goal:** Audit routes using this controller. Implement the missing methods or redirect them to `studentLearningController.js` to prevent route-resolution crashes.

### Task 2: Fix `next.config.mjs` API Port Mismatch (Blocker)
* **File:** [next.config.mjs](file:///Users/mr.ushantha/Downloads/Mr5/client-main/next.config.mjs) at line 104.
* **Goal:** Change port `5000` to `5001` in rewrite fallbacks to align with the backend's `PORT=5001`.

### Task 3: Local Playwright E2E Setup (Testing Blocker)
* **Goal:** Install missing browser binaries.
* **Action:** Run `cd client-main && npx playwright install chromium` in the terminal to enable Playwright tests.

### Task 4: Server-Sync 3D Classroom XP (Feature)
* **Files:**
  * [classroom.store.tsx](file:///Users/mr.ushantha/Downloads/Mr5/client-main/features/classroom/store/classroom.store.tsx)
  * [UserLearningStats.js](file:///Users/mr.ushantha/Downloads/Mr5/Mr5-School-API-main/src/models/UserLearningStats.js)
* **Goal:** Implement an API call on lesson completion to persist student XP, levels, and streaks in the database.

---

## 3. How to Start
1. Run `npm install` in both `client-main/` and `Mr5-School-API-main/`.
2. Spin up local development servers using `docker-compose up` or starting the projects manually (backend: port 5001, frontend: port 3000).
3. Verify the environment using `.env.example` configurations.
4. Execute tests via `npm test` or `npx playwright test`.
