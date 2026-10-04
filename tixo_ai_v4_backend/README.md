# TIXO AI V4 — Vercel + Supabase

## Architecture
Browser → Vercel serverless API → Supabase `public.leads`.

The Supabase secret key is server-only and must never be placed in `index.html` or any `NEXT_PUBLIC_*` variable.

## Vercel environment variables
Set these in Project → Settings → Environment Variables:

- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SECRET_KEY` = your Supabase secret key

`SUPABASE_SERVICE_ROLE_KEY` is accepted as a legacy fallback, but the modern `SUPABASE_SECRET_KEY` is preferred.

## Deploy
1. Import this folder/project into Vercel.
2. Add the two environment variables above for Production and Preview.
3. Deploy/redeploy.
4. Submit a test lead through the site.
5. Confirm the row appears in Supabase → Table Editor → `leads`.

## API endpoints
- `POST /api/lead` — creates a lead in Supabase.
- `GET /api/leads` — returns recent leads for internal/admin use; protect this endpoint with authentication before exposing an admin UI publicly.
- `POST /api/ideas` — returns local TIXO content ideas.


## CRM security
Set `ADMIN_KEY` in Vercel Environment Variables. The `/api/leads` endpoint requires the `x-admin-key` header and supports GET/PATCH. Never put ADMIN_KEY in frontend code or commit it.
