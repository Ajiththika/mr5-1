import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = process.env.PLAYWRIGHT_WEB_URL || 'http://localhost:3000';
const API = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000';
const OUT = path.join(process.cwd(), 'demo-screenshots');

const STUDENT = { email: 'student@mr5school.com', password: 'Student@123456' };
const ONBOARD = { email: 'onboard@mr5school.com', password: 'Onboard@123456' };
const ADMIN = { email: 'admin@mr5school.com', password: 'Admin@123456' };

async function snap(page: import('@playwright/test').Page, name: string, fullPage = true) {
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
}

async function skipIntro(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('hasSeenIntro_v1', 'true');
    window.sessionStorage.setItem('hasSeenGlobalLoading', 'true');
    window.localStorage.setItem('mr5_product_tour_completed_v1', 'true');
    window.localStorage.setItem(
      'userPreferences',
      JSON.stringify({
        theme: 'system',
        language: 'en',
        notifications: { email: true, push: true, inApp: true },
        privacy: { profileVisibility: 'public', activityStatus: true },
        accessibility: { highContrast: false, reducedMotion: false, fontSize: 'medium' },
      }),
    );
  });
}

async function login(page: import('@playwright/test').Page, creds: { email: string; password: string }) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(student|dashboard|onboarding|admin)/, { timeout: 45000 });
}

test('capture demo screenshots', async ({ page, request }) => {
  test.setTimeout(600000);
  fs.mkdirSync(OUT, { recursive: true });
  await skipIntro(page);

  await page.goto(BASE);
  await page.waitForLoadState('domcontentloaded');
  await snap(page, '01-landing-desktop');

  await page.goto(`${BASE}/login`);
  await snap(page, '02-login-desktop');

  await page.goto(`${BASE}/register`);
  await snap(page, '03-signup-desktop');

  await page.goto(`${BASE}/courses`);
  await page.waitForLoadState('domcontentloaded');
  await snap(page, '07-courses-list-desktop');

  await login(page, ONBOARD);
  if (page.url().includes('/onboarding')) {
    await snap(page, '04-onboarding-step1-desktop');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await snap(page, '05-onboarding-step2-avatar-desktop');
    await page.locator('button').filter({ hasText: 'Cadet Blue' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await snap(page, '06-onboarding-step3-courses-desktop');
  }

  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await skipIntro(page);
  await login(page, STUDENT);

  await page.goto(`${BASE}/student/portal`);
  await page.waitForLoadState('domcontentloaded');
  await snap(page, '08-dashboard-desktop');

  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState('domcontentloaded');
  await snap(page, '13-profile-desktop');

  const editBtn = page.getByRole('button', { name: 'Edit Profile' });
  if (await editBtn.isVisible().catch(() => false)) {
    await editBtn.click();
    await page.waitForTimeout(500);
    await snap(page, '06b-avatar-customization-desktop');
    await page.keyboard.press('Escape');
  }

  await page.goto(`${BASE}/shop`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await snap(page, '14-shop-desktop');

  await page.goto(`${BASE}/student/portal`);
  await page.waitForLoadState('domcontentloaded');
  await snap(page, '15-student-portal-progress-desktop');

  const coursesRes = await request.get(`${API}/api/courses`);
  const coursesJson = await coursesRes.json();
  const course = coursesJson.data?.[0];
  if (course?._id) {
    await page.goto(`${BASE}/course/${course._id}`);
    await page.waitForLoadState('domcontentloaded');
    await snap(page, '09-course-detail-desktop');

    const lessonsRes = await request.get(`${API}/api/lessons?course=${course._id}`);
    const lessonsJson = await lessonsRes.json();
    const lesson = lessonsJson.data?.[0];
    if (lesson?._id) {
      await page.goto(`${BASE}/course/${course._id}/lesson/${lesson._id}`);
      await page.waitForLoadState('domcontentloaded');
      await snap(page, '10-lesson-player-desktop');

      await page.goto(`${BASE}/course/${course._id}/room/classroom`);
      await page.waitForTimeout(5000);
      await snap(page, '11-3d-classroom-desktop', false);

      await page.goto(`${BASE}/course/${course._id}/school`);
      await page.waitForTimeout(4000);
      await snap(page, '12-campus-3d-desktop', false);
    }
  }

  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await skipIntro(page);
  await login(page, ADMIN);
  await page.goto(`${BASE}/admin`);
  await page.waitForLoadState('domcontentloaded');
  await snap(page, '16-admin-dashboard-desktop');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await skipIntro(page);
  await page.goto(BASE);
  await snap(page, 'm01-landing-mobile');

  await page.goto(`${BASE}/login`);
  await snap(page, 'm02-login-mobile');

  await login(page, STUDENT);
  await page.goto(`${BASE}/student/portal`);
  await snap(page, 'm03-dashboard-mobile');

  await page.goto(`${BASE}/courses`);
  await snap(page, 'm04-courses-mobile');
});
