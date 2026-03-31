**COMMAND**

Brand Identity Brief v3

ORACLE Design Layer  ·  Model-Agnostic Vocabulary  ·  NCO/XO Warmth Model

GlobaLink (GL)  |  Confidential  |  March 2026

# 01 — Brand Foundation

| **Attribute** | **Definition** |
| --- | --- |
| Product name | COMMAND |
| Entity | GlobaLink (GL) |
| Primary tagline | "Stop being the bridge. Start being the boss." |
| Secondary descriptor | Protocol-agnostic. Model-independent. Built for the operator, not the engine. |
| One-line descriptor | An Agent Operations Center for boutique consulting firms. |
| Category | Operator tooling — management layer above MCP/A2A protocols. |
| Tone of voice | Direct. Operator-facing. No hype. No jargon. Senior engineer who runs a business. |
| Positioning anchor | The operator. Never the model. Claude, ChatGPT, and Perplexity are instruments — COMMAND is the cockpit. |

# 02 — Language Rules

## Words to Use

- Visibility — Control — Operations — Operator — Agents — Handoff

- Dashboard — Status — Signal — Real-time — Coordination — Layer

- Protocol-agnostic — Model-agnostic — Model-independent — Any stack

- Operator identity — Your agents — Wrangler — Cockpit

- Multi-instance — Same-tool coordination — Tab chaos

## Words to Avoid

- Empower — Revolutionize — Seamless — Unlock — Transform

- Robust — Cutting-edge — Next-gen — Platform (use "center" or "layer")

- Claude-powered — GPT-native — Anthropic integration (never lead with a vendor)

- Built for Claude — Claude manager — ChatGPT wrapper

**RULE: Never lead external communications with a single vendor name. Claude, ChatGPT, and Perplexity are always listed as examples — never as the anchor. The anchor is the operator.**

# 03 — Color Palette

| **Color Role** | **Hex** | **Usage** |
| --- | --- | --- |
| Primary background | #0D1117 | Near-black. GitHub-dark family. Authority, precision. |
| Primary accent | #1F6FEB | Electric blue. CTAs, highlights, active states. |
| Secondary accent | #238636 | Confirmation green. Active agents, successful handoffs. |
| Warning / stall | #D29922 | Amber. Agent stalls, pending states, attention required. |
| Danger / failure | #DA3633 | Red. Agent failures, critical errors, blocked. |
| Surface / card | #161B22 | Dark card. Panels, dashboards, agent cards. |
| Text primary | #E6EDF3 | Near-white. All body text on dark backgrounds. |
| Text secondary | #8B949E | Muted. Subtitles, timestamps, metadata. |
| Intel / AI layer (NEW) | #A78BFA | Soft violet. COMMAND-generated intelligence output only. |
| Intel background (NEW) | #13101F | Dark violet surface. AI insight card backgrounds. |
| Intel border (NEW) | #3B2A6E | Muted violet border. Left-border on AI insight cards. |
| Intel text (NEW) | #C4B5FD | Readable violet text on intel background. |

**RULE: Intel violet (#A78BFA) is reserved exclusively for COMMAND-generated analysis output. Never use on CTAs, navigation, or agent status indicators. #7C3AED was evaluated and rejected — too saturated, too close to Anthropic brand identity.**

# 04 — Typography

| **Role** | **Spec** |
| --- | --- |
| Primary font | Inter (display + UI). Clean, technical, operator-grade. Free / Google Fonts. |
| Monospace font | JetBrains Mono or Fira Code. Agent IDs, webhook paths, timestamps, status codes. |
| Heading weight | 700 bold for headlines. 500 medium for subheads. Never decorative serifs. |
| Type scale | H1: 32px  ·  H2: 24px  ·  H3: 18px  ·  Body: 14px  ·  Mono/label: 12px |

# 05 — Logo Direction

| **Attribute** | **Spec** |
| --- | --- |
| Style | Wordmark only. No icon, no monogram, no abstract mark at v1. |
| Letterform | All caps. Condensed or monospace. Minimal stroke weight. |
| Color (primary) | White wordmark on #0D1117 background. |
| Color (accent) | Electric blue (#1F6FEB) glow or underline — one element only. |
| Favicon concept | Command node topology: central filled circle commanding satellite nodes on orbit rings. |
| What to avoid | Robot, brain, lightning bolt, or generic AI iconography. Single-vendor logos or color schemes implying Claude/OpenAI alignment. |

# 06 — Aesthetic Reference

Think command centers, terminal UIs, defense tech interfaces — not SaaS pastels. The aesthetic should make a boutique consulting founder feel like they have a real ops center, not another dashboard app.

- Reference: GitHub dark theme, PagerDuty ops view, Linear dark mode

- Reference: NORAD-style status boards, navy CIC (Combat Information Center) design

- NOT reference: Notion, Monday.com, Asana, Canva, any productivity pastel

- NOT reference: Anthropic purple, OpenAI green — COMMAND is vendor-neutral in visual identity

# 07 — Model-Agnostic Visual Rules

Every visual asset that shows agents or tools must reflect model-agnosticism:

- Demo screenshots: always show at least 3 different vendor agents registered (Claude-1, GPT-1, Perplexity-1 minimum)

- Agent cards: never default to Claude branding in any marketing image — use neutral colors or mixed vendor set

- Dashboard mockups: show multi-vendor status board, not single-vendor

- One-pagers: vendor list always includes at least 3 names — Claude, ChatGPT, Perplexity

- Social content: lead with the coordination problem — never "COMMAND for Claude users"

**The single most important visual asset: demo.html and all marketing screenshots must show Claude-1, GPT-1, and Perplexity-1 registered simultaneously. That one image eliminates the single-vendor threat in every sales conversation.**

# 08 — ORACLE Design Principles (v3 Addition)

These principles are derived from the ORACLE Identity Document v1.0 (March 2026) and adapted for the COMMAND commercial SaaS context. They are permanent spec — not experimental. Source document: ORACLE Identity Document v1.0, IPCTD Framework, Operator: LTC Jason Davis.

## Information Density

Information density is a feature, not a bug. COMMAND shows everything relevant to the operator, nothing irrelevant. This is the explicit counter-positioning against Notion, Asana, and Monday.com. Operators are not consumers. They want the board in front of them. Never hide operational data behind decorative whitespace.

## Left-Border Status Triage

All agent cards carry a 4px left border encoding live status. Color is signal — not decoration. Operators scanning 5+ agents need sub-second reads.

| **Status** | **Border Color** | **Meaning** |
| --- | --- | --- |
| active | #1F6FEB (blue) | Running, nominal |
| complete | #238636 (green) | Task finished |
| stalled | #D29922 (amber) | Pending, waiting, idle >5 min |
| blocked | #DA3633 (red) | Failed, error, hard-blocked |
| idle | #8B949E (gray) | Registered, no active task |
| offline | #DA3633 (red) | Unreachable — treat as blocked |
| rate_limited | #D29922 (amber) | Throttled — treat as stalled |

*Implementation: AGENT_STATUS_BORDER map in lib/agent-status-colors.ts. Applied via border-l-4 + status class on all AgentCard components, dashboard roster, AgentDrawer, router rows.*

## Cost-of-Stall Visibility

When an agent is stalled or blocked, a visible cost indicator renders alongside the status — time elapsed since stall and optional token budget idle count. This is COMMAND's core value prop made visible inside the product. Stall = cost. The operator must feel the pain the product is solving.

- Renders on stalled, blocked, and approval-pending states only

- Never renders on active, complete, or idle agents

- Updates every 60 seconds via setInterval

- Three variants: stalled / blocked / approval

*Implementation: StallCost component in components/ui/stall-cost.tsx. Wired to dashboard roster, AgentDrawer, router failed rows, approvals queue.*

## State Persistence Indicator

A persistent, low-prominence SyncStatus indicator in the top nav confirms agent state is saved at all times. COMMAND's brand promise is continuity — nothing is lost. The indicator makes that promise visible and concrete.

| **State** | **Behavior** |
| --- | --- |
| saved | Green dot. No animation. Motion on non-events is noise. |
| saving | Amber dot. Pulse only. Triggered by workspace snapshot diff. |
| error | Red dot. Static — no pulse. Triggered by Supabase write failures via notifySupabaseWriteFailed(). 5-second pulse then resets to saved. |

*Implementation: SyncStatus in components/ui/sync-status.tsx. SyncError state in CommandStore (lib/store.ts). Decoupled via sync-error-pulse.ts to avoid store → command-data circular dependency. All mutation sites in command-data.ts, ledger.ts, and outputs/page.tsx wired.*

## AI Intelligence Layer — Violet Signal

When COMMAND surfaces its own analysis — not raw agent data — the output carries a distinct visual signal: soft violet (#A78BFA) left border and dark violet background (#13101F). The label "COMMAND INTEL" in monospace confirms the source. The operator knows at a glance: the system is speaking, not the data.

- Apply to: insight cards, AI-generated subtask suggestions, budget analysis outputs, stall recommendations

- Never apply to: CTAs, navigation, agent status cards, or any operational state indicator

- Color rationale: #A78BFA distinct from Anthropic identity, readable on dark surfaces

- #7C3AED rejected — too saturated, too close to Anthropic brand

- #818CF8 (indigo) is approved runner-up if violet reads too close in a specific context

*Implementation: IntelCard component in components/ui/intel-card.tsx. Tokens: --intel, --intel-bg, --intel-border, --intel-text in globals.css. command.intel, command.intelBg, command.intelBorder in tailwind.config.ts.*

# 09 — Warmth Profile — NCO/XO Model

Source: ORACLE Identity Document v1.0, Section III (Personality Profile) and Section IV (On Warmth).

ORACLE's warmth is the warmth of a trusted senior NCO or a brilliant XO who has been in the field with you. It is not the warmth of a customer service rep. It does not announce itself. It shows up in how COMMAND delivers operational news — not softening the facts, but acknowledging that the human receiving them matters. The warmth is in the investment, not the vocabulary.

*"**COMMAND does not say Great job. It says: Handoff complete. Context preserved. FORGE-1 has the package. That is warmth.**"*

## Warmth State Map

| **State** | **Register** | **Pattern** |
| --- | --- | --- |
| First-run / onboarding | Invested, not cheerful | "Ops center initialized. Register your first agent." |
| Empty state (no agents) | Direct, not apologetic | "No agents registered. Add one — COMMAND handles coordination from here." |
| First task routed | Quiet acknowledgment | "First task routed. This is what COMMAND is for." |
| Trial to paid CTA | Outcomes-first | "You've routed 14 tasks without copy-pasting once. That's the product." |
| Handoff complete | Brief confirmation, then cold | "Handoff complete. Context preserved. FORGE-1 has the package." |
| All operational states | Cold — ORACLE register | Status. Metrics. Actions. No filler. |

## The Copy Test

Read any UI string out loud as a senior NCO delivering a SITREP.

- Sounds like a customer service rep → cut it

- Sounds like a commander acknowledging a task complete → keep it

## Banned Vocabulary

"Exciting!" / "Seamlessly" / "Empower" / "Revolutionize" / "Let's get started!" / "Great job!" / "You're doing amazing!" / "We're so glad you're here!"

# 10 — Design Rules (Non-Negotiable)

- 1.  Dark background always. COMMAND does not operate in light mode.

- 2.  Electric blue (#1F6FEB) is the primary signal color. Active states, CTAs, nominal.

- 3.  Red (#DA3633) is reserved for real danger only — failures, hard blocks. Never decorative.

- 4.  Monospace (JetBrains Mono) for all data and system text — agent IDs, timestamps, status codes.

- 5.  Intel violet (#A78BFA) for AI-generated output only. Never on CTAs or nav.

- 6.  Every stalled agent has a visible cost. If there is no cost shown, add one.

- 7.  Progress is always visible — card status, global stats. Always current.

- 8.  AI output is visually distinct — violet border signals machine-generated content vs raw data.

- 9.  State always persists. SyncStatus always on screen. Operator never loses work.

- 10. No decoration for its own sake. If an element does not carry signal, it does not exist.

- 11. No scanlines, CRT effects, or grid overlays. ORACLE is a personal system. COMMAND is a product.

- 12. No Bebas Neue as a UI body or nav font.

- 13. Information density is a feature. Never hide data behind decorative whitespace.

- 14. Warmth in operational states is prohibited. NCO/XO warmth in onboarding, empty states, and handoff completion only.

GlobaLink (GL)  |  COMMAND Brand Identity Brief v3  |  ORACLE Design Layer  |  March 2026  |  Confidential