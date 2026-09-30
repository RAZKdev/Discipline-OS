import { test, expect } from '@playwright/test';

test.describe('Discipline-OS: End-to-End Workflow & Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure deterministic initial state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Complete Flow: Landing → Today → Complete Tasks → Unlock Gate → Redeem Reward in Catalog', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/Discipline-OS/i);

    const heroHeading = page.locator('#hero-title');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Konsistensi Harian');

    // 2. Click Hero CTA to navigate to /today
    const heroCta = page.getByTestId('btn-hero-today');
    await expect(heroCta).toBeVisible();
    await heroCta.click();

    await page.waitForURL('**/today');
    expect(page.url()).toContain('/today');

    // 3. Verify Today Page loaded with Tasks & Entertainment Gate Banner
    const todayHeading = page.getByRole('heading', { name: 'Rutinitas Hari Ini' });
    await expect(todayHeading).toBeVisible();

    const gateBanner = page.getByTestId('entertainment-gate-banner');
    await expect(gateBanner).toBeVisible();

    const initialBadge = page.getByTestId('gate-status-badge');
    await expect(initialBadge).toContainText('🔒 Terkunci');

    // Verify task checkboxes exist
    const checkboxes = page.getByTestId('task-checkbox');
    await expect(checkboxes.first()).toBeVisible();
    const taskCount = await checkboxes.count();
    expect(taskCount).toBeGreaterThanOrEqual(3);

    // 4. Complete Tasks 1, 2, and 3
    // Task 1
    await checkboxes.nth(0).click();
    await page.waitForTimeout(400);

    // Task 2
    await checkboxes.nth(1).click();
    await page.waitForTimeout(400);

    // Task 3 (Completes the requirement of 3 tasks for the gate)
    await checkboxes.nth(2).click();
    await page.waitForTimeout(500);

    // 5. Verify Gate is now UNLOCKED
    await expect(initialBadge).toContainText('🔓 Terbuka');
    const unlockedProgress = page.getByTestId('gate-progress-text');
    await expect(unlockedProgress).toContainText('100%');

    // Verify "Buka Gerbang & Lihat Katalog Hadiah →" button is visible
    const viewCatalogBtn = page.getByTestId('btn-view-rewards-catalog');
    await expect(viewCatalogBtn).toBeVisible();

    // 6. Navigate to /rewards via the gate unlock button
    await viewCatalogBtn.click();
    await page.waitForURL('**/rewards');
    expect(page.url()).toContain('/rewards');

    // 7. Verify Points Balance on Rewards Page
    const pointsBalanceElem = page.getByTestId('points-balance');
    await expect(pointsBalanceElem).toBeVisible();
    // 50 base starting points + 3 tasks completed (3 * 10 = 30) = 80 points
    await expect(pointsBalanceElem).toContainText('80 Poin');

    // 8. Redeem a Reward (e.g. reward-1: "Istirahat Santai 30 Menit", costs 20 points)
    const redeemBtn1 = page.getByTestId('btn-redeem-reward-1');
    await expect(redeemBtn1).toBeVisible();
    await expect(redeemBtn1).toBeEnabled();
    await expect(redeemBtn1).toContainText('Tukar Hadiah');

    await redeemBtn1.click();

    // Verify feedback notification appears
    const feedbackAlert = page.getByTestId('feedback-alert');
    await expect(feedbackAlert).toBeVisible();
    await expect(feedbackAlert).toContainText('berhasil ditukarkan');

    // Verify points balance is deducted (80 - 20 = 60 Poin)
    await expect(pointsBalanceElem).toContainText('60 Poin');

    // Verify button is now marked as redeemed
    await expect(redeemBtn1).toContainText('Sudah Ditukar');
    await expect(redeemBtn1).toBeDisabled();
  });

  test('Guilt-Free & No-Shame Flow: Skip task with peaceful reason', async ({ page }) => {
    await page.goto('/today');

    // Click "Lewatkan Hari Ini" on the first task
    const skipBtn = page.getByRole('button', { name: 'Lewatkan Hari Ini' }).first();
    await expect(skipBtn).toBeVisible();
    await skipBtn.click();

    // Choose peaceful reason
    const reasonBtn = page.getByRole('button', { name: 'Energi sedang rendah / Perlu istirahat' });
    await expect(reasonBtn).toBeVisible();
    await reasonBtn.click();

    // Verify feedback message confirms no penalty
    const feedback = page.getByRole('status');
    await expect(feedback).toBeVisible();
    await expect(feedback).toContainText('Tugas dilewatkan dengan tenang tanpa penalti');
  });

  test('Settings Page: Streak toggle and Quiet Hours preferences', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Pengaturan & Preferensi' })).toBeVisible();

    // Check streak toggle
    const streakToggle = page.locator('#streak-toggle');
    await expect(streakToggle).toBeAttached();
    await expect(streakToggle).toBeChecked();

    // Toggle streak off via its accessible label
    const streakLabel = page.locator('label[for="streak-toggle"]');
    await streakLabel.click();
    await expect(streakToggle).not.toBeChecked();

    // Verify auto-saved status notification appears
    const statusMsg = page.getByRole('status');
    await expect(statusMsg).toBeVisible();
    await expect(statusMsg).toContainText('Preferensi berhasil disimpan');

    // Verify quiet hours inputs exist and can be modified
    const quietStart = page.locator('#quiet-start');
    const quietEnd = page.locator('#quiet-end');
    await expect(quietStart).toBeVisible();
    await expect(quietEnd).toBeVisible();

    await quietStart.fill('22:00');
    await expect(quietStart).toHaveValue('22:00');
  });
});
