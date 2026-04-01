/**
 * COMMAND One-Pager — Playwright smoke suite
 * Target: https://command.globalinkservices.io/one-pager → COMMAND_One_Pager_v20.html
 *
 * Covers:
 *   OP-01  Page loads, title correct, hero visible
 *   OP-02  Features section cards all visible (not stuck at opacity:0)
 *   OP-03  ACTIVATE COMMAND button reachable by scrolling
 *   OP-04  Clicking ACTIVATE reveals dashboard + intel card
 *   OP-05  Demo section visible after activation
 *   OP-06  Demo steps 1–5 advance via button click, dots update
 *   OP-07  Market position cards visible (not stuck at opacity:0)
 *   OP-08  Pricing section visible with correct tiers
 *   OP-09  Footer present with version tag
 *
 * Usage:
 *   npx playwright test one-pager.spec.ts
 *   npx playwright test one-pager.spec.ts --reporter=html
 */

import { test, expect } from '@playwright/test';

const BASE = (process.env.COMMAND_GL_BASE_URL ?? 'https://command.globalinkservices.io').replace(/\/$/, '');
const ONE_PAGER = `${BASE}/one-pager`;

/** Scroll page by delta pixels, wait for any animations to settle */
async function scrollBy(page: import('@playwright/test').Page, deltaY: number) {
  await page.mouse.wheel(0, deltaY);
  await page.waitForTimeout(120);
}

/** Scroll until an element enters the viewport (max 20 attempts × 400px) */
async function scrollUntilVisible(page: import('@playwright/test').Page, selector: string) {
  for (let i = 0; i < 20; i++) {
    const visible = await page.isVisible(selector);
    if (visible) return;
    await scrollBy(page, 400);
  }
  throw new Error(`scrollUntilVisible: "${selector}" never appeared after scrolling`);
}

// ─── OP-01: Page load ─────────────────────────────────────────────────────────

test('OP-01 — page loads, title and hero visible', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  // Title contains COMMAND
  await expect(page).toHaveTitle(/COMMAND/i);

  // Hero heading visible
  await expect(page.locator('h1')).toContainText(/bridge|boss/i);

  // Scroll hint initially visible
  await expect(page.locator('.scroll-hint')).toBeVisible();
});

// ─── OP-02: Feature cards visible ────────────────────────────────────────────

test('OP-02 — feature cards not stuck invisible', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  // Scroll down to features section
  await page.evaluate(() => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(600); // let GSAP entry animation fire

  const cards = page.locator('#features .feature-card');
  await expect(cards).toHaveCount(3);

  // All three must be visible (opacity > 0 — GSAP immediateRender:false fix)
  for (let i = 0; i < 3; i++) {
    await expect(cards.nth(i)).toBeVisible();
    const opacity = await cards.nth(i).evaluate(el => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.1);
  }
});

// ─── OP-03: ACTIVATE COMMAND button reachable ────────────────────────────────

test('OP-03 — ACTIVATE COMMAND button is reachable and enabled', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  // Scroll until the button is in view (goes through problem section lock)
  await scrollUntilVisible(page, '#activate-command');

  const btn = page.locator('#activate-command');
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
  await expect(btn).toContainText(/ACTIVATE COMMAND/i);
});

// ─── OP-04: Activation reveals dashboard ─────────────────────────────────────

test('OP-04 — clicking ACTIVATE reveals dashboard + intel card', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  await scrollUntilVisible(page, '#activate-command');
  await page.locator('#activate-command').click();

  // Dashboard view should become visible
  const dashboard = page.locator('#dashboard-view');
  await expect(dashboard).toBeVisible({ timeout: 2000 });

  // At least one agent card visible
  await expect(page.locator('.agent-card').first()).toBeVisible();

  // Intel card visible (the card that was getting cut off)
  const intel = page.locator('#intel-reveal');
  await expect(intel).toBeVisible({ timeout: 2000 });
});

// ─── OP-05: Demo section visible after activation ────────────────────────────

test('OP-05 — demo section visible and interactive after activation', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  await scrollUntilVisible(page, '#activate-command');
  await page.locator('#activate-command').click();
  await page.waitForTimeout(400);

  // Scroll to demo section
  await page.evaluate(() => {
    const el = document.getElementById('demo');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(500);

  // Demo headline visible
  await expect(page.locator('#demo h2')).toBeVisible();
  await expect(page.locator('#demo h2')).toContainText(/30 seconds/i);

  // Demo button visible
  await expect(page.locator('#demo-next')).toBeVisible();
});

// ─── OP-06: Demo steps advance ───────────────────────────────────────────────

test('OP-06 — demo advances through all 5 steps', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  await scrollUntilVisible(page, '#activate-command');
  await page.locator('#activate-command').click();
  await page.waitForTimeout(400);

  await page.evaluate(() => {
    const el = document.getElementById('demo');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(500);

  const btn = page.locator('#demo-next');
  const dots = page.locator('#step-dots .dot');

  // Step 1 — first dot active
  await expect(dots.first()).toHaveClass(/active/);

  // Advance through steps 1→5
  for (let step = 1; step <= 4; step++) {
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForTimeout(200);
    // Dot at index `step` should be active
    await expect(dots.nth(step)).toHaveClass(/active/);
  }

  // After step 5, button text should change (Complete / restart / hide)
  // At minimum, demo-left panel should have content
  const demoLeft = page.locator('#demo-left');
  await expect(demoLeft).not.toBeEmpty();
});

// ─── OP-07: Market position grid cards visible ───────────────────────────────

test('OP-07 — market position grid-cards not stuck invisible', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    const el = document.getElementById('positioning');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(600);

  const cards = page.locator('#positioning .grid-card');
  await expect(cards).toHaveCount(4);

  for (let i = 0; i < 4; i++) {
    await expect(cards.nth(i)).toBeVisible();
    const opacity = await cards.nth(i).evaluate(el => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.1);
  }
});

// ─── OP-08: Pricing section visible ──────────────────────────────────────────

test('OP-08 — pricing section visible with tier cards', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);

  await expect(page.locator('#pricing h2')).toBeVisible();
  await expect(page.locator('#pricing h2')).toContainText(/threshold|decision/i);

  // At least 2 pricing cards present
  const pricingCards = page.locator('#pricing .card');
  await expect(pricingCards).toHaveCount(await pricingCards.count());
  expect(await pricingCards.count()).toBeGreaterThanOrEqual(2);
});

// ─── OP-09: Footer with version tag ──────────────────────────────────────────

test('OP-09 — footer present with version tag', async ({ page }) => {
  await page.goto(ONE_PAGER, { waitUntil: 'networkidle' });

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(400);

  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  await expect(footer).toContainText(/one_pager/i);
  await expect(footer).toContainText(/v\d+/i);
});
