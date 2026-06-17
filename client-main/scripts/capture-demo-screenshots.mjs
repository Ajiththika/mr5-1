/**
 * Standalone demo screenshot capture script.
 * Run: node scripts/capture-demo-screenshots.mjs
 * Requires: API on :5001, client on :3000
 */
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../demo-screenshots');
const BASE = 'http://localhost:3000';

const USERS = {
  student: { email: 'student@mr5school.com', password: 'Student@123456' },
  onboard: { email: 'onboard@mr5school.com', password: 'Onboard@123456' },
  admin: { email: 'admin@mr5school.com', password: 'Admin@123456' },
};

async function snap(page, name, fullPage = true) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
  console.log(`  ✓ ${name}.png`);
}

async function skipIntro(page) {
  await page.addInitScript(() => {
    localStorage.setItem('hasSeenIntro_v1', 'true');
    sessionStorage.setItem('hasSeenGlobalLoading', 'true');
    localStorage.setItem(
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

async function applyAuth(page, creds) {
  await page.context().clearCookies();
  const res = await page.request.post(`${BASE}/api/auth/login`, { data: creds });
  if (!res.ok()) throw new Error(`Login failed: ${res.status()}`);
  const state = await page.request.storageState();
  await page.context().addCookies(state.cookies);
}

async function waitForAny(page, texts, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const text of texts) {
      if (await page.getByText(text, { exact: false }).first().isVisible().catch(() => false)) {
        await page.waitForTimeout(1000);
        return;
      }
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`Timed out waiting for: ${texts.join(' | ')}`);
}

async function getDemoCourseId(page) {
  const res = await page.request.get(`${BASE}/api/courses`);
  const json = await res.json();
  return json.data?.[0]?._id;
}

async function getFirstLessonId(page, courseId) {
  const res = await page.request.get(`${BASE}/api/lessons?course=${courseId}`);
  const json = await res.json();
  return json.data?.[0]?._id;
}

async function captureSection(label, fn) {
  console.log(label);
  try {
    await fn();
  } catch (err) {
    console.warn(`  ⚠ ${label} partial failure:`, err.message);
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await skipIntro(page);

  await captureSection('Capturing public pages...', async () => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await snap(page, '01-landing-desktop');
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await snap(page, '02-login-desktop');
    await page.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded' });
    await snap(page, '03-signup-desktop');
    await page.goto(`${BASE}/courses`, { waitUntil: 'domcontentloaded' });
    await snap(page, '07-courses-list-desktop');
  });

  await captureSection('Capturing onboarding...', async () => {
    await page.context().clearCookies();
    await skipIntro(page);
    await applyAuth(page, USERS.onboard);
    await page.goto(`${BASE}/onboarding`);
    await waitForAny(page, ['set up your profile']);
    await snap(page, '04-onboarding-step1-desktop');
    await page.locator('input[placeholder="Your name"]').fill('Demo Student');
    await page.locator('button').filter({ hasText: /^Next$/ }).first().click();
    await waitForAny(page, ['Choose your avatar']);
    await snap(page, '05-onboarding-step2-avatar-desktop');
    await page.locator('button').filter({ hasText: 'Cadet Blue' }).click();
    await page.locator('button').filter({ hasText: /^Next$/ }).first().click();
    await waitForAny(page, ['Explore your first course']);
    await snap(page, '06-onboarding-step3-courses-desktop');
  });

  await captureSection('Capturing student journey...', async () => {
    await page.context().clearCookies();
    await skipIntro(page);
    await applyAuth(page, USERS.student);
    await page.goto(`${BASE}/student/portal`);
    await waitForAny(page, ['Learning Portal', 'Ready to continue']);
    await snap(page, '08-dashboard-desktop');

    await page.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded' });
    await waitForAny(page, ['Edit Profile', 'Weekly Goal', 'Alex']);
    await snap(page, '13-profile-desktop');
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    await waitForAny(page, ['Avatar Preset', 'Edit Profile']);
    await snap(page, '06b-avatar-customization-desktop');
    await page.keyboard.press('Escape');

    await page.goto(`${BASE}/shop`, { waitUntil: 'domcontentloaded' });
    await waitForAny(page, ['Avatar Shop', 'Classic Cap']);
    await snap(page, '14-shop-desktop');

    await page.goto(`${BASE}/student/portal`, { waitUntil: 'domcontentloaded' });
    await waitForAny(page, ['Learning Portal', 'Welcome back']);
    await snap(page, '15-student-portal-progress-desktop');

    const courseId = await getDemoCourseId(page);
    if (!courseId) return;

    await page.goto(`${BASE}/course/${courseId}`, { waitUntil: 'domcontentloaded' });
    await waitForAny(page, ['Introduction to the 3D Campus', 'Virtual 3D Campus', 'Campus Encrypted']);
    await snap(page, '09-course-detail-desktop');

    const lessonId = await getFirstLessonId(page, courseId);
    if (!lessonId) return;

    await page.goto(`${BASE}/course/${courseId}/lesson/${lessonId}`, { waitUntil: 'domcontentloaded' });
    await waitForAny(page, ['Mark Complete', 'Welcome to Mr5']);
    await snap(page, '10-lesson-player-desktop');

    await page.goto(`${BASE}/course/${courseId}/room/classroom`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 60000 });
    await page.waitForTimeout(6000);
    await snap(page, '11-3d-classroom-desktop', false);

    await page.goto(`${BASE}/course/${courseId}/school`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 60000 });
    await page.waitForTimeout(6000);
    await snap(page, '12-campus-3d-desktop', false);
  });

  await captureSection('Capturing admin...', async () => {
    await page.context().clearCookies();
    await skipIntro(page);
    const adminRes = await page.request.post(`${BASE}/api/auth/login`, { data: USERS.admin });
    if (!adminRes.ok()) throw new Error('Admin login failed');
    const state = await page.request.storageState();
    await page.context().addCookies(state.cookies);
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    await waitForAny(page, ['Admin', 'Dashboard', 'Users', 'Overview']);
    await snap(page, '16-admin-dashboard-desktop');
  });

  await captureSection('Capturing mobile...', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.context().clearCookies();
    await skipIntro(page);
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await snap(page, 'm01-landing-mobile');
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await snap(page, 'm02-login-mobile');
    await applyAuth(page, USERS.student);
    await page.goto(`${BASE}/student/portal`);
    await waitForAny(page, ['Learning Portal', 'Ready to continue']);
    await snap(page, 'm03-dashboard-mobile');
    await page.goto(`${BASE}/courses`, { waitUntil: 'domcontentloaded' });
    await snap(page, 'm04-courses-mobile');
  });

  await browser.close();
  const count = fs.readdirSync(OUT).filter((f) => f.endsWith('.png')).length;
  console.log(`\nDone — ${count} screenshots in ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
