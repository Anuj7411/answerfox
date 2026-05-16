---
"@answerable/audit": minor
---

Add 16 more checks to the audit registry: content structure (B), E-E-A-T trust signals (D), and off-site citations (E). Audit grows from 17 → **33 checks** covering **~63 of 100 points**.

**B-series (content & chunking) — 11 new points:**

| ID | Check | Sev | Pts |
|---|---|---|---|
| B1 | Exactly one `<h1>` | critical | 3 |
| B3 | Logical h2/h3 hierarchy (no skipped levels) | high | 2 |
| B4 | Long pages broken into multiple h2 sections | high | 2 |
| B8 | At least one external citation (different-origin link) | medium | 1 |
| B11 | ≥3 internal links to sibling pages | medium | 1 |
| B14 | Lists or tables present (`<ul>`/`<ol>`/`<table>`) | medium | 2 |

**D-series (E-E-A-T & entity authority) — 14 new points:**

| ID | Check | Sev | Pts |
|---|---|---|---|
| D1 | About page linked | critical | 3 |
| D2 | Privacy policy linked | critical | 3 |
| D3 | Terms of use linked (accepts `/terms`, `/tos`, `/terms-of-use`) | high | 2 |
| D4 | Contact accessible (`/contact` page or `mailto:`) | high | 2 |
| D5 | Trust link in `<nav>`/`<header>` (about / team / company / newsroom) | high | 2 |
| D6 | Footer contains all three of /privacy, /terms, /contact | high | 2 |

**E-series (off-site citation surface) — 7 new points:**

| ID | Check | Sev | Pts |
|---|---|---|---|
| E1 | Link to a review / marketplace profile (G2, Product Hunt, Capterra, Trustpilot, ...) | medium | 2 |
| E7 | GitHub link present | medium | 2 |
| E10 | Organization JSON-LD `sameAs` has ≥3 authoritative profiles | medium | 2 |
| E11 | LinkedIn profile linked | low | 1 |

**Notable design notes:**

- **B4 (long-page chunking)** treats pages under 1500 chars of body text as "short" and passes them without h2 section requirements — short pages don't need chunking.
- **B8 (external citations)** parses each link's URL and excludes same-origin absolutes, so a page with only internal `https://example.com/...` links still warns.
- **D6** distinguishes between "no footer at all" (fail), "footer with 0 of 3 trust links" (fail), and "footer with 1-2 of 3" (warn) — partial credit isn't pass, but the error message tells you what to add.
- **E10** walks the schema.org `@graph` form via a recursive type-finder, so `organization()` output is detected whether emitted as a single object, inside an array, or under `@graph`.

67 new tests. PERFECT_HTML fixture updated to exercise all 33 checks; "empty-HTML hits critical band" assertion relaxed to `score < 20` (A8 + B4 still pass on empty HTML by design).
