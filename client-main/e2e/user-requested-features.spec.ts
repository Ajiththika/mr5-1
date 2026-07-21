import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 1280, height: 800 },
});

test.describe("User Requested Features & Verification", () => {
  test("language selector in header works and is removed from footer", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("http://localhost:3005");
    await page.evaluate(() => {
      sessionStorage.setItem("hasSeenGlobalLoading", "true");
      localStorage.setItem("hasSeenIntro_v1", "true");
    });
    await page.reload();

    // Check navbar language selector exists and is visible on desktop viewport
    const navLangSelector = page.locator('[data-tour-id="tour-language"] select');
    await expect(navLangSelector).toBeVisible({ timeout: 10000 });

    // Check footer does NOT contain LanguageSelector
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    const footerLangSelector = footer.locator('select, button[aria-pressed]');
    await expect(footerLangSelector).toHaveCount(0);

    // Verify navbar language changing
    await navLangSelector.selectOption("ta");
    await page.waitForTimeout(500);

    const realErrors = consoleErrors.filter(
      (e) => !e.includes("favicon") && !e.includes("SpeechSynthesis") && !e.includes("sound")
    );
    expect(realErrors.length).toBe(0);
  });

  test("product tour backdrop traps clicks and skip button completes tour", async ({ page }) => {
    await page.goto("http://localhost:3005");
    await page.evaluate(() => {
      sessionStorage.setItem("hasSeenGlobalLoading", "true");
      localStorage.setItem("hasSeenIntro_v1", "true");
      localStorage.removeItem("mr5_product_tour_completed_v1");
    });
    await page.reload();

    // Wait for tour dialog to open
    const tourStep = page.locator('[role="dialog"][aria-label*="Product tour step"]');
    await expect(tourStep).toBeVisible({ timeout: 10000 });

    // Click on backdrop (outside tooltip)
    const backdrop = page.locator('div[aria-hidden].backdrop-blur-\\[2px\\]');
    await backdrop.click({ position: { x: 20, y: 20 }, force: true });

    // Tour should still be visible because touching/clicking backdrop does not close tour
    await expect(tourStep).toBeVisible();

    // Click explicit Skip tour button
    const skipButton = page.getByRole("button", { name: "Skip tour" });
    await expect(skipButton).toBeVisible();
    await skipButton.click();

    // Tour should now be closed
    await expect(tourStep).not.toBeVisible();

    // Check localStorage saved completion
    const completed = await page.evaluate(() => localStorage.getItem("mr5_product_tour_completed_v1"));
    expect(completed).toBe("true");
  });
});
