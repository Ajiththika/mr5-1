import { test, expect } from "@playwright/test";

test.describe("SEO smoke", () => {
  test("homepage has optimized title and meta description", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("hasSeenIntro_v1", "true");
      window.sessionStorage.setItem("hasSeenGlobalLoading", "true");
    });

    await page.goto("/");
    await expect(page).toHaveTitle(/3D Virtual Classroom|MR5 School/i);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);
  });

  test("courses and pricing pages are indexable with metadata", async ({ page }) => {
    await page.goto("/courses");
    await expect(page).toHaveTitle(/Courses|MR5 School/i);

    await page.goto("/pricing");
    await expect(page).toHaveTitle(/Pricing|MR5 School/i);
  });
});
