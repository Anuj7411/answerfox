# Audit Framework — 50 Checks Across 6 Categories

The audit engine evaluates a target URL against 50 checks. Each check has an ID, category, severity, point weight, fix availability, and rationale.

Categories and their total point budget (sums to 100):

| Category | ID Prefix | Points | Focus |
|----------|-----------|--------|-------|
| Meta & Technical Foundations | A | 20 | Title, description, canonical, viewport, lang, charset |
| Structured Data | C | 18 | JSON-LD presence, validity, completeness |
| Content Structure & Chunking | B | 20 | H1/H2 hierarchy, FAQ, lists, tables, definitional sentences |
| E-E-A-T & Entity Authority | D | 22 | Trust pages, brand consistency, expert signals |
| Off-site / Citation Surface | E | 12 | sameAs links, external citations, marketplace profiles |
| Open Graph & Social | F | 8 | OG tags, Twitter cards, social previews |

Total: **100 points**

---

## Category A — Meta & Technical Foundations (20 pts)

| ID | Check | Severity | Points | Auto-fix |
|----|-------|----------|--------|----------|
| A1 | `<title>` present, 30-60 chars | critical | 3 | ✅ |
| A2 | `<title>` unique across crawl | high | 2 | ⚠️ guided |
| A3 | Meta description present, 120-160 chars | critical | 3 | ✅ |
| A4 | Canonical URL declared | critical | 3 | ✅ |
| A5 | `<html lang>` attribute set | high | 2 | ✅ |
| A6 | Viewport meta correct for mobile | high | 2 | ✅ |
| A7 | charset declared as UTF-8 | medium | 1 | ✅ |
| A8 | robots meta consistent with intent | high | 2 | ✅ |
| A9 | Favicon linked (multiple sizes) | medium | 1 | ✅ |
| A10 | Apple touch icon linked | low | 1 | ✅ |

## Category B — Content Structure & Chunking (20 pts)

| ID | Check | Severity | Points | Auto-fix |
|----|-------|----------|--------|----------|
| B1 | Exactly one `<h1>` | critical | 3 | ⚠️ guided |
| B2 | `<h1>` contains primary topic keyword | high | 2 | ⚠️ guided |
| B3 | Logical H2/H3 hierarchy | high | 2 | ⚠️ guided |
| B4 | Long pages broken into H2 sections | high | 2 | ⚠️ guided |
| B5 | FAQ section present where appropriate | high | 2 | ✅ via templates |
| B6 | Concrete data points (numbers, dates, prices) | medium | 2 | ❌ |
| B7 | Quoted/attributed expert language | medium | 2 | ❌ |
| B8 | External citations to authoritative sources | medium | 1 | ❌ |
| B10 | Definitional sentence patterns ("X is defined as...") | medium | 1 | ⚠️ guided |
| B11 | ≥3 internal links to sibling pages | medium | 1 | ✅ via templates |
| B14 | Lists/tables for comparisons | medium | 2 | ❌ |

## Category C — Structured Data (18 pts)

| ID | Check | Severity | Points | Auto-fix |
|----|-------|----------|--------|----------|
| C1 | At least one JSON-LD block present | critical | 3 | ✅ |
| C2 | Organization schema present | high | 2 | ✅ |
| C3 | WebSite schema with SearchAction | medium | 1 | ✅ |
| C4 | FAQPage schema on FAQ pages | high | 2 | ✅ |
| C5 | Article/BlogPosting on blog pages | high | 2 | ✅ |
| C6 | Product schema on product pages | high | 2 | ✅ |
| C7 | BreadcrumbList on nested pages | medium | 1 | ✅ |
| C8 | HowTo schema on tutorial pages | low | 1 | ✅ |
| C9 | All schemas validate against schema.org | critical | 2 | ⚠️ guided |
| C10 | Schema fields match visible content | high | 2 | ❌ |

## Category D — E-E-A-T & Entity Authority (22 pts)

| ID | Check | Severity | Points | Auto-fix |
|----|-------|----------|--------|----------|
| D1 | About page exists and linked | critical | 3 | ✅ via templates |
| D2 | Privacy policy exists and linked | critical | 3 | ✅ via templates |
| D3 | Terms of use exists and linked | high | 2 | ✅ via templates |
| D4 | Contact information accessible | high | 2 | ✅ via templates |
| D5 | About/Trust/Newsroom links in chrome | high | 2 | ✅ |
| D6 | Privacy/Terms/Contact links in footer | high | 2 | ✅ |
| D7 | Author info on articles (where applicable) | medium | 1 | ⚠️ guided |
| D8 | Date published / updated on articles | medium | 1 | ⚠️ guided |
| D9 | Editorial standards page (Phase 2 check) | low | 1 | ❌ |
| D10 | Original research/data signals | low | 1 | ❌ |
| D11 | Awards/credentials displayed if real | low | 1 | ❌ |
| D12 | Brand token consistency across title/desc/H1/body | high | 3 | ⚠️ guided |

## Category E — Off-site / Citation Surface (12 pts)

| ID | Check | Severity | Points | Auto-fix |
|----|-------|----------|--------|----------|
| E1 | Review/marketplace profile linked (G2, PH, etc.) | medium | 2 | ⚠️ guided |
| E2 | App store profile linked (if applicable) | low | 1 | ⚠️ guided |
| E3 | Wikidata/Wikipedia entity claimed (when notable) | low | 1 | ❌ |
| E7 | GitHub linked for technical products | medium | 2 | ✅ |
| E10 | sameAs ≥3 authoritative profiles | medium | 2 | ✅ |
| E11 | LinkedIn company/personal profile linked | low | 1 | ✅ |
| E12 | External citations near named category sources | medium | 2 | ❌ |
| E13 | Social profiles consistent across platforms | low | 1 | ❌ |

## Category F — Open Graph & Social (8 pts)

| ID | Check | Severity | Points | Auto-fix |
|----|-------|----------|--------|----------|
| F1 | og:title set | high | 1 | ✅ |
| F2 | og:description set | high | 1 | ✅ |
| F3 | og:image set with absolute URL | high | 2 | ✅ |
| F4 | og:image dimensions 1200×630, < 5MB | medium | 1 | ⚠️ guided |
| F5 | og:url canonical | medium | 1 | ✅ |
| F6 | twitter:card set | high | 1 | ✅ |
| F7 | twitter:image dedicated or matches og:image | medium | 1 | ✅ |

---

## Scoring Bands

| Score | Band | Color |
|-------|------|-------|
| 91-100 | Excellent | green |
| 81-90 | Strong | green |
| 61-80 | Average | yellow |
| 41-60 | Weak | orange |
| 0-40 | Critical | red |

## Auto-Fix Legend

- ✅ Full auto-fix available via `answerfox fix <id>` or `answerfox add <template>`
- ⚠️ Guided fix — CLI prompts user for missing info and then patches
- ❌ Manual — Content/research work the user must do themselves

## Notes for Implementation

- Check IDs are deliberately sparse (e.g., B9/B12/B13, E4–E6, E8–E9 reserved). Once `audit` ships, IDs are part of the public API (users will pin `--ignore <id>` in CI). Do not renumber; reserve gaps for future checks.
- Check weights are calibrated to total exactly 100 points
- Severity is independent of points: a low-points check can still be critical
- Every check has a `docsUrl` linking to a doc page explaining *why* it matters
- Checks are run in parallel where they don't share state
- Audit output supports console (default), JSON (`--json`), HTML report (`--html report.html`)
- CI mode (`--ci`) returns non-zero exit if score drops below threshold (default 80)

## Reference Sources

The framework draws from:

- **Google Search Quality Guidelines** — E-E-A-T concepts
- **freeaiseoaudit.com** — AI search engine readiness checks
- **schema.org** — Structured data validation
- **Lighthouse SEO audits** — Traditional SEO foundations
- **Perplexity, Claude, ChatGPT crawling behavior** — Real-world AI answer engine signals
