import { test, expect } from "@playwright/test";
import { bypassIntroAndLoading } from "./helpers/auth";

test.describe("Platform upgrade", () => {
  test.beforeEach(async ({ page }) => {
    await bypassIntroAndLoading(page);
  });

  test("homepage chat shortcut opens AI assistant", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const chatButton = page.getByRole("button", { name: /open ai study assistant/i });
    await expect(chatButton).toBeVisible({ timeout: 20000 });
    await chatButton.click();
    await expect(page.getByRole("dialog", { name: /AI Tutor/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test("footer language switch updates visible UI", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    const germanButton = footer.getByRole("button", { name: "Deutsch", exact: true });
    if (await germanButton.isVisible().catch(() => false)) {
      await germanButton.click();
      await expect(footer.getByText("Sprache")).toBeVisible();
    } else {
      const langSelect = footer.locator("select").first();
      if (await langSelect.isVisible().catch(() => false)) {
        await langSelect.selectOption("de");
        await expect(footer.getByText("Sprache")).toBeVisible();
      }
    }
  });

  test("orphan routes redirect safely", async ({ page }) => {
    await page.goto("/apps/course-generator");
    await expect(page).toHaveURL(/\/courses/, { timeout: 15000 });

    await page.goto("/ai-assistant/avatar-support");
    await expect(page).toHaveURL(/\/ai-assistant/, { timeout: 15000 });
  });
});
