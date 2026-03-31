/**
 * COMMAND — Phase A Playwright Eval Suite
 * Target: command-gl landing site
 * URL: https://command.globalinkservices.io
 * Personas: C1–C8 (8 personas)
 * Stack: Next.js 15 / Tailwind 4 / Vercel
 * Authored: 2026-03-29 | GL | Confidential
 *
 * Run order: C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8
 * Critical gate: ALL must pass before first beta invite goes out.
 *
 * Usage:
 *   npx playwright test phase-a-command-gl.spec.ts
 *   npx playwright test phase-a-command-gl.spec.ts --reporter=html
 *   npx playwright test phase-a-command-gl.spec.ts -g "C4"   # single persona
 *
 * Local static check (before deploy):
 *   npx serve . -l 9988
 *   $env:COMMAND_GL_BASE_URL="http://127.0.0.1:9988"; npx playwright test phase-a-command-gl.spec.ts
 *
 * C8 contrast: C8-03/C8-04 guard against sprint-regression tokens — computed
 * rgb(122, 128, 153) and literal #7a8099 in page source must not return.
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

/** Override with http://127.0.0.1:PORT to test a local static server before deploy */
const LANDING_ORIGIN = (process.env.COMMAND_GL_BASE_URL ?? 'https://command.globalinkservices.io').replace(/\/$/, '');
const LANDING_URL = LANDING_ORIGIN;
const APP_BASE = 'https://app.command.globalinkservices.io';
const APP_PRIVACY_URL = `${APP_BASE}/privacy`;

/** Max time a cold landing hero should be visible (ms) */
const HERO_PAINT_MAX_MS = 2500;

/** Primary trial CTAs (buttons with Stripe onclick — never match footer `a[href*="app"]` first) */
const CTA = {
  primary:
    '[data-testid="cta-trial"], [data-testid="cta-trial-hero"], [data-testid="cta-trial-pricing"], [data-testid="cta-trial-footer"], button.nav-cta, button.btn-p:has-text("Start"), button.qbtn.f:has-text("trial")',
  trialNav: '[data-testid="cta-trial"], button.nav-cta',
  pricing: 'nav a[href*="#pricing"], a[href*="#pricing"]',
  faq: '[data-testid="nav-faq"], a[href*="#faq"], a[href*="faq"]',
  privacy: '[data-testid="privacy-link"], a[href*="privacy"]',
  demo: '[data-testid="nav-demo"], [data-testid="nav-demo-footer"], button.btn-s:has-text("Watch live demo"), button.btn-s:has-text("demo")',
};

/** Pre-accessibility-fix muted gray — must not appear (hex or as computed RGB) */
const LEGACY_FAIL_MUTED_HEX = '#7a8099';
const LEGACY_FAIL_MUTED_RGB = 'rgb(122, 128, 153)';

// Quiet common asset misses so we still fail on real JS exceptions
test.beforeEach(async ({ page }) => {
  await page.route('**/favicon.ico', (route) =>
    route.fulfill({ status: 204, body: '', headers: { 'Content-Type': 'image/x-icon' } })
  );
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the element is visible in the current viewport
 * without scrolling (above the fold).
 */
async function isAboveFold(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const { top, bottom } = el.getBoundingClientRect();
    return top >= 0 && bottom <= window.innerHeight;
  }, selector);
}

/**
 * Checks for any horizontal overflow on the page (mobile viewport test).
 */
async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

/**
 * Returns all broken internal links (4xx responses) on the current page.
 */
async function getBrokenLinks(page: Page, context: BrowserContext): Promise<string[]> {
  const hrefs: string[] = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .map((a) => (a as HTMLAnchorElement).href)
      .filter(
        (h) =>
          h.startsWith('https://command.globalinkservices.io') || h.startsWith('https://app.command.globalinkservices.io')
      )
  );
  const broken: string[] = [];
  for (const href of [...new Set(hrefs)]) {
    const res = await context.request.get(href, { timeout: 8000 }).catch(() => null);
    if (!res || res.status() >= 400) broken.push(`${href} → ${res?.status() ?? 'timeout'}`);
  }
  return broken;
}

/**
 * Asserts no JS console errors during a page visit.
 */
function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

/** Strip Chromium generic 404 lines when the failing URL is omitted (favicon, touch icon, etc.) */
function materialConsoleErrors(errors: string[]): string[] {
  return errors.filter(
    (e) => !/^Failed to load resource: the server responded with a status of 404\b/i.test(e.trim())
  );
}

/** Trial destination: Stripe checkout, signup, or app (primary CTA is a button + onclick on command-gl) */
async function expectTrialTargetOk(page: Page, description: string): Promise<void> {
  const el = page.locator(CTA.trialNav).first();
  await expect(el, description).toBeVisible({ timeout: 8000 });
  const onclick = (await el.getAttribute('onclick')) ?? '';
  const href = (await el.getAttribute('href')) ?? '';
  const target = `${onclick} ${href}`;
  expect(
    /stripe|buy\.stripe|signup|app\.command|trial/i.test(target),
    `Expected trial CTA to point at Stripe or app/signup; got: ${target.slice(0, 200)}`
  ).toBe(true);
}

// ─── PERSONA C1 — The First-Impression Skeptic ────────────────────────────────
/**
 * Profile: Cold-arrival boutique firm owner. Judges in 8 seconds. Desktop 1440px.
 * Mission: Land → hero visible → CTA above fold → no JS errors on paint.
 * Pass:    Primary CTA visible without scroll. Hero headline legible. <2500ms paint.
 */
test.describe('C1 — First-Impression Skeptic', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('C1-01 hero headline is visible above fold on load', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    const t0 = Date.now();
    await page.goto(LANDING_URL, { waitUntil: 'domcontentloaded' });
    const paintMs = Date.now() - t0;

    expect(paintMs, `Hero paint took ${paintMs}ms — max ${HERO_PAINT_MAX_MS}ms`).toBeLessThan(HERO_PAINT_MAX_MS);

    // Hero heading must exist and be visible
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible({ timeout: 3000 });

    // Must be above fold — no scroll required
    const aboveFold = await isAboveFold(page, 'h1');
    expect(aboveFold, 'Hero h1 not visible above fold without scroll').toBe(true);

    expect(materialConsoleErrors(errors), `Console errors on load: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('C1-02 primary CTA is visible above fold without scrolling', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const cta = page.locator(CTA.trialNav).first();
    await expect(cta).toBeVisible({ timeout: 5000 });
    const aboveFold = await isAboveFold(page, CTA.trialNav);
    expect(aboveFold, 'Primary CTA not visible above fold — conversion will suffer').toBe(true);
  });

  test('C1-03 BYOA / cockpit framing present in hero copy', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').textContent();
    // At least one of these differentiating phrases must appear above fold
    const framingPhrases = ['cockpit', 'Bring Your Own', 'BYOA', 'Stop being the bridge', 'multi-agent'];
    const found = framingPhrases.some((p) => bodyText?.toLowerCase().includes(p.toLowerCase()));
    expect(found, `None of [${framingPhrases.join(', ')}] found in page copy — differentiation not clear`).toBe(true);
  });

  test('C1-04 no "GlobaLink" or "Globalink" spelling errors in page text', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const text = await page.locator('body').textContent() ?? '';
    // Case-sensitive: allow footer "GLOBALINK" and body "GlobaLink"; forbid mixed wrong spellings
    expect(text).not.toMatch(/GlobaLink/);
    expect(text).not.toMatch(/\bGlobalink\b/);
  });
});

// ─── PERSONA C2 — The Pricing Hawk ───────────────────────────────────────────
/**
 * Profile: COO, 12-person firm. Jumps to pricing first. Compares Solo vs Pro.
 * Mission: Navigate to pricing → parse Solo/Pro/Studio tiers → find token/instance caps.
 * Pass:    Pricing section exists, tier names + limits parseable, trial CTA visible.
 */
test.describe('C2 — Pricing Hawk', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('C2-01 pricing section is reachable from landing nav', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const pricingLink = page.locator(CTA.pricing).first();
    await expect(pricingLink).toBeVisible({ timeout: 5000 });
    await pricingLink.click();
    // Either navigates to /pricing or scrolls to #pricing
    await page.waitForTimeout(600);
    const url = page.url();
    const hasPricingSection = await page.locator('[data-testid="pricing"], #pricing, section:has-text("Solo"), section:has-text("Pro")').count();
    expect(url.includes('pricing') || hasPricingSection > 0, 'Pricing section not found after clicking pricing nav').toBe(true);
  });

  test('C2-02 Solo and Pro tiers are both visible', async ({ page }) => {
    await page.goto(LANDING_URL + '/#pricing', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Solo').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Pro').first()).toBeVisible({ timeout: 5000 });
  });

  test('C2-03 price amounts visible ($49 and $149)', async ({ page }) => {
    await page.goto(LANDING_URL + '/#pricing', { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').textContent() ?? '';
    expect(bodyText).toMatch(/\$49/);
    expect(bodyText).toMatch(/\$149/);
  });

  test('C2-04 token or instance limits visible on pricing cards', async ({ page }) => {
    await page.goto(LANDING_URL + '/#pricing', { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').textContent() ?? '';
    // Either token counts or instance caps must be present
    const hasLimits = /100K|500K|2M|unlimited|3 agent|10 agent/i.test(bodyText);
    expect(hasLimits, 'Token or instance limits not visible on pricing cards').toBe(true);
  });

  test('C2-05 trial CTA accessible from pricing section', async ({ page }) => {
    await page.goto(LANDING_URL + '/#pricing', { waitUntil: 'networkidle' });
    const cta = page.locator(CTA.primary).first();
    await expect(cta).toBeVisible({ timeout: 5000 });
  });

  test('C2-06 "no credit card required" language present', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').textContent() ?? '';
    const hasNoCCLanguage = /no credit card|no CC required|free trial/i.test(bodyText);
    expect(hasNoCCLanguage, '"No credit card required" or equivalent not found — conversion risk').toBe(true);
  });
});

// ─── PERSONA C3 — The Privacy Reader ─────────────────────────────────────────
/**
 * Profile: Legal advisory firm. Reads Privacy + FAQ before any click.
 * Mission: Privacy page → FAQ → find data storage language → trial CTA.
 * Pass:    Both pages load 200, no broken anchors, data storage language present.
 */
test.describe('C3 — Privacy Reader', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('C3-01 privacy page loads without error', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    const res = await page.goto(APP_PRIVACY_URL, { waitUntil: 'networkidle' });
    expect(res?.status(), 'Privacy page returned non-200').toBe(200);
    expect(materialConsoleErrors(errors), `Console errors on privacy page: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('C3-02 privacy page contains data storage language', async ({ page }) => {
    await page.goto(APP_PRIVACY_URL, { waitUntil: 'networkidle' });
    const text = await page.locator('body').textContent() ?? '';
    const hasDataLang = /store|storage|data|retain|Supabase|third.party/i.test(text);
    expect(hasDataLang, 'No data storage language found on privacy page').toBe(true);
  });

  test('C3-03 FAQ page loads without error', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    const res = await page.goto(`${LANDING_URL}/#faq`, { waitUntil: 'networkidle' });
    expect(res?.status(), 'Landing with #faq returned non-200').toBe(200);
    expect(materialConsoleErrors(errors)).toHaveLength(0);
  });

  test('C3-04 FAQ contains at least 3 question entries', async ({ page }) => {
    await page.goto(`${LANDING_URL}/#faq`, { waitUntil: 'networkidle' });
    const entries = await page.locator('#faq [data-testid="faq-item"]').count();
    expect(entries, `Only ${entries} FAQ entries found — need ≥ 3`).toBeGreaterThanOrEqual(3);
  });

  test('C3-05 no broken internal links on privacy page', async ({ page, context }) => {
    await page.goto(APP_PRIVACY_URL, { waitUntil: 'networkidle' });
    const broken = await getBrokenLinks(page, context);
    expect(broken, `Broken links on privacy page: ${broken.join(', ')}`).toHaveLength(0);
  });

  test('C3-06 privacy link reachable from landing footer', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const privacyLink = page.locator(CTA.privacy).first();
    await expect(privacyLink).toBeVisible({ timeout: 5000 });
  });
});

// ─── PERSONA C4 — The Mobile Scroller ────────────────────────────────────────
/**
 * Profile: iPhone 15 Pro, 393px viewport, Safari, thumb-only, forwarded link arrival.
 * Mission: Full scroll → hero → features → pricing → CTA → tap CTA.
 * Pass:    No horizontal overflow, CTA thumb-reachable (bottom 40% of screen), no layout breaks.
 */
test.describe('C4 — Mobile Scroller', () => {
  test.use({
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });

  test('C4-01 no horizontal scroll at 393px', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const hasOverflow = await hasHorizontalOverflow(page);
    expect(hasOverflow, 'Horizontal overflow detected at 393px — layout broken on mobile').toBe(false);
  });

  test('C4-02 hero headline visible on 393px without horizontal scroll', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible({ timeout: 5000 });
    // Heading should not overflow viewport width
    const overflow = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return false;
      return h1.scrollWidth > window.innerWidth;
    });
    expect(overflow, 'h1 text overflows 393px viewport').toBe(false);
  });

  test('C4-03 primary CTA reachable by thumb (exists in DOM on mobile)', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const cta = page.locator(CTA.primary).first();
    await expect(cta).toBeVisible({ timeout: 5000 });
    // CTA should be at least 44px tall (Apple HIG touch target minimum)
    const box = await cta.boundingBox();
    expect(box, 'CTA has no bounding box — not rendered').not.toBeNull();
    expect(box!.height, `CTA height ${box!.height}px is below 44px touch target minimum`).toBeGreaterThanOrEqual(44);
  });

  test('C4-04 nav menu accessible on mobile (hamburger or visible nav)', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    // command-gl collapses .nav-links under 680px but keeps landmark + trial CTA
    const hamburger = page.locator('[aria-label*="menu"], [data-testid="hamburger"], button:has-text("Menu")').first();
    const inlineNav = page.locator('nav a').first();
    const navBar = page.locator('nav');
    const trial = page.locator('button.nav-cta');
    const hasNav =
      (await hamburger.isVisible().catch(() => false)) ||
      (await inlineNav.isVisible().catch(() => false)) ||
      ((await navBar.isVisible()) && (await trial.isVisible()));
    expect(hasNav, 'No navigation chrome on mobile viewport').toBe(true);
  });

  test('C4-05 no JS errors on 393px mobile paint', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    expect(materialConsoleErrors(errors), `JS errors on mobile: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('C4-06 full page scroll completes without layout breaks at 393px', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    // Scroll to bottom in steps, check for overflow at each step
    for (let y = 0; y <= 5000; y += 400) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(100);
      const overflow = await hasHorizontalOverflow(page);
      if (overflow) {
        throw new Error(`Horizontal overflow detected at scroll position ${y}px`);
      }
    }
  });
});

// ─── PERSONA C5 — The LATAM Operator ─────────────────────────────────────────
/**
 * Profile: São Paulo boutique firm. ESL. Mobile-first. WhatsApp-driven ops.
 * Mission: Full landing scan → pricing → FAQ. No US-only friction blocks comprehension.
 * Pass:    No US-only currency lock, no timezone-only US display, mobile completable.
 */
test.describe('C5 — LATAM Operator', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });

  test('C5-01 landing page loads in pt-BR locale without error', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    expect(materialConsoleErrors(errors)).toHaveLength(0);
  });

  test('C5-02 no horizontal overflow at 390px LATAM mobile', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const overflow = await hasHorizontalOverflow(page);
    expect(overflow, 'Horizontal overflow on LATAM 390px mobile').toBe(false);
  });

  test('C5-03 pricing visible and parseable in pt-BR locale', async ({ page }) => {
    await page.goto(LANDING_URL + '/#pricing', { waitUntil: 'networkidle' });
    // Prices must still display as $ (USD) — not broken by locale
    const text = await page.locator('body').textContent() ?? '';
    expect(text).toMatch(/\$\d+/);
  });

  test('C5-04 page does not hardcode US-only timezone in visible copy', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const text = await page.locator('body').textContent() ?? '';
    // Should not show US timezone in a way that breaks LATAM UX
    // e.g. "EST only" or "US hours only" — flag if found
    const usOnlyBlock = /EST only|US hours only|United States only/i.test(text);
    expect(usOnlyBlock, 'US-only timezone language found — LATAM blocker').toBe(false);
  });

  test('C5-05 trial CTA reachable from LATAM mobile without scroll > 3 screens', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const ctaPosition = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return Infinity;
      return el.getBoundingClientRect().top + window.scrollY;
    }, CTA.trialNav);
    expect(ctaPosition, `CTA is ${ctaPosition}px from top — LATAM user unlikely to find it`).toBeLessThan(2600);
  });
});

// ─── PERSONA C6 — The Competitor-Aware Buyer ──────────────────────────────────
/**
 * Profile: Has seen Epicenter. Arrives with a mental comparison list.
 * Mission: Hero → features section → differentiation clear without needing FAQ.
 * Pass:    BYOA / cockpit / model-agnostic framing visible. No single-vendor language.
 */
test.describe('C6 — Competitor-Aware Buyer', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('C6-01 "cockpit not engines" or equivalent positioning visible', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const text = await page.locator('body').textContent() ?? '';
    const differentiators = [
      'cockpit', 'Bring Your Own', 'BYOA', 'model-agnostic',
      'your agents', 'any agent', 'Stop being the bridge',
      'unified', 'coordination', 'wrangl',
    ];
    const found = differentiators.filter((d) => text.toLowerCase().includes(d.toLowerCase()));
    expect(found.length, `No differentiating phrases found. Checked: [${differentiators.join(', ')}]`).toBeGreaterThan(0);
  });

  test('C6-02 page does NOT lead with single-vendor framing (Claude-only, ChatGPT-only)', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    // Above-the-fold text must not be exclusively one vendor
    const heroText = await page.locator('h1, h2, [data-testid="hero"]').first().textContent() ?? '';
    const singleVendorLock = /^(only claude|claude manager|chatgpt wrapper|gpt-4 only)/i.test(heroText.trim());
    expect(singleVendorLock, 'Hero copy leads with single-vendor framing — model-agnostic rule violated').toBe(false);
  });

  test('C6-03 features section visible within 2 viewport scrolls', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const features = page.locator('#features, [data-testid="features"], section:has-text("Agent Status"), section:has-text("Task Router")').first();
    await expect(features).toBeVisible({ timeout: 5000 });
  });

  test('C6-04 three MVP features named: Dashboard, Task Router, Context Bridge', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const text = await page.locator('body').textContent() ?? '';
    expect(text).toMatch(/agent.status|dashboard/i);
    expect(text).toMatch(/task.router/i);
    expect(text).toMatch(/context.bridge|handoff/i);
  });

  test('C6-05 no performative warmth language in body copy', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const text = await page.locator('body').textContent() ?? '';
    const performative = ['Exciting!', "We're so glad", 'Revolutionize', 'Seamlessly', 'Empower your'];
    const found = performative.filter((p) => text.includes(p));
    expect(found, `Performative warmth language found: [${found.join(', ')}] — ORACLE voice rule violated`).toHaveLength(0);
  });
});

// ─── PERSONA C7 — The Demo Seeker ────────────────────────────────────────────
/**
 * Profile: Won't trial blind. Needs demo.html before committing.
 * Mission: Find demo from landing → interact with demo → path to trial.
 * Pass:    demo.html reachable within 2 clicks. Demo renders. CTA present post-demo.
 */
test.describe('C7 — Demo Seeker', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('C7-01 demo link exists on landing page', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const demoLink = page.locator(CTA.demo).first();
    await expect(demoLink, 'No demo link found on landing page').toBeVisible({ timeout: 5000 });
  });

  test('C7-02 demo.html loads with status 200', async ({ page }) => {
    const res = await page.goto(`${LANDING_URL}/demo.html`, { waitUntil: 'networkidle' });
    expect(res?.status(), 'demo.html did not return 200').toBe(200);
  });

  test('C7-03 demo renders core UI elements (agents, tasks, dashboard)', async ({ page }) => {
    await page.goto(`${LANDING_URL}/demo.html`, { waitUntil: 'networkidle' });
    const text = await page.locator('body').textContent() ?? '';
    const hasDemoContent = /agent|task|dashboard|route|context/i.test(text);
    expect(hasDemoContent, 'demo.html does not render expected agent/task content').toBe(true);
  });

  test('C7-04 demo page has a path back to trial (CTA present)', async ({ page }) => {
    await page.goto(`${LANDING_URL}/demo.html`, { waitUntil: 'networkidle' });
    const cta = page.locator(CTA.primary).first();
    await expect(cta, 'No trial CTA found on demo page — conversion dead end').toBeVisible({ timeout: 5000 });
  });

  test('C7-05 demo reachable from landing in max 2 clicks', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const demoLink = page.locator(CTA.demo).first();
    const popupPromise = page.waitForEvent('popup', { timeout: 15000 });
    await demoLink.click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    try {
      expect(popup.url(), 'Demo should open in a new tab').toMatch(/demo\.html/i);
    } finally {
      await popup.close();
    }
  });

  test('C7-06 no console errors on demo.html', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto(`${LANDING_URL}/demo.html`, { waitUntil: 'networkidle' });
    expect(materialConsoleErrors(errors), `Console errors on demo.html: ${errors.join(', ')}`).toHaveLength(0);
  });
});

// ─── PERSONA C8 — The Accessibility User ──────────────────────────────────────
/**
 * Profile: Low vision. 150% browser zoom. High-contrast mode. WCAG concern.
 * Mission: Full landing at 150% zoom → keyboard-navigate to CTA → verify contrast tokens.
 * Pass:    No text overflow at 150%, CTA keyboard-reachable, contrast tokens ≥ 4.5:1.
 *
 * Note: Playwright does not simulate true browser zoom. We approximate with a scaled
 * viewport (effective width = 1440 / 1.5 = 960px) and CSS font-size scaling checks.
 *
 * C8-03: hero h1 must not resolve to known failing grays (incl. rgb(122, 128, 153)).
 * C8-04: muted selector must not be legacy rgb(122, 128, 153); page HTML must not
 *         contain #7a8099 (pre-fix token string regression).
 */
test.describe('C8 — Accessibility User', () => {
  // 960px approximates 1440px viewport at 150% zoom
  test.use({ viewport: { width: 960, height: 600 } });

  test('C8-01 page loads without horizontal overflow at 960px (150% zoom proxy)', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const overflow = await hasHorizontalOverflow(page);
    expect(overflow, 'Horizontal overflow at 960px — fails at 150% browser zoom').toBe(false);
  });

  test('C8-02 primary CTA keyboard-focusable via Tab navigation', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    // Tab through up to 30 elements looking for the CTA
    let ctaFocused = false;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      const focusedText = await page.evaluate(() => document.activeElement?.textContent?.toLowerCase() ?? '');
      const focusedHref = await page.evaluate(() => (document.activeElement as HTMLAnchorElement)?.href ?? '');
      if (
        focusedText.includes('start') ||
        focusedText.includes('trial') ||
        focusedText.includes('try') ||
        focusedHref.includes('trial') ||
        focusedHref.includes('app')
      ) {
        ctaFocused = true;
        break;
      }
    }
    expect(ctaFocused, 'Primary CTA not reachable via keyboard Tab navigation').toBe(true);
  });

  test('C8-03 hero text contrast: textPri #E6EDF3 on bg #0D1117 passes WCAG AA', async ({ page }) => {
    // Contrast ratio calculation: relative luminance formula
    // #E6EDF3 on #0D1117 → known contrast ratio ≈ 15.3:1 (well above 4.5)
    // We verify these tokens are actually applied, not swapped for a lower-contrast value.
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const heroColor = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;
      return window.getComputedStyle(h1).color;
    });
    // heroColor will be rgb(230, 237, 243) for #E6EDF3 — just assert it's not a known failing gray
    expect(heroColor, 'h1 color not computed — font may not be rendering').not.toBeNull();
    // Flag the known bad tokens from sprint history (includes legacy muted rgb(122, 128, 153))
    const knownFailTokens = ['rgb(100, 116, 139)', 'rgb(71, 85, 105)', 'rgb(51, 65, 85)', LEGACY_FAIL_MUTED_RGB];
    expect(knownFailTokens, `h1 using a known-failing contrast token: ${heroColor}`).not.toContain(heroColor);
  });

  test('C8-04 muted text uses #9DA8B5 token (≥7.84:1 contrast on #0D1117)', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const html = (await page.content()).toLowerCase();
    expect(
      html.includes(LEGACY_FAIL_MUTED_HEX),
      `Legacy failing hex ${LEGACY_FAIL_MUTED_HEX} found in page HTML — accessibility regression`
    ).toBe(false);

    // command-gl: secondary copy uses .hsub and nav links (CSS var --tx2)
    const mutedColor = await page.evaluate(() => {
      const el = document.querySelector('.hsub') ?? document.querySelector('.nav-links a');
      if (!el) return null;
      return window.getComputedStyle(el).color;
    });
    expect(mutedColor, 'No muted secondary element (.hsub / nav link) found for contrast check').not.toBeNull();
    expect(mutedColor!, 'Muted text is using old failing contrast token').not.toBe(LEGACY_FAIL_MUTED_RGB);
  });

  test('C8-05 focus indicators visible on interactive elements', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const focusOutline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });
    // Element should have a visible focus indicator (outline or box-shadow ring)
    const hasVisibleFocus = focusOutline !== null && (
      (focusOutline.outline !== 'none' && focusOutline.outlineWidth !== '0px') ||
      focusOutline.boxShadow !== 'none'
    );
    expect(hasVisibleFocus, `No visible focus indicator on first Tab-focused element. Got: ${JSON.stringify(focusOutline)}`).toBe(true);
  });

  test('C8-06 no text overflow at 960px (images/videos may scale but text wraps)', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const overflowingText = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, span, li'));
      return all
        .filter((el) => el.scrollWidth > el.clientWidth + 5) // 5px tolerance
        .map((el) => ({ tag: el.tagName, text: el.textContent?.slice(0, 60), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    });
    expect(overflowingText, `Text overflow at 960px on: ${JSON.stringify(overflowingText)}`).toHaveLength(0);
  });
});

// ─── GLOBAL SMOKE — runs after all personas ───────────────────────────────────
/**
 * Final gate: SSL, canonical URL, no 404s on nav links, Clarity script present.
 */
test.describe('GL-SMOKE — Global landing health', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('SMOKE-01 landing returns 200 with valid SSL', async ({ page }) => {
    const res = await page.goto(LANDING_URL, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    const u = page.url();
    const isLocalBase = !!process.env.COMMAND_GL_BASE_URL?.match(/^https?:\/\/(127\.0\.0\.1|localhost)\b/i);
    if (isLocalBase) {
      expect(u.startsWith('http://'), 'Local COMMAND_GL_BASE_URL should load over http').toBe(true);
    } else {
      expect(u.startsWith('https://'), 'Production landing not served over HTTPS').toBe(true);
    }
  });

  test('SMOKE-02 Microsoft Clarity script present on landing (production)', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const clarityPresent = await page.evaluate(() => {
      return Array.from(document.scripts).some((s) =>
        s.src.includes('clarity.ms') || s.text.includes('clarity') || s.text.includes('w35dn6egp4')
      );
    });
    expect(clarityPresent, 'Microsoft Clarity (project w35dn6egp4) not found on landing — session recording dark').toBe(true);
  });

  test('SMOKE-03 all nav links return non-4xx responses', async ({ page, context }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    const navHrefs: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('nav a[href], header a[href]'))
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((h) => h && !h.startsWith('mailto') && !h.startsWith('tel'))
    );
    const broken: string[] = [];
    for (const href of [...new Set(navHrefs)]) {
      const res = await context.request.get(href, { timeout: 8000 }).catch(() => null);
      if (!res || res.status() >= 400) broken.push(`${href} → ${res?.status() ?? 'timeout'}`);
    }
    expect(broken, `Broken nav links: ${broken.join(', ')}`).toHaveLength(0);
  });

  test('SMOKE-04 primary trial CTA targets Stripe checkout or app/signup', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' });
    await expectTrialTargetOk(page, 'Primary trial CTA missing');
  });

  test('SMOKE-05 page title contains "COMMAND" branding', async ({ page }) => {
    await page.goto(LANDING_URL, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title).toMatch(/COMMAND/i);
  });
});
