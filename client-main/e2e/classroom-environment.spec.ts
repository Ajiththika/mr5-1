import { test, expect } from "@playwright/test";
import { loginAsStudent } from "./helpers/auth";

test.describe("Classroom environment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test("loads classroom with environment status panel", async ({ page }) => {
    await page.goto("/student/courses");
    await page.waitForLoadState("networkidle");

    const courseLink = page.locator('a[href*="/course/"]').first();
    const href = await courseLink.getAttribute("href");
    test.skip(!href, "No enrolled course available for student");

    const courseId = href!.split("/course/")[1]?.split("/")[0];
    await page.goto(`/course/${courseId}/room/classroom`);
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByRole("heading", { name: /classroom/i })).toBeVisible({
      timeout: 30000,
    });

    const statusPanel = page.getByLabel("Classroom environment status");
    await expect(statusPanel).toBeVisible({ timeout: 45000 });
    await expect(statusPanel).toContainText(/live environment/i);
  });

  test("dev override switches weather theme in development", async ({ page }) => {
    test.skip(
      process.env.NODE_ENV === "production",
      "Dev panel hidden in production",
    );

    await page.goto("/student/courses");
    const courseLink = page.locator('a[href*="/course/"]').first();
    const href = await courseLink.getAttribute("href");
    test.skip(!href, "No enrolled course available");

    const courseId = href!.split("/course/")[1]?.split("/")[0];
    await page.goto(`/course/${courseId}/room/classroom`);

    await page.getByRole("button", { name: /env debug/i }).click({ timeout: 30000 });
    await page.getByRole("button", { name: /^night$/i }).click();
    await page.getByRole("button", { name: /^rainy$/i }).click();

    const statusPanel = page.getByLabel("Classroom environment status");
    await expect(statusPanel).toContainText(/night/i);
    await expect(statusPanel).toContainText(/rainy/i);
  });
});
