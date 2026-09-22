# BatchPilot

BatchPilot is a dashboard for tuition teachers to manage batches, students, attendance, fees and marks from one place.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) — see [AGENTS.md](AGENTS.md), this project pins a version with real behavioral differences from mainline Next.js
- React 19, TypeScript (strict)
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) Auth (Google OAuth) via `@supabase/ssr`
- [Prisma](https://www.prisma.io) ORM, connected to a Postgres database (Supabase) — every dashboard route reads/writes through it via `server/`
- Deployed to Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values described below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard is Prisma/Postgres-backed, so `DATABASE_URL`/`DIRECT_URL` must point at a real database before dashboard pages will load — see "Environment variables" below.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth | Project origin, e.g. `https://<ref>.supabase.co` — not the `/rest/v1` endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth | Supabase anon/publishable key |
| `DATABASE_URL` | Prisma | Pooled Postgres connection string. Required — every dashboard page queries through it (`server/`) |
| `DIRECT_URL` | Prisma migrations | Direct (non-pooled) Postgres connection |
| `NEXT_PUBLIC_USE_DEMO_DATA` | Mock data | `"true"`/unset seeds every module with demo data; `"false"` starts empty, matching a first-time user. See `lib/config.ts` |

Local-only, gitignored files: `.env.local` (dev server) and `.dev.vars` (Wrangler preview — mirror the same values, see "Deployment" below).

## Development workflow

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server (Turbopack) |
| `npm run build` | Production build — also what CI/deploys should validate against |
| `npm run start` | Serve a production build locally |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check without emitting |
| `npm run preview` | Build with OpenNext and run it locally under `wrangler dev`, using `.dev.vars` |
| `npm run deploy` | Build with OpenNext and deploy to Cloudflare Workers |

Before opening a PR, run type-check, lint and `npm run build` — the same three checks used throughout this project's history.

**Read [AGENTS.md](AGENTS.md) before writing Next.js-specific code.** This project pins a Next.js version with real, verified differences from the framework's public docs/training-data behavior (e.g. `middleware.ts` vs. `proxy.ts` target different runtimes here — see the Deployment section). When in doubt, check `node_modules/next/dist/docs/` rather than assuming standard Next.js behavior.

## Project structure

```
app/                    App Router routes
  dashboard/            Authenticated app shell (students, batches, attendance, fees, marks, settings)
  auth/                 Login, signup, OAuth callback
  api/, admin/, attendance/   Reserved/placeholder — not currently wired to anything
components/
  ui/                   shadcn primitives
  <domain>/             Feature components (students/, batches/, attendance/, fees/, marks/)
  dashboard/, layout/, shared/, branding/, pwa/, theme/   Cross-cutting UI
lib/
  mock/                 In-memory mock data layer — superseded by server/ for app/dashboard, still used by app/admin
  hooks/                Shared client hooks (SWR wrappers over server/ actions)
  supabase/             Supabase client/server/middleware helpers
  prisma.ts             Prisma client singleton, re-exported by server/db/prisma.ts
types/                  Shared TypeScript types, one file per domain
server/                 Prisma-backed queries/actions/mappers/validators, one folder per domain — this is what app/ routes actually call
prisma/schema.prisma    Database schema, connected and in use
```

### Data layer

Dashboard pages (`app/dashboard/**`) call query functions in `server/<domain>/queries.ts`, which run Prisma queries against Postgres — this is the app's real data source for teachers, students, batches, attendance, fees and marks. `lib/mock/*` is an earlier in-memory layer that predates the Prisma migration; it's no longer used by `app/dashboard/**` but is still imported by the admin section (`app/admin/**`), which hasn't been migrated yet. `NEXT_PUBLIC_USE_DEMO_DATA` (`lib/config.ts`) only affects that remaining mock-backed admin section.

## Deployment prerequisites

The app deploys to Cloudflare Workers via OpenNext (`wrangler.jsonc`, `open-next.config.ts`). Before deploying:

1. Set the environment variables above as Worker **Variables & Secrets** in the Cloudflare dashboard (these are separate from Workers Builds' "Build variables" — the build step and the deployed Worker read from different scopes).
2. Update Supabase's Site URL and Redirect URLs, and Google Cloud Console's Authorized origins, to point at the production Worker domain.
3. `middleware.ts` is intentionally used instead of the newer `proxy.ts` convention — this fork's `proxy.ts` forces the Node.js runtime with no opt-out, which `@opennextjs/cloudflare` doesn't yet support for middleware. Functionally identical, just a different file name; revert this once upstream support lands.

See `wrangler.jsonc` and `open-next.config.ts` for the full Worker configuration.
