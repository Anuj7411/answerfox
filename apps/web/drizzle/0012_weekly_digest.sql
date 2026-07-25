-- Weekly readiness digest opt-in, one flag per user.
--
-- Opt-out model: every user gets a Monday summary of their sites'
-- agent-readiness scores by default, and can turn it off from Account
-- Settings. Existing profiles backfill to true via the column default.
-- NOT NULL + default keeps the digest query (WHERE weekly_digest_opt_in)
-- from having to treat legacy NULLs as a special case.
alter table profiles
  add column weekly_digest_opt_in boolean not null default true;
