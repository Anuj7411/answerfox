# Contributing to Answerfox

Thanks for your interest in Answerfox! This project is in pre-alpha — the public contribution flow opens up once Phase 1 lands. Until then, the most valuable contributions are:

- **Architectural feedback** in [GitHub Discussions](https://github.com/Anuj7411/answerfox/discussions)
- **Real-world SEO pain points** that should be in the audit framework
- **Bug reports** on the planning docs ([PROJECT-SPEC](./docs/internal/PROJECT-SPEC.md), [ROADMAP](./docs/internal/ROADMAP.md), [AUDIT-FRAMEWORK](./docs/internal/AUDIT-FRAMEWORK.md))

## Development setup

```bash
git clone https://github.com/Anuj7411/answerfox.git
cd answerfox
pnpm install
pnpm check    # runs typecheck + lint + tests
```

**Requirements:** Node.js ≥ 20, pnpm ≥ 10.

## Tooling

| Concern | Tool |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Language | TypeScript (strict mode, no `any`) |
| Lint & format | Biome |
| Testing | Vitest |
| Versioning & releases | Changesets |

## Code standards

- **TypeScript strict, no `any`.** Enforced by `tsconfig.base.json` and Biome.
- **Every public API has tests.** If a function is exported, it has at least one test.
- **Every doc page has a working code example.** Docs that aren't runnable rot.
- **Changesets for every user-facing change.** Run `pnpm changeset` before committing.

## Pull request flow

1. Fork and create a branch from `main`.
2. Make your changes. Run `pnpm check` locally.
3. Add a changeset (`pnpm changeset`) describing what changed.
4. Open a PR. CI must pass before review.
5. Maintainer reviews and merges; release happens via Changesets automation.

## Code of conduct

Be kind. Assume good intent. Disagree on substance, not people.
