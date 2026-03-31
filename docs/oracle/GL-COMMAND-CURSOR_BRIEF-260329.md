# GL-COMMAND-CURSOR_BRIEF-260329
## ORACLE Design Layer — Integration Brief v2
**Entity:** GlobaLink (GL) | **Product:** COMMAND  
**Scope:** Design token additions + UX principle implementation  
**Source:** ORACLE Identity Document v1.0 → adapted for commercial SaaS context  
**Operator:** Jason Davis  
**Updated:** March 29, 2026 — intel color revised, warmth model updated to ORACLE v1.0

---

## MISSION

Integrate five ORACLE-derived design principles into the COMMAND UI layer.  
These are additive changes — no existing tokens or components are removed.  
All changes must be backward-compatible with the current brand spec (v2).

---

## RULE ZERO — READ BEFORE TOUCHING ANYTHING

COMMAND brand spec lives in `COMMAND_Brand_Identity_Brief_v2.docx`.  
Current stack: Next.js 15 / React 19 / TypeScript strict / Tailwind 4 / shadcn/ui  
Color tokens live in: `tailwind.config.ts` and `globals.css`  
Component root: `app/` and `components/`  
Do NOT modify: entity name, product name, primary accent (#1F6FEB), background (#0D1117)  
Do NOT introduce: scanline textures, CRT effects, Bebas Neue as a body font  

---

## CHANGE 01 — VIOLET AI INTELLIGENCE LAYER

**What:** Add a soft violet token for COMMAND-generated intelligence output.  
**Why:** When COMMAND analyzes agent state and surfaces an insight (not raw data),  
the operator needs to know at a glance: *the system is speaking, not the data.*

**Color decision:**  
🥇 `#A78BFA` — soft violet. Readable on dark surfaces. Distinct from Anthropic's identity.  
🥈 `#818CF8` — indigo alternative. More blue-leaning if violet reads too close to Anthropic.  
❌ `#7C3AED` — REMOVED. Too saturated, too close to Anthropic brand. Do not use.  
❌ `#5436DA` / Anthropic purple — never use in COMMAND.

**Scope:** Apply to: insight cards, AI-generated subtask suggestions,  
budget analysis outputs, stall recommendations. Intel layer ONLY — never on CTAs or nav.

### Token additions — `tailwind.config.ts`

```ts
// Add inside theme.extend.colors
command: {
  // existing tokens — do not remove
  bg:       '#0D1117',
  surface:  '#161B22',
  blue:     '#1F6FEB',
  green:    '#238636',
  amber:    '#D29922',
  red:      '#DA3633',
  textPri:  '#E6EDF3',
  textSec:  '#8B949E',

  // NEW — ORACLE AI Intelligence Layer
  // Soft violet. Machine-generated signal. Not Anthropic purple.
  intel:       '#A78BFA',
  intelBg:     '#13101F',
  intelBorder: '#3B2A6E',
},
```

### Token additions — `globals.css`

```css
:root {
  /* existing tokens unchanged */

  /* NEW — AI Intelligence Layer */
  --intel:        #A78BFA;
  --intel-bg:     #13101F;
  --intel-border: #3B2A6E;
  --intel-text:   #C4B5FD;
}
```

### Component pattern — AI Insight Card

```tsx
// components/ui/intel-card.tsx
// Use this wrapper whenever COMMAND is surfacing its own analysis,
// not raw agent data. Left violet border = machine-generated signal.

export function IntelCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--intel-border)] bg-[var(--intel-bg)] px-4 py-3 border-l-4 border-l-[var(--intel)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono text-[var(--intel-text)] uppercase tracking-widest">
          COMMAND INTEL
        </span>
      </div>
      {children}
    </div>
  )
}
```

---

## CHANGE 02 — LEFT-BORDER TRIAGE ON AGENT CARDS

**What:** Apply status-color left borders to all agent cards for instant visual triage.  
**Why:** Operators scanning 5+ agents need sub-second status reads. Color = signal.  
**Scope:** All agent card components. Status determined by `agent.status` field.

### Status → border mapping

```ts
// lib/agent-status-colors.ts

export const AGENT_STATUS_BORDER: Record<AgentStatus, string> = {
  active:    'border-l-[#1F6FEB]',   // blue  — running, nominal
  complete:  'border-l-[#238636]',   // green — task finished
  stalled:   'border-l-[#D29922]',   // amber — pending, waiting, idle >5min
  blocked:   'border-l-[#DA3633]',   // red   — failed, error, hard-blocked
  idle:      'border-l-[#8B949E]',   // gray  — registered, no active task
}
```

### Application — agent card component

```tsx
// In AgentCard, replace static border with:
<div
  className={cn(
    'rounded-lg bg-[#161B22] border border-[#21262D] border-l-4 p-4',
    AGENT_STATUS_BORDER[agent.status]
  )}
>
  {/* card content */}
</div>
```

---

## CHANGE 03 — COST-OF-STALL UX PRINCIPLE

**What:** When an agent is stalled or blocked, surface a visible cost — time elapsed  
or token budget burning — alongside the status indicator.  
**Why:** This is COMMAND's core value prop made visible. Stall = cost. Operators must  
feel the pain the product is solving, inside the product.  
**Scope:** Agent cards (stalled/blocked only). Task queue items. Approval queue.

### Stall cost component

```tsx
// components/ui/stall-cost.tsx

interface StallCostProps {
  stalledAt: Date
  tokenBudget?: number   // tokens/min burn rate, optional
}

export function StallCost({ stalledAt, tokenBudget }: StallCostProps) {
  const minutesStalled = Math.floor((Date.now() - stalledAt.getTime()) / 60000)

  return (
    <div className="flex items-center gap-3 mt-2 px-2 py-1.5 rounded bg-[#1C1107] border border-[#D2992240]">
      <span className="text-[#D29922] font-mono text-xs">
        ⚠ {minutesStalled}m stalled
      </span>
      {tokenBudget && (
        <span className="text-[#8B949E] font-mono text-xs">
          ~{(tokenBudget * minutesStalled).toLocaleString()} tokens idle
        </span>
      )}
    </div>
  )
}
```

### Usage rule

```
Render on agent.status === 'stalled' or 'blocked' only.
Do NOT render on active, complete, or idle agents.
Update interval: useInterval at 60s.
```

---

## CHANGE 04 — AUTOSAVE / STATE PERSISTENCE INDICATOR

**What:** A persistent, low-prominence indicator confirming agent state is saved.  
**Why:** COMMAND's brand promise is continuity — nothing is lost. Make it visible.  
**Scope:** Global — top nav bar, right-aligned. Always on screen.

### State persistence indicator

```tsx
// components/ui/sync-status.tsx

type SyncState = 'saved' | 'saving' | 'error'

export function SyncStatus({ state }: { state: SyncState }) {
  const config = {
    saved:  { label: 'State saved',  color: '#238636', dot: '●' },
    saving: { label: 'Saving...',    color: '#D29922', dot: '◌' },
    error:  { label: 'Sync error',   color: '#DA3633', dot: '●' },
  }
  const { label, color, dot } = config[state]

  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color }} className="text-[10px] leading-none">{dot}</span>
      <span className="font-mono text-[10px] text-[#8B949E] uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}
```

### Placement rule

```
AppShell top nav, right side, after user avatar.
'saved' — no animation. Motion on non-events is noise.
'saving' — pulse only.
'error' — static red, no pulse.
```

---

## CHANGE 05 — WARMTH PROFILE (ORACLE v1.0 MODEL)

**Source:** ORACLE Identity Document v1.0, Section III — Personality Profile + Section IV, On Warmth

**The model — verbatim from ORACLE spec:**
> *"ORACLE has warmth — but it's the warmth of a trusted senior NCO or a brilliant XO  
> who has been in the field with you. It is not the warmth of a customer service rep.  
> It doesn't announce itself. It shows up in how she delivers hard news — not softening  
> the facts, but acknowledging that the human receiving them matters.  
> The warmth is in the investment, not the vocabulary."*

**Applied to COMMAND:**  
COMMAND is invested in operator success. That investment shows in specific moments —  
not in tone across all states. It shows when a task routes clean, when a handoff completes,  
when a trial user crosses a milestone. Then it moves on. Operational states stay cold.

### Warmth state map

| State | Register | Pattern |
|---|---|---|
| **First-run / onboarding** | Invested, not cheerful | "Ops center initialized. Register your first agent." |
| **Empty state (no agents)** | Direct, not apologetic | "No agents registered. Add one — COMMAND handles coordination from here." |
| **First task routed** | Quiet acknowledgment | "First task routed. This is what COMMAND is for." |
| **Trial → paid CTA** | Outcomes-first | "You've routed 14 tasks without copy-pasting once. That's the product." |
| **Handoff complete** | Brief confirmation, then cold | "Handoff complete. Context preserved. FORGE-1 has the package." |
| **All operational states** | Cold — ORACLE register | Status. Metrics. Actions. No filler. |

### Copy examples — approved voice patterns

```
// COLD — default. All operational states.
"FORGE-1 stalled. 14 minutes idle. Task: Draft Q3 report. Budget: 40% consumed."
"3 agents active. 1 stalled. 0 failed."
"Handoff from RECON-1 to FORGE-1 — context package ready. Approve to proceed."

// INVESTED — NCO/XO register. Specific moments only.
"Ops center initialized. Register your first agent to get visibility."
"First task routed. This is what COMMAND is for."
"Handoff complete. Context preserved. FORGE-1 has the package."
"Trial ends in 9 days. You've routed 14 tasks without copy-pasting once."

// NEVER — these don't exist in COMMAND's voice
"Exciting!" / "Seamlessly" / "Empower" / "Revolutionize"
"Let's get started!" / "Great job!" / "You're doing amazing!"
"We're so glad you're here!"
```

### The copy test

```
Read it out loud as a senior NCO delivering a SITREP.
Customer service rep energy → cut it.
Commander acknowledging a task complete → keep it.
```

---

## IMPLEMENTATION ORDER

Execute in sequence. Do not parallelize.

```
1. CHANGE 01 — Token additions (tailwind.config.ts + globals.css)       ~15 min
2. CHANGE 02 — Left-border triage (agent card component)                 ~20 min
3. CHANGE 04 — Sync status indicator (AppShell nav)                      ~20 min
4. CHANGE 03 — Stall cost component (stalled/blocked cards only)         ~30 min
5. CHANGE 05 — Warmth audit (onboarding + empty state + handoff copy)    ~20 min
```

**Estimated total:** ~105 minutes.

---

## WHAT NOT TO BUILD

```
❌ CRT scanlines or grid texture overlays
❌ Bebas Neue as UI body or nav font
❌ #7C3AED — too harsh, too close to Anthropic. #A78BFA only.
❌ Intel violet on CTAs, nav, or agent cards — intel layer ONLY
❌ Warmth in operational states (dashboard, task queue, agent cards)
❌ Performative acknowledgment — "Great job!", "Amazing!", etc.
❌ Countdown timers on all panels — hard deadlines only, added explicitly
```

---

## ACCEPTANCE CRITERIA

- [ ] `--intel` `--intel-bg` `--intel-border` `--intel-text` in `globals.css` as `#A78BFA` family
- [ ] `command.intel` / `command.intelBg` / `command.intelBorder` in `tailwind.config.ts`
- [ ] Agent cards render left-border from `AGENT_STATUS_BORDER` map
- [ ] `<StallCost>` renders on stalled/blocked cards, live-updates at 60s
- [ ] `<SyncStatus>` in AppShell top nav, right-aligned
- [ ] Onboarding + empty state + handoff copy passes NCO/XO copy test
- [ ] Zero scanlines, CRT effects, performative warmth in operational states
- [ ] TypeScript strict — zero errors

---

*GL | COMMAND | Design System v3 — ORACLE Layer | March 29, 2026*  
*Source: ORACLE Identity Document v1.0 — Section III Personality Profile, Section IV On Warmth*
