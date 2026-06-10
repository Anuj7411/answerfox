# Answerfox DB (Drizzle + Supabase Postgres)

## Layout

```
src/lib/db/
├── client.ts              # Drizzle client with the pooled connection
├── schema/                # One file per table
│   ├── index.ts           # Re-exports everything
│   ├── profiles.ts        # User profiles (keyed to auth.users)
│   ├── sites.ts           # User-owned sites
│   ├── audits.ts          # Per-URL audit runs
│   └── findings.ts        # Per-check results inside an audit
└── README.md              # This file

drizzle/
└── 0000_initial.sql       # First migration, includes RLS policies
```

## Setup (when you have a Supabase project)

1. Create a Supabase project at supabase.com
2. Copy `apps/web/.env.example` to `apps/web/.env.local`
3. Fill in `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard
4. Run the initial migration: paste `drizzle/0000_initial.sql` into the Supabase SQL Editor and execute, OR install the deps and use Drizzle Kit (commands below)
5. Verify in Supabase Table Editor that `profiles`, `sites`, `audits`, `findings` exist with RLS enabled

## After the schema changes

```bash
# Generate a migration from schema edits
pnpm --filter @answerfox/web exec drizzle-kit generate

# Apply pending migrations to the database
pnpm --filter @answerfox/web exec drizzle-kit migrate

# Push schema directly (dev shortcut, no migration file)
pnpm --filter @answerfox/web exec drizzle-kit push
```

## Why two connection strings

- **`DATABASE_URL`** (pooled, port 6543): transaction-mode connection pool. Used by the app at runtime (Vercel serverless, Edge Functions). Cannot run DDL.
- **`DIRECT_URL`** (direct, port 5432): bypasses the pooler. Used by `drizzle-kit` for migrations because DDL needs a session.

## Why RLS lives in the SQL migration

Drizzle generators don't emit Postgres Row Level Security policies. The hand-written migration ensures every user can only see their own rows; the app never has to check ownership manually. This is the same pattern Supabase docs recommend.

## Tables at a glance

| Table | One row per | Owner field |
|---|---|---|
| `profiles` | signed-in user | `id` (= auth.users.id) |
| `sites` | site (origin) tracked by a user | `user_id` |
| `audits` | one audit run for one URL | `sites.user_id` (transitively) |
| `findings` | one check result inside one audit | `audits.sites.user_id` (transitively) |

## Future tables (not in this migration)

- `subscriptions` (Day 6+, when Stripe billing lands)
- `agent_referrer_events` (Q4 2026, agent-preference analytics)
- `alerts` (Week 4, for score-drop notifications)
