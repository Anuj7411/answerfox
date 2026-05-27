# Master Claude Design Prompt for Answerable

**Use this prompt every time you start a new design in Claude Design (claude.ai/design).**

Paste the prompt below. Fill in the bracketed values. Iterate. Reject anything that drifts from the rules.

---

## How to use this file

1. Pick which screen you are designing
2. Copy the full prompt below
3. Replace `[SCREEN]` and `[DESCRIBE WHAT THIS SCREEN DOES]` at the bottom
4. Paste into Claude Design as your starting prompt
5. Iterate until the output passes the Anti-Generic Checklist
6. If Claude Design drifts, repaste the rules section

**The order to design screens in:**
1. Design system (colors, type, components)
2. Landing page hero
3. Pricing section
4. Dashboard home (three scores)
5. Audit details view
6. Fix Studio panel
7. Sign-in / Sign-up
8. Empty states + error states
9. Email templates (digest, alerts)

---

## THE MASTER PROMPT (paste this)

```
You are designing a screen for Answerable, an open-source AI-SEO toolkit. This is a v1 launch product targeting indie developers in 2026. The visual ambition is awwwards-level, not template SaaS. The user is going to evaluate this design against shader-gradient.co, skiper-ui.com, 21st.dev, and Aceternity UI references.

PRODUCT CONTEXT (one paragraph)
Answerable audits any website across SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization), then generates the actual code fixes using AI. The differentiator is three scores side by side (SEO + AEO + GEO unified) and the only open-source AI-SEO toolkit. Target users are solo founders building Next.js, Astro, and Remix products who hate marketing fluff and respect tools that respect their intelligence.

POSITIONING SENTENCE
Answerable is the only open-source AI-SEO toolkit (SEO + AEO + GEO unified) that lives in your codebase and ships fixes as code.

═══════════════════════════════════════════════════════════════════
DESIGN SYSTEM (NON NEGOTIABLE, USE EXACTLY THESE VALUES)
═══════════════════════════════════════════════════════════════════

COLOR PALETTE (dark mode default, no light mode in v1)

Background base:        #0A0E1A  (deep midnight)
Background elevated:    #10162A  (raised surface, cards)
Background glass:       rgba(20, 26, 48, 0.6) + 12px backdrop-blur
Text primary:           #F2F4F8  (warm white)
Text muted:             #7B8BA8  (cool gray)
Text dim:               #4A5A78  (disabled, metadata)
Border subtle:          rgba(255, 255, 255, 0.08)
Border strong:          rgba(255, 255, 255, 0.16)

ACCENT COLORS
Accent cyan:            #00F0FF  (electric cyan, links, focus, info)
Accent violet:          #A855F7  (premium tier, Pro features)
Accent magenta:         #FF006E  (warnings, alerts, fail states)
Accent lime:            #A3FF12  (success, passing checks)

THE SIGNATURE AURORA GRADIENT (use sparingly: hero, CTAs, score bars, brand mark)
linear-gradient(135deg, #00F0FF 0%, #A855F7 50%, #FF006E 100%)

Best as an animated WebGL shader (reference shader-gradient.co). Slow drift over 8 to 12 seconds. Never aggressive. Calm but alive.

TYPOGRAPHY
Display font:           Geist (sans, variable, free from Vercel)
Body font:              Inter (variable, free)
Mono font:              Geist Mono (numbers, scores, code, terminal output)

TYPE SCALE
Hero headline:          72px / weight 600 / letter-spacing -0.04em
Section heading:        36px / weight 600 / letter-spacing -0.02em
Card heading:           20px / weight 600 / letter-spacing -0.01em
Body:                   16px / weight 400
Caption:                14px / weight 400 / letter-spacing 0.01em
Mono / scores:          24px mono / weight 500 / letter-spacing -0.02em / tabular-nums

Tight tracking on big text. Default on body. Slightly open on captions.

COMPONENT SYSTEM
Corner radius:          16px on cards (rounded-2xl)
                        12px on buttons (rounded-xl)
                        full on pills
Borders:                hairline (1px) using rgba white at 0.08 alpha
Shadows:                AVOID heavy drop shadows. Use inner glow or backdrop blur instead.
Hover states:           subtle inner glow + 1px translate up
Layout:                 bento grids (12-col irregular), not symmetric rows
Dense areas:            tables, data, lists (information-rich, tight)
Spacious areas:         marketing chrome, hero, headers (calm, breathing room)

═══════════════════════════════════════════════════════════════════
2026 DESIGN TRENDS TO USE (be intentional, never decorative)
═══════════════════════════════════════════════════════════════════

✅ Glass morphism (semi-translucent cards over animated mesh gradient backgrounds)
✅ Aurora / iridescent gradients (the signature visual identity)
✅ Bento grid layouts (irregular tile compositions, not rigid columns)
✅ Variable font weights and tight letter-spacing on display text
✅ Custom cursors and micro-interactions where they communicate state
✅ Animated mesh gradients in hero areas (use shader-gradient style)
✅ Spatial depth through layering and translucency (not box-shadow)
✅ Sharp data presentation: monospace numbers, tabular-nums, color-coded
✅ Hand-finished feel: custom focus rings, custom toggles, custom range sliders
✅ Restrained motion (everything animates, nothing jitters)
✅ AI-first interfaces (real data on screen, real evidence inline, no fake demos)

═══════════════════════════════════════════════════════════════════
ANTI-GENERIC CHECKLIST (DESIGN FAILS IF ANY OF THESE APPEAR)
═══════════════════════════════════════════════════════════════════

❌ Centered hero with subtle gradient and a "Get Started" button (every AI SaaS does this)
❌ Three-feature blocks with cute icons in rows (template SaaS tell)
❌ Purple gradient on white background (the universal AI startup look)
❌ "Built with [stack]" badges in the footer
❌ "Loved by developers at [generic company logos]" without real logos
❌ Stock isometric illustrations
❌ Default shadcn components without customization (instant template recognition)
❌ Generic Material Design or Bootstrap defaults
❌ 47 testimonials in a carousel
❌ Numbered step circles ("1, 2, 3 how it works")
❌ Big animated "5x your productivity" stats counters
❌ AI chat avatar with speech bubble in corner
❌ "Limited time offer" or fake scarcity
❌ Lottie animations from the LottieFiles browse page (recognizable, used everywhere)
❌ Stock photography from Unsplash for hero images
❌ Em-dashes (—) anywhere in copy (the #1 AI-generated text tell)
❌ Words like "delve", "navigate", "tapestry", "realm", "leverage", "harness", "unlock the potential", "in today's fast-paced world"
❌ Exclamation marks in product UI (looks AI-eager)
❌ More than one emoji per page on marketing pages (zero in product UI)
❌ Spinning loaders (use skeleton shimmer instead)
❌ Bouncy spring animations on serious data (use ease-out)
❌ Auto-playing videos on landing page hero
❌ "AI-powered" repeated as adjective on every feature
❌ Generic "Get Started" or "Learn More" button labels (use specific verbs)

═══════════════════════════════════════════════════════════════════
COPY VOICE (if any text appears in this screen)
═══════════════════════════════════════════════════════════════════

Tone: friendly + educational. Sharp, not warm. Confident, not cocky.

Word swaps (always):
"leverage" → "use"
"utilize" → "use"
"facilitate" → "help" or "make easier"
"robust" → specific quality
"comprehensive" → specific list
"seamless" → "smooth" or delete it
"cutting-edge" → delete it (show, do not tell)
"powerful" → specific capability
"intelligent" → specific behavior
"revolutionary" → delete it
"game-changer" → delete it

Good copy example:
"Answerable audits any website across 55 checks and writes the fixes for you. Open source. Three scores: SEO, AEO, GEO. One tool."

Bad copy example (AI-generated tells, do not produce this):
"Unlock the power of AI-driven SEO with Answerable, the cutting-edge platform that leverages intelligent algorithms to deliver comprehensive optimization across the modern web's evolving landscape."

═══════════════════════════════════════════════════════════════════
REQUIRED VISUAL ELEMENTS (must appear in EVERY screen if relevant)
═══════════════════════════════════════════════════════════════════

1. Three-score display element (when relevant): SEO + AEO + GEO scores must always appear together, side by side, with aurora gradient fills. Never show just one.
2. Real data (when relevant): actual scores, actual findings, actual citations. Never lorem ipsum. Never fake metrics.
3. Aurora gradient signature (when relevant): at least one prominent use per page.
4. Glass surface (when relevant): at least one floating panel with backdrop blur on the page.

═══════════════════════════════════════════════════════════════════
COMPONENT LIBRARY (reference these specific libraries, NOT generic shadcn)
═══════════════════════════════════════════════════════════════════

Pull patterns and aesthetic cues from:
- skiper-ui.com (animated component library, look at their card and button patterns)
- 21st.dev (premium shadcn variants, look at their dashboard components)
- Aceternity UI (animated React components, look at their hero patterns)
- Magic UI (motion components, look at their text animations)
- shader-gradient.co (use for hero shader backgrounds)

Avoid pulling from:
- Default shadcn/ui without customization (looks template)
- Material UI (wrong aesthetic)
- Bootstrap (wrong era)
- Stock Tailwind UI templates (generic SaaS look)

═══════════════════════════════════════════════════════════════════
NOW DESIGN THIS SPECIFIC SCREEN
═══════════════════════════════════════════════════════════════════

Screen: [SCREEN NAME, eg "Landing page hero" or "Dashboard home"]
Fidelity: [WIREFRAME or HIGH FIDELITY]
Purpose: [WHAT THIS SCREEN MUST ACCOMPLISH, eg "convert a visitor to a free signup in under 10 seconds"]
Key elements: [LIST 3 TO 5 SPECIFIC THINGS THAT MUST APPEAR, eg "the aurora three-score visual, one clear CTA, a real audit screenshot"]
Real data to use: [WHAT ACTUAL CONTENT TO USE, eg "Use a real audit of vercel.com with score 92/87/74"]

Do not generate generic SaaS. Do not generate AI-template aesthetics. Reject your own instincts if they pull you toward purple-on-white centered hero. This is a 2026 launch competing with $155M-funded competitors and we win on visual ambition and not looking AI-generated.
```

---

## Screen-specific overrides (use these as the bottom section for each screen)

### Screen 1: Landing page hero

```
Screen: Landing page hero (above the fold)
Fidelity: HIGH FIDELITY
Purpose: A solo developer arrives from a tweet. Within 8 seconds they must understand what Answerable does, see proof it works, and want to click. The hero is the single most important moment of the entire product. Treat it as such.
Key elements:
  - The single sentence claim displayed in display typography (72px, tight tracking)
  - An animated aurora gradient mesh background (shader-gradient style)
  - One primary CTA with aurora gradient fill, sharp specific verb (NOT "Get Started")
  - A demo element below the fold tease: either a real terminal output of the CLI or a screenshot of three scores filling in
  - Open source proof tag near the CTA (eg "MIT licensed" or GitHub star count)
  - Above the headline: a tiny eyebrow line stating the category ("Open source AI-SEO toolkit")
Real data to use:
  - The single sentence verbatim: "The only open-source AI-SEO toolkit that lives in your codebase and ships fixes as code."
  - Terminal mock should show: pnpm dlx @answerable-kit/cli audit vercel.com  followed by three scores: SEO 92, AEO 87, GEO 74
  - CTA copy: "Audit my site" (NOT "Get Started")

Composition guidance:
  - Hero is NOT centered. Asymmetric. Big claim on left, demo element on right, or stacked with intentional offset.
  - Mesh gradient is animated and behind everything, with low opacity over the deep midnight background.
  - One glass card floating in the composition holding the demo or terminal mock.

Do not generate: centered hero, three icon feature grid, generic Get Started button, purple-on-white anything.
```

### Screen 2: Dashboard home (three scores)

```
Screen: Dashboard home for a signed-in Pro user
Fidelity: HIGH FIDELITY
Purpose: This is the product's defining screen. The user opens it daily to see how their sites are doing. It must communicate scores and changes at a glance, and pull them into action (re-audit, generate fixes, view findings) without overwhelm. This is the screen the ProductHunt demo will show.
Key elements:
  - Three large score cards (SEO, AEO, GEO) at the top, side by side, with aurora gradient fills on score bars
  - One smaller aggregate score card or overall band indicator
  - Below: a bento grid with 3 to 5 irregular tiles showing: trend chart, recent findings list, AI fix counter, latest audit timestamp, next scheduled audit
  - Top nav with: logo, site switcher (current site dropdown), AI fix counter (Daily AI fixes: 2 of 3), user avatar
  - Side nav (collapsible): Audits, Findings, AI Fixes, Settings
  - One primary action available from this screen: "Re-audit my site" button
Real data to use:
  - Site name: a real demo site name like "answerable.io" or invent one believable
  - SEO 92, AEO 87, GEO 74, Aggregate 84 (Strong band)
  - Trend: 7 days of three lines (SEO, AEO, GEO) with the lime accent for upward, magenta for downward
  - Findings list: 3 real-looking findings like "A4 canonical missing", "G1 llms.txt absent", "C3 WebSite schema incomplete"
  - Daily AI fixes counter: "2 of 3 used today, resets at midnight UTC"

Composition guidance:
  - Bento grid is asymmetric. One tile is 2x normal width. One tile is 2x normal height. Visual interest through irregularity.
  - Glass surfaces float over a subtle animated mesh gradient background (less prominent than landing hero).
  - Numbers in monospace, tabular, large.
  - The score bars use the aurora gradient and fill from left at the appropriate percentage. Empty space is a hairline rule.

Do not generate: rigid 3-column dashboard, generic SaaS chart components, sidebar with default shadcn list items, stat cards with up-arrow icons.
```

### Screen 3: Pricing section

```
Screen: Pricing section on the landing page (likely 2nd or 3rd section after hero)
Fidelity: HIGH FIDELITY
Purpose: A Pro-curious visitor lands here and decides whether $29 per month is worth it. The pricing must make the upgrade decision obvious in 5 seconds.
Key elements:
  - Two cards side by side: Free and Pro. (Studio shown smaller below as "coming soon" with email capture)
  - Free card: minimal styling, deep midnight background, hairline border
  - Pro card: aurora gradient border or subtle violet accent, slightly elevated, the recommended choice
  - Each card lists the value props (NOT features, value props): what the user gets, in plain language
  - One toggle for monthly vs annual (15 percent savings on annual)
  - Pro card has a prominent CTA with aurora gradient: "Start Pro"
  - Below the cards: a 1-line comparison statement that reframes the choice
Real data to use:
  - Free card: "Audit engine (OSS), Three scores: SEO + AEO + GEO, CLI: pnpm dlx, GitHub Action, Public score badge, Latest score in web dashboard"
  - Pro card: "Everything in Free, plus: AI generates fixes as code (90 per month), Auto audits every 24 hours, 30-day history + trend graphs, Up to 3 sites, Weekly email digest, Detailed evidence per finding"
  - Footer line under cards: "Free is for verification. Pro is for monitoring and fixing."

Composition guidance:
  - Pro card is visually heavier (slightly larger, aurora-accent border, "Most popular" pill).
  - No comparison table beneath (kept tight).
  - The annual savings is a small toggle, not a flashy badge.
  - Studio "coming soon" shown as a small card or tile below, with violet accent and email capture input.

Do not generate: three-card comparison with Enterprise, fake scarcity countdown timers, "save 50% today" banners, checkmark grid with 47 features.
```

### Screen 4: Fix Studio panel (the magic moment)

```
Screen: Fix Studio side panel slides in from right when user clicks "Generate fix with AI" on a failing check
Fidelity: HIGH FIDELITY
Purpose: This is the moment that justifies the $29. The user sees AI generate actual code in front of them. It must feel like magic but credible (real code, not lorem ipsum).
Key elements:
  - Right side panel, roughly 40% of viewport width
  - Header of panel: which check this is fixing (eg "A4: Missing canonical link") with severity badge
  - Streaming text effect as the AI generates the fix (use shimmer + text appearing word by word)
  - The fix output: a code block with syntax highlighting (use Geist Mono)
  - Three action buttons at bottom: Copy code, Download as .patch, Apply to GitHub PR (Studio tier only, locked icon)
  - A small token cost line at the bottom (transparency): "Generated in 2.1s. Quota remaining today: 1 of 3."
Real data to use:
  - Check ID: A4 Canonical
  - Generated meta tag content:  <link rel="canonical" href="https://yoursite.com/about">
  - Or for a schema check, a real JSON-LD code block

Composition guidance:
  - The panel uses glass surface (semi-transparent) over the dashboard behind, with backdrop blur.
  - The streaming text uses a subtle cursor blink and lime accent on newly appearing characters that fade to text-primary white over 200ms.
  - The code block has a hairline border, dim corner labels showing the language, copy button on hover.
  - No close button - press Esc to close, or click outside panel.

Do not generate: full modal overlay (we use a side panel for context preservation), generic code editor, fake green checkmarks "All fixed!"
```

---

## Quality control: the Anti-Generic Checklist (run before approving any design)

Before accepting a Claude Design output, check every item:

- [ ] Zero em-dashes anywhere in the copy
- [ ] Zero centered-hero-with-subtle-gradient compositions
- [ ] Zero three-feature blocks with stock icons
- [ ] Zero purple-on-white "AI startup" looks
- [ ] Zero default-feeling shadcn components
- [ ] Zero AI tells in copy (delve, leverage, harness, unlock, navigate, in today's fast-paced world)
- [ ] Zero exclamation marks in product UI
- [ ] Zero spinning loaders
- [ ] At least one aurora gradient prominent use
- [ ] At least one glass surface with backdrop blur
- [ ] At least one bento grid composition (where layout is dense)
- [ ] Real data present (real scores, real findings, real text)
- [ ] Numbers in monospace with tight tracking
- [ ] Asymmetric, not symmetric, layouts where the screen has multiple elements

If 3+ items fail, reject and repaste the master prompt. Claude Design has drifted.

---

## The single rule (hang on your wall)

> If a design choice could appear on any other generic AI-SaaS landing page in 2026, do not ship it.

This is what we are protecting against. The funded competitors will all converge on the same purple-gradient template SaaS look. We win by refusing to.
