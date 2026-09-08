# Tomkyns Sealant Services

A public local-trades website with persistent quote requests and an authenticated owner portal for managing enquiries and jobs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/tomkyns-sealant-services run dev` — run the website
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Website: `artifacts/tomkyns-sealant-services`
- Shared API: `artifacts/api-server`
- API contract: `lib/api-spec/openapi.yaml`
- Database schema: `lib/db/src/schema`
- Website theme: `artifacts/tomkyns-sealant-services/src/index.css`

## Architecture decisions

- Public quote requests are saved to PostgreSQL, not browser storage.
- Owner-only surfaces use Clerk authentication; the public website remains accessible without signing in.
- The public marketing copy stays grounded in supplied/current-site facts. Do not invent insurance, accreditation, rating, warranty-detail, or performance claims.
- Original logo and project photography should replace the interim generated mark when the owner supplies source files.

## Product

- Responsive public site with services, customer proof, areas, FAQs and contact details.
- Persistent free-quote form.
- Authenticated owner dashboard, enquiry pipeline and job tracker.
- Local-business SEO metadata and structured data.

## User preferences

- Preserve the existing Tomkyns logo, images and navy/green/white colour direction while improving the design.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
