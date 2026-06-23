import { test, expect } from "@playwright/test";
import { bypassIntroAndLoading, ensureLoggedOut } from "./helpers/auth";

test.describe("Light theme UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await bypassIntroAndLoading(page);
    await ensureLoggedOut(page);
    await page.addInitScript(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      window.localStorage.setItem(
        "userPreferences",
        JSON.stringify({
          theme: "light",
          language: "en",
          notifications: { email: true, push: true, inApp: true },
          privacy: { profileVisibility: "public", activityStatus: true },
          accessibility: { highContrast: false, reducedMotion: true, fontSize: "medium" },
        }),
      );
    });
  });

  test("Start Learning navbar button is visible and readable", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const startLearning = page.getByTestId("nav-start-learning");
    await expect(startLearning).toBeVisible({ timeout: 20000 });

    const box = await startLearning.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(80);
    expect(box?.height ?? 0).toBeGreaterThan(28);

    const styles = await startLearning.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        opacity: computed.opacity,
      };
    });

    expect(parseFloat(styles.opacity)).toBeGreaterThan(0.9);
    expect(styles.color).not.toBe("rgba(0, 0, 0, 0)");
    expect(styles.color).toMatch(/rgb\(\s*2(4[0-9]|5[0-5])/);
  });

  test("Get Started hero CTA is visible in light theme", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const getStarted = page.getByRole("link", { name: /get started/i });
    await expect(getStarted).toBeVisible({ timeout: 15000 });

    const box = await getStarted.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(40);
    expect(box?.height ?? 0).toBeGreaterThan(20);
  });
});
