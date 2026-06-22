import { Page } from "@playwright/test";

export const STUDENT = {
  email: "student@mr5school.com",
  password: "Student@123456",
};

export async function bypassIntroAndLoading(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("hasSeenIntro_v1", "true");
    window.sessionStorage.setItem("hasSeenGlobalLoading", "true");
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
  await page.goto("/login");
  await page.fill('input[name="email"]', STUDENT.email);
  await page.fill('input[name="password"]', STUDENT.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/student|\/dashboard|\/onboarding/, { timeout: 45000 });

  if (page.url().includes("/onboarding")) {
    await completeOnboarding(page);
  }

  if (!page.url().includes("/student/portal")) {
    await page.goto("/student/portal");
    await page.waitForLoadState("domcontentloaded");
  }
}
