# Answerfox Audit GitHub Action

Audit a deployed URL for **Agent Readiness** + classic SEO/AEO/GEO on every pull request. Posts a sticky comment with the score, fails the workflow when you fall below your minimums.

Powered by [`@answerfox/cli`](https://www.npmjs.com/package/@answerfox/cli). MIT licensed.

## Quick start

Pin to a Vercel/Netlify preview URL on every PR:

```yaml
# .github/workflows/audit.yml
name: Answerfox audit

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... your build / deploy / wait-for-preview step here ...
      - uses: Anuj7411/answerfox/packages/github-action@main
        with:
          url: ${{ steps.deploy.outputs.preview_url }}
          min-score: 60
          min-agent-readiness: 4
```

Once we cut the `answerfox` GitHub org, the canonical reference becomes `answerfox/audit-action@v1`. The path-style reference above keeps working in the meantime.

## Inputs

| Name | Required | Description |
|---|---|---|
| `url` | **yes** | URL to audit. Typically the PR preview URL. |
| `min-score` | no | Fail if score (0-100) falls below this value. |
| `min-agent-readiness` | no | Fail if Agent Readiness checks passing (0-8) falls below this value. |
| `fail-on-decline` | no | Reserved for v2. Currently a no-op. |
| `api-key` | no | Answerfox API key. When set, the audit shows up in your dashboard history at answerfox.dev. |
| `comment` | no | `true` (default) posts a sticky PR comment with the result. Set `false` to suppress. |

## Outputs

| Name | Example |
|---|---|
| `score` | `74` |
| `band` | `average` |
| `agent-readiness` | `3/8` |
| `pass-count` | `33` |
| `fail-count` | `12` |

## Required permissions

The PR comment step needs `pull-requests: write` on the `GITHUB_TOKEN`. Add this to your workflow:

```yaml
permissions:
  contents: read
  pull-requests: write
```

## What a sticky comment looks like

```text
🦊 Answerfox audit

`https://my-preview-deployment.vercel.app`

| | |
|---|---|
| Score          | 74/100 · average |
| Agent Readiness | 3/8 |
| Pass / Fail / Warn / Skip | 33 / 12 / 0 / 5 |
```

Subsequent pushes to the PR update the same comment rather than spamming new ones.

## Branch protection (the real win)

To require the audit to pass before merge, mark the action's job as a **required status check** in your branch protection rules:

1. Repository → Settings → Branches → Add rule (or edit `main`)
2. Enable "Require status checks to pass before merging"
3. Search for `audit` and select the job
4. Save

Combined with `min-score` or `min-agent-readiness`, an accidental regression below your threshold blocks the merge.

## Composition with the OSS toolkit

This action runs `npx @answerfox/cli audit ... --json` under the hood. If you'd rather wire up the CLI yourself (custom reporters, scheduled jobs, multi-URL fan-out, anything past what the action does), do it. The Action is a thin convenience layer.

## Where to learn more

- Framework: https://github.com/Anuj7411/answerfox
- CLI: https://www.npmjs.com/package/@answerfox/cli
- Pricing: https://answerfox.dev/pricing
