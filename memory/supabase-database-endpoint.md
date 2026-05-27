---
name: supabase-database-endpoint
description: Supabase Postgres endpoint verified for this project without storing credentials
metadata:
  type: reference
updated_at: 2026-05-27
last_verified_scope: Local Prisma migrate deploy and API write verification
---

Use the Supabase session pooler host `aws-1-ap-southeast-1.pooler.supabase.com:5432` with user `postgres.pjmiaivogvyctvsvfohz` for this project's Postgres connection. The project REST ref `pjmiaivogvyctvsvfohz` is valid, but the direct host `db.pjmiaivogvyctvsvfohz.supabase.co` did not resolve from the local environment during verification.

**Why:** Prisma migration and manual API write succeeded only through the ap-southeast-1 session pooler endpoint; direct `db.*` DNS lookup returned no records.
**How to apply:** For CI/server deployment, set `DATABASE_URL` to the pooler connection string from Supabase Dashboard using this host/user format and the current database password. Do not store the password in memory or committed files.
