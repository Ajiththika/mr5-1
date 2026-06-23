import { defineConfig, devices } from "@playwright/test";

const API_PORT = process.env.PLAYWRIGHT_API_PORT || "5002";
const API_URL = process.env.PLAYWRIGHT_API_URL || `http://127.0.0.1:${API_PORT}`;
const WEB_PORT = process.env.PLAYWRIGHT_WEB_PORT || (process.env.CI ? "3001" : "3000");
const WEB_URL = process.env.PLAYWRIGHT_WEB_URL || `http://localhost:${WEB_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 120 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  use: {
    baseURL: WEB_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `cd ../Mr5-School-API-main && MONGO_URI= MONGODB_URI= NODE_ENV=development JWT_SECRET=test-jwt-secret-for-ci-only-min-32-chars PORT=${API_PORT} node src/app.js`,
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
    },
    {
      command: `NEXT_PUBLIC_API_URL=${API_URL} PORT=${WEB_PORT} npm run dev`,
      url: WEB_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
    },
  ],
});
