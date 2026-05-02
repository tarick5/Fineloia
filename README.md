# Fineloia

Fineloia is an AI-powered CFO SaaS for companies of any size and country.

## Core Stack

- Next.js 14 + TypeScript (App Router)
- Tailwind CSS + shadcn-style UI components
- Supabase (PostgreSQL + Auth + RLS)
- Anthropic Claude (`claude-sonnet-4-20250514`) via Vercel AI SDK
- Recharts
- Stripe subscriptions
- Resend email
- next-intl (EN, PT, FR, ES, AR)

## Rules

- The platform never moves money and never executes payments.
- It provides analysis and recommendations only.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure env vars:

```bash
cp .env.example .env.local
```

3. Create Supabase schema:

- Run the SQL migration in:
  - `supabase/migrations/20260502190000_init_fineloia.sql`

4. Start dev server:

```bash
npm run dev
```

5. Open:

- `http://localhost:3000`

## Main Routes

- `/` landing
- `/pricing`
- `/login`
- `/register`
- `/dashboard`

## API Routes

- `POST /api/organizations/bootstrap`
- `POST /api/transactions/import`
- `POST /api/transactions`
- `GET /api/kpis`
- `POST /api/reports/generate`
- `POST /api/forecasts/generate`
- `POST /api/chat`
- `GET /api/alerts`
- `POST /api/alerts/generate`
- `POST /api/stripe/webhook`
- `POST /api/stripe/checkout`
- `POST /api/stripe/portal`

## Notes

- Server-side plan limits and membership checks are enforced in API routes.
- RLS is enabled for all key tables.
- Add a secure `CRON_SECRET` before scheduling `/api/alerts/generate` in production.
