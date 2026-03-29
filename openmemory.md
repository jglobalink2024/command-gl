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

## Patterns

- Cross-subdomain legal links: plain `<a href="https://app.command...">`, `target="_blank"`, `rel="noopener noreferrer"`.
- E2E: Playwright expects `[data-testid="privacy-link"]` in rendered HTML.
