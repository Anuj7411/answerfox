---
"@answerfox/cli": patch
"@answerfox/audit": minor
---

Add gated-page detection. When the audited URL looks like a logged-out gate page (login wall on linkedin.com, github.com, gmail.com, etc.), the report now includes a banner above the score line explaining why the score is low: the page is intentionally minimal, not broken.

5 heuristics, page is classified as a gate if 3 or more fire:
- Title under 30 characters
- Title contains a login keyword (sign in, log in, welcome to, join now, etc.)
- Page has a password input
- Body word count under 200
- No /about /pricing /docs /blog links anywhere on the page

The score itself is NOT adjusted, the engine stays deterministic. Gate pages still surface real fixable issues for sites that want to optimize them anyway.

This kills the most common misread of the tool ("I audited linkedin.com and got 50, the tool is broken") permanently. New `AuditReport.gatePage` field exposes the detection for downstream consumers; reporters print a yellow banner with the matching signals listed.

Internal: new `gate-detector.ts` module in `@answerfox/audit`. Wired into `runChecks()` and the console reporter. 7 new tests, all 25 audit-level tests pass.
