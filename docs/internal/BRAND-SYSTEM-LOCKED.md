# Answerable Brand System — LOCKED

**Status:** Locked 2026-05-28. Source of truth for every visual decision from this point forward.
**Supersedes:** Aurora gradient references in `BRAND-BRIEF.md` (which now serves as exploration history).
**Companion:** `BRAND-BRIEF.md` still governs voice, copy rules, anti-AI checklist, typography. This doc replaces only the color and gradient sections.

---

## 1. The Brand Mark

The signature visual element of Answerable is **the ember bloom** — a single warm orange dot blooming softly over a calm slate background.

```
   . . . . . . . . . . . . . . . . . . . . . . . . . . .
   . . . . . . . . . . . . . . . . . . . . . . . . . . .
   . . . . . . . . . . . . . . . . . . . . . . . . . . .
   . . . . . . . . . . . . . . . . . . . . . . . . . . .
   . . . . . . . . . . . . . . . . . . . . . . . . . . .
   . . . . . . . . . . . . . . . . . . .  ⬢ ⬢  . . . . .       ← ember bloom
   . . . . . . . . . . . . . . . . . .  ⬢ ⬢ ⬢ ⬢  . . . .         (warm orange,
   . . . . . . . . . . . . . . . . . . . ⬢ ⬢  . . . . . .         soft fade,
   . . . . . . . . . . . . . . . . . . . . . . . . . . .         heavy grain)
   . . . . . . . . . . . . . . . . . . . . . . . . . . .
   . . . . . . . . . . . . . . . . . . . . . . . . . . .
       ←──────────── slate base, asymmetric ────────────→
```

The ember bloom translates everywhere:
- Favicon
- App icon
- Loading state
- Social card glow
- Email header
- Logo lockup accent
- ProductHunt launch image
- Twitter avatar

One mark. One brand.

---

## 2. The Slate Family — 6 Color Cousins

All variants share the same slate base `#C9C5BE`. Only the ember color shifts.

### Color tokens

| Variant | Ember hex | Personality | Used for |
|---|---|---|---|
| **Slate Ember** | `#E87B2C` | Confident, signature | Brand mark, landing hero, dashboard |
| **Slate Marigold** | `#E8AA2A` | Optimistic, golden | Pricing page |
| **Slate Saffron** | `#E5B225` | Analytical | Audit details, findings |
| **Slate Amber** | `#FFA500` | Magical, present | Fix Studio, AI moments |
| **Slate Terracotta** | `#C6553C` | Grounded, warm | Sign in, sign up |
| **Slate Ochre** | `#B85C1F` | Serious, technical | Documentation, settings |

### Shared background tokens

| Token | Hex | Use |
|---|---|---|
| `bg.base` | `#C9C5BE` | Page background across all variants |
| `bg.elevated` | `#D4D1CB` | Cards, raised surfaces (lighter than base) |
| `bg.recessed` | `#B8B4AD` | Inset elements, slight depression |
| `bg.glass` | `rgba(201, 197, 190, 0.6)` + 12px blur | Floating panels with backdrop blur |
| `border.subtle` | `rgba(26, 24, 20, 0.08)` | Card edges, dividers |
| `border.strong` | `rgba(26, 24, 20, 0.16)` | Active inputs, focused elements |

### Text colors (dark ink for slate background)

| Token | Hex | Use |
|---|---|---|
| `text.primary` | `#1A1814` | Body text, headings |
| `text.muted` | `#4A453E` | Captions, secondary info |
| `text.dim` | `#7A736A` | Disabled, metadata |
| `text.inverse` | `#F2EFE9` | Text on ember-colored backgrounds |

### Functional accent colors (kept from prior palette)

| Token | Hex | Use |
|---|---|---|
| `accent.violet` | `#A855F7` | Pro tier badge, premium features |
| `accent.lime` | `#A3FF12` | Success state, passing audit checks |
| `accent.magenta` | `#FF006E` | Warnings, failing checks, alerts |
| `accent.cyan` | `#00F0FF` | Links (low saturation use only) |

---

## 3. Page-to-Variant Mapping (memorize this table)

| Page / surface | Variant | Ember hex | Bloom intensity |
|---|---|---|---|
| **Landing page hero** | Slate Ember | `#E87B2C` | 80% |
| **Pricing page** | Slate Marigold | `#E8AA2A` | 60% |
| **Sign-in / Sign-up** | Slate Terracotta | `#C6553C` | 60% |
| **Documentation** | Slate Ochre | `#B85C1F` | 60% |
| **Dashboard home** | Slate Ember | `#E87B2C` | 35% |
| **Audit details** | Slate Saffron | `#E5B225` | 35% |
| **Fix Studio panel** | Slate Amber | `#FFA500` | 40% |
| **Settings / Billing** | Slate Ochre | `#B85C1F` | 25% |
| **Empty states / 404** | Slate Ember (Ink Drop variant) | `#E87B2C` | 15% |

If a page does not appear in this table, default to **Slate Ember at intensity matching the surface tier** (marketing = 60%, product = 30%).

---

## 4. Intensity Scale

The same gradient feels completely different at different intensities. Match intensity to context.

| Surface tier | Intensity | When |
|---|---|---|
| Marketing hero (impact moment) | **80%** | Landing hero only |
| Marketing supporting (pricing, docs, sign-in) | **60%** | Other marketing pages |
| Product primary (dashboard home, hero panels) | **35 to 40%** | Daily-use product views |
| Product secondary (settings, billing, admin) | **25%** | Less visited admin surfaces |
| Modals and overlays | **20%** | Just enough to feel branded |
| Body content background | **10 to 15%** | Subtle ambient only |
| Loading / empty / 404 | **15% + Ink Drop animation** | Patient, calm states |

---

## 5. The Three-Tier Visual System

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  TIER 1: PRIMARY (Slate Family)                                │
│  ────────────────────────────                                  │
│  6 ember cousins on shared slate base                          │
│  Used across all pages, marketing and product                  │
│  Animation: 12-second breath (bloom expands and contracts)     │
│                                                                │
│  TIER 2: SECONDARY (Dawn Strip)                                │
│  ───────────────────────────                                  │
│  Flat charcoal #2A2522 + single thin coral #FF6B6B band       │
│  Band positioned 70% down the canvas                           │
│  Heavy grain across both fields                                │
│  Animation: band drifts horizontally, 30-second loop           │
│  Used only for: ProductHunt launch banner, blog hero (rare),   │
│                 special marketing moments                       │
│  Frequency: less than 5% of all surfaces                       │
│                                                                │
│  TIER 3: TERTIARY (Ink Drop in Slate Ember palette)            │
│  ─────────────────────────────────────────────                │
│  Slate base + orange ember drop slowly spreading outward       │
│  No contraction, no breath                                     │
│  Animation: 30-second patient bloom, then resets               │
│  Used for: AI fix generation loading state, empty states,     │
│            404 pages, "thinking" moments                       │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Typography (unchanged from BRAND-BRIEF.md)

| Font | Use | Source |
|---|---|---|
| Geist | Display, headings | https://vercel.com/font/geist |
| Inter | Body text | https://rsms.me/inter/ |
| Geist Mono | Scores, code, terminal | Vercel |

### Type scale

| Use | Size | Weight | Letter spacing |
|---|---|---|---|
| Hero headline | 72px | 600 | -0.04em |
| Section heading | 36px | 600 | -0.02em |
| Card heading | 20px | 600 | -0.01em |
| Body | 16px | 400 | 0 |
| Caption | 14px | 400 | 0.01em |
| Mono / scores | 24px mono | 500 | -0.02em (tabular-nums) |

---

## 7. Component Aesthetic (revised for Slate palette)

**The look on Slate Family backgrounds:**
- Cards: lighter slate `#D4D1CB` with hairline ink borders `rgba(26, 24, 20, 0.08)`
- Buttons primary: ember color of current page variant
- Buttons secondary: ghost on slate, dark ink text and border
- Score bars: ember color of current page (filled portion) on `rgba(26, 24, 20, 0.06)` track
- Hover states: subtle inner ember glow + 1px translate up
- Shadows: AVOIDED. Use translucency and grain texture instead.
- Corner radius: 16px cards, 12px buttons, full on pills

**Text on slate backgrounds:**
- Body: `#1A1814` dark ink (high contrast, readable for long reads)
- Captions: `#4A453E` muted ink
- Mono numbers: dark ink with `tabular-nums`

**Text on ember-colored backgrounds:**
- Use `#F2EFE9` warm white inverse (only when ember is at full saturation, like on CTA buttons)

---

## 8. Motion (revised)

| Motion type | Where | Behavior |
|---|---|---|
| Breath bloom | Primary surfaces (all Tier 1 pages) | 12-second loop: ember expands subtly, contracts back. Eases in and out. |
| Patient spread | Tertiary (loading, empty, error states) | 30-second outward bloom, no contraction, fades and restarts |
| Coral band drift | Secondary (Dawn Strip moments) | Coral band drifts horizontally 1 to 2 pixels every 8 seconds |
| Score bar fill | On audit reveal | 1.2 second ease-out fill animation, ember color |
| Card entrance | On scroll into viewport | 400ms fade + 8px translate up, ease-out |
| Number count-up | On metric reveal | 600ms ease-out from 0 to final value |
| Skeleton shimmer | During async loads | 1.5s loop, slate gradient shifting left to right |
| Page transition | Between pages | 200ms fade through |

**Never use:**
- Spinning loaders (use skeleton shimmer)
- Bouncy spring on serious data
- Aurora rainbow animations (legacy, deprecated)

---

## 9. Layout Patterns (updated for Slate)

### Landing page (uses Slate Ember at 80%)
- Animated ember bloom in hero (upper-right or lower-right placement)
- Asymmetric composition, never centered
- Floating glass card with terminal demo (lighter slate, hairline border)
- One primary CTA filled with Slate Ember orange
- Hero text in `#1A1814` dark ink for high contrast

### Pricing (uses Slate Marigold at 60%)
- Two cards: Free (minimal) and Pro (marigold-accented border)
- Marigold accent on "Most popular" pill and Pro CTA
- Free card uses ghost button (no ember fill)
- Studio "coming soon" card below with violet accent

### Dashboard home (uses Slate Ember at 35%)
- Top nav: lighter slate `#D4D1CB` glass surface
- Side nav: collapsible, ember accent on active item left border
- Bento grid main area: irregular tiles, each a lighter slate card
- Three score cards: SEO, AEO, GEO numbers in mono, ember-filled progress bars
- Subtle ember bloom in background, 35% intensity

### Fix Studio (uses Slate Amber at 40%)
- Right side panel slides in (40% viewport width)
- Glass panel surface with backdrop blur
- Amber accent on the streaming text cursor
- Code block in monospace with subtle amber syntax highlights for new content
- "Generate fix" button: amber-filled

### Documentation (uses Slate Ochre at 60%)
- Sidebar navigation, ochre accent on active item
- Body content area: lighter slate background
- Long-form text rendered for max readability
- Code blocks: slightly darker slate `#B8B4AD` with hairline border
- Inline code: ochre-tinted background

---

## 10. The CSS Tokens (for engineering reference)

```css
:root {
  /* Backgrounds */
  --bg-base: #C9C5BE;
  --bg-elevated: #D4D1CB;
  --bg-recessed: #B8B4AD;
  --bg-glass: rgba(201, 197, 190, 0.6);

  /* Borders */
  --border-subtle: rgba(26, 24, 20, 0.08);
  --border-strong: rgba(26, 24, 20, 0.16);

  /* Text */
  --text-primary: #1A1814;
  --text-muted: #4A453E;
  --text-dim: #7A736A;
  --text-inverse: #F2EFE9;

  /* Slate Family embers */
  --ember: #E87B2C;
  --ember-marigold: #E8AA2A;
  --ember-saffron: #E5B225;
  --ember-amber: #FFA500;
  --ember-terracotta: #C6553C;
  --ember-ochre: #B85C1F;

  /* Functional accents */
  --accent-violet: #A855F7;
  --accent-lime: #A3FF12;
  --accent-magenta: #FF006E;
  --accent-cyan: #00F0FF;

  /* Dawn Strip (secondary tier) */
  --dawn-base: #2A2522;
  --dawn-band: #FF6B6B;
}

/* Page-level ember switching (theme prop on body or layout) */
body[data-page="landing"]   { --ember-active: var(--ember); --ember-intensity: 0.8; }
body[data-page="pricing"]   { --ember-active: var(--ember-marigold); --ember-intensity: 0.6; }
body[data-page="signin"]    { --ember-active: var(--ember-terracotta); --ember-intensity: 0.6; }
body[data-page="docs"]      { --ember-active: var(--ember-ochre); --ember-intensity: 0.6; }
body[data-page="dashboard"] { --ember-active: var(--ember); --ember-intensity: 0.35; }
body[data-page="audit"]     { --ember-active: var(--ember-saffron); --ember-intensity: 0.35; }
body[data-page="fix"]       { --ember-active: var(--ember-amber); --ember-intensity: 0.40; }
body[data-page="settings"]  { --ember-active: var(--ember-ochre); --ember-intensity: 0.25; }
```

---

## 11. The Updated Claude Design Starter Prompt

When designing any new screen in Claude Design, paste this at the start instead of the old Aurora prompt:

```
Design a [SCREEN] for Answerable, an open-source AI-SEO toolkit.

LOCKED BRAND SYSTEM (do not deviate)

Background: slate gray #C9C5BE
Text: dark ink #1A1814 primary, #4A453E muted
Ember bloom (page-specific): use [#E87B2C for landing/dashboard, #E8AA2A for pricing, #C6553C for sign-in, #B85C1F for docs/settings, #E5B225 for audit, #FFA500 for Fix Studio]
Bloom intensity: 80% for landing hero, 60% for other marketing, 35% for product main, 25% for admin
Animation: 12-second breath (expand and contract)
Texture: heavy film grain across entire canvas
Composition: asymmetric, ember anchored upper-right (rarely lower-right)
Glass surfaces: lighter slate #D4D1CB with backdrop blur
Borders: hairline rgba(26, 24, 20, 0.08)
Corner radius: 16px cards, 12px buttons, full pills

Typography: Geist for display, Inter for body, Geist Mono for numbers
Hero headline: 72px, weight 600, letter-spacing -0.04em
Body: 16px

REJECT (auto-fail):
- Any dark/midnight backgrounds (we are now light slate)
- Aurora rainbow gradients (deprecated)
- Smooth CSS linear gradients with 3+ colors
- Centered hero compositions
- Three-feature blocks with icons
- Purple-on-white AI startup looks
- Em-dashes anywhere in copy
- Default shadcn components without customization

Screen-specific requirements: [DESCRIBE THIS SCREEN]
```

---

## 12. The Single Rule (unchanged)

If a design choice could appear on any other generic AI-SaaS landing page in 2026, do not ship it.

The Slate Family system is the practical instrument that enforces this rule. Warm orange embers on calm slate backgrounds is uncommon enough in this category that it instantly differentiates us.

---

## 13. What changes elsewhere in the project

After this lock, update these references:

- `BRAND-BRIEF.md` Section 3 (Color System): mark as historical, point to this doc
- `CLAUDE-DESIGN-PROMPT.md`: replace color tokens with Slate Family
- `CLAUDE-DESIGN-PROMPT-MULTIPAGE.md`: replace Aurora with Slate Family per-page
- `PRD-V1.md` Section 9 F5 (web dashboard): update background reference
- `STRATEGIC-POSITIONING.md`: no changes needed (does not reference specific colors)

---

**Locked: 2026-05-28**
**Next: redesign the 5 foundation screens with the new Slate Family system in Claude Design.**
