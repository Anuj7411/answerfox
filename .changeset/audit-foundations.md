---
"@answerable/audit": minor
---

Scaffold the `@answerable/audit` package — the sixth workspace package and the project's killer differentiator — with foundations and the first 5 checks.

**Foundations:**

- **`fetchAndParse(url)`** — cheerio-backed static crawler. Polite User-Agent (`Answerable/0.0.0 (+https://github.com/Anuj7411/answerable)`), redirect-follow, abort-on-timeout (15s default), `CrawlError` on non-2xx or network failure with cause preserved.
- **`loadHtml(html)` + `AuditDom`** — thin cheerio wrapper exporting the DOM type so check authors don't depend on cheerio directly.
- **`runChecks({ url, html, dom, checks? })`** — pure runner with no network. Each check runs in parallel via `Promise.all`. Thrown checks captured as `skip` with the error message — the audit always completes.
- **`audit(url, options?)`** — convenience wrapper that fetches then runs.
- **`bandFromScore(score)`** — maps integer score to AUDIT-FRAMEWORK band (critical / weak / average / strong / excellent).
- **`consoleReport(report)`** — kleur-colored terminal output. Groups failures by severity (critical → high → medium → low), surfaces evidence + fix recommendation + docs URL per finding, lists passing checks at the bottom. Color can be toggled off for CI/snapshot tests.

**First 5 checks (14 points of 100 total):**

| ID | Check | Severity | Pts |
|---|---|---|---|
| A1 | `<title>` present and 30-60 chars | critical | 3 |
| A3 | Meta description present and 120-160 chars | critical | 3 |
| A4 | Canonical URL declared (absolute) | critical | 3 |
| A5 | `<html lang>` BCP 47 tag | high | 2 |
| C1 | At least one `<script type="application/ld+json">` with valid JSON | critical | 3 |

Score is computed against the *checks that ran* (excluding skips) so category-filtered audits score on their own denominator. Stable check IDs (`A1`, `A3`, ...) match AUDIT-FRAMEWORK.md and never renumber — they're part of the public API once users pin `--ignore A4` in CI.

The remaining 45 checks land in follow-up PRs (B-series content structure, D-series E-E-A-T, E-series off-site, F-series OG/Twitter, plus the remaining A and C checks).
