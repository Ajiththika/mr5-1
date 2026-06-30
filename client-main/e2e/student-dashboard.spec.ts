import { test, expect } from "@playwright/test";
import { loginAsStudent, dismissOverlayDialogs } from "./helpers/auth";

test.describe("Student dashboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await loginAsStudent(page);
  });

  test("sidebar links work for all student sections", async ({ page }) => {
    const navChecks = [
      { link: "My Courses", heading: /My Courses/i, url: /\/student\/courses/ },
      { link: "Assignments", heading: /Assignments/i, url: /\/student\/assignments/ },
      { link: "Grades", heading: /Grades/i, url: /\/student\/grades/ },
      { link: "Own Store", heading: /MR5 Own Store/i, url: /\/avatar-shop/ },
      { link: "Schedule", heading: /Schedule/i, url: /\/student\/schedule/ },
      { link: "Dashboard", heading: /welcome back/i, url: /\/student\/portal/ },
    ];

    const sidebar = page.getByLabel("Student navigation");

    for (const item of navChecks) {
      const link = sidebar.getByRole("link", { name: item.link, exact: true });
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await page.waitForURL(item.url, { timeout: 30000 });
      await dismissOverlayDialogs(page);
      await expect(page.getByRole("heading", { name: item.heading }).first()).toBeVisible({
        timeout: 20000,
      });
    }
  });
});
