---
'@answerfox/audit': minor
'@answerfox/cli': patch
'@answerfox/core': patch
---

v0.5.0 phase 2 — Cloudflare Agent Readiness Score coverage parity, phase 2 of 3.

Adds 5 new checks bringing the active framework from 41 to 46 of 63 planned.
Cloudflare-equivalent coverage moves from 8 of 16 to 13 of 16. The final 3
(x402, UCP, ACP, MPP as a single Agentic Commerce category H) land in v0.6.0.

New checks
- **A12 RFC 8288 Link headers**: detects Link headers in the HTTP response
  with rel attributes. 1 point, low severity. Skips on the runChecks
  fixture path (no headers context).
- **A13 AI bot rules**: detects explicit AI bot user agents in robots.txt
  (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot,
  anthropic-ai, cohere-ai, CCBot, and 10 more). 2 points, medium severity.
- **C3 Markdown content negotiation**: re-fetches the audited URL with
  Accept: text/markdown, checks if Content-Type or body shape is markdown.
  2 points, low severity.
- **C4 Content Signals**: detects X-Content-Signals HTTP header or
  matching meta tag, requires at least one recognised policy field
  (use-policy, citation, training, paywall, freshness). 2 points, medium.
- **G8 Web Bot Auth (RFC 9421)**: detects HTTP Message Signatures via
  Signature-Input + Signature headers. 4 points, low severity. Skips
  on the runChecks fixture path.

Crawler refactor
- `FetchAndParseResult` now includes a `headers: Headers` field.
- `RunChecksInput` accepts an optional `headers?: Headers` field.
- `@answerfox/core`'s `CheckInput` interface adds an optional
  `headers?: Headers` field so checks can typesafely access response
  headers. Backward-compatible: existing checks ignore the new field.

Framework reweight
- A category: 18 → 21 of 100 pts (A12=1, A13=2 added)
- C category: 5 → 9 of 100 pts (C3=2, C4=2 added)
- G category: 35 → 39 of 100 pts (G8=4 added)
- Total max-points budget: ~101 of normalized 100 (score normalizes)
- A classic-perfect fixture without AR manifests now scores 61 (was 65
  after phase 1, was 70 after AR-first reweight, was 100 in v0.3.x).

Tests
- 24 new test cases (5 for A12, 5 for A13, 4 for C3, 5 for C4, 5 for G8).
- All 228 tests pass.
