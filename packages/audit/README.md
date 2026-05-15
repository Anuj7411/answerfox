# @answerable/audit

The audit engine for the [Answerable](https://github.com/Anuj7411/answerable) SEO toolkit. Fetches a target URL, parses the HTML, runs every registered check in parallel, and returns a structured report with score, severity-grouped findings, evidence, and fix recommendations.

> **Pre-alpha.** Foundations + first 5 checks ship today. The full 50-check framework lands across subsequent PRs — see [AUDIT-FRAMEWORK.md](../../docs/internal/AUDIT-FRAMEWORK.md).

## Install

```bash
pnpm add @answerable/audit
```

## Usage

```ts
import { audit, consoleReport } from '@answerable/audit';

const report = await audit('https://example.com');
console.log(consoleReport(report));
```

Or pass a pre-parsed DOM in if you already have one (handy in tests and CI):

```ts
import { runChecks } from '@answerable/audit';
import { loadHtml } from '@answerable/audit/parser';
import { parseAbsoluteUrl } from '@answerable/core';

const html = '<!doctype html><html lang="en"><head><title>...</title></head>...';
const report = await runChecks({
  url: parseAbsoluteUrl('https://example.com'),
  html,
  dom: loadHtml(html),
});
```

## What ships today

| ID | Check | Severity | Pts |
|---|---|---|---|
| A1 | `<title>` present, 30-60 chars | critical | 3 |
| A3 | Meta description present, 120-160 chars | critical | 3 |
| A4 | Canonical URL declared (absolute) | critical | 3 |
| A5 | `<html lang>` attribute set | high | 2 |
| C1 | At least one JSON-LD block present and valid | critical | 3 |

Total: **14 points** out of the eventual 100. The remaining 45 checks land in follow-up PRs.

## Architecture notes

- **Static-first parser.** Uses [cheerio](https://github.com/cheeriojs/cheerio) for parsing — fast, no headless browser. SPA support via Playwright lands when needed; the static engine catches everything that matters for server-rendered Next.js sites.
- **Polite UA.** Every fetch sends `User-Agent: Answerable/<version> (+https://github.com/Anuj7411/answerable)`.
- **Errors don't crash.** A check that throws is captured and emitted as a `skip` with the error message — the audit always completes.
- **Pure runner + fetching wrapper.** `runChecks()` takes pre-parsed input (no network), `audit()` is the convenience wrapper that fetches first. Tests use the pure runner so CI never hits the network.

## License

[MIT](../../LICENSE) © 2026 Anuj Ojha
