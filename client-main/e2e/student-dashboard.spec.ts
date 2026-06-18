import { test, expect } from "@playwright/test";
import { loginAsStudent } from "./helpers/auth";

test.describe("Student dashboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test("sidebar links work for all student sections", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /welcome back/i }).first(),
    ).toBeVisible();

    const navChecks = [
      { link: "My Courses", heading: /My Courses/i, url: /\/student\/courses/ },
      { link: "Assignments", heading: /Assignments/i, url: /\/student\/assignments/ },
      { link: "Grades", heading: /Grades/i, url: /\/student\/grades/ },
      { link: "Avatar Shop", heading: /Avatar Shop/i, url: /\/student\/shop/ },
      { link: "Schedule", heading: /Schedule/i, url: /\/student\/schedule/ },
      { link: "Dashboard", heading: /welcome back/i, url: /\/student\/portal/ },
    ];

    const sidebar = page.getByLabel("Student navigation");

    for (const item of navChecks) {
      await sidebar.getByRole("link", { name: item.link, exact: true }).click();
      await page.waitForURL(item.url);
      await expect(page.getByRole("heading", { name: item.heading }).first()).toBeVisible();
    }
  });
});
