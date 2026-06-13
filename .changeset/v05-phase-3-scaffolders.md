---
'@answerfox/templates': minor
'@answerfox/cli': patch
---

v0.5.0 phase 3 — completes the agent manifest scaffolder set.

Adds two new manifest templates so the CLI can scaffold every G category
check that audits to a missing file. Users who score 0/8 on Agent
Readiness can now run a single command per gap to ship the fix.

New templates
- **llms-txt** at `public/llms.txt` (audit check G7). Per the llmstxt.org
  spec: H1 site name, blockquote description, and starter sections with
  curated markdown links to docs, about, and optional content.
- **web-bot-auth** at `public/.well-known/http-message-signatures-directory`
  (audit check G8). JWKS-shaped JSON declaring an Ed25519 public key with
  an inline `_comment` field walking the user through key generation
  (`openssl genpkey -algorithm ed25519`), base64url encoding, and signing
  per RFC 9421.

CLI commands
- `answerfox add llms-txt` — scaffolds the llms.txt file
- `answerfox add web-bot-auth` — scaffolds the JWKS directory
- Both join the existing `agent-card`, `mcp-server-card`, `api-catalog`,
  `agent-permissions`, `oauth-discovery` set. Total of 7 G-category
  manifest scaffolders now available.

Notes
- Both new templates are framework-agnostic (no Next.js gate, write
  under `public/`).
- The registry-invariant test was relaxed to allow `public/<file>` in
  addition to `public/.well-known/<file>` — llms.txt is the spec
  exception that puts the file at the origin root.
- No new audit checks in this PR. Phase 3 closes the "we fix" promise
  for the 8 AR checks already shipped (G1-G8). Agentic Commerce (H1-H4)
  lands next in v0.6.0.
