# Gradient Exploration Prompt for Claude Design

**Purpose:** Generate 8 unique gradient variations for Answerable's hero background. Each must reject the standard "AI SaaS rainbow blur" aesthetic. Pick the strongest 1-2 to lock as our brand signature.

**Context:** The first Claude Design output used a smooth cyan-violet-magenta gradient that looks like every other AI SaaS in 2026. We need something that genuinely differentiates. References: shader-gradient.co (Interstella, Nighty Night, Viola, Universe presets).

---

## THE PROMPT (paste this into a new Claude Design prototype)

```
Design 8 separate gradient hero backgrounds for Answerable, an open-source AI-SEO toolkit. Each gradient is a full-bleed background for a hero section (1920x1080 viewport). Show all 8 side by side as a comparison grid.

═══════════════════════════════════════════════════════════════════
DESIGN BRIEF
═══════════════════════════════════════════════════════════════════

The product is a developer tool. The aesthetic ambition is awwwards level. We reject the standard "smooth cyan to purple to magenta" rainbow gradient that every AI SaaS in 2026 uses (Stripe knockoffs, Profound, Peec AI, every Tailwind-template startup). We want gradients that feel handcrafted, textured, painterly, asymmetric. References to study:

- https://www.shader-gradient.co/  (specifically Interstella, Nighty Night, Viola, Universe presets - heavy grain, asymmetric, painterly)
- https://linear.app/  (subtle, monochrome, refined)
- https://www.aesop.com/  (Risograph-print aesthetic, duotone)
- https://stripe.com/  (subtle multi-layer parallax depth)

═══════════════════════════════════════════════════════════════════
HARD RULES (every gradient must satisfy)
═══════════════════════════════════════════════════════════════════

✅ Must include heavy noise/grain texture (looks like film stock, not pure CSS blend)
✅ Must be asymmetric (color distribution NOT symmetric or centered)
✅ Must use a maximum of 3 colors (often 2 colors plus black is enough)
✅ Must include subtle animation (slow drift, bloom, or breath, 8 to 30 second loops)
✅ Must work at 1920x1080 full-bleed hero with white text overlaid (visible contrast)

❌ REJECT all of these (auto-fail criteria):
❌ Smooth CSS linear-gradient with 3+ rainbow colors blended
❌ Centered radial gradient with even falloff
❌ Anything resembling the default Tailwind UI gradient
❌ Light backgrounds with subtle purple accent (the OpenAI clone look)
❌ Glow effects that look like CSS box-shadow on a colored circle
❌ Rainbow color cycling animations

═══════════════════════════════════════════════════════════════════
GENERATE THESE 8 GRADIENT VARIATIONS (label each clearly)
═══════════════════════════════════════════════════════════════════

────────────────────────────────────────────────────────────────────
VARIATION 1: VOID BLOOM
────────────────────────────────────────────────────────────────────

Description: 75% of canvas is deep midnight #0A0E1A. ONE single color bloom of electric cyan #00F0FF in the lower-right corner (or upper-left, designer choice). The bloom is painterly with heavy grain.
Colors: #0A0E1A (midnight, 75% coverage) + #00F0FF (cyan, 25% coverage in single bloom)
Animation: bloom slowly expands and contracts every 12 seconds, like breath
Texture: heavy film grain across ENTIRE canvas (not just the colored area)
Inspiration: Shader Gradient Universe preset, but with our cyan and far more black

────────────────────────────────────────────────────────────────────
VARIATION 2: COLD STATIC
────────────────────────────────────────────────────────────────────

Description: Monochrome navy gradient with TV-static texture. Vertical bands like a signal slightly off-tune.
Colors: #1A2540 (navy) and #0A0E1A (midnight) - TWO colors only
Animation: subtle vertical drift, 1 pixel every 8 seconds (almost imperceptible)
Texture: very heavy noise, like analog film grain or CRT scan lines
Inspiration: Linear minimalism + Shader Gradient texture

────────────────────────────────────────────────────────────────────
VARIATION 3: TOPOGRAPHIC DRIFT
────────────────────────────────────────────────────────────────────

Description: Contour lines like a topographic map. Lines drift slowly horizontally. NO traditional gradient - the lines ARE the visual.
Colors: cyan #00F0FF (lines) on midnight #0A0E1A (background)
Animation: lines drift horizontally at 2 different speeds (front layer faster than back layer - parallax built into the gradient itself)
Line treatment: lines vary in thickness (0.5px to 2px), opacity (10% to 40%), some slightly broken/dotted
Inspiration: cartographic design, Vercel typography refinement

────────────────────────────────────────────────────────────────────
VARIATION 4: RISOGRAPH CYAN
────────────────────────────────────────────────────────────────────

Description: Duotone print aesthetic - looks like Risograph or screen printing
Colors: midnight #0A0E1A and cyan #00F0FF - exactly TWO colors, no blending
Animation: static OR extremely subtle ink-bleed expansion at edges (almost still)
Texture: visible halftone dots, slight misregistration between the two color plates
Inspiration: zine culture, Aesop branding, indie publication design

────────────────────────────────────────────────────────────────────
VARIATION 5: LIME DUST
────────────────────────────────────────────────────────────────────

Description: Pure black canvas with lime green grain particles scattered like dust. 90% black.
Colors: #000000 (pure black, 90%) + #A3FF12 (lime, 10% as scattered particles)
Animation: particles drift very slowly, like ash falling in still air
Texture: particles are the texture - they cluster slightly more in one corner (asymmetric)
Inspiration: 90s art installations, Massive Attack album covers

────────────────────────────────────────────────────────────────────
VARIATION 6: INK STORM
────────────────────────────────────────────────────────────────────

Description: Single color watercolor / ink wash with painterly edges
Colors: midnight #0A0E1A and deep amber #FFA500 (pick amber for this variation specifically - it's distinctive)
Animation: ink slowly diffuses and swirls almost imperceptibly
Texture: heavy noise, painterly edges, NO crisp transitions, looks like ink in water
Asymmetric: amber dominates upper-left, fades to midnight bottom-right
Inspiration: Japanese sumi-e ink painting

────────────────────────────────────────────────────────────────────
VARIATION 7: ECLIPSE
────────────────────────────────────────────────────────────────────

Description: INVERSE of dark mode - bright cyan field with one dark void
Colors: #00F0FF (cyan, 80%) + #0A0E1A (midnight, 20% as circular void)
Animation: the dark void slowly drifts horizontally, like a planet moving across a sun
Texture: heavy grain across BOTH color and void
Position: void is in upper-center, slightly left of true center
Inspiration: solar eclipse photography, NASA archive imagery

────────────────────────────────────────────────────────────────────
VARIATION 8: CHROMATIC CRACK
────────────────────────────────────────────────────────────────────

Description: TWO color fields meeting at a sharp diagonal (NOT a smooth blend). Like a Rothko painting.
Colors: midnight #0A0E1A (one side) and electric cyan #00F0FF (other side)
Animation: extremely subtle - the diagonal rotates 1 degree every 30 seconds (barely perceptible drift)
Texture: heavy noise across both fields, painterly edge along the diagonal
Inspiration: Mark Rothko color field paintings

═══════════════════════════════════════════════════════════════════
PRESENTATION INSTRUCTIONS
═══════════════════════════════════════════════════════════════════

Present all 8 gradients side by side in a 4x2 or 2x4 grid for comparison. Each gradient labeled clearly with its name (Void Bloom, Cold Static, etc.) at the top. Each should be roughly 16:9 aspect ratio. Include a small description below each. Make the comparison page itself styled minimally (white-on-black or vice versa) so the gradients are the focus.

═══════════════════════════════════════════════════════════════════
THE GOAL
═══════════════════════════════════════════════════════════════════

We will pick 1 or 2 gradients from these 8 to test as our brand signature on the actual landing page. The chosen gradient must communicate: developer tool, technical sophistication, distinctly NOT the standard AI SaaS rainbow.

If the output looks anything like a smooth CSS linear-gradient with 3+ colors blending evenly, the variation has failed and must be regenerated with stronger adherence to the rules above.
```

---

## After Claude Design generates the 8 options

1. **Review side by side.** Squint at each. Does it feel distinct from the standard AI SaaS look?
2. **Apply the rejection criteria:**
   - Does it look like smooth CSS gradient? → REJECT
   - Does it have heavy noise/grain texture? → KEEP
   - Is the color distribution asymmetric? → KEEP
   - Does it use 3 or fewer colors? → KEEP
   - Can white text sit readably on top? → KEEP
3. **Shortlist 2 candidates.**
4. **Test them on the actual landing page hero.** Repaste with the previous landing page prompt + the chosen gradient.
5. **Iterate** if the gradient overpowers the content or feels off in context.

## My personal pick (if I had to choose one)

**Void Bloom.** Reasons:
- 75% deep midnight reinforces "developer tool"
- One distinctive cyan bloom becomes the brand mark (favicon, loading state, hero)
- Heavy grain texture immediately differentiates from CSS-gradient SaaS
- Cyan fits our existing palette
- Asymmetric placement is rare in SaaS

But all 8 are worth seeing before deciding.

## On parallax (your other note)

Stripe-style parallax works by:
1. Background layer (gradient): scrolls at 0.3x speed
2. Mid-ground layer (content blocks): scrolls at 1.0x speed (normal)
3. Foreground accent (hero headline): scrolls at 1.2x speed

Once we pick a gradient, we can implement this with CSS `transform: translateY(var(--scroll) * 0.3)` style or React libraries like Framer Motion's `useScroll` + `useTransform`. It's roughly half a day of engineering work.

## Final note

The first Claude Design output was symmetric, smooth, and template-feel. That is normal for first generations. Iterating with strict rejection rules is how we get to distinctive design. This prompt has 6 explicit reject criteria specifically because Claude Design's default behavior is the "AI SaaS rainbow" we are trying to escape.

Paste this into a new Claude Design prototype, see all 8, then we pick.
