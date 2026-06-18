import { test, expect } from "@playwright/test";
import { loginAsStudent } from "./helpers/auth";

test.describe("Login and Dashboard Flow", () => {
  test("user can log in and see student dashboard", async ({ page }) => {
    await loginAsStudent(page);

    await expect(page).toHaveURL(/\/student\/portal/);
    await expect(
      page.getByRole("heading", { name: /welcome back/i }).first(),
    ).toBeVisible();
    await expect(page.getByText(/Active Courses|Avg\. Progress/i).first()).toBeVisible();
  });
});
