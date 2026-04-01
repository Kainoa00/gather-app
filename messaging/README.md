# CareBridge Connect Messaging

HIPAA-compliant automated family notification platform for skilled nursing facilities. Built on Next.js 14 App Router, Prisma, PostgreSQL, Twilio, and PointClickCare.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Database | PostgreSQL via Prisma ORM |
| SMS | Twilio (delivery + inbound opt-out) |
| EHR | PointClickCare API + webhooks |
| Auth | NextAuth.js |
| Styling | Tailwind CSS |
| Compliance monitoring | Drata (external, SOC 2) |
| Hosting | AWS (US-only, AES-256 at rest, TLS 1.2+) |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in DATABASE_URL, TWILIO_*, PCC_*, NEXTAUTH_SECRET
```

### 3. Set up the database
```bash
# Start Postgres (or use a managed service)
npm run db:push     # Apply Prisma schema
npm run db:seed     # Load demo residents, contacts, events
```

### 4. Run dev server
```bash
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
messaging/
├── prisma/
│   ├── schema.prisma          # Full data model (14 models)
│   └── seed.ts                # Demo data: 5 residents, contacts, events
│
├── src/
│   ├── app/
│   │   ├── page.tsx           # Dashboard (metrics + EHR event feed)
│   │   ├── events/            # EHR event log
│   │   ├── messages/          # Threaded SMS view per resident
│   │   ├── residents/         # Resident roster with consent status
│   │   ├── consent/           # Consent registry + send consent SMS
│   │   ├── dsr/               # Data subject rights request tracker
│   │   ├── audit/             # Immutable audit log (HIPAA 6yr)
│   │   ├── infra/             # Subprocessors, BAA, security posture
│   │   └── api/
│   │       ├── webhooks/
│   │       │   ├── twilio/    # Inbound SMS (YES/STOP handler)
│   │       │   └── pcc/       # PointClickCare event ingestion
│   │       ├── residents/     # REST: CRUD residents
│   │       └── events/        # REST: manual event trigger
│   │
│   ├── components/
│   │   └── Sidebar.tsx        # Navigation
│   │
│   └── lib/
│       ├── prisma.ts          # Prisma singleton
│       ├── sms.ts             # Twilio: send, consent request, inbound handler
│       ├── compliance.ts      # Consent gate — blocks all PHI without consent
│       └── pcc.ts             # PCC event processor + chart write-back stub
```

---

## Data Model (Key Entities)

```
Facility ─── StaffUser
    │
    └── Resident
          ├── FamilyContact ─── Consent (per category, per contact)
          ├── CareEvent ──────── Message (outbound/inbound)
          └── Message

AuditLog (facility-scoped, immutable)
DataSubjectRequest (30-day SLA tracker)
PccWebhookEvent (raw ingestion log)
MessageTemplate (interpolatable SMS templates)
```

### Consent Categories (from Privacy Policy §5)
- `ADMISSIONS_DISCHARGES`
- `LAB_RESULTS`
- `MEDICATION_CHANGES`
- `PSYCHOTROPIC_CONSENT`
- `IMMUNIZATIONS`
- `WEIGHT_VITALS`
- `ROOM_TRANSFERS`
- `GENERAL`

Every outbound SMS passes through `compliance.checkConsent()` before Twilio is called. No exceptions.

---

## Core Flows

### 1. PCC webhook → SMS delivery
```
PCC fires webhook → POST /api/webhooks/pcc
  → verify HMAC-SHA256 signature
  → store PccWebhookEvent
  → processPccEvent()
    → find Resident by pccPatientId
    → create CareEvent
    → for each primary contact:
        → checkConsent(contact, eventType)
        → if allowed: sendSMS() via Twilio
        → if blocked: suppressMessage() + audit log
    → writePccProgressNote() (write-back to chart)
```

### 2. Inbound SMS (YES / STOP)
```
Family member replies → POST /api/webhooks/twilio
  → verify Twilio signature
  → handleInboundSMS()
    → find FamilyContact by phone number
    → YES → activate all PENDING consents
    → STOP → revoke all consents (TCPA)
    → other → store as inbound message for staff review
```

### 3. Manual event trigger (testing without PCC)
```
POST /api/events
{
  "residentId": "...",
  "eventType": "LAB_RESULT",
  "details": { "test": "BMP Panel" }
}
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `TWILIO_ACCOUNT_SID` | From Twilio console |
| `TWILIO_AUTH_TOKEN` | From Twilio console |
| `TWILIO_PHONE_NUMBER` | Your Twilio number (E.164) |
| `TWILIO_WEBHOOK_URL` | Public URL for inbound SMS (use ngrok in dev) |
| `PCC_CLIENT_ID` | PointClickCare API client ID |
| `PCC_CLIENT_SECRET` | PointClickCare API secret |
| `PCC_WEBHOOK_SECRET` | HMAC secret for PCC webhook verification |

---

## Next Steps (Post-MVP)

### Priority 1 — Required for go-live
- [ ] NextAuth authentication (staff login with MFA)
- [ ] PCC OAuth2 flow (replace stub with real token exchange)
- [ ] PCC chart write-back API (implement `writePccProgressNote()`)
- [ ] Add resident / contact CRUD UI
- [ ] SMS delivery status webhook (`/api/webhooks/twilio/status`)

### Priority 2 — Growth
- [ ] Message queue (AWS SQS) for async PCC event processing
- [ ] Broadcast messaging (wing/unit-level)
- [ ] Per-resident notification preferences UI
- [ ] Analytics dashboard (delivery rates, response rates, consent gaps)
- [ ] Annual consent renewal workflow

### Priority 3 — Scale
- [ ] Multi-facility support (facility switcher)
- [ ] Role-based access control (ADMIN vs NURSE vs SOCIAL_WORKER)
- [ ] API rate limiting
- [ ] Automated SOC 2 control evidence (Drata integration)
- [ ] Data export (NIST SP 800-88 compliant deletion workflow)

---

## HIPAA Compliance Checklist

- [x] Privacy-by-default: no PHI transmitted without active consent
- [x] Consent revocation (STOP → immediate suppression)
- [x] Audit log (immutable, 6-year retention, AES-256)
- [x] Data subject rights tracker (30-day SLA)
- [x] PHI limited to PCC-authorized data elements only
- [x] No SSN, financial data collection
- [x] US-only data residency
- [ ] BAA signed with each SNF customer (operational step)
- [ ] Annual risk assessment (operational step)
- [ ] Staff security training (operational step)
- [ ] Breach notification plan (operational step)

---

## Testing Locally

### Simulate a PCC event (no PCC account needed)
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "residentId": "RESIDENT_ID_FROM_DB",
    "eventType": "LAB_RESULT",
    "details": { "test": "BMP Panel", "result": "Normal" }
  }'
```

### Simulate inbound SMS (no Twilio needed in dev)
```bash
curl -X POST http://localhost:3000/api/webhooks/twilio \
  -d "From=%2B18015550192&Body=YES&SmsSid=SMtest123"
```

### View database
```bash
npm run db:studio  # Opens Prisma Studio at localhost:5555
```
