# @answerfox/cli

The `answerfox` command. Wraps the [Answerfox](https://github.com/Anuj7411/answerfox) audit engine for terminal + CI use.

> **v0.1.0.** `audit`, `explain`, `init`, and `add` ship today. `verify` lands in a subsequent release.

## Install

```bash
# As a one-off:
npx @answerfox/cli audit https://example.com

# Or globally:
pnpm add -g @answerfox/cli
answerfox audit https://example.com
```

## Commands

### `answerfox audit <url>`

Fetch the URL, run every registered check, print a human-readable report.

```bash
# Human report:
answerfox audit https://example.com

# Machine-readable JSON (for CI integration):
answerfox audit https://example.com --json

# CI gate — exits non-zero if score < threshold:
answerfox audit https://example.com --ci --min-score 80

# Disable colour (for non-TTY pipelines):
answerfox audit https://example.com --no-color
```

| Flag | Description | Default |
|---|---|---|
| `--json` | Emit machine-readable JSON to stdout | off |
| `--ci` | Exit with code 1 if score < `--min-score` | off |
| `--min-score <n>` | Threshold for `--ci` mode | `80` |
| `--no-color` | Disable ANSI colours | colour on |

Exit codes:
- `0` — success (and, if `--ci`, score ≥ threshold)
- `1` — CI threshold not met
- `2` — argument error (bad URL, unknown flag)

### `answerfox explain <check-id>`

Print full documentation for a single check.

```bash
answerfox explain A4
```

Outputs: description · category · severity + points · rationale · docs URL.

## License

[MIT](../../LICENSE) © 2026 Anuj Ojha
