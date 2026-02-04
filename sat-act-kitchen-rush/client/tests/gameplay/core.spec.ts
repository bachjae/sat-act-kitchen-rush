import { test, expect } from '@playwright/test';

test.describe('Core Gameplay', () => {
  test('should login as guest and start session', async ({ page }) => {
    await page.goto('/');

    // Auth Modal should be visible
    await expect(page.locator('text=WELCOME CHEF!')).toBeVisible();

    // Click Continue as Guest
    await page.click('text=CONTINUE AS GUEST');

    // Main Menu should be visible
    await expect(page.locator('text=SAT/ACT KITCHEN RUSH')).toBeVisible();

    // Click Start Solo Session
    await page.click('text=START SOLO SESSION');

    // Session selection modal
    await expect(page.locator('text=SELECT SESSION')).toBeVisible();
    await page.click('text=Quick Service');

    // Kitchen should be visible (canvas)
    await expect(page.locator('canvas')).toBeVisible();

    // HUD should show score
    await expect(page.locator('text=Score')).toBeVisible();
  });
});
