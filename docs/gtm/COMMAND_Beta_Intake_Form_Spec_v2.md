**COMMAND — Beta Intake Form Spec v2**

*Multi-Instance Question Added — Section 2*

*GlobaLink (GL)  |  Confidential  |  March 2026 — Updated*

Build in Tally.so (free tier). 20 questions across 5 sections. Do not add branding until the form is verified functional. Estimated completion time: 8 minutes.

# Section 1 — Firm Profile (4 questions)

| **#** | **Question / Type** |
| --- | --- |
| 1.1 | What best describes your firm? (Single select: Consulting · Coaching · Advisory · Agency · Other) |
| 1.2 | How many people work at your firm, including yourself? (Single select: 1 · 2–5 · 6–15 · 16–50 · 50+) |
| 1.3 | What is your firm's approximate annual revenue? (Single select: <$250K · $250K–$1M · $1M–$5M · $5M+) |
| 1.4 | What is your primary role? (Single select: Founder/CEO · COO · Head of Ops · Other) |

# Section 2 — Agent Stack (5 questions)

*NOTE v2: Question 2.1b added to capture single-service multi-instance operators — the primary use case.*

| **#** | **Question / Type** |
| --- | --- |
| 2.1 | Which AI tools is your firm actively using in production? (Multi-select: Claude · ChatGPT · GPT-4 · Perplexity · Cursor · Make · Zapier · Other) |
| 2.1b | NEW v2 — Do you ever run multiple simultaneous sessions or tabs of the same AI tool? (Single select: Never · Sometimes — 2 tabs · Regularly — 3-4 tabs · Always — 5+ tabs) |
| 2.2 | How many distinct AI agents or workflows are you running simultaneously? (Single select: 1 · 2–3 · 4–6 · 7+) |
| 2.3 | How long have you been running AI agents in production? (Single select: <3 months · 3–12 months · 1–2 years · 2+ years) |
| 2.4 | Do you have a centralized place to monitor all your agents? (Single select: Yes, fully · Partially · No — we check them individually · No — we find out when something breaks) |

# Section 3 — Pain Qualification (5 questions)

| **#** | **Question / Type** |
| --- | --- |
| 3.1 | How do you currently move context between agents or sessions? (Single select: Automatic · Manual copy-paste · A team member handles it · We don't — agents work in isolation · Other) |
| 3.2 | How often does an agent stall or fail without you knowing immediately? (Single select: Rarely/never · Monthly · Weekly · Daily · Multiple times per day) |
| 3.3 | On a scale of 1–7, how much of your productive AI time is lost to manually managing agents vs. using their output? (Linear scale: 1=None · 7=Most of it) |
| 3.4 | What would you most want to see if you had a single dashboard for all your agents? (Open text) |
| 3.5 | Describe the most frustrating thing about managing your current AI stack. (Open text) |

# Section 4 — Feature Prioritization (3 questions)

| **#** | **Question / Type** |
| --- | --- |
| 4.1 | Rank these COMMAND features by how valuable they'd be to you (1=Most valuable, drag to rank): Agent Status Dashboard · Task Router · Handoff & Context Bridge · Approval Queue · Agent Builder · Agent Marketplace · ROI Dashboard |
| 4.2 | Which single feature would make you sign up today if it worked perfectly? (Single select: same 7 options) |
| 4.3 | What feature are we missing that you'd need before signing up? (Open text) |

# Section 5 — Buying Intent (3 questions)

| **#** | **Question / Type** |
| --- | --- |
| 5.1 | If COMMAND solved the coordination problem you described, what would you expect to pay per month? (Single select: <$50 · $50–$99 · $100–$199 · $200–$349 · $350+ · It depends on the ROI) |
| 5.2 | Would you be willing to join a closed beta (free access, feedback required)? (Single select: Yes, sign me up · Maybe — send me more info · No) |
| 5.3 | May we follow up by email? If yes, please share your email address. (Short text — optional) |

# Tally.so Build Notes

- Form name: COMMAND Beta Interest Form v2

- Status: Start as DRAFT. Do not publish until all questions are verified in editor.

- Self-notification: hasSelfEmailNotifications: true, selfEmailTo: jason@globalinkservices.io

- Completion message: "Thank you — you're on the early access list. We'll be in touch."

- Do NOT use LINEAR_SCALE legend labels via API — set manually in Tally editor after creation.

- Question 2.1b is the primary single-instance qualification signal — review these responses first when scoring intake forms.