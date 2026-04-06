# CLAUDE.md — command-gl
# GlobaLink LLC | COMMAND | Public Repo
# Last updated: April 6, 2026

## REPO IDENTITY

This is the **command-gl** repo — the PUBLIC static site and sales asset repo for COMMAND.

- **Live URL:** command.globalinkservices.io
- **GitHub Pages base:** https://jglobalink2024.github.io/command-gl/
- **Custom domain:** command.globalinkservices.io
- **Repo:** github.com/jglobalink2024/command-gl (PUBLIC — never put secrets here)
- **Local path:** C:\Users\jdavi\OneDrive\Desktop\GlobalInk Repos\command-gl\

This is NOT the application repo. command-app is the Next.js app.
This repo is static HTML, CSS, JS files only. No build step. No npm. No TypeScript.

---

## WHAT LIVES HERE

| Path | What it is |
|------|-----------|
| `public/sales/command_hub.html` | Mobile sales hub — live at `/sales-hub` via vercel.json rewrite |
| `public/sales/COMMAND_One_Pager_v4.html` | One-pager — live at `/sales/COMMAND_One_Pager_v4.html` |
| `public/beta-syllabus.html` | Beta Program Syllabus v2 — live at `/beta-syllabus` |
| `public/demos/` | Demo HTML files |
| `public/skills/` | Skills library domain packs |
| `docs/` | GTM, market, compliance, brand, oracle, ops docs |
| `vercel.json` | URL rewrites — defines all clean paths |

---

## HARD RULES — NEVER VIOLATE

1. **This repo is PUBLIC.** Never commit API keys, secrets, tokens, or credentials of any kind.
2. **Entity name is GlobaLink** — never "GlobalInk" — not in copy, not in comments, not anywhere.
3. **Never imply single-vendor.** COMMAND is model-agnostic. All demo screenshots and copy must show Claude + GPT + Perplexity minimum.
4. **No n8n references** in any customer-facing file — GL internal only.
5. **Never use agent codenames** COMMAND-0, FORGE-1, SIGNAL-1, RECON-1. Function names only.
6. **No build step.** Static HTML only. Do not introduce npm, webpack, or any build tooling.
7. **Vercel.json is the routing layer.** The clean URL `/sales-hub` rewrites to `public/sales/command_hub.html`. Never change rewrites without explicit instruction.

---

## FILE VERSIONING RULE

Working/output files must always be versioned: `command_hub_v[N]_[YYMMDD].html`

Deploy commits always overwrite the production filename: `public/sales/command_hub.html`

Current production version: **v3_260406**

---

## DESIGN TOKENS (LOCKED)

These tokens apply to all HTML files in this repo. Do not deviate.

```
Background:    #080B11
Surface:       #0D1117
Border:        #1C2333
Amber accent:  #F0A030
Amber dim:     #A06820
Amber glow:    rgba(240,160,48,0.08)
Text primary:  #E6EDF3
Text muted:    #9DA8B5  ← canonical --tx2, 7.84:1 WCAG AA on #0D1117
Text faint:    #6E7681
Green:         #3FB950
Yellow:        #D29922
Red:           #F85149
Blue:          #58A6FF
```

**BANNED tokens — zero occurrences allowed:**
`#64748b` `#475569` `#334155` `#7a8099` `#30363D` `#94a3b8` `#5dcaa5`

Fonts: Space Mono (labels/headers), DM Mono (body/code), DM Sans (display)

---

## LIVE ASSET URLS (CANONICAL)

| Asset | URL |
|-------|-----|
| Sales Hub | command.globalinkservices.io/sales-hub |
| Beta Syllabus | command.globalinkservices.io/beta-syllabus |
| One-Pager v4 | command.globalinkservices.io/sales/COMMAND_One_Pager_v4.html |
| Navattic Demo | globalink.navattic.com/fcr04wg |
| Dock.us Master | globalinkservices.dock.us/acme-E7sOXt5HpHir (clone per prospect, never send directly) |
| FM Stripe | https://buy.stripe.com/9B68wRgwAcp8dt2dJp9k407 ($99/mo, landing/syllabus only) |
| Standard Pro | https://buy.stripe.com/bJe00lfsw74O74E5cT9k408 ($149/mo, in-app /pricing only) |

---

## DEPLOYMENT

No preflight.ps1 in this repo — static HTML, no build pipeline.

Standard deploy:
```
git add [files]
git commit -m "type(scope): description"
git push origin main
```

Vercel auto-deploys on push to main. Deploy time ~60 seconds.

---

## COMMIT MESSAGE FORMAT

```
feat(sales): sales hub v3 — tailored questions, Dock brief gen (260406)
fix(hub): switchTab DOMContentLoaded iframe compatibility
chore(docs): update beta syllabus v2 copy
```

---

## ENTITY RULES

- **GlobaLink LLC** — this repo, COMMAND product
- **Phase Line LLC** — separate entity, never referenced here
- **Traverse (TRV)** — separate entity, stealth, never referenced here
- Hard wall: no commingling between entities in any file

---

## CONTACT

Operator: jason@globalinkservices.io
Support: support@globalinkservices.io
GitHub: jglobalink2024
