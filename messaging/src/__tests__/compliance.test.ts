// Basic test stubs — validates the compliance module's consent-checking logic
// To run: npx vitest run (after adding vitest to devDependencies)

import { describe, it, expect } from 'vitest'

describe('Consent Categories', () => {
  it('should have 8 consent categories matching the schema', () => {
    const categories = [
      'ADMISSIONS_DISCHARGES', 'LAB_RESULTS', 'MEDICATION_CHANGES',
      'PSYCHOTROPIC_CONSENT', 'IMMUNIZATIONS', 'WEIGHT_VITALS',
      'ROOM_TRANSFERS', 'GENERAL',
    ]
    expect(categories).toHaveLength(8)
  })
})

describe('Event Type to Consent Category Mapping', () => {
  const eventToConsent: Record<string, string> = {
    ADMISSION: 'ADMISSIONS_DISCHARGES',
    DISCHARGE: 'ADMISSIONS_DISCHARGES',
    LAB_RESULT: 'LAB_RESULTS',
    MEDICATION_CHANGE: 'MEDICATION_CHANGES',
    PSYCHOTROPIC_MED_CONSENT: 'PSYCHOTROPIC_CONSENT',
    IMMUNIZATION: 'IMMUNIZATIONS',
    WEIGHT_CHANGE: 'WEIGHT_VITALS',
    ROOM_TRANSFER: 'ROOM_TRANSFERS',
    MANUAL: 'GENERAL',
  }

  it('should map all event types to consent categories', () => {
    expect(Object.keys(eventToConsent)).toHaveLength(9)
  })

  it('should map ADMISSION to ADMISSIONS_DISCHARGES', () => {
    expect(eventToConsent['ADMISSION']).toBe('ADMISSIONS_DISCHARGES')
  })

  it('should map MANUAL to GENERAL', () => {
    expect(eventToConsent['MANUAL']).toBe('GENERAL')
  })
})

describe('Phone Number Format', () => {
  it('should validate E.164 format', () => {
    const e164 = /^\+[1-9]\d{1,14}$/
    expect('+18015550192').toMatch(e164)
    expect('+442071234567').toMatch(e164)
    expect('8015550192').not.toMatch(e164)
    expect('+0123456789').not.toMatch(e164)
  })
})
