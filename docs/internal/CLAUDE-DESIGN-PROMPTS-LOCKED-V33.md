# Claude Design Prompts — Locked V3.3 (Per-Screen)

**Status:** Current. Use these prompts in Claude Design to generate screens 2 through 5 using the locked Slate Family system with the v3.3 bloom learnings baked in.

**Supersedes:** the older multipage prompt in `CLAUDE-DESIGN-PROMPT-LOCKED.md` (which referenced original Set E values before the brown-bloom/white-pinpoint fixes).

**Source of truth:** `BRAND-SYSTEM-LOCKED.md` for tokens, `prototype/landing/` for the live reference implementation.

---

## Why these prompts differ from the previous ones

After implementing the Landing screen, we discovered three issues with Claude Design's default bloom generation and tuned through them:

| Issue we hit | What v3.3 fixes |
|---|---|
| Original `#C9C5BE` slate × `#E87B2C` ember multiplied to `#B75F21` (brown, not orange) | Lift slate to `#D6D2CB` and brighten ember to `#F89444`. Multiply now lands in actual orange. |
| Original CD output had a bright `source-over` pinpoint at the bloom center | Looked like a "white hole". Removed. Chiaroscuro from a slightly deepened core does the work instead. |
| Original bloom was a static circle with size-only "breath" | Bloom now drifts on a slow lissajous (orbit ~26-32 seconds, amplitude 10-14% of width). |
| Grain was strobing at 8 Hz (itchy on eyes) | Grain crossfades between two tiles every 3.2 seconds. Calm, no boil. |

All 4 prompts below carry these fixes in their hard-rules section. Paste them verbatim — do not let Claude Design talk you back into a smooth aurora rainbow.

---

## SHARED HEADER (paste at the top of every prompt below)

This block is identical across all 4 screens. Paste it first, then the screen-specific section.

```
You are designing a screen for Answerable, an open-source AI-SEO toolkit launching in 2026 targeting indie developers. The user evaluating this design is visually sophisticated and will reject anything that looks like AI-generated template SaaS.

═══════════════════════════════════════════════════════════════════
PRODUCT IDENTITY
═══════════════════════════════════════════════════════════════════

Product name: Answerable
Target domain: answerable.io
Positioning: The only open-source AI-SEO toolkit (SEO + AEO + GEO unified) that lives in your codebase and ships fixes as code.

GitHub: https://github.com/Anuj7411/answerable
npm scope: @answerable-kit
Install command shown in demos: pnpm dlx @answerable-kit/cli audit yoursite.com

What it does: audits any website across SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) using a 55-check framework, then generates the actual code fixes using AI. Three scores side by side. Open source MIT license.

Pricing tiers:
- Free OSS forever
- Pro $29 per month (90 AI fixes per month, scheduled audits, 30-day history, email digest, detailed evidence)
- Studio $99 per month coming Q3 2026

═══════════════════════════════════════════════════════════════════
LOCKED BRAND SYSTEM V3.3 (use EXACTLY these values, no deviation)
═══════════════════════════════════════════════════════════════════

This is the Slate Family system. Each page has its own warm ember color cousin on a shared slate base. The slate base never changes. Only the ember accent shifts per page.

SHARED BACKGROUND (every screen)
bg base:        #D6D2CB  (warm light gray, the canvas — lifted ~12pts from earlier explorations)
bg elevated:    #E0DCD5  (cards, raised surfaces)
bg recessed:    #C4C0B9  (inset elements)
bg glass:       rgba(224, 220, 213, 0.62) with 12px backdrop blur

SHARED BORDERS
border subtle:  rgba(26, 24, 20, 0.08)  (card edges)
border strong:  rgba(26, 24, 20, 0.16)  (active, focus)

SHARED TEXT (dark ink on light slate)
text primary:   #1A1814
text muted:     #4A453E
text dim:       #7A736A
text inverse:   #F2EFE9  (only for text ON ember-filled buttons)

EMBER COLORS (use the one specified per screen below)
Slate Ember:      #F89444  (orange — landing, dashboard)
Slate Marigold:   #E8AA2A  (golden orange — pricing)
Slate Saffron:    #E5B225  (yellow — audit details)
Slate Amber:      #FFA500  (bright amber — Fix Studio)
Slate Terracotta: #C6553C  (red-orange — sign in)
Slate Ochre:      #B85C1F  (burnt orange — docs)

FUNCTIONAL ACCENTS (sparingly, only for states)
violet:   #A855F7  (Pro tier badge, premium features)
lime:     #A3FF12  (success, passing checks)
magenta:  #FF006E  (warnings, failing checks)

TYPOGRAPHY
Display: Geist (https://vercel.com/font/geist) variable, free
Body:    Inter (https://rsms.me/inter/) variable, free
Mono:    Geist Mono (numbers, scores, code, terminal)

TYPE SCALE
Hero headline:    72px / weight 600 / letter-spacing -0.04em
Section heading:  36px / weight 600 / letter-spacing -0.02em
Card heading:     20px / weight 600 / letter-spacing -0.01em
Body:             16px / weight 400
Caption:          14px / weight 400 / letter-spacing 0.01em
Mono scores:      24px mono / weight 500 / letter-spacing -0.02em / tabular-nums

COMPONENT TOKENS
Corner radius:  16px cards, 12px buttons, full pills
Borders:        1px hairline rgba(26, 24, 20, 0.08)
Shadows:        AVOID heavy drop-shadows. Use translucency and grain instead.
Layout:         bento grids and asymmetric compositions, NOT rigid symmetric rows.

═══════════════════════════════════════════════════════════════════
THE EMBER BLOOM (the signature visual element) — v3.3 RULES
═══════════════════════════════════════════════════════════════════

The bloom is a single soft warm circle of the page's ember color, anchored asymmetrically over the slate base. It is the brand signature.

CRITICAL v3.3 RULES (these come from previous design iterations):

1. NEVER use smooth CSS aurora/rainbow gradients. The bloom is built
   from layered radial gradients with paper grain, not from a single
   linear-gradient.

2. NEVER put a bright white pinpoint at the bloom center. The
   previous design generated a "white hole" effect at the center
   which read as a sun. Removed permanently. The center of the
   bloom is slightly DEEPER than the halo (chiaroscuro), not
   brighter.

3. The bloom must DRIFT slowly. The position of the bloom center
   should orbit on a slow lissajous curve over 25 to 32 seconds,
   amplitude 10 to 14 percent of width and 6 to 9 percent of height.
   Not a static dot. Not a fast pulse.

4. Use heavy film grain across the ENTIRE canvas (not just the
   bloom area). The grain should crossfade smoothly between tiles,
   not strobe. Calm 3-second tile cycle.

5. The bloom should read as a warm presence, not as an orange
   sun. The orange should obviously be there but the slate should
   still dominate as the page color. Roughly 65-75% slate visible.

6. Composition is ASYMMETRIC. The bloom anchors at upper-right,
   upper-left, or one side. Never centered. Never radially
   symmetric. Never a perfect circle in the middle.

═══════════════════════════════════════════════════════════════════
REFERENCE WEBSITES (study these URLs)
═══════════════════════════════════════════════════════════════════

Primary visual references:
- https://www.aesop.com/  (warm slate aesthetic, editorial sophistication)
- https://www.muji.com/  (refined minimal palette, calm)
- https://resend.com/  (warm editorial restraint)
- https://www.notion.so/  (light-friendly product surfaces)

Brand vibe references:
- https://linear.app/  (refined minimalism)
- https://stripe.com/  (sophisticated technical depth)
- https://vercel.com/  (typography excellence)
- https://www.planetscale.com/  (developer dashboard density done well)
- https://www.fey.com/  (sophisticated data presentation)

Typography sources:
- https://vercel.com/font/geist
- https://rsms.me/inter/

REJECT (auto-fail):
- https://www.tryprofound.com/  (enterprise template look)
- https://peec.ai/  (mid-market template SaaS)
- https://otterly.ai/  (budget tool look)
- Any default Tailwind UI template
- Any default Material UI screen

═══════════════════════════════════════════════════════════════════
ANTI-GENERIC CHECKLIST (design FAILS if any of these appear)
═══════════════════════════════════════════════════════════════════

- NO bright white pinpoint at the bloom center
- NO smooth CSS aurora rainbow gradients
- NO orange sun dominating the canvas
- NO dark or midnight backgrounds (we are LIGHT slate)
- NO centered hero compositions
- NO three-feature blocks with stock icons
- NO purple gradient on white background
- NO "Built with Next.js" badges in footer
- NO testimonial carousels
- NO numbered step circles ("1, 2, 3 how it works")
- NO AI chat avatar in corner
- NO em-dashes anywhere in copy (the number-one AI text tell)
- NO words: delve, navigate, tapestry, realm, leverage, harness, unlock the potential, seamless, in today's fast-paced world
- NO exclamation marks in product UI
- NO spinning loaders (skeleton shimmer instead)
- NO auto-playing videos
- NO "Get Started" or "Learn More" button labels (use specific verbs)

═══════════════════════════════════════════════════════════════════
COPY VOICE
═══════════════════════════════════════════════════════════════════

Tone: friendly + educational. Sharp not warm. Confident not cocky.

Good copy example:
"Audit any site for SEO, AEO, and GEO across 55 checks. Then let AI write the fixes."

Bad copy to NEVER produce:
"Unlock the power of AI-driven SEO with Answerable, the cutting-edge platform that leverages intelligent algorithms..."

Word swaps:
leverage → use
utilize → use
facilitate → help
seamless → smooth, or delete
cutting-edge → delete
powerful → specific capability
intelligent → specific behavior
```

Stop pasting at this point and add the screen-specific section below.

---

## PROMPT 02 · PRICING (Slate Marigold at 60%)

Paste the SHARED HEADER above first, then this:

```
═══════════════════════════════════════════════════════════════════
NOW DESIGN: PRICING SECTION
═══════════════════════════════════════════════════════════════════

Fidelity: HIGH FIDELITY
Canvas size: 1440 by 900 pixels
Page ember: Slate Marigold #E8AA2A (golden orange)
Bloom intensity: 60 percent (visible warm presence, never dominating)
Bloom position: upper-center, slightly to one side
Purpose: A Pro-curious visitor lands here and decides whether $29 per month is worth it. The pricing must make the upgrade decision obvious in 5 seconds.

═══════════════════════════════════════════════════════════════════
LAYOUT
═══════════════════════════════════════════════════════════════════

Top nav (height 76px):
- Left: Answerable wordmark with small marigold ember-dot accent inside a square frame
- Center-left: links Pricing, Docs, GitHub
- Right: ghost button "Sign in with GitHub"

Main content centered horizontally:
- Eyebrow line in mono: "PRICING" with a small marigold dot
- Section heading (36px): "Free is for verification. Pro is for monitoring and fixing."
- Sub: "No credit card to try. Cancel any time. Open source forever."
- Monthly/Annual toggle (pill-shaped, 4px padding, hairline border). Active state: solid slate background. Inactive: ghost. Annual side has small "save 15%" in marigold.

Two pricing cards side by side, each 360px wide, glass surfaces:
- LEFT CARD (Free)
  - Name: "Free" (display 18px)
  - Price: "$0" (mono 38px) followed by small caption "forever"
  - Tagline: "For trying it out and self-hosting."
  - Feature list with marigold-dot bullets:
    - Audit engine (open source)
    - Three scores: SEO + AEO + GEO
    - CLI: pnpm dlx @answerable-kit/cli
    - GitHub Action for PR audits
    - Public score badge for your README
    - Latest audit in web dashboard
  - CTA: ghost button "Install the CLI"

- RIGHT CARD (Pro) — visually heavier
  - Translated up 8px (sits higher than Free)
  - Marigold border (1px solid)
  - "Most popular" pill at top-right, marigold filled, white text, mono uppercase
  - Name: "Pro"
  - Price: "$29" (mono 38px) followed by "/ month"
  - Tagline: "For founders who ship weekly."
  - Feature list:
    - Everything in Free, plus:
    - AI fixes as code · 90 per month
    - Auto-audits every 24 hours
    - 30-day history + trend graphs
    - Up to 3 sites
    - Weekly email digest
    - Detailed evidence per finding
  - CTA: solid marigold button "Start Pro" with inverse text

Below the two cards, a horizontal "Studio coming soon" tease card:
- Dashed border with violet accent
- Violet pill "Studio"
- Text: "$99 / month · auto-PR to GitHub · Team accounts · API access · Coming Q3 2026"
- Link "Join waitlist" at the right in violet

═══════════════════════════════════════════════════════════════════
REAL DATA TO USE
═══════════════════════════════════════════════════════════════════

Use the exact pricing tiers, feature bullets, and copy above. Do not invent fake testimonials, do not add a comparison table at the bottom, do not add fake "X happy customers" counters.

Bloom: marigold #E8AA2A, slightly behind the Pro card, asymmetric placement, 60 percent intensity, slow drift. Heavy paper grain across the whole canvas. NO bright white pinpoint.
```

---

## PROMPT 03 · DASHBOARD HOME (Slate Ember at 35%)

Paste the SHARED HEADER above first, then this:

```
═══════════════════════════════════════════════════════════════════
NOW DESIGN: DASHBOARD HOME (signed-in Pro user)
═══════════════════════════════════════════════════════════════════

Fidelity: HIGH FIDELITY
Canvas size: 1440 by 900 pixels
Page ember: Slate Ember #F89444 (orange, same as landing but at much lower intensity)
Bloom intensity: 35 percent (ambient, the bloom is supporting the data, not competing)
Bloom position: upper-right of the main content area, subtle
Purpose: The screen the user opens daily. Must communicate scores and changes at a glance, and pull them into action without overwhelm. This is the ProductHunt demo screen.

═══════════════════════════════════════════════════════════════════
LAYOUT
═══════════════════════════════════════════════════════════════════

Left sidebar (240px wide, glass surface bg-elevated #E0DCD5):
- Top: Answerable wordmark with ember dot mark
- Section label (mono uppercase 11px): "Site"
- Active site row: small ember dot, "answerable.io"
- Inactive site row: small violet dot, "docs.answerable.io"
- Section label: "Navigate"
- Active item: "Audits" with 3px ember vertical bar on its left edge
- Items: "Findings" (with count 3 right-aligned), "AI Fixes" (with 23/90 right-aligned), "Settings"

Main area (right of sidebar, padded 26 36 32px):
- Top bar: site switcher pill (mono, with ember dot + chevron) on left, AI fix quota meta on right ("Daily AI fixes · 2 of 3 used · resets in 4h 23m")
- Score row: 4 score cards in a horizontal grid (3 ember-bar scores + 1 aggregate gradient card)

EACH SCORE CARD:
- Label (mono uppercase 11.5px) at top: SEO, AEO, GEO, or "Aggregate"
- For improving scores: small lime "▲ improving" right-aligned
- For declining: magenta "▼ declining"
- For aggregate: "Strong" band name in mono
- Big number (mono 46px, weight 500): the score with "/100" in muted small
- Progress bar at bottom: 4px height, slate track, ember-gradient fill at score percent

SCORES TO RENDER:
- SEO 92 (improving)
- AEO 87 (improving)
- GEO 74 (declining)
- Aggregate 84 (Strong)

Below the score row, bento grid with 2 columns (2fr 1fr):

LEFT COLUMN (wider):
- Trend tile: header "Score trend" + "Last 7 days" right-aligned mono caption
- SVG line chart with 3 series (dark ink for SEO, violet for AEO, magenta for GEO)
- Data points showing SEO stable around 88-92, AEO climbing 80-87, GEO declining 80-74
- Day labels (Mon-Sun) in mono caption beneath
- Below: AI Fixes tile horizontal
  - Conic-gradient progress ring (ember filled to 92 degrees of 360)
  - "23/90" in inner of ring
  - "AI Fixes this month" + sub "67 remaining · resets May 31"
  - Right-side ghost button "Generate fix"

RIGHT COLUMN (narrower):
- Recent findings tile: header "Recent findings" + "3 new" right-aligned
- 3 finding rows divided by hairline:
  - A4 · Canonical missing on /pricing · [High] pill (magenta)
  - G1 · llms.txt absent · [Med] pill (ochre)
  - C3 · WebSite schema incomplete · [Low] pill (dim)
- Below: Next scheduled audit tile
  - "Tomorrow 03:42 UTC" + "Next scheduled audit"
  - Solid ember button "Re-audit"

═══════════════════════════════════════════════════════════════════
REAL DATA
═══════════════════════════════════════════════════════════════════

Use the exact site name "answerable.io" and the exact scores above. The findings (A4, G1, C3) are real check IDs from our audit framework. Daily AI fix counter: "2 of 3 used."

Bloom: ember #F89444, 35 percent intensity, subtle ambient warmth in the upper-right of the content area, slow drift. The slate should clearly dominate the page. The bloom should be felt, not seen. Heavy paper grain. NO white pinpoint.
```

---

## PROMPT 04 · FIX STUDIO PANEL (Slate Amber at 40%)

Paste the SHARED HEADER above first, then this:

```
═══════════════════════════════════════════════════════════════════
NOW DESIGN: FIX STUDIO PANEL (the magic moment)
═══════════════════════════════════════════════════════════════════

Fidelity: HIGH FIDELITY
Canvas size: 1440 by 900 pixels
Page ember: Slate Amber #FFA500 (the brightest of the family, for the magical moment)
Bloom intensity: 40 percent
Bloom position: subtle halo behind the streaming text area inside the panel
Purpose: The screen that justifies $29 per month. User clicks "Generate fix with AI" on a failing check, and AI generates real code in front of them. Must feel like magic but credible.

═══════════════════════════════════════════════════════════════════
LAYOUT
═══════════════════════════════════════════════════════════════════

Background: dimmed Dashboard at roughly 45 percent opacity with a slight blur. Just enough context that the user remembers where they are. Do NOT design the full dashboard underneath, but a few score cards visible in faded form is fine for context.

RIGHT SIDE PANEL (582 pixels wide, full viewport height):
- Glass surface (semi-transparent lighter slate with 16px backdrop blur)
- 1px hairline left border
- Faint amber tint gradient overlay in the upper area

Panel header (padded 22 26 16):
- TOP ROW
  - Title: small ember pill "A4" + display 17px "Generate fix for Canonical"
  - Right: 28x28 close X button (ghost square)
- Sub-line: text-muted "Missing canonical link on /pricing page · severity high"
- Hairline bottom border

Panel body (padded 20 26, scrollable):

1. Status indicator: 
   - mono uppercase 12px, ember color
   - "● Generated in 2.1s" with pulsing dot
   - Subtle box-shadow halo on the dot, animating in 1.6s loop

2. Code block:
   - Background: slate-recessed with hairline border, 12px radius
   - Mono 13px / line-height 1.65
   - Syntax-highlighted real meta tag:
     `<link rel="canonical" href="https://answerable.io/pricing" />`
   - "link" tag in ember-shaded color
   - "rel" / "href" attributes in violet
   - String values in slightly deeper ember

3. Explanation block:
   - Left border (2px ember-tinted)
   - Padded 12px left
   - "Why this matters." bold heading
   - "This tells search engines and AI crawlers that /pricing is the authoritative version of this page, preventing duplicate content issues across query parameters and tracking variants. Both SEO and GEO scores will lift on the next audit."

4. Impact estimate row:
   - Mono caption
   - Inset card with hairline border
   - "Impact" label · "+3 SEO · +1 GEO" in bold dark · "Estimated" right-aligned in dim

Panel footer (padded 16 26, top hairline border):
- Action buttons in a row:
  - "Copy code" (ghost button, height 42)
  - "Download .patch" (quiet button, height 42)
  - "Apply as PR" (quiet button, locked-feel, with violet "Studio" pill on it, opacity 0.55)
- Right-aligned mono meta: "Daily AI fixes: 1 of 3 remaining"

═══════════════════════════════════════════════════════════════════
REAL DATA
═══════════════════════════════════════════════════════════════════

Check ID: A4 Canonical
Generated meta tag exactly: <link rel="canonical" href="https://answerable.io/pricing" />
Explanation copy verbatim from above. Impact estimate "+3 SEO, +1 GEO".

Bloom: amber #FFA500, 40 percent intensity, subtle halo behind the streaming text area inside the panel (not the full canvas). Slow drift. Heavy grain across the panel surface. NO white pinpoint.

The panel itself uses heavy paper grain and the amber bloom inside its glass surface to communicate "AI is working here." The dimmed dashboard underneath stays muted so the panel is the focus.
```

---

## PROMPT 05 · SIGN IN (Slate Terracotta at 60%)

Paste the SHARED HEADER above first, then this:

```
═══════════════════════════════════════════════════════════════════
NOW DESIGN: SIGN IN PAGE
═══════════════════════════════════════════════════════════════════

Fidelity: HIGH FIDELITY
Canvas size: 1440 by 900 pixels
Page ember: Slate Terracotta #C6553C (warm red-orange, the warmest variant)
Bloom intensity: 60 percent
Bloom position: dominates the LEFT half of the viewport (large, off-center)
Purpose: New user arrived from CLI footer link or marketing page. Must convert sign-up in under 5 seconds with zero friction.

═══════════════════════════════════════════════════════════════════
LAYOUT
═══════════════════════════════════════════════════════════════════

Asymmetric two-column split (1fr 1fr):

LEFT SIDE (bloom dominates here):
- 56px padding all around
- Top: Answerable wordmark with terracotta ember-dot mark inside the square frame
- Middle (large area): editorial quote in display weight 500, 30px size:
  "SEO that lives in your codebase. Audit, fix, and ship in one tool."
  Where "ship" is emphasized in terracotta color and weight 600.
- Bottom: meta strip in mono uppercase 12px, text-muted:
  "MIT licensed · 500+ stars · 50k weekly downloads"
  with small dot dividers between segments

The bloom is the visual hero of the left side. Large, soft, terracotta, anchored at roughly cx=28% cy=45%. Heavy grain.

RIGHT SIDE (glass card centered):
- Background slate, no dominant bloom here
- Centered card 380px wide, padded 32px
- Glass surface (lighter slate with backdrop blur)
- 1px border in terracotta-tinted color

Card content (vertical stack with 18px gaps):
- Small wordmark "Answerable" in display 14px text-muted
- Big heading "Welcome." (display 28px weight 600)
- Sub: "Audit your site for SEO, AEO, and GEO. Then let AI write the fixes as code." (14.5px text-muted)
- Actions stack (10px gaps):
  - Primary solid terracotta button "Continue with GitHub" with GitHub icon (height 46)
  - Quiet button "Continue with Google" with Google icon (height 46)
- Divider line in mono 11.5px uppercase: "Free to sign up · no credit card"
- Footer in 13px text-muted: "By continuing you agree to our terms and privacy."
  Where "terms" and "privacy" are terracotta-tinted inline links.

═══════════════════════════════════════════════════════════════════
REAL DATA
═══════════════════════════════════════════════════════════════════

Use the exact copy above for the quote, heading, sub, and footer. The "MIT licensed" / "500+ stars" / "50k weekly downloads" is real (the repo IS MIT, the targets are realistic launch numbers).

Bloom: terracotta #C6553C, 60 percent intensity. Large, soft, asymmetric — dominates the left half. Heavy paper grain across both halves. NO bright white pinpoint at the bloom center. The bloom should feel like a warm welcome lamp at the entrance, not a sun.
```

---

## Quality control: run this checklist after every generation

| Check | Pass criteria |
|---|---|
| Background is slate `#D6D2CB` (not `#C9C5BE` from earlier explorations, not midnight) | ✅ |
| Heavy film grain across full canvas | ✅ |
| Page-specific ember color used (one of the 6 in the brand system) | ✅ |
| **No bright white pinpoint at bloom center** | ✅ (most important — this was the recurring failure mode) |
| Bloom is asymmetric, NOT centered | ✅ |
| Slate dominates the page (~65-75% of the visible color) | ✅ |
| Bloom feels like warm presence, not orange sun | ✅ |
| Dark ink text (#1A1814) for body, readable | ✅ |
| Real data on screen (not lorem ipsum) | ✅ |
| Zero em-dashes in copy | ✅ |
| No three-feature icon blocks | ✅ |
| No default-feeling shadcn | ✅ |

If 3 or more checks fail, repaste the SHARED HEADER and force Claude Design to regenerate with explicit "use Slate Family v3.3 only, no white pinpoint, slate #D6D2CB base" instruction.

---

## After all 4 are generated

1. Screenshot each
2. Compare against the prototype version at `prototype/landing/` (open localhost:5500)
3. Pick the better implementation per screen (Claude Design vs my code)
4. Once locked, we move to TRD-V1.md

The reference implementation in `prototype/landing/` is the visual truth. If Claude Design's output diverges, the prototype is the source of truth. You can always paste my screenshots back into Claude Design as "match this exactly" reference.
