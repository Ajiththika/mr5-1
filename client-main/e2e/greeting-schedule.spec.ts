import { test, expect } from "@playwright/test";
import { bypassIntroAndLoading } from "./helpers/auth";

test.describe("Homepage Vanakkam greeting schedule", () => {
  test.beforeEach(async ({ page }) => {
    await bypassIntroAndLoading(page);
  });

  test("does not auto-greet again on refresh within five hours", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("mr5_last_voice_greeting_at");
      sessionStorage.removeItem("mr5_voice_greeting_session");
    });

    await page.goto("/");

    const spokeFirstVisit = await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 2500));
      return sessionStorage.getItem("mr5_voice_greeting_session") === "1";
    });
    expect(spokeFirstVisit).toBe(true);

    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2500);

    const spokeAfterRefresh = await page.evaluate(() => {
      return sessionStorage.getItem("mr5_voice_greeting_session") === "1";
    });
    expect(spokeAfterRefresh).toBe(true);

    const greetingAttemptsAfterRefresh = await page.evaluate(() => {
      return localStorage.getItem("mr5_last_voice_greeting_at");
    });
    expect(greetingAttemptsAfterRefresh).toBeTruthy();
  });

  test("allows greeting again after five hours when tab reopens", async ({ page }) => {
    const sixHoursAgo = Date.now() - 5 * 60 * 60 * 1000 - 60_000;

    await page.addInitScript((ts) => {
      localStorage.setItem("mr5_last_voice_greeting_at", String(ts));
      sessionStorage.removeItem("mr5_voice_greeting_session");
    }, sixHoursAgo);

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2500);

    const sessionMarked = await page.evaluate(() => {
      return sessionStorage.getItem("mr5_voice_greeting_session") === "1";
    });
    expect(sessionMarked).toBe(true);
  });
});
