# Prebet UPSI

A full-stack campus ride-hailing platform for Universiti Pendidikan Sultan Idris (UPSI) — a safer, verified alternative to Telegram-based student transport bookings.

## Run & Operate

- `pnpm --filter @workspace/ride-hailing run dev` — run the frontend (served at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (served at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Demo Accounts

| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| Admin   | admin@upsi.edu.my            | admin123    |
| Student | aisyah@student.upsi.edu.my   | student123  |
| Driver  | hafiz@driver.upsi.edu.my     | driver123   |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — Single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, drivers, bookings, ratings)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, users, drivers, bookings, ratings, dashboard, admin, fare)
- `artifacts/ride-hailing/src/` — React frontend (pages for student, driver, admin roles)
- `artifacts/ride-hailing/src/contexts/AuthContext.tsx` — Auth context with JWT, localStorage persistence

## Architecture decisions

- Three user roles: student, driver, admin. Role is stored in the users table and controls routing.
- Simple token-based auth: SHA256 hashed password, base64-encoded token (userId:role:timestamp). Not production-grade crypto — replace with proper JWT for production.
- Driver approval workflow: drivers register (pending) → admin approves → driver can go online → can accept rides.
- Fare estimation uses haversine distance between known campus locations with fallback.
- Ride status flow: searching → accepted → arriving → in_progress → completed (or cancelled at any point).

## Product

- **Landing page** — hero, how it works, safety features
- **Student** — book rides with fare estimate, live ride tracking, ride history, SOS modal
- **Driver** — toggle online/offline, accept/reject requests, today's earnings, trip history
- **Admin** — verify/approve/reject/suspend drivers, view all users/bookings, statistics dashboard

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After schema changes to `lib/db/src/schema/`, run `pnpm run typecheck:libs` before checking API server typecheck.
- Auth uses `SHA256(password + "upsi_salt_2024")`. Must match in both register and login routes.
- The design subagent imported from `@workspace/api-client-react/src/custom-fetch` directly — always check and fix to `@workspace/api-client-react` after design runs.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
