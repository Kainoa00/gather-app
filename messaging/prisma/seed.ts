// prisma/seed.ts
import { PrismaClient, StaffRole, ResidentStatus, ConsentCategory, ConsentStatus, ConsentMethod, EventType, MessageDirection, MessageStatus, AuditActor, DSRType, DSRStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding CareBridge Connect Messaging demo data...')

  // ─── Facility ───────────────────────────────────────────────────────────
  const facility = await prisma.facility.upsert({
    where: { npi: '1234567890' },
    update: {},
    create: {
      name: 'Sunrise Skilled Nursing Facility',
      npi: '1234567890',
      address: '850 North 500 West',
      city: 'Provo',
      state: 'UT',
      zip: '84604',
      phone: '+18015550100',
      baaSignedAt: new Date('2025-12-01'),
    }
  })

  // ─── Staff ──────────────────────────────────────────────────────────────
  const admin = await prisma.staffUser.upsert({
    where: { email: 'admin@sunrisesnf.com' },
    update: {},
    create: {
      facilityId: facility.id,
      name: 'Sarah Mitchell',
      email: 'admin@sunrisesnf.com',
      role: StaffRole.ADMIN,
    }
  })

  await prisma.staffUser.upsert({
    where: { email: 'nurse@sunrisesnf.com' },
    update: {},
    create: {
      facilityId: facility.id,
      name: 'James Torres',
      email: 'nurse@sunrisesnf.com',
      role: StaffRole.NURSE,
    }
  })

  // ─── Residents + contacts + consents ────────────────────────────────────
  const residents = [
    {
      firstName: 'Dorothy', lastName: 'Hayes', dob: '1938-03-12',
      room: '114', admitted: '2025-11-15',
      contact: { name: 'Carol Hayes', rel: 'Daughter', phone: '+18015550192', primary: true },
      consented: true,
    },
    {
      firstName: 'Robert', lastName: 'Kinsley', dob: '1942-07-28',
      room: '108', admitted: '2025-10-02',
      contact: { name: 'Mark Kinsley', rel: 'Son', phone: '+18015550347', primary: true },
      consented: true,
    },
    {
      firstName: 'Eleanor', lastName: 'Park', dob: '1935-01-05',
      room: '122', admitted: '2026-01-08',
      contact: { name: 'Jen Park', rel: 'Daughter', phone: '+18015550581', primary: true },
      consented: false,  // Consent gap — notifications suppressed
    },
    {
      firstName: 'Walter', lastName: 'Marsh', dob: '1940-09-19',
      room: '131', admitted: '2025-09-20',
      contact: { name: 'Sandra Marsh', rel: 'Spouse', phone: '+18015550219', primary: true },
      consented: true,
    },
    {
      firstName: 'Grace', lastName: 'Tran', dob: '1945-06-03',
      room: '117', admitted: '2025-12-01',
      contact: { name: 'David Tran', rel: 'Son', phone: '+18015550463', primary: true },
      consented: true,
    },
  ]

  for (const r of residents) {
    const resident = await prisma.resident.upsert({
      where: { pccPatientId: `PCC-${r.lastName.toUpperCase()}` },
      update: {},
      create: {
        facilityId: facility.id,
        pccPatientId: `PCC-${r.lastName.toUpperCase()}`,
        firstName: r.firstName,
        lastName: r.lastName,
        dateOfBirth: new Date(r.dob),
        roomNumber: r.room,
        admittedAt: new Date(r.admitted),
        status: ResidentStatus.ACTIVE,
      }
    })

    const contact = await prisma.familyContact.upsert({
      where: { id: `contact-${r.lastName}` },
      update: {},
      create: {
        id: `contact-${r.lastName}`,
        residentId: resident.id,
        name: r.contact.name,
        relationship: r.contact.rel,
        phone: r.contact.phone,
        isPrimary: r.contact.primary,
      }
    })

    // Create consent records for all categories
    const categories = Object.values(ConsentCategory)
    for (const cat of categories) {
      await prisma.consent.upsert({
        where: { contactId_category: { contactId: contact.id, category: cat } },
        update: {},
        create: {
          contactId: contact.id,
          category: cat,
          status: r.consented ? ConsentStatus.ACTIVE : ConsentStatus.PENDING,
          method: ConsentMethod.SMS,
          consentedAt: r.consented ? new Date('2026-01-15') : null,
        }
      })
    }

    // Create a sample care event and message for consented residents
    if (r.consented) {
      const eventId = `event-${r.lastName.toLowerCase()}`
      const event = await prisma.careEvent.upsert({
        where: { pccEventId: `seed-${r.lastName.toLowerCase()}` },
        update: {},
        create: {
          id: eventId,
          residentId: resident.id,
          pccEventId: `seed-${r.lastName.toLowerCase()}`,
          type: EventType.LAB_RESULT,
          details: { test: 'BMP Panel', result: 'Normal', note: 'All values within range' },
          occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          processedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 5000),
          pccNoteWritten: false,
        }
      })

      const msgSid = `SM-seed-${r.lastName.toLowerCase()}`
      await prisma.message.upsert({
        where: { twilioSid: msgSid },
        update: {},
        create: {
          residentId: resident.id,
          contactId: contact.id,
          eventId: event.id,
          direction: MessageDirection.OUTBOUND,
          body: `Hi ${r.contact.name.split(' ')[0]}, this is Sunrise SNF. ${r.firstName}'s recent lab results are back and all values are within normal range. Please call us if you have any questions.`,
          status: MessageStatus.DELIVERED,
          twilioSid: msgSid,
          sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          deliveredAt: new Date(Date.now() - 1000 * 60 * 90),
        }
      })
    } else {
      // Eleanor — suppressed message (use a stable twilioSid for upsert)
      const suppressedSid = `SM-seed-suppressed-${r.lastName.toLowerCase()}`
      await prisma.message.upsert({
        where: { twilioSid: suppressedSid },
        update: {},
        create: {
          residentId: resident.id,
          contactId: contact.id,
          direction: MessageDirection.OUTBOUND,
          body: `Hi Jen, this is Sunrise SNF. Eleanor had a medication update today.`,
          status: MessageStatus.SUPPRESSED,
          twilioSid: suppressedSid,
        }
      })
    }
  }

  // ─── Default message templates ───────────────────────────────────────────
  const templates = [
    { name: 'Admission notice', type: EventType.ADMISSION, body: 'Hi {{contactFirstName}}, this is {{facilityName}}. We want to let you know that {{residentName}} was admitted today and is getting settled in room {{roomNumber}}. Please call us at any time with questions.' },
    { name: 'Discharge notice', type: EventType.DISCHARGE, body: 'Hi {{contactFirstName}}, {{residentName}} has been discharged from {{facilityName}} today. Please reach out if you need any follow-up information or discharge paperwork.' },
    { name: 'Lab result update', type: EventType.LAB_RESULT, body: "Hi {{contactFirstName}}, this is {{facilityName}}. {{residentName}}'s recent lab results have been reviewed by our care team. Please call us if you'd like to discuss the results." },
    { name: 'Medication change', type: EventType.MEDICATION_CHANGE, body: "Hi {{contactFirstName}}, we're reaching out because {{residentName}}'s medication regimen has been updated by their physician. Please call {{facilityPhone}} if you have any questions." },
    { name: 'Psychotropic consent request', type: EventType.PSYCHOTROPIC_MED_CONSENT, body: "Hi {{contactFirstName}}, {{facilityName}} is requesting your consent for a psychotropic medication update for {{residentName}}. Reply YES to consent or call us at {{facilityPhone}} to discuss." },
    { name: 'Immunization notice', type: EventType.IMMUNIZATION, body: 'Hi {{contactFirstName}}, we want to inform you that {{residentName}} received their {{immunizationName}} vaccine today at {{facilityName}}.' },
    { name: 'Weight change alert', type: EventType.WEIGHT_CHANGE, body: "Hi {{contactFirstName}}, our care team has noted a weight change for {{residentName}} and wants to keep you informed. Please call {{facilityPhone}} if you'd like to discuss." },
    { name: 'Room transfer notice', type: EventType.ROOM_TRANSFER, body: 'Hi {{contactFirstName}}, {{residentName}} has been moved to room {{roomNumber}} at {{facilityName}}. Please update your records. Call us with any questions.' },
  ]

  for (const t of templates) {
    // Use name as natural key for idempotency
    const existing = await prisma.messageTemplate.findFirst({
      where: { name: t.name, eventType: t.type },
    })
    if (!existing) {
      await prisma.messageTemplate.create({
        data: {
          name: t.name,
          eventType: t.type,
          body: t.body,
          isDefault: true,
        }
      })
    }
  }

  // ─── Sample audit logs ───────────────────────────────────────────────────
  const auditEntries = [
    { facilityId: facility.id, actorType: AuditActor.SYSTEM, action: 'SMS_DELIVERED', entityType: 'Message', entityId: 'demo-sms', metadata: { to: '+18015550192', resident: 'Dorothy Hayes' } },
    { facilityId: facility.id, actorType: AuditActor.WEBHOOK, action: 'PCC_SYNC', entityType: 'PccWebhookEvent', entityId: 'demo-sync', metadata: { eventsIngested: 4 } },
    { facilityId: facility.id, actorType: AuditActor.SYSTEM, action: 'NOTIFICATION_SUPPRESSED', entityType: 'Message', entityId: 'demo-suppressed', metadata: { reason: 'NO_CONSENT', resident: 'Eleanor Park' } },
    { facilityId: facility.id, actorId: admin.id, actorType: AuditActor.STAFF, action: 'STAFF_LOGIN', entityType: 'StaffUser', entityId: admin.id, metadata: { mfa: true } },
  ]

  for (const entry of auditEntries) {
    const existing = await prisma.auditLog.findFirst({
      where: { action: entry.action, entityId: entry.entityId },
    })
    if (!existing) {
      await prisma.auditLog.create({ data: entry })
    }
  }

  // ─── Sample DSR ──────────────────────────────────────────────────────────
  const existingDsr = await prisma.dataSubjectRequest.findFirst({
    where: { requestorName: 'Carol Hayes', residentName: 'Dorothy Hayes', requestType: DSRType.ACCESS },
  })
  if (!existingDsr) {
    await prisma.dataSubjectRequest.create({
      data: {
        facilityId: facility.id,
        requestType: DSRType.ACCESS,
        requestorName: 'Carol Hayes',
        requestorPhone: '+18015550192',
        residentName: 'Dorothy Hayes',
        status: DSRStatus.IN_PROGRESS,
        receivedAt: new Date('2026-03-15'),
        dueAt: new Date('2026-04-14'),
      }
    })
  }

  console.log('Seed complete.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
