import { Page, expect } from "@playwright/test";

export const STUDENT = {
  email: "student@mr5school.com",
  password: "Student@123456",
};

export function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.PLAYWRIGHT_API_URL ||
    "http://localhost:5001"
  )
    .replace(/\/$/, "")
    .replace("://127.0.0.1", "://localhost");
}

export async function bypassIntroAndLoading(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("hasSeenIntro_v1", "true");
    window.sessionStorage.setItem("hasSeenGlobalLoading", "true");
    window.localStorage.setItem("mr5-ai-consent", "true");
    window.localStorage.setItem("mr5_product_tour_completed_v1", "true");
  });
}

export async function dismissOverlayDialogs(page: Page) {
  const aiDialog = page.getByRole("dialog", { name: /AI-Powered Learning/i });
  if (await aiDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.getByRole("button", { name: /maybe later/i }).click();
  }
}

export async function openClassroomMenu(page: Page) {
  await page.getByRole("button", { name: /open menu/i }).click({ timeout: 30000 });
  await expect(page.getByRole("dialog", { name: /classroom navigation/i })).toBeVisible({
    timeout: 15000,
  });
}

export async function ensureLoggedOut(page: Page) {
  await page.context().clearCookies();
  await page.addInitScript(() => {
    window.localStorage.removeItem("token");
  });
}

async function acceptLegalIfNeeded(page: Page) {
  const api = getApiBase();
  const requiredRes = await page.request.get(`${api}/api/legal/required`);
  if (!requiredRes.ok()) return;

  const requiredBody = await requiredRes.json();
  const docs = requiredBody.data || [];
  if (docs.length === 0) return;

  await page.request.post(`${api}/api/legal/accept`, {
    data: {
      documentVersionIds: docs.map((d: { documentVersionId: string }) => d.documentVersionId),
      locale: "en",
      source: "e2e",
    },
  });
}

async function completeOnboarding(page: Page) {
  await page.waitForURL(/\/onboarding/, { timeout: 15000 });

  const nameInput = page.locator("#displayName");
  if (await nameInput.isVisible().catch(() => false)) {
    const value = await nameInput.inputValue();
    if (!value.trim()) {
      await nameInput.fill("E2E Student");
    }
    await page.getByRole("button", { name: /^next$/i }).click();
  }

  await page.locator("button.rounded-xl.border-2").first().click({ timeout: 10000 });
  await page.getByRole("button", { name: /^next$/i }).click();
  await page.getByRole("button", { name: /enter campus/i }).click();
  await page.waitForURL(/\/student|\/dashboard/, { timeout: 45000 });
}

export async function loginAsStudent(page: Page) {
  await bypassIntroAndLoading(page);
  await page.context().clearCookies();

  const api = getApiBase();
  const loginRes = await page.request.post(`${api}/api/auth/login`, {
    data: STUDENT,
    headers: { Origin: "http://localhost:3000" },
  });
  expect(loginRes.ok()).toBeTruthy();

  const loginBody = await loginRes.json();
  if (loginBody.data?.consentSatisfied === false) {
    await acceptLegalIfNeeded(page);
  }

  await page.request.patch(`${api}/api/legal/preferences`, {
    data: { aiFeatures: true },
    headers: { Origin: "http://localhost:3000" },
  });

  await page.goto("/student/portal");
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/onboarding")) {
    await completeOnboarding(page);
  }

  if (page.url().includes("/legal/accept")) {
    await page.getByText(/I have read and agree/i).click();
    await page.getByRole("button", { name: /accept & continue/i }).click();
    await page.waitForURL(/\/student|\/dashboard|\/onboarding/, { timeout: 45000 });
  }

  if (!page.url().includes("/student/portal")) {
    await page.goto("/student/portal");
    await page.waitForLoadState("domcontentloaded");
  }

  await expect(
    page.getByRole("heading", { name: /welcome back/i }).first(),
  ).toBeVisible({ timeout: 20000 });

  await dismissOverlayDialogs(page);
}
