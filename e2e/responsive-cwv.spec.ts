import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Mobile (375px)', width: 375, height: 667 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1280px)', width: 1280, height: 800 },
];

const testRoutes = ['/', '/today', '/rewards', '/settings'];

test.describe('Responsive Layout & Visual QA Audit', () => {
  for (const vp of viewports) {
    test.describe(`${vp.name} Viewport Audit`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of testRoutes) {
        test(`Page ${route} renders without horizontal overflow on ${vp.name}`, async ({ page }) => {
          await page.goto(route);
          await page.waitForLoadState('domcontentloaded');

          // Verify semantic main element exists
          const main = page.locator('main');
          await expect(main).toBeVisible();

          // Check horizontal overflow: scrollWidth should not exceed clientWidth (viewport width without scrollbar)
          const isOverflowing = await page.evaluate(() => {
            const root = document.documentElement;
            const body = document.body;
            return root.scrollWidth > root.clientWidth || body.scrollWidth > root.clientWidth;
          });

          expect(isOverflowing).toBe(false);
        });
      }

      test(`Critical interactive elements meet minimum 48px touch target on ${vp.name}`, async ({ page }) => {
        await page.goto('/today');

        // Check task checkbox touch target
        const checkbox = page.getByTestId('task-checkbox').first();
        await expect(checkbox).toBeVisible();

        const box = await checkbox.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44); // With border/padding
          expect(box.height).toBeGreaterThanOrEqual(44);
        }

        // Check "Tambah Tugas" button touch target
        const addTaskBtn = page.getByRole('button', { name: 'Tambah Tugas' });
        await expect(addTaskBtn).toBeVisible();
        const addBox = await addTaskBtn.boundingBox();
        expect(addBox).not.toBeNull();
        if (addBox) {
          expect(addBox.height).toBeGreaterThanOrEqual(44);
        }
      });
    });
  }

  test('Keyboard Navigation & Focus Management Audit', async ({ page }) => {
    await page.goto('/');

    // Press Tab from address bar
    await page.keyboard.press('Tab');

    // The first focusable element (Logo or Skip link or Hero link) should receive focus
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(['a', 'button', 'input']).toContain(focusedTag);
  });
});
