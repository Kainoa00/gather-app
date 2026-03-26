import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { escapeHtml, nameFromEmail, getClientIp } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────────

interface FacilityDetails {
  name: string
  address: string
  phone: string
  size: string
}

interface FirstResident {
  name: string
  dob: string
  roomNumber: string
  diagnosis: string
}

interface StaffInvite {
  email: string
  role: string
}

interface OnboardingBody {
  facility: FacilityDetails
  resident: FirstResident
  staffInvites: StaffInvite[]
}

// ── Role mapping ────────────────────────────────────────────────────────────

const ROLE_MAP: Record<string, 'admin' | 'nurse' | 'family'> = {
  Admin:               'admin',
  Nurse:               'nurse',
  CNA:                 'nurse',
  'Activities Director': 'nurse',
  'Family Member':     'family',
}

function toDbRole(role: string): 'admin' | 'nurse' | 'family' {
  const mapped = ROLE_MAP[role]
  if (!mapped) {
    console.warn(`[onboarding] Unknown role "${role}", defaulting to "nurse"`)
  }
  return mapped ?? 'nurse'
}

// ── Email builder ───────────────────────────────────────────────────────────

function buildInviteEmail(
  inviteeEmail: string,
  facilityName: string,
  adminEmail: string
): string {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://carebridgeconnect.ai'}/auth/login`
  const safeFacility = escapeHtml(facilityName)
  const safeAdmin = escapeHtml(adminEmail)
  const safeInvitee = escapeHtml(inviteeEmail)
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f6f9;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1e3a5f;padding:24px 32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">CareBridge Connect</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:18px;">You've been added to a care team</h2>
      <p style="color:#444;font-size:14px;line-height:1.7;margin:0 0 16px;">
        <strong>${safeAdmin}</strong> has added you to the care team for
        <strong>${safeFacility}</strong> on CareBridge Connect — a HIPAA-compliant
        family communication platform for skilled nursing facilities.
      </p>
      <p style="color:#444;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Sign in with <strong>${safeInvitee}</strong> to access your care dashboard.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${loginUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;
                  border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">
          Accept Invitation
        </a>
      </div>
      <p style="color:#888;font-size:12px;line-height:1.6;margin:24px 0 0;text-align:center;">
        Questions? Reply to this email or contact ${safeAdmin}.
      </p>
    </div>
  </div>
</body>
</html>`
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // 1. Verify authenticated session
  const supabaseAuth = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser()

  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: OnboardingBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { facility, resident, staffInvites } = body

  if (!facility?.name || !resident?.name || !resident?.dob) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Input length validation
  if (facility.name.length > 200 || resident.name.length > 200) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })
  }

  // 3. Use service role to bypass RLS for initial data creation
  const db = createServiceRoleClient()

  // 4. Insert patient record
  const { data: patient, error: patientError } = await db
    .from('patients')
    .insert({
      name: resident.name,
      date_of_birth: resident.dob,
      room_number: resident.roomNumber || null,
      facility_name: facility.name,
      facility_phone: facility.phone || null,
      facility_address: facility.address || null,
      primary_diagnosis: resident.diagnosis || null,
      admission_date: new Date().toISOString().split('T')[0],
    })
    .select('id')
    .single()

  if (patientError || !patient) {
    console.error('[onboarding] Failed to create patient:', patientError)
    return NextResponse.json({ error: 'Failed to create resident record' }, { status: 500 })
  }

  const patientId: string = patient.id

  // 5. Add admin member + facility_info in parallel (both depend only on patientId)
  const [memberResult, facilityResult] = await Promise.all([
    db.from('care_circle_members').insert({
      patient_id: patientId,
      name: nameFromEmail(user.email),
      email: user.email,
      role: 'admin',
      relationship: 'Facility Administrator',
    }),
    db.from('facility_info').insert({
      patient_id: patientId,
      facility_name: facility.name,
      facility_phone: facility.phone || null,
      facility_address: facility.address || null,
    }),
  ])

  if (memberResult.error) {
    console.error('[onboarding] Failed to add admin member:', memberResult.error)
    return NextResponse.json({ error: 'Failed to set up care circle' }, { status: 500 })
  }

  if (facilityResult.error) {
    console.error('[onboarding] Failed to add facility info:', facilityResult.error)
    // Non-fatal — continue
  }

  // 6. Add pending members + send invite emails
  const validInvites = (staffInvites ?? []).filter(
    (inv) => inv.email?.includes('@')
  )

  if (validInvites.length > 0) {
    const { error: inviteError } = await db.from('care_circle_members').insert(
      validInvites.map((inv) => ({
        patient_id: patientId,
        name: nameFromEmail(inv.email),
        email: inv.email,
        role: toDbRole(inv.role),
        relationship: inv.role,
      }))
    )

    if (inviteError) {
      console.error('[onboarding] Failed to add invitees:', inviteError)
      // Non-fatal — continue so the admin can still use the app
    }

    // Send invite emails (fire-and-forget; don't block on failure)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await Promise.allSettled(
        validInvites.map((inv) =>
          resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
            to: inv.email,
            subject: `You've been invited to CareBridge Connect — ${facility.name}`,
            html: buildInviteEmail(inv.email, facility.name, user.email!),
          })
        )
      )
    }
  }

  // 7. Write audit event (non-fatal)
  await db.from('audit_log').insert({
    patient_id: patientId,
    actor_id: user.id,
    actor_name: user.email,
    actor_role: 'admin',
    action: 'facility_onboarded',
    resource_type: 'patient',
    resource_id: patientId,
    ip_address: getClientIp(request),
    metadata: {
      facility_name: facility.name,
      resident_name: resident.name,
      invited_count: validInvites.length,
    },
  })

  return NextResponse.json({ success: true, patientId })
}
