# command-gl — OpenMemory guide

## Overview

Static marketing/landing site for COMMAND (Agent Operations Center), served at `command.globalinkservices.io`. Primary entry: single-page `index.html` (inline CSS, no React/Next.js in-repo). Interactive product demo: `demo.html`.

## Architecture

- **Stack:** Static HTML + CSS + small inline scripts; no `package.json` / npm build in this workspace snapshot.
- **Deploy:** Typically Vercel or similar hosting the repo root.

## User Defined Namespaces

- (none defined)

## Components

- **Landing footer (`index.html`):** Three-column footer — brand (`flogo`), company line (`fmid`), contact column (`fright`) with Privacy Policy link (`data-testid="privacy-link"`) to `https://app.command.globalinkservices.io/privacy` and Cloudflare-protected email.
- **Landing footer (`index.html`):** Three-column footer — brand (`flogo`), company line (`fmid`), contact column (`fright`) with legal links for Privacy + Terms and plain `mailto:support@globalinkservices.io`.
- **Pricing page (`pricing.html`):** Static standalone pricing surface using the same root CSS tokens/fonts as `index.html` (`--bg`, `--amber`, `--tx2`, `--mono`, `--display`, `--sans`), with four plan cards, FAQ accordion script, and bottom CTA strip.
- **One-pager v3 (`COMMAND_One_Pager_v3.html`):** Single-file interactive collateral with dark COMMAND palette, hero canvas particle network (12–18 nodes, proximity edges), pinned 400vh problem story (SplitType + GSAP scroll-typed terminal lines), click/scroll activation transition into dashboard state, GSAP reveal cards, five-step JS state demo, positioning/pricing/footer sections.
- **One-pager v3 copy alignment:** v3 keeps new interaction/animation architecture but mirrors v2 copy language for shared collateral sections (solution/features text, market-position grid, pricing tier details, and footer legal/meta phrasing).

## Patterns

- Cross-subdomain legal links: plain `<a href="https://app.command...">`, `target="_blank"`, `rel="noopener noreferrer"`.
- E2E: Playwright expects `[data-testid="privacy-link"]` in rendered HTML.
- Public security contact is published at `public/.well-known/security.txt` with support mailbox and privacy policy canonical links.
- **Phase A eval:** `tests/phase-a-command-gl.spec.ts` — personas C1–C8 + `GL-SMOKE`. Default base `https://command.globalinkservices.io`; set `COMMAND_GL_BASE_URL=http://127.0.0.1:PORT` with `npx serve .` for pre-deploy checks. C8-03/C8-04 reject legacy muted (`rgb(122, 128, 153)` / `#7a8099`); landing `--tx2` uses `#9da8b5`. Privacy tests hit `https://app.command.globalinkservices.io/privacy`. FAQ: in-page `#faq` with `[data-testid="faq-item"]`. Primary trial CTAs: `data-testid="cta-trial"` (+ hero/pricing/footer variants); demo opens in a new tab (`window.open`). Root `command-mark.svg` + `<link rel="icon">` for favicon. Microsoft Clarity `w35dn6egp4` in `index.html` before `toggleB` script.
- Landing top nav `Pricing` points to `/pricing.html`; avoid touching `demo.html` when making marketing-site pricing updates.
- For one-pager interactions, keep animation properties to `opacity` and `transform`, maintain dense information layout (no decorative scanlines/CRT overlays), and reserve violet (`#A78BFA`) for AI-output intel cards only.
- `COMMAND_One_Pager_v3.html` reveal baseline: `.term-line` and `.copy-block` should start at `opacity: 0` (GSAP controls reveal to 1), `.dashboard-view` keeps `opacity/transform` transition for smoother activation entry, and demo step 5 uses CTA button text `This is COMMAND. Start your trial →` with `window.open("https://app.command.globalinkservices.io/signup", "_blank")`.
