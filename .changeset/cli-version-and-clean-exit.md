---
"@answerfox/cli": patch
---

Fix two CLI bugs. `--version` now reads the real version from package.json instead of printing a hardcoded `0.0.0`. The `audit` command now sets the exit code and lets the process exit naturally instead of calling `process.exit()` while fetch (undici) sockets are still closing, which previously triggered a libuv assertion crash on Windows after the report printed.
