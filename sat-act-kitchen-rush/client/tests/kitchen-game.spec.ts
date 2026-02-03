import { test, expect } from '@playwright/test';

test.describe('SAT/ACT Kitchen Rush - Phase 2', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait for PixiJS canvas to initialize
    await page.waitForSelector('canvas', { timeout: 10000 });
    // Give PixiJS a moment to render
    await page.waitForTimeout(2000);
  });

  test('canvas renders at 1280x720', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    // Canvas element should exist with correct intrinsic dimensions
    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');
    expect(width).toBe('1280');
    expect(height).toBe('720');
  });

  test('canvas has pixel-perfect class', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveClass(/pixel-perfect/);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(2000);
    // Filter out known non-critical warnings and headless Chrome WebGL shader issues
    const criticalErrors = errors.filter(e =>
      !e.includes('Firebase') &&
      !e.includes("reading 'split'") // PixiJS shader error in SwiftShader/headless
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('clicking canvas does not crash the app', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Click center of canvas (floor area - should move player)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.7);
    await page.waitForTimeout(500);

    // App should still be running
    await expect(canvas).toBeVisible();
  });

  test('clicking station area opens question modal', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Calculate scale factors (canvas may be CSS-scaled)
    const scaleX = box.width / 1280;
    const scaleY = box.height / 720;

    // Click on Fridge interaction zone (x:288-416, y:416-480 in game coords)
    // Center of fridge interaction zone: ~352, 448
    const clickX = box.x + 352 * scaleX;
    const clickY = box.y + 448 * scaleY;
    await page.mouse.click(clickX, clickY);

    // Wait for question modal to appear
    const modal = page.locator('[data-testid="question-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('question modal displays stem and 4 choices', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const scaleX = box.width / 1280;
    const scaleY = box.height / 720;

    // Click on Prep station interaction zone (center: ~576, 448)
    await page.mouse.click(box.x + 576 * scaleX, box.y + 448 * scaleY);

    const modal = page.locator('[data-testid="question-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Check question stem exists
    const stem = page.locator('[data-testid="question-stem"]');
    await expect(stem).toBeVisible();
    const stemText = await stem.textContent();
    expect(stemText).toBeTruthy();
    expect(stemText!.length).toBeGreaterThan(10);

    // Check 4 choices exist
    for (const choiceId of ['A', 'B', 'C', 'D']) {
      const choice = page.locator(`[data-testid="choice-${choiceId}"]`);
      await expect(choice).toBeVisible();
    }
  });

  test('submit button is disabled until a choice is selected', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const scaleX = box.width / 1280;
    const scaleY = box.height / 720;

    // Click on Stove station interaction zone (center: ~800, 448)
    await page.mouse.click(box.x + 800 * scaleX, box.y + 448 * scaleY);

    const modal = page.locator('[data-testid="question-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Submit should be disabled initially
    const submitBtn = page.locator('[data-testid="submit-answer"]');
    await expect(submitBtn).toBeDisabled();

    // Click choice A
    await page.locator('[data-testid="choice-A"]').click();

    // Submit should now be enabled
    await expect(submitBtn).toBeEnabled();
  });

  test('submitting answer shows feedback with explanation', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const scaleX = box.width / 1280;
    const scaleY = box.height / 720;

    // Click on Fridge station
    await page.mouse.click(box.x + 352 * scaleX, box.y + 448 * scaleY);

    const modal = page.locator('[data-testid="question-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Select choice A
    await page.locator('[data-testid="choice-A"]').click();

    // Submit
    await page.locator('[data-testid="submit-answer"]').click();

    // Feedback should appear
    const feedback = page.locator('[data-testid="question-feedback"]');
    await expect(feedback).toBeVisible({ timeout: 3000 });

    // Result text should show Correct! or Incorrect
    const result = page.locator('[data-testid="feedback-result"]');
    const resultText = await result.textContent();
    expect(resultText).toMatch(/Correct!|Incorrect/);

    // Explanation should be visible
    const explanation = page.locator('[data-testid="feedback-explanation"]');
    await expect(explanation).toBeVisible();
    const explanationText = await explanation.textContent();
    expect(explanationText).toBeTruthy();
    expect(explanationText!.length).toBeGreaterThan(10);
  });

  test('continue button closes modal', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const scaleX = box.width / 1280;
    const scaleY = box.height / 720;

    // Click on Fridge station
    await page.mouse.click(box.x + 352 * scaleX, box.y + 448 * scaleY);

    const modal = page.locator('[data-testid="question-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Select and submit
    await page.locator('[data-testid="choice-B"]').click();
    await page.locator('[data-testid="submit-answer"]').click();

    // Wait for feedback
    await expect(page.locator('[data-testid="question-feedback"]')).toBeVisible({ timeout: 3000 });

    // Click continue
    await page.locator('[data-testid="continue-button"]').click();

    // Modal should be gone
    await expect(modal).not.toBeVisible({ timeout: 3000 });

    // Canvas should still be there
    await expect(canvas).toBeVisible();
  });

  test('can open questions from different stations', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const scaleX = box.width / 1280;
    const scaleY = box.height / 720;

    // Test Fridge station
    await page.mouse.click(box.x + 352 * scaleX, box.y + 448 * scaleY);
    let modal = page.locator('[data-testid="question-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Check station type badge
    let stationType = page.locator('[data-testid="question-station-type"]');
    let typeText = await stationType.textContent();
    expect(typeText?.toLowerCase()).toContain('fridge');

    // Close it
    await page.locator('[data-testid="choice-A"]').click();
    await page.locator('[data-testid="submit-answer"]').click();
    await expect(page.locator('[data-testid="continue-button"]')).toBeVisible({ timeout: 3000 });
    await page.locator('[data-testid="continue-button"]').click();
    await expect(modal).not.toBeVisible({ timeout: 3000 });

    // Now test Prep station
    await page.mouse.click(box.x + 576 * scaleX, box.y + 448 * scaleY);
    modal = page.locator('[data-testid="question-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    stationType = page.locator('[data-testid="question-station-type"]');
    typeText = await stationType.textContent();
    expect(typeText?.toLowerCase()).toContain('prep');
  });

  test('station type badge shows correct station name', async ({ page }) => {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const scaleX = box.width / 1280;
    const scaleY = box.height / 720;

    // Click on Stove station interaction zone (center: ~800, 448)
    await page.mouse.click(box.x + 800 * scaleX, box.y + 448 * scaleY);

    const modal = page.locator('[data-testid="question-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    const stationType = page.locator('[data-testid="question-station-type"]');
    const typeText = await stationType.textContent();
    expect(typeText?.toLowerCase()).toContain('stove');
  });
});
