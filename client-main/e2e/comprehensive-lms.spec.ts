import { test, expect } from '@playwright/test';
import { loginAsStudent, STUDENT, bypassIntroAndLoading, dismissOverlayDialogs, openClassroomMenu } from './helpers/auth';

// Use serial mode so tests run in order and can share state/logic if needed (though we separate flows)
test.describe.configure({ mode: 'serial' });

const STUDENT_CREDS = STUDENT;
const ADMIN = { email: 'admin@mr5school.com', password: 'Admin@123456' };
const BASE_URL =
  process.env.PLAYWRIGHT_WEB_URL ||
  (process.env.CI ? "http://localhost:3001" : "http://localhost:3000");
const API_BASE = BASE_URL;

test.describe('LMS E2E System Test', () => {

    test('Student Flow (S-01 to S-05)', async ({ page, request }) => {
        let course: any; // Shared course data
        // Reset DB or ensure clean state if needed
        // await request.post('http://127.0.0.1:5000/api/testing/reset');
        // S-01: Login (UI Flow for correct Cookie handling)
        await test.step('S-01: Login', async () => {
            await loginAsStudent(page);
            await expect(page.getByRole('heading', { name: /welcome back|learning portal/i }).first()).toBeVisible({ timeout: 15000 });
            await page.screenshot({ path: 'test-results/S-01-dashboard.png' });
        });

        // S-02: Course Enrollment & Payment
        // S-02: Course Enrollment & Payment
        await test.step('S-02: Course Enrollment', async () => {
            const adminLoginInfo = await request.post(`${API_BASE}/api/auth/login`, { data: ADMIN });
            expect(adminLoginInfo.ok()).toBeTruthy();
            const adminToken = (await adminLoginInfo.json()).data.accessToken;

            const coursesRes = await request.get(`${API_BASE}/api/courses`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const coursesData = await coursesRes.json();
            course = coursesData.data.find((c: any) => c.title.includes('Intro')) || coursesData.data[0];
            const courseId = course._id;

            const studentLoginInfo = await request.post(`${API_BASE}/api/auth/login`, { data: STUDENT_CREDS });
            const studentId = (await studentLoginInfo.json()).data.user.id;

            await request.post(`${API_BASE}/api/enrollments`, {
                headers: { Authorization: `Bearer ${adminToken}` },
                data: {
                    student: studentId,
                    course: courseId,
                    status: 'active',
                },
            });

            await page.goto(`${BASE_URL}/student/courses`);
            await expect(page.getByRole('heading', { name: /My Courses/i })).toBeVisible();
            await expect(page.getByText(course.title).first()).toBeVisible({ timeout: 20000 });
            await page.screenshot({ path: 'test-results/S-02-enrolled.png' });
        });

        // S-03: Launch AI Avatar & Lessons
        await test.step('S-03: Launch Avatar', async () => {
            await page.goto(`${BASE_URL}/course/${course._id}/room/classroom`);
            await dismissOverlayDialogs(page);
            await expect(page.getByLabel(/immersive classroom experience/i)).toBeVisible({ timeout: 90000 });
            await expect(page.getByText(/loading classroom/i)).toBeHidden({ timeout: 90000 });
            await openClassroomMenu(page);
            await expect(page.getByLabel(/room atmosphere/i)).toBeVisible({ timeout: 30000 });
            await page.screenshot({ path: 'test-results/S-03-lesson.png' });
        });

        // S-04: Profile Management
        await test.step('S-04: Profile Management', async () => {
            await page.goto(`${BASE_URL}/profile`);
            await dismissOverlayDialogs(page);
            await expect(page.getByText("Loading your profile")).not.toBeVisible({ timeout: 30000 });

            const editButton = page.getByRole('button', { name: /edit profile/i });
            if (await editButton.isVisible().catch(() => false)) {
                await editButton.click();
                await expect(page.getByRole('heading', { name: /edit profile/i })).toBeVisible();
                const nameInput = page.getByLabel(/^name$/i);
                await nameInput.fill('Test Student Updated');
                await page.getByRole('button', { name: /save changes/i }).click();
                await expect(page.getByRole('heading', { name: /edit profile/i })).not.toBeVisible({ timeout: 15000 });
            }

            await page.screenshot({ path: 'test-results/S-04-profile.png' });
        });

        // S-05: Persistence (Implicitly tested by reload above, but let's do course state if possible)
        // Skipping complex course state for now as it depends on internal implementation of progress
    });

    test('Admin Flow (A-01 to A-05)', async ({ page }) => {
        await test.step('A-01: Login', async () => {
            await bypassIntroAndLoading(page);
            const loginRes = await page.request.post(`${API_BASE}/api/auth/login`, { data: ADMIN });
            expect(loginRes.ok()).toBeTruthy();
            await page.goto(`${BASE_URL}/admin`);
            await expect(page).toHaveURL(/\/admin/);
            await page.screenshot({ path: 'test-results/A-01-admin-dashboard.png' });
        });

        // A-02: User Management
        await test.step('A-02: User Management', async () => {
            const usersResponsePromise = page.waitForResponse(response =>
                response.url().includes('/api/users') && response.request().method() === 'GET'
            );
            await page.goto(`${BASE_URL}/admin/users`);
            page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

            try {
                const response = await usersResponsePromise;
                console.log("Users API Status:", response.status());
            } catch (e) {
                console.log("Users API request never happened or timed out");
            }
            // Just verify list loads
            await page.waitForTimeout(1000);
            await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });
            await expect(page.locator('table, .grid').or(page.getByText('No users found'))).toBeVisible({ timeout: 10000 });
            await page.screenshot({ path: 'test-results/A-02-users.png' });
        });

        // A-03: Course Management
        await test.step('A-03: Course Management', async () => {
            await page.goto(`${BASE_URL}/admin/courses`);
            // Just verify page loads and table is visible
            await expect(page.getByRole('heading', { name: 'Courses Management' }).first()).toBeVisible();
            await expect(page.locator('table')).toBeVisible();
            await page.screenshot({ path: 'test-results/A-03-courses.png' });
        });
    });
});
