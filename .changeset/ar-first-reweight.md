---
'@answerfox/audit': minor
'@answerfox/cli': patch
---

Reweight Agent Readiness category (G1-G6) from 0 to 30 of 100 total points.

Agent Readiness is the Answerfox wedge — until now the six G category
checks (MCP Server Card, A2A agent-card.json, RFC 9727 API Catalog,
agent-permissions.json, OAuth discovery, WebMCP form annotations) were
informational only and didn't affect the score. A site that aced classic
SEO but shipped zero agent manifests scored 100/100, which undermines
the point of the framework.

New weights: G1=6, G2=6, G3=5, G4=5, G5=4, G6=4 (total 30 of 100).
A "classic-perfect" site with no AR manifests now scores 70 (average band)
instead of 100 (excellent). Existing classic-SEO checks are unchanged.

Tests updated to match. No code-path changes outside `points: 0 → N` on
the six G check definitions.
