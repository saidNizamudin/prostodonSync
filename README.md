# FKG Schedule Race

Schedule registration app for FKG fields (Prostodonsia and Bedah Mulut).

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Copy credentials from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
3. Fill in `.env` (see `.env` template in repo).
4. Apply the database schema:

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
npm run db:push
```

Or paste `supabase/migrations/20250101000000_init.sql` into the Supabase SQL Editor.

5. Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Field selector (Prostodonsia / Bedah Mulut) |
| `/prosthodontist` | Prostodonsia schedule list |
| `/maksilofasial` | Bedah Mulut schedule list |
| `/[type]/[scheduleId]` | Public registration |
| `/admin` | Manage schedules (OTP protected) |
| `/admin/[scheduleId]` | Manage categories |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run db:push` — apply Supabase migrations
- `npm run db:reset` — reset local Supabase DB (requires Supabase CLI)
