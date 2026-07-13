# Answerfox

Answerfox is an open-source AI-readiness platform that lives in your codebase and
ships fixes as pull requests, then proves the fix moved the score. It covers
answerability (SEO/AEO/GEO, get cited by AI) and agent-actionability (real agents can
use your site), with compliance-as-code next. The OSS packages publish under
`@answerfox/*`; the SaaS app lives in `apps/web`. Foundation docs are in
`docs/internal/`; read `SESSION-HANDOFF.md` first when resuming a session.

## Voice and writing rules

- Zero em-dashes anywhere. Use commas, periods, or restructure the sentence.
- Friendly and educational. Sharp, not warm.
- No AI-tells: delve, leverage, harness, unlock the potential, seamless, robust,
  comprehensive, in today's fast-paced world.
- Real numbers only in marketing copy. No fake testimonials, counters, or logos.

## Decision style

Recommend, don't ask. Give a concrete recommendation with reasoning. Use
AskUserQuestion only for genuine, non-trivial branching. Never present a neutral menu.

## Working conventions

- Small PRs, one concept each. Conventional commits (feat:, fix:, chore:, prototype:, docs:).
- Branch protection on main: PR + green CI + linear history. No direct push.
- Co-author commits with: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
- Do not create new documentation files unless explicitly asked.

## gstack dev loop (how we build Answerfox)

We build with the gstack workflow. Map each stage to a skill:

- Idea / scope exploration -> /office-hours, then /plan-ceo-review
- Architecture before coding -> /plan-eng-review
- UI/design plan -> /plan-design-review (or /design-consultation for a new system)
- Full review gauntlet in one shot -> /autoplan
- Build -> implement against the approved plan
- Bugs / errors / unexpected behavior -> /investigate (root cause before any fix)
- Diff review before merge -> /review (add /codex review for a second opinion)
- Does it actually work in a browser -> /qa (test + fix) or /qa-only (report only)
- Visual polish on a live page -> /design-review
- Code quality dashboard -> /health
- Ship -> /ship (open PR), then /land-and-deploy (merge + verify + canary)
- Post-deploy monitoring -> /canary
- Save / resume context across sessions -> /context-save and /context-restore

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool.
When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming -> invoke /office-hours
- Strategy/scope -> invoke /plan-ceo-review
- Architecture -> invoke /plan-eng-review
- Design system/plan review -> invoke /design-consultation or /plan-design-review
- Full review pipeline -> invoke /autoplan
- Bugs/errors -> invoke /investigate
- QA/testing site behavior -> invoke /qa or /qa-only
- Code review/diff check -> invoke /review
- Visual polish -> invoke /design-review
- Ship/deploy/PR -> invoke /ship or /land-and-deploy
- Save progress -> invoke /context-save
- Resume context -> invoke /context-restore
