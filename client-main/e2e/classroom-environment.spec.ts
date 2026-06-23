import { test, expect } from "@playwright/test";
import { loginAsStudent, openClassroomMenu, dismissOverlayDialogs } from "./helpers/auth";

test.describe("Classroom environment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  async function enterClassroom(page: import("@playwright/test").Page) {
    await page.goto("/student/courses");
    await page.waitForLoadState("networkidle");

    const courseLink = page.locator('a[href*="/course/"]').first();
    const href = await courseLink.getAttribute("href");
    test.skip(!href, "No enrolled course available for student");

    const courseId = href!.split("/course/")[1]?.split("/")[0];
    await page.goto(`/course/${courseId}/room/classroom`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByLabel(/immersive classroom experience/i)).toBeVisible({
      timeout: 45000,
    });
    await expect(page.getByText(/loading classroom/i)).toBeHidden({ timeout: 90000 });
    await dismissOverlayDialogs(page);
    await openClassroomMenu(page);
    return courseId;
  }

  test("loads classroom with environment status panel", async ({ page }) => {
    await enterClassroom(page);

    const statusPanel = page.getByLabel(/room atmosphere/i);
    await expect(statusPanel).toBeVisible({ timeout: 30000 });
    await expect(statusPanel.getByText(/syncing environment/i)).toBeHidden({ timeout: 60000 });
  });

  test("dev override switches weather theme in development", async ({ page }) => {
    test.skip(
      process.env.NODE_ENV === "production",
      "Dev panel hidden in production",
    );

    await enterClassroom(page);

    await page.getByRole("button", { name: /env debug/i }).click({ timeout: 30000 });
    await page.getByRole("button", { name: /^night$/i }).click();
    await page.getByRole("button", { name: /^rainy$/i }).click();

    const statusPanel = page.getByLabel(/room atmosphere/i);
    await expect(statusPanel).toContainText(/night/i);
    await expect(statusPanel).toContainText(/rainy/i);
  });
});
