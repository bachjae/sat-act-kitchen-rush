# SAT/ACT Kitchen Rush - Playwright Testing Guide (MCP)

## Table of Contents
1. [Test Setup](#test-setup)
2. [Core Gameplay Tests](#core-gameplay-tests)
3. [Multiplayer Tests](#multiplayer-tests)
4. [User Flow Tests](#user-flow-tests)
5. [Data Persistence Tests](#data-persistence-tests)
6. [Running Tests](#running-tests)

---

## 1. Test Setup

### Installation

```powershell
cd client
npm install -D @playwright/test@1.40.0
npx playwright install
```

### Configuration

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Test File Structure

```
client/tests/
├── auth/
│   ├── login.spec.ts
│   ├── signup.spec.ts
│   └── anonymous.spec.ts
├── gameplay/
│   ├── solo-session.spec.ts
│   ├── movement.spec.ts
│   ├── stations.spec.ts
│   ├── questions.spec.ts
│   ├── orders.spec.ts
│   └── scoring.spec.ts
├── multiplayer/
│   ├── room-creation.spec.ts
│   ├── joining.spec.ts
│   ├── coop-gameplay.spec.ts
│   └── synchronization.spec.ts
├── ui/
│   ├── main-menu.spec.ts
│   ├── settings.spec.ts
│   ├── profile.spec.ts
│   └── recap-screen.spec.ts
├── data/
│   ├── firebase-connection.spec.ts
│   ├── question-loading.spec.ts
│   └── session-persistence.spec.ts
└── helpers/
    ├── fixtures.ts
    ├── test-data.ts
    └── page-objects.ts
```

---

## 2. Core Gameplay Tests

### Test: Solo Session Complete Flow

**tests/gameplay/solo-session.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/fixtures';

test.describe('Solo Session - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsTestUser(page);
  });

  test('should complete full standard session', async ({ page }) => {
    // Start session
    await page.click('button:has-text("Start Solo Session")');
    await page.click('button:has-text("Standard (30 min)")');
    
    // Wait for kitchen to load
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('[data-testid="hud-score"]')).toBeVisible();
    
    // Check initial state
    const scoreText = await page.locator('[data-testid="hud-score"]').textContent();
    expect(scoreText).toContain('0');
    
    // Check orders appear
    await expect(page.locator('[data-testid="order-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Complete first order (simplified test - just check stations)
    await page.click('[data-testid="station-ticket-board"]');
    await expect(page.locator('[data-testid="question-modal"]')).toBeVisible();
    
    // Answer question
    await page.click('[data-testid="choice-B"]'); // Assume B is correct
    await page.click('button:has-text("Submit")');
    
    // Check feedback
    await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();
    await page.click('button:has-text("Continue")');
    
    // Move to fridge
    await page.click('[data-testid="station-fridge"]');
    await expect(page.locator('[data-testid="question-modal"]')).toBeVisible();
    
    // Answer fridge question
    await page.click('[data-testid="choice-A"]');
    await page.click('button:has-text("Submit")');
    await page.click('button:has-text("Continue")');
    
    // Continue through prep, stove, plating stations...
    // (Similar pattern for each station)
    
    // Complete order
    await page.click('[data-testid="station-serving-window"]');
    
    // Check score increased
    const newScoreText = await page.locator('[data-testid="hud-score"]').textContent();
    expect(parseInt(newScoreText || '0')).toBeGreaterThan(0);
    
    // End session early for testing
    await page.click('[data-testid="menu-button"]');
    await page.click('button:has-text("End Session")');
    await page.click('button:has-text("Confirm")');
    
    // Check recap screen appears
    await expect(page.locator('[data-testid="recap-screen"]')).toBeVisible({ timeout: 5000 });
    
    // Verify recap data
    await expect(page.locator('[data-testid="recap-accuracy"]')).toContainText('%');
    await expect(page.locator('[data-testid="recap-coins-earned"]')).toBeVisible();
  });
  
  test('should handle quick session (10 min)', async ({ page }) => {
    await page.click('button:has-text("Start Solo Session")');
    await page.click('button:has-text("Quick (10 min)")');
    
    await expect(page.locator('canvas')).toBeVisible();
    
    // Check fewer orders for quick session
    const orderCount = await page.locator('[data-testid="order-card"]').count();
    expect(orderCount).toBeLessThanOrEqual(4);
  });
});
```

### Test: Player Movement

**tests/gameplay/movement.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Player Movement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Start quick session
    await page.click('button:has-text("Start Solo Session")');
    await page.click('button:has-text("Quick (10 min)")');
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should move player when clicking floor', async ({ page }) => {
    const canvas = page.locator('canvas');
    
    // Get initial player position (via custom attribute or API)
    const initialPos = await page.evaluate(() => {
      return (window as any).gameState?.playerPosition;
    });
    
    // Click on canvas to move
    await canvas.click({ position: { x: 400, y: 400 } });
    
    // Wait for movement
    await page.waitForTimeout(1000);
    
    // Check player moved
    const newPos = await page.evaluate(() => {
      return (window as any).gameState?.playerPosition;
    });
    
    expect(newPos.x).not.toBe(initialPos.x);
    expect(newPos.y).not.toBe(initialPos.y);
  });
  
  test('should not move through walls', async ({ page }) => {
    // Try to click on wall area
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 50, y: 150 } }); // Wall position
    
    await page.waitForTimeout(500);
    
    const pos = await page.evaluate(() => {
      return (window as any).gameState?.playerPosition;
    });
    
    // Player should not be inside wall collision box
    expect(pos.x).toBeGreaterThan(100); // Outside wall area
  });
});
```

### Test: Station Interactions

**tests/gameplay/stations.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Station Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Solo Session")');
    await page.click('button:has-text("Quick (10 min)")');
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should open question modal when clicking station', async ({ page }) => {
    await page.click('[data-testid="station-fridge"]');
    
    await expect(page.locator('[data-testid="question-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="question-stem"]')).toBeVisible();
    await expect(page.locator('[data-testid="choice-A"]')).toBeVisible();
  });
  
  test('should show correct feedback for right answer', async ({ page }) => {
    await page.click('[data-testid="station-fridge"]');
    await expect(page.locator('[data-testid="question-modal"]')).toBeVisible();
    
    // Get correct answer from data attribute
    const correctId = await page.locator('[data-testid="question-modal"]').getAttribute('data-correct-answer');
    
    // Click correct answer
    await page.click(`[data-testid="choice-${correctId}"]`);
    await page.click('button:has-text("Submit")');
    
    // Check feedback is positive
    await expect(page.locator('[data-testid="answer-feedback"]')).toContainText('Correct');
    await expect(page.locator('[data-testid="answer-feedback"]')).toHaveClass(/correct/);
  });
  
  test('should show incorrect feedback for wrong answer', async ({ page }) => {
    await page.click('[data-testid="station-fridge"]');
    await expect(page.locator('[data-testid="question-modal"]')).toBeVisible();
    
    // Get correct answer
    const correctId = await page.locator('[data-testid="question-modal"]').getAttribute('data-correct-answer');
    
    // Click wrong answer
    const wrongId = correctId === 'A' ? 'B' : 'A';
    await page.click(`[data-testid="choice-${wrongId}"]`);
    await page.click('button:has-text("Submit")');
    
    // Check feedback is negative
    await expect(page.locator('[data-testid="answer-feedback"]')).toContainText('Incorrect');
    await expect(page.locator('[data-testid="answer-feedback"]')).toHaveClass(/incorrect/);
  });
  
  test('should disable stations until previous step complete', async ({ page }) => {
    // Try to click prep station before completing fridge
    const prepStation = page.locator('[data-testid="station-prep"]');
    
    // Should be disabled or not clickable
    const isDisabled = await prepStation.getAttribute('data-disabled');
    expect(isDisabled).toBe('true');
  });
  
  test('should show timer for each question', async ({ page }) => {
    await page.click('[data-testid="station-fridge"]');
    await expect(page.locator('[data-testid="question-modal"]')).toBeVisible();
    
    // Check timer exists and counts down
    await expect(page.locator('[data-testid="question-timer"]')).toBeVisible();
    
    const initialTime = await page.locator('[data-testid="question-timer"]').textContent();
    await page.waitForTimeout(2000);
    const laterTime = await page.locator('[data-testid="question-timer"]').textContent();
    
    expect(parseInt(laterTime || '0')).toBeLessThan(parseInt(initialTime || '100'));
  });
});
```

### Test: Order System

**tests/gameplay/orders.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Order System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Solo Session")');
    await page.click('button:has-text("Quick (10 min)")');
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should display orders with correct information', async ({ page }) => {
    await expect(page.locator('[data-testid="order-card"]').first()).toBeVisible({ timeout: 10000 });
    
    const firstOrder = page.locator('[data-testid="order-card"]').first();
    
    // Check order has required elements
    await expect(firstOrder.locator('[data-testid="order-dish-name"]')).toBeVisible();
    await expect(firstOrder.locator('[data-testid="order-timer"]')).toBeVisible();
    await expect(firstOrder.locator('[data-testid="order-steps"]')).toBeVisible();
  });
  
  test('should update order progress as stations complete', async ({ page }) => {
    const firstOrder = page.locator('[data-testid="order-card"]').first();
    
    // Initial state: no steps complete
    const initialComplete = await firstOrder.locator('[data-testid="step-complete"]').count();
    expect(initialComplete).toBe(0);
    
    // Complete ticket station
    await page.click('[data-testid="station-ticket-board"]');
    await page.click('[data-testid="choice-A"]');
    await page.click('button:has-text("Submit")');
    await page.click('button:has-text("Continue")');
    
    // Check one step complete
    const afterTicket = await firstOrder.locator('[data-testid="step-complete"]').count();
    expect(afterTicket).toBe(1);
  });
  
  test('should fail order when time expires', async ({ page }) => {
    // Wait for order timer to expire (speed up for testing)
    await page.evaluate(() => {
      (window as any).gameState.orders[0].timeRemaining = 1;
    });
    
    await page.waitForTimeout(2000);
    
    // Check order marked as failed
    const firstOrder = page.locator('[data-testid="order-card"]').first();
    await expect(firstOrder).toHaveClass(/failed/);
  });
  
  test('should calculate dish quality based on performance', async ({ page }) => {
    // Complete full order perfectly (fast + correct)
    // (Detailed step execution)
    
    // Check final quality stars
    const qualityStars = page.locator('[data-testid="dish-quality-stars"]');
    const starCount = await qualityStars.getAttribute('data-stars');
    expect(parseInt(starCount || '0')).toBeGreaterThanOrEqual(3);
  });
});
```

### Test: Scoring System

**tests/gameplay/scoring.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Scoring System', () => {
  test('should increase score for correct answers', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Solo Session")');
    await page.click('button:has-text("Quick (10 min)")');
    await expect(page.locator('canvas')).toBeVisible();
    
    // Get initial score
    const initialScore = await page.locator('[data-testid="hud-score"]').textContent();
    
    // Answer question correctly
    await page.click('[data-testid="station-fridge"]');
    const correctId = await page.locator('[data-testid="question-modal"]').getAttribute('data-correct-answer');
    await page.click(`[data-testid="choice-${correctId}"]`);
    await page.click('button:has-text("Submit")');
    await page.click('button:has-text("Continue")');
    
    // Check score increased
    const newScore = await page.locator('[data-testid="hud-score"]').textContent();
    expect(parseInt(newScore || '0')).toBeGreaterThan(parseInt(initialScore || '0'));
  });
  
  test('should award coins based on performance', async ({ page }) => {
    // Complete session
    // Check coins awarded in recap
    
    await expect(page.locator('[data-testid="coins-earned"]')).toContainText('+');
  });
  
  test('should track accuracy percentage', async ({ page }) => {
    // Answer mix of correct and incorrect
    // Check accuracy calculation in HUD and recap
  });
});
```

---

## 3. Multiplayer Tests

### Test: Room Creation

**tests/multiplayer/room-creation.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Multiplayer - Room Creation', () => {
  test('should create room and show code', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Multiplayer")');
    await page.click('button:has-text("Create Room")');
    
    // Select mode
    await page.click('[data-testid="mode-coop"]');
    await page.click('button:has-text("Continue")');
    
    // Check lobby screen with code
    await expect(page.locator('[data-testid="lobby-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="room-code"]')).toBeVisible();
    
    const roomCode = await page.locator('[data-testid="room-code"]').textContent();
    expect(roomCode).toMatch(/^\d{6}$/); // 6-digit code
  });
});
```

### Test: Joining Room

**tests/multiplayer/joining.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Multiplayer - Joining', () => {
  test('should join room with valid code', async ({ browser }) => {
    // Host creates room
    const hostPage = await browser.newPage();
    await hostPage.goto('/');
    await hostPage.click('button:has-text("Multiplayer")');
    await hostPage.click('button:has-text("Create Room")');
    await hostPage.click('[data-testid="mode-coop"]');
    await hostPage.click('button:has-text("Continue")');
    
    const roomCode = await hostPage.locator('[data-testid="room-code"]').textContent();
    
    // Player joins room
    const playerPage = await browser.newPage();
    await playerPage.goto('/');
    await playerPage.click('button:has-text("Multiplayer")');
    await playerPage.click('button:has-text("Join Room")');
    await playerPage.fill('[data-testid="room-code-input"]', roomCode || '');
    await playerPage.click('button:has-text("Join")');
    
    // Check both see lobby
    await expect(hostPage.locator('[data-testid="player-list"]')).toContainText('Player 2');
    await expect(playerPage.locator('[data-testid="lobby-screen"]')).toBeVisible();
    
    await hostPage.close();
    await playerPage.close();
  });
  
  test('should show error for invalid code', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Multiplayer")');
    await page.click('button:has-text("Join Room")');
    await page.fill('[data-testid="room-code-input"]', '999999');
    await page.click('button:has-text("Join")');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Room not found');
  });
});
```

### Test: Co-op Gameplay

**tests/multiplayer/coop-gameplay.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Multiplayer - Co-op Gameplay', () => {
  test('should synchronize order progress between players', async ({ browser }) => {
    // Setup: Host and player in same room
    const hostPage = await browser.newPage();
    const playerPage = await browser.newPage();
    
    // Create and join room
    await hostPage.goto('/');
    await hostPage.click('button:has-text("Multiplayer")');
    await hostPage.click('button:has-text("Create Room")');
    await hostPage.click('[data-testid="mode-coop"]');
    await hostPage.click('button:has-text("Continue")');
    
    const roomCode = await hostPage.locator('[data-testid="room-code"]').textContent();
    
    await playerPage.goto('/');
    await playerPage.click('button:has-text("Multiplayer")');
    await playerPage.click('button:has-text("Join Room")');
    await playerPage.fill('[data-testid="room-code-input"]', roomCode || '');
    await playerPage.click('button:has-text("Join")');
    
    // Both ready up
    await hostPage.click('[data-testid="ready-button"]');
    await playerPage.click('[data-testid="ready-button"]');
    
    // Host starts session
    await hostPage.click('button:has-text("Start Session")');
    
    // Both should see kitchen
    await expect(hostPage.locator('canvas')).toBeVisible();
    await expect(playerPage.locator('canvas')).toBeVisible();
    
    // Host completes fridge station
    await hostPage.click('[data-testid="station-fridge"]');
    await hostPage.click('[data-testid="choice-A"]');
    await hostPage.click('button:has-text("Submit")');
    await hostPage.click('button:has-text("Continue")');
    
    // Player should see order progress update
    await expect(playerPage.locator('[data-testid="order-card"] [data-testid="step-complete"]')).toBeVisible({ timeout: 5000 });
    
    await hostPage.close();
    await playerPage.close();
  });
  
  test('should show both players on map', async ({ browser }) => {
    // Similar setup
    // Check that both player sprites visible
    
    const hostPlayerCount = await hostPage.evaluate(() => {
      return (window as any).gameState.players.length;
    });
    
    expect(hostPlayerCount).toBe(2);
  });
});
```

---

## 4. User Flow Tests

### Test: First-Time User Onboarding

**tests/ui/onboarding.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should show tutorial for first-time users', async ({ page }) => {
    await page.goto('/');
    
    // Check if tutorial modal appears
    const tutorial = page.locator('[data-testid="tutorial-modal"]');
    if (await tutorial.isVisible()) {
      await expect(tutorial).toContainText('Welcome');
      await page.click('button:has-text("Next")');
      // Step through tutorial
      await page.click('button:has-text("Got it!")');
    }
  });
});
```

### Test: Settings and Preferences

**tests/ui/settings.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test('should save accessibility settings', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="settings-button"]');
    
    // Toggle colorblind mode
    await page.click('[data-testid="colorblind-mode-toggle"]');
    
    // Save
    await page.click('button:has-text("Save")');
    
    // Reload page
    await page.reload();
    await page.click('[data-testid="settings-button"]');
    
    // Check setting persisted
    const toggle = page.locator('[data-testid="colorblind-mode-toggle"]');
    await expect(toggle).toBeChecked();
  });
});
```

---

## 5. Data Persistence Tests

**tests/data/firebase-connection.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Firebase Connection', () => {
  test('should save session data to Firestore', async ({ page }) => {
    // Complete session
    // Check that session document created in Firestore
    
    const sessionId = await page.evaluate(() => {
      return localStorage.getItem('lastSessionId');
    });
    
    expect(sessionId).toBeTruthy();
  });
  
  test('should update skill mastery after session', async ({ page }) => {
    // Complete session with specific skill focus
    // Check mastery updated in database
  });
});
```

---

## 6. Running Tests

### Commands

```powershell
# Run all tests
npm run test

# Run specific test file
npx playwright test tests/gameplay/solo-session.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Debug mode (interactive)
npx playwright test --debug

# Generate and view HTML report
npx playwright show-report
```

### Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report"
  }
}
```

### CI/CD Integration

**.github/workflows/test.yml:**
```yaml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - name: Install dependencies
        run: |
          cd client
          npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm run test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 7. Test Coverage Goals

**Target Coverage:**
- Core gameplay: 90%+
- UI components: 80%+
- Data persistence: 85%+
- Multiplayer: 75%+ (harder to test)

**Priority Test Areas:**
1. Complete solo session flow (critical path)
2. Question answering and feedback
3. Order completion and scoring
4. Session persistence
5. Multiplayer synchronization

---

**Testing guide complete! Ready for comprehensive QA.** ✅
