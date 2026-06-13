---
'@answerfox/core': minor
'@answerfox/audit': minor
'@answerfox/cli': patch
---

v0.6.0 — Agentic Commerce category H. **16 of 16 Cloudflare AR Score parity reached.**

Adds 4 new audit checks for the agentic commerce protocols Cloudflare tracks
in their AR Score. After this release, every check Cloudflare scores is
covered, plus 36 checks we have they don't (classic SEO/AEO/GEO + the WebMCP,
A2A, and agent-permissions G checks they skipped).

New category
- **H — agentic-commerce**: 4 checks, 12 of 100 max points.

New checks
- **H1 x402** (4 pts, medium): detects x402 capability via
  `/.well-known/x402` manifest OR `X-Payment-Required` header. x402
  was acquired by the Linux Foundation in 2026 (Coinbase origins,
  $50M+ cumulative volume by April).
- **H2 UCP** (3 pts, medium): detects Universal Commerce Protocol
  manifest at `/.well-known/ucp.json`. Google + Shopify/Walmart/Target
  launch, January 11 2026.
- **H3 ACP** (3 pts, medium): detects Agentic Commerce Protocol
  manifest at `/.well-known/acp.json`. OpenAI + Stripe joint protocol
  for agent checkout flows.
- **H4 MPP** (2 pts, low): detects Machine Payment Protocol manifest
  at `/.well-known/mpp.json`. Cloudflare addition to AR Score, May 2026.

Core API additions
- `'agentic-commerce'` added to the `Category` enum.
- `CATEGORY_ID_PREFIX['agentic-commerce'] = 'H'`.
- `CATEGORY_POINT_BUDGET` updated to reflect actual per-category
  weights: A=21, B=20, C=9, D=22, E=12, F=8, G=39, H=12. Total of
  143 max points (score normalizes to 100 in the runner).

Framework
- Active checks: 46 → **50** of 67 planned.
- Cloudflare-equivalent coverage: 13 of 16 → **16 of 16**.
- Classic-perfect fixture without AR + commerce manifests now scores
  **55** (was 61 after phase 2, was 100 in v0.3.x). Drops from
  "average" to "weak" band — a perfect SEO site that ships zero
  agent or commerce signals is no longer middling, it's deficient.

Tests
- 14 new test cases (4 H1, 4 H2, 3 H3, 3 H4).
- runner.test.ts updated for new check IDs and new score math.
- console.test.ts updated to allow Weak band on the perfect fixture.
- All 242 tests pass.
