# CareBridge Connect

HIPAA-compliant family communication platform for skilled nursing facilities. Live demo at [carebridgeconnect.ai](https://www.carebridgeconnect.ai).

CareBridge replaces the family phone call. Staff log care events once; families get real-time updates, secure messaging, and AI-authored daily insights — structured, never raw clinical notes.

## Why it exists

Nurses spend 2–3 hours per shift returning family calls. Families get vague updates ("she's doing fine") or none at all. CareBridge makes the logging nurses already do the only source of truth for family visibility, cuts call volume by ~60%, and gives families the moments that matter without compromising HIPAA.

## Features

- **Care Insights** — Claude-authored daily digest: overall assessment, highlights, worth-monitoring concerns, and family-friendly talking points for the next visit. Role-aware (family sees talking points; nurse sees clinical notes).
- **Daily Care Log** — Timeline of shift notes, vitals, mood, activity. Role-gated visibility.
- **Wellness Trends** — Multi-day mood, appetite, pain, and engagement charts.
- **Care Calendar** — Appointments with "I'll do it" claim buttons.
- **Care Circle** — Role-based access (admin, nurse, primary family, family member).
- **The Vault** — Encrypted storage for insurance, medications, providers.
- **PCC Integration** — Optional PointClickCare sync (mock API bundled for demo).
- **AI Chat** — Resident-scoped Q&A using Claude.
- **Export & Share** — One-click PDF of filtered care log for family review.

## Architecture

```
┌───────────────┐     ┌─────────────────┐     ┌────────────────┐
│  Next.js 14   │────▶│   Supabase RLS  │◀────│  PCC Mock API  │
│  App Router   │     │  (patients,     │     │  (5 residents, │
│  TS + Tailwind│     │   log_entries,  │     │   vitals,      │
│               │     │   audit_log)    │     │   assessments) │
└───────┬───────┘     └─────────────────┘     └────────────────┘
        │
        │  /api/agents/care-insights
        ▼
┌──────────────────┐
│ Anthropic        │
│ Managed Agents   │────▶ JSON insights → Supabase agent_outputs
│ claude-sonnet-4-6│
└──────────────────┘
```

## Tech stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript strict
- **Styling**: Tailwind CSS, Framer Motion, Lucide icons
- **Data**: Supabase (Postgres + RLS + Auth), PCC mock API
- **AI**: Anthropic Managed Agents (`claude-sonnet-4-6`) for care insights; direct Claude API for chat
- **Email**: Resend for onboarding invites
- **Observability**: Sentry with source-map upload
- **Hosting**: Vercel

## HIPAA-compliant by design

- **Security headers** — HSTS, CSP, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy locked down in [`next.config.js`](./next.config.js). Sources: NIST SP 800-53 (SC-8, SC-28), HIPAA §164.312(e).
- **Audit logging** — `audit_log` table captures `view_patient`, `view_vault`, `switch_resident`, `switch_role`, `export_data`, `add_log_entry` and agent operations. Fires from [`src/lib/audit.ts`](./src/lib/audit.ts).
- **Row-level security** — every PHI table in [`supabase/migrations/`](./supabase/migrations/) has RLS enforcing `my_patient_ids()`. No client can read rows outside its care circle.
- **PHI sanitization** — [`src/lib/agents/phi-sanitizer.ts`](./src/lib/agents/phi-sanitizer.ts) strips names/DOB/SSN from patient context before it reaches Anthropic. First-name-only policy.
- **Role-based access** — five roles (primary family, family member, care staff, nurse, facility admin) with distinct visibility matrices in [`src/lib/permissions.ts`](./src/lib/permissions.ts).

## Getting started

```bash
# Install
npm install

# Run in demo mode (no backend needed)
npm run dev
# → http://localhost:3000  — demo login: admin@carebridge.demo / carebridge123

# Build
npm run build
```

## Environment

Copy [`.env.local.example`](./.env.local.example) to `.env.local`.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | — | Set `true` for the zero-backend demo |
| `NEXT_PUBLIC_DATA_SOURCE` | — | `supabase` \| `pcc` \| `demo` |
| `NEXT_PUBLIC_SUPABASE_URL` | live | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | live | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | live | Server-side inserts (onboarding) |
| `ANTHROPIC_API_KEY` | AI | Claude API + Managed Agents |
| `ANTHROPIC_AGENT_INSIGHTS_ID` | AI | From `scripts/setup-agents.ts` |
| `ANTHROPIC_ENVIRONMENT_ID` | AI | From `scripts/setup-agents.ts` |
| `SENTRY_AUTH_TOKEN` | prod | Source-map upload (readable stacks) |
| `RESEND_API_KEY` | prod | Onboarding invite emails |
| `CRON_SECRET` | prod | Gates `/api/agents/*` routes |

One-time Anthropic agent setup:

```bash
ANTHROPIC_API_KEY=... npx tsx scripts/setup-agents.ts
# Outputs the agent + environment IDs to paste into .env.local.
```

## Project layout

```
src/
  app/
    app/                  # Main dashboard (home, calendar, care log, vault, etc.)
    auth/login/           # Email+password sign-in
    onboarding/           # 3-step facility setup → POST /api/onboarding
    api/
      agents/             # Care Insights route (Managed Agents)
      onboarding/         # Patient + facility insert + invite emails
      mock-pcc/           # PointClickCare mock for demo
      chat/               # Resident-scoped Claude chat
  components/
    HomeView.tsx          # Daily dashboard + Care Insights card
    WellnessTrends.tsx    # Multi-day wellness charts
    CareLog.tsx           # Shift notes, vitals, mood timeline
    ExportModal.tsx       # One-click PDF export
    ChatBot.tsx           # Claude-powered resident Q&A
  lib/
    agents/               # Managed-runner, PHI sanitizer, prompts, fixtures
    pcc/                  # PointClickCare client + mock generator
    hooks/                # React hooks (Supabase, PCC, Care Insights)
    permissions.ts        # Role → visibility matrix
    audit.ts              # HIPAA audit logger
supabase/migrations/      # Schema + RLS policies
```

## Deploy

Vercel auto-deploys on push to `master`. Source maps upload to Sentry when `SENTRY_AUTH_TOKEN` is configured. Background cron jobs live in `vercel.json` (absent by default — Hobby tier limit).

## Status

- Demo: live at [carebridgeconnect.ai](https://www.carebridgeconnect.ai)
- Production readiness: RLS + audit + HIPAA headers ready; auth hardening and end-to-end tests planned post-grant.

## License

MIT
