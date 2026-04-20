import type {
  PCCResident,
  PCCVitals,
  PCCMedicationOrder,
  PCCMedicationAdministration,
  PCCProgressNote,
  PCCAssessment,
  PCCIncident,
  PCCAppointment,
  PCCMood,
  PCCAlertness,
  PCCAppetite,
  PCCSleepQuality,
  PCCMedicationAdministrationStatus,
  PCCProgressNoteAuthorRole,
  PCCAppointmentType,
  PCCAppointmentStatus,
  PCCIncidentType,
  PCCIncidentSeverity,
} from '../types';
import { type PRNG, createPRNG, seededInt, seededFloat, seededPick, seededBool } from './seed';
import { PCC_RESIDENTS } from './residents';

// ──────────────────────────────────────────────
// Public types
// ──────────────────────────────────────────────

export interface GeneratedResidentData {
  resident: PCCResident;
  vitals: PCCVitals[];
  medicationOrders: PCCMedicationOrder[];
  medicationAdministrations: PCCMedicationAdministration[];
  progressNotes: PCCProgressNote[];
  assessments: PCCAssessment[];
  incidents: PCCIncident[];
  appointments: PCCAppointment[];
}

export interface GenerateOptions {
  referenceDate?: Date;
  historyDays?: number;
  includeTodayUpToNow?: boolean;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString();
}

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

function setHour(d: Date, h: number, m = 0): Date {
  const r = new Date(d);
  r.setUTCHours(h, m, 0, 0);
  return r;
}

let _counter = 0;
function uid(prefix: string): string {
  _counter++;
  return `${prefix}-${String(_counter).padStart(6, '0')}`;
}

function resetCounter() {
  _counter = 0;
}

// ──────────────────────────────────────────────
// Vitals baselines
// ──────────────────────────────────────────────

interface VitalsBaseline {
  systolicMin: number;
  systolicMax: number;
  diastolicMin: number;
  diastolicMax: number;
  hrMin: number;
  hrMax: number;
  tempMin: number;
  tempMax: number;
  spo2Min: number;
  spo2Max: number;
  rrMin: number;
  rrMax: number;
  baseWeight: number;
}

const VITALS_BASELINES: Record<string, VitalsBaseline> = {
  'pcc-r-001': { systolicMin: 128, systolicMax: 138, diastolicMin: 78, diastolicMax: 86, hrMin: 72, hrMax: 80, tempMin: 97.8, tempMax: 98.6, spo2Min: 95, spo2Max: 97, rrMin: 16, rrMax: 18, baseWeight: 138 },
  'pcc-r-002': { systolicMin: 122, systolicMax: 132, diastolicMin: 74, diastolicMax: 82, hrMin: 68, hrMax: 76, tempMin: 97.8, tempMax: 98.4, spo2Min: 96, spo2Max: 98, rrMin: 14, rrMax: 16, baseWeight: 182 },
  'pcc-r-003': { systolicMin: 130, systolicMax: 140, diastolicMin: 78, diastolicMax: 86, hrMin: 76, hrMax: 84, tempMin: 97.6, tempMax: 98.6, spo2Min: 93, spo2Max: 96, rrMin: 16, rrMax: 20, baseWeight: 155 },
  'pcc-r-004': { systolicMin: 132, systolicMax: 144, diastolicMin: 80, diastolicMax: 88, hrMin: 70, hrMax: 78, tempMin: 97.8, tempMax: 98.6, spo2Min: 94, spo2Max: 97, rrMin: 16, rrMax: 18, baseWeight: 198 },
  'pcc-r-005': { systolicMin: 138, systolicMax: 148, diastolicMin: 84, diastolicMax: 92, hrMin: 74, hrMax: 84, tempMin: 97.8, tempMax: 98.6, spo2Min: 95, spo2Max: 97, rrMin: 15, rrMax: 18, baseWeight: 162 },
};

// ──────────────────────────────────────────────
// Medication definitions
// ──────────────────────────────────────────────

interface MedDef {
  name: string;
  generic: string | null;
  dosage: string;
  route: PCCMedicationOrder['route'];
  frequency: string;
  indication: string;
  isPRN: boolean;
  endDateOffsetDays?: number; // relative to admissionDate
}

const MEDICATION_DEFS: Record<string, MedDef[]> = {
  'pcc-r-001': [
    { name: 'Donepezil', generic: 'donepezil HCl', dosage: '10mg', route: 'oral', frequency: 'QD', indication: 'Cognitive symptoms', isPRN: false },
    { name: 'Memantine', generic: 'memantine HCl', dosage: '10mg', route: 'oral', frequency: 'BID', indication: 'Cognitive symptoms', isPRN: false },
    { name: 'Sertraline', generic: 'sertraline HCl', dosage: '50mg', route: 'oral', frequency: 'QD', indication: 'Mood/behavioral symptoms', isPRN: false },
    { name: 'Lorazepam', generic: 'lorazepam', dosage: '0.5mg', route: 'oral', frequency: 'PRN', indication: 'Agitation', isPRN: true },
    { name: 'Lisinopril', generic: 'lisinopril', dosage: '10mg', route: 'oral', frequency: 'QD', indication: 'Hypertension', isPRN: false },
    { name: 'Aspirin', generic: 'aspirin', dosage: '81mg', route: 'oral', frequency: 'QD', indication: 'Cardiac protection', isPRN: false },
  ],
  'pcc-r-002': [
    { name: 'Enoxaparin', generic: 'enoxaparin sodium', dosage: '40mg', route: 'im', frequency: 'QD', indication: 'DVT prophylaxis', isPRN: false },
    { name: 'Acetaminophen', generic: 'acetaminophen', dosage: '650mg', route: 'oral', frequency: 'Q6H', indication: 'Pain management', isPRN: false },
    { name: 'Oxycodone', generic: 'oxycodone HCl', dosage: '5mg', route: 'oral', frequency: 'Q4H PRN', indication: 'Breakthrough pain', isPRN: true },
    { name: 'Metoprolol', generic: 'metoprolol tartrate', dosage: '25mg', route: 'oral', frequency: 'BID', indication: 'Cardiac', isPRN: false },
    { name: 'Docusate Sodium', generic: 'docusate sodium', dosage: '100mg', route: 'oral', frequency: 'BID', indication: 'Bowel regimen', isPRN: false },
    { name: 'Pantoprazole', generic: 'pantoprazole sodium', dosage: '40mg', route: 'oral', frequency: 'QD', indication: 'GI protection', isPRN: false },
  ],
  'pcc-r-003': [
    { name: 'Tiotropium', generic: 'tiotropium bromide', dosage: '18mcg', route: 'inhaled', frequency: 'QD', indication: 'Bronchodilator', isPRN: false },
    { name: 'Albuterol', generic: 'albuterol sulfate', dosage: '2.5mg', route: 'inhaled', frequency: 'Q4H PRN', indication: 'Rescue bronchodilator', isPRN: true },
    { name: 'Furosemide', generic: 'furosemide', dosage: '20mg', route: 'oral', frequency: 'QD', indication: 'Diuretic', isPRN: false },
    { name: 'Aspirin', generic: 'aspirin', dosage: '81mg', route: 'oral', frequency: 'QD', indication: 'Cardiac', isPRN: false },
    { name: 'Metoprolol', generic: 'metoprolol tartrate', dosage: '50mg', route: 'oral', frequency: 'BID', indication: 'Rate control', isPRN: false },
    { name: 'Prednisone', generic: 'prednisone', dosage: '10mg', route: 'oral', frequency: 'QD', indication: 'Short burst', isPRN: false, endDateOffsetDays: 14 },
  ],
  'pcc-r-004': [
    { name: 'Carvedilol', generic: 'carvedilol', dosage: '6.25mg', route: 'oral', frequency: 'BID', indication: 'Heart failure', isPRN: false },
    { name: 'Lisinopril', generic: 'lisinopril', dosage: '5mg', route: 'oral', frequency: 'QD', indication: 'ACE inhibitor', isPRN: false },
    { name: 'Furosemide', generic: 'furosemide', dosage: '40mg', route: 'oral', frequency: 'QD', indication: 'Fluid management', isPRN: false },
    { name: 'Metolazone', generic: 'metolazone', dosage: '2.5mg', route: 'oral', frequency: 'QD', indication: 'Potentiate diuresis', isPRN: false },
    { name: 'Digoxin', generic: 'digoxin', dosage: '0.125mg', route: 'oral', frequency: 'QD', indication: 'Rate control', isPRN: false },
    { name: 'Spironolactone', generic: 'spironolactone', dosage: '25mg', route: 'oral', frequency: 'QD', indication: 'Aldosterone antagonist', isPRN: false },
  ],
  'pcc-r-005': [
    { name: 'Amlodipine', generic: 'amlodipine besylate', dosage: '5mg', route: 'oral', frequency: 'QD', indication: 'Hypertension', isPRN: false },
    { name: 'Metformin', generic: 'metformin HCl', dosage: '500mg', route: 'oral', frequency: 'BID', indication: 'Diabetes', isPRN: false },
    { name: 'Insulin Glargine', generic: 'insulin glargine', dosage: '10 units', route: 'im', frequency: 'QHS', indication: 'Insulin', isPRN: false },
    { name: 'Risperidone', generic: 'risperidone', dosage: '0.25mg', route: 'oral', frequency: 'BID', indication: 'Behavioral symptoms', isPRN: false },
    { name: 'Donepezil', generic: 'donepezil HCl', dosage: '5mg', route: 'oral', frequency: 'QD', indication: 'Cognitive symptoms', isPRN: false },
    { name: 'Melatonin', generic: 'melatonin', dosage: '3mg', route: 'oral', frequency: 'QHS', indication: 'Sleep', isPRN: false },
  ],
};

// ──────────────────────────────────────────────
// Vitals generation
// ──────────────────────────────────────────────

function generateVitals(
  resident: PCCResident,
  prng: PRNG,
  days: Date[],
  includeTodayUpToNow: boolean,
  referenceDate: Date
): PCCVitals[] {
  const bl = VITALS_BASELINES[resident.residentId];
  if (!bl) return [];

  const results: PCCVitals[] = [];
  const staffPool = ['staff-001', 'staff-002'];
  const todayStr = dateOnly(referenceDate);
  const nowHour = referenceDate.getUTCHours();

  // Stable base weight per resident
  const baseWeight = bl.baseWeight;

  for (const day of days) {
    const dayStr = dateOnly(day);
    const isToday = dayStr === todayStr;

    const slots: { hour: number; minute: number }[] = [{ hour: 7, minute: 0 }];
    if (seededBool(prng, 0.5)) slots.push({ hour: 12, minute: 0 });
    slots.push({ hour: 17, minute: 0 });

    for (const slot of slots) {
      if (isToday && includeTodayUpToNow && nowHour <= slot.hour) continue;

      const recordedAt = setHour(day, slot.hour, slot.minute);
      const painRoll = prng();
      // Weighted toward lower values: 0-1 (50%), 2-3 (35%), 4-5 (15%)
      let painScore: number;
      if (painRoll < 0.5) painScore = seededInt(prng, 0, 1);
      else if (painRoll < 0.85) painScore = seededInt(prng, 2, 3);
      else painScore = seededInt(prng, 4, 5);

      const vitals: PCCVitals = {
        vitalsId: uid('v'),
        residentId: resident.residentId,
        recordedAt: isoDate(recordedAt),
        recordedBy: seededPick(prng, staffPool),
        bloodPressureSystolic: seededInt(prng, bl.systolicMin, bl.systolicMax),
        bloodPressureDiastolic: seededInt(prng, bl.diastolicMin, bl.diastolicMax),
        heartRate: seededInt(prng, bl.hrMin, bl.hrMax),
        respiratoryRate: seededInt(prng, bl.rrMin, bl.rrMax),
        temperatureFahrenheit: Math.round(seededFloat(prng, bl.tempMin, bl.tempMax) * 10) / 10,
        oxygenSaturation: seededInt(prng, bl.spo2Min, bl.spo2Max),
        bloodGlucose: resident.residentId === 'pcc-r-005' ? seededInt(prng, 95, 145) : null,
        weight: Math.round((baseWeight + seededFloat(prng, -0.5, 0.5)) * 10) / 10,
        painScore,
        notes: null,
      };
      results.push(vitals);
    }
  }
  return results;
}

// ──────────────────────────────────────────────
// Medication orders generation
// ──────────────────────────────────────────────

function generateMedicationOrders(resident: PCCResident): PCCMedicationOrder[] {
  const defs = MEDICATION_DEFS[resident.residentId] ?? [];
  return defs.map((def, i) => {
    let endDate: string | null = null;
    if (def.endDateOffsetDays !== undefined) {
      const admDate = new Date(resident.admissionDate + 'T00:00:00Z');
      endDate = dateOnly(addDays(admDate, def.endDateOffsetDays));
    }
    return {
      orderId: `${resident.residentId}-ord-${String(i + 1).padStart(3, '0')}`,
      residentId: resident.residentId,
      medicationName: def.name,
      genericName: def.generic,
      dosage: def.dosage,
      route: def.route,
      frequency: def.frequency,
      startDate: resident.admissionDate,
      endDate,
      prescriber: 'Dr. Patricia Wong, MD',
      indication: def.indication,
      isPRN: def.isPRN,
      isActive: true,
    };
  });
}

// ──────────────────────────────────────────────
// Medication administration generation
// ──────────────────────────────────────────────

function getScheduledHours(frequency: string): number[] {
  const f = frequency.toLowerCase();
  if (f === 'bid') return [8, 20];
  if (f === 'qhs') return [21];
  if (f === 'q6h') return [6, 12, 18, 0];
  if (f === 'qd') return [8];
  // PRN and Q4H PRN handled separately
  return [8];
}

function generateMedicationAdministrations(
  resident: PCCResident,
  orders: PCCMedicationOrder[],
  prng: PRNG,
  days: Date[],
  includeTodayUpToNow: boolean,
  referenceDate: Date
): PCCMedicationAdministration[] {
  const results: PCCMedicationAdministration[] = [];
  const staffPool = ['staff-001', 'staff-002', 'staff-003'];
  const todayStr = dateOnly(referenceDate);
  const nowHour = referenceDate.getUTCHours();

  for (const order of orders) {
    for (const day of days) {
      const dayStr = dateOnly(day);
      const isToday = dayStr === todayStr;

      if (order.isPRN) {
        // ~20% chance of PRN administration on any given day
        if (!seededBool(prng, 0.2)) continue;
        const hour = seededInt(prng, 8, 22);
        if (isToday && includeTodayUpToNow && nowHour <= hour) continue;

        const scheduledAt = setHour(day, hour, 0);
        const statusRoll = prng();
        const status: PCCMedicationAdministrationStatus =
          statusRoll < 0.95 ? 'given' : statusRoll < 0.98 ? 'refused' : 'held';

        results.push({
          administrationId: uid('ma'),
          orderId: order.orderId,
          residentId: resident.residentId,
          scheduledTime: isoDate(scheduledAt),
          administeredTime: status === 'given' ? isoDate(setHour(day, hour, seededInt(prng, 0, 15))) : null,
          administeredBy: status === 'given' ? seededPick(prng, staffPool) : null,
          status,
          notes: null,
        });
        continue;
      }

      const hours = getScheduledHours(order.frequency);
      for (const h of hours) {
        if (isToday && includeTodayUpToNow && nowHour <= h) continue;

        const scheduledAt = setHour(day, h, 0);
        const statusRoll = prng();
        const status: PCCMedicationAdministrationStatus =
          statusRoll < 0.95 ? 'given' : statusRoll < 0.98 ? 'refused' : 'held';

        results.push({
          administrationId: uid('ma'),
          orderId: order.orderId,
          residentId: resident.residentId,
          scheduledTime: isoDate(scheduledAt),
          administeredTime: status === 'given' ? isoDate(setHour(day, h, seededInt(prng, 1, 20))) : null,
          administeredBy: status === 'given' ? seededPick(prng, staffPool) : null,
          status,
          notes: null,
        });
      }
    }
  }
  return results;
}

// ──────────────────────────────────────────────
// Assessment generation
// ──────────────────────────────────────────────

const MOOD_POOL: { value: PCCMood; weight: number }[] = [
  { value: 'content', weight: 50 },
  { value: 'euphoric', weight: 10 },
  { value: 'sad', weight: 15 },
  { value: 'anxious', weight: 15 },
  { value: 'agitated', weight: 7 },
  { value: 'withdrawn', weight: 3 },
];

function weightedPick<T>(prng: PRNG, pool: { value: T; weight: number }[]): T {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = prng() * total;
  for (const item of pool) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return pool[pool.length - 1].value;
}

function pickMood(prng: PRNG): PCCMood {
  return weightedPick(prng, MOOD_POOL);
}

function pickAlertness(prng: PRNG): PCCAlertness {
  return weightedPick(prng, [
    { value: 'alert' as PCCAlertness, weight: 70 },
    { value: 'drowsy' as PCCAlertness, weight: 20 },
    { value: 'lethargic' as PCCAlertness, weight: 8 },
    { value: 'unresponsive' as PCCAlertness, weight: 2 },
  ]);
}

function pickAppetite(prng: PRNG): PCCAppetite {
  return weightedPick(prng, [
    { value: 'good' as PCCAppetite, weight: 45 },
    { value: 'fair' as PCCAppetite, weight: 35 },
    { value: 'poor' as PCCAppetite, weight: 15 },
    { value: 'refused' as PCCAppetite, weight: 5 },
  ]);
}

function appetiteToIntake(prng: PRNG, appetite: PCCAppetite): number {
  switch (appetite) {
    case 'good': return seededInt(prng, 70, 100);
    case 'fair': return seededInt(prng, 40, 70);
    case 'poor': return seededInt(prng, 10, 40);
    case 'refused': return seededInt(prng, 0, 20);
  }
}

function generateAssessments(
  resident: PCCResident,
  prng: PRNG,
  days: Date[],
  includeTodayUpToNow: boolean,
  referenceDate: Date
): PCCAssessment[] {
  const results: PCCAssessment[] = [];
  const staffPool = ['staff-001', 'staff-002'];
  const todayStr = dateOnly(referenceDate);
  const nowHour = referenceDate.getUTCHours();

  for (const day of days) {
    const dayStr = dateOnly(day);
    const isToday = dayStr === todayStr;

    const slots = [{ hour: 8, minute: 0 }];
    if (seededBool(prng, 0.6)) slots.push({ hour: 14, minute: 0 });

    for (const slot of slots) {
      if (isToday && includeTodayUpToNow && nowHour <= slot.hour) continue;

      const appetite = pickAppetite(prng);
      const sleepQ = weightedPick(prng, [
        { value: 'good' as PCCSleepQuality, weight: 50 },
        { value: 'fair' as PCCSleepQuality, weight: 35 },
        { value: 'poor' as PCCSleepQuality, weight: 15 },
      ]);

      results.push({
        assessmentId: uid('a'),
        residentId: resident.residentId,
        assessedAt: isoDate(setHour(day, slot.hour, slot.minute)),
        assessedBy: seededPick(prng, staffPool),
        mood: pickMood(prng),
        alertness: pickAlertness(prng),
        appetite,
        intakePercentage: appetiteToIntake(prng, appetite),
        sleepQuality: sleepQ,
        notes: null,
      });
    }
  }
  return results;
}

// ──────────────────────────────────────────────
// Progress notes generation
// ──────────────────────────────────────────────

const MORNING_NOTES = [
  (prng: PRNG, resident: PCCResident) => {
    const time = `0${seededInt(prng, 6, 8)}:${seededPick(prng, ['00', '15', '30', '45'])}`;
    const oriented = ['Memory Care', 'Memory Care'].includes(resident.unit ?? '')
      ? 'person only'
      : 'person and place';
    const appetite = seededPick(prng, ['good', 'fair', 'poor']);
    const assist = seededPick(prng, ['minimal', 'moderate', 'maximal']);
    return `Resident awoke at ${time}. Oriented to ${oriented}. Appetite ${appetite} for breakfast. ADLs completed with ${assist} assistance. No acute distress noted.`;
  },
  (prng: PRNG) => {
    const behavior = seededPick(prng, ['cooperative', 'resistive']);
    const ambDist = seededInt(prng, 15, 75);
    const ambAid = seededPick(prng, ['walker', 'gait belt', 'one-person assist']);
    return `Morning care completed without incident. Resident ${behavior} with personal hygiene. Vital signs within baseline. No complaints of pain. Ambulated ${ambDist} feet with ${ambAid}.`;
  },
];

const AFTERNOON_NOTES = [
  (prng: PRNG) => {
    const activity = seededBool(prng, 0.7) ? 'participated in' : 'declined';
    const intake = seededInt(prng, 40, 90);
    const pain = seededInt(prng, 0, 4);
    const management = seededPick(prng, ['acetaminophen as ordered', 'repositioning', 'ice pack application']);
    const mood = seededPick(prng, ['pleasant', 'calm', 'cooperative', 'anxious']);
    return `Resident ${activity} afternoon activities. Lunch intake approximately ${intake}%. Pain level reported as ${pain}/10, managed with ${management}. Mood ${mood}.`;
  },
  (prng: PRNG) => {
    const progress = seededPick(prng, ['mobility', 'strength', 'balance', 'transfers']);
    const familyContact = seededBool(prng, 0.3) ? 'Family member contacted with update.' : 'Family not present.';
    return `Physical therapy session completed. Resident tolerated treatment well. Progress noted with ${progress}. ${familyContact}`;
  },
];

const EVENING_NOTES = [
  (prng: PRNG) => {
    const adj = seededPick(prng, ['calm', 'pleasant', 'tired', 'restless', 'cooperative']);
    const intake = seededInt(prng, 40, 90);
    const nightStatus = seededPick(prng, ['stable status', 'elevated pain level', 'increased agitation']);
    return `Evening medications administered without incident. Resident ${adj} this evening. Dinner intake ${intake}%. No falls or incidents to report. Night staff notified of ${nightStatus}.`;
  },
  (prng: PRNG) => {
    const trend = seededPick(prng, ['stable', 'improving', 'unchanged']);
    const familyVisit = seededBool(prng, 0.25) ? 'occurred' : 'did not occur';
    return `End of shift summary: Resident ${trend} compared to yesterday. No new concerns. Family visit ${familyVisit}. Night staff briefed.`;
  },
];

function generateProgressNotes(
  resident: PCCResident,
  prng: PRNG,
  days: Date[],
  includeTodayUpToNow: boolean,
  referenceDate: Date
): PCCProgressNote[] {
  const results: PCCProgressNote[] = [];
  const todayStr = dateOnly(referenceDate);
  const nowHour = referenceDate.getUTCHours();

  const authorSlots = [
    { id: 'staff-001', role: 'rn' as PCCProgressNoteAuthorRole },
    { id: 'staff-002', role: 'cna' as PCCProgressNoteAuthorRole },
    { id: 'staff-003', role: 'lpn' as PCCProgressNoteAuthorRole },
  ];

  const shiftSlots = [
    { hour: 7, minute: seededInt(prng, 0, 59), notes: MORNING_NOTES },
    { hour: 8, minute: seededInt(prng, 30, 59), notes: MORNING_NOTES },
    { hour: 13, minute: seededInt(prng, 0, 59), notes: AFTERNOON_NOTES },
    { hour: 14, minute: seededInt(prng, 30, 59), notes: AFTERNOON_NOTES },
  ];
  const eveningSlots = [
    { hour: 17, minute: seededInt(prng, 0, 59), notes: EVENING_NOTES },
    { hour: 19, minute: seededInt(prng, 0, 59), notes: EVENING_NOTES },
  ];

  for (const day of days) {
    const dayStr = dateOnly(day);
    const isToday = dayStr === todayStr;

    const allSlots = [...shiftSlots, ...eveningSlots];
    // 3-4 notes per day: pick 3 or 4 slots
    const count = seededBool(prng, 0.5) ? 4 : 3;
    const chosen = allSlots.slice(0, count);

    for (const slot of chosen) {
      if (isToday && includeTodayUpToNow && nowHour <= slot.hour) continue;

      // Weight: rn 60%, lpn 20%, cna 20%
      const roleRoll = prng();
      const authorInfo = roleRoll < 0.6 ? authorSlots[0] : roleRoll < 0.8 ? authorSlots[2] : authorSlots[1];
      const noteFn = seededPick(prng, slot.notes);

      results.push({
        noteId: uid('n'),
        residentId: resident.residentId,
        authoredAt: isoDate(setHour(day, slot.hour, slot.minute)),
        authoredBy: authorInfo.id,
        authorRole: authorInfo.role,
        noteType: 'shift_note',
        content: noteFn(prng, resident),
        tags: [],
      });
    }
  }

  return results;
}

// ──────────────────────────────────────────────
// Incident generation
// ──────────────────────────────────────────────

function generateIncidents(
  resident: PCCResident,
  prng: PRNG,
  startDate: Date,
): PCCIncident[] {
  // Roll once: 40% chance of any incident
  if (!seededBool(prng, 0.4)) return [];

  const dayOffset = seededInt(prng, 5, 20);
  const occurredAt = setHour(addDays(startDate, dayOffset), seededInt(prng, 8, 20), seededInt(prng, 0, 59));

  const typeRoll = prng();
  const incidentType: PCCIncidentType =
    typeRoll < 0.4 ? 'fall' :
    typeRoll < 0.7 ? 'behavior' :
    typeRoll < 0.85 ? 'injury' : 'other';

  const severityRoll = prng();
  const severity: PCCIncidentSeverity =
    severityRoll < 0.5 ? 'minor' :
    severityRoll < 0.9 ? 'moderate' : 'major';

  const descriptions: Record<PCCIncidentType, string[]> = {
    fall: [
      'Resident found on floor near bedside. No loss of consciousness. Denies pain. No visible injuries.',
      'Resident slipped while ambulating to bathroom. Assisted back to chair. No injury apparent.',
    ],
    behavior: [
      'Resident became verbally aggressive during personal care. De-escalation techniques employed.',
      'Resident refused medications and became agitated. Calm verbal redirection used.',
    ],
    injury: [
      'Resident sustained minor skin tear on right forearm. Wound care applied.',
      'Resident reported pain in left shoulder after repositioning. Assessment completed.',
    ],
    other: [
      'Resident found out of bed without call light. Returned safely. Bed alarm reset.',
      'Resident expressed verbal concern about care. Social worker notified.',
    ],
    medication_error: ['Medication administered 30 minutes late. Physician notified. No adverse effects.'],
    elopement: ['Resident found at unit door. Safely redirected. Family notified.'],
  };

  const interventions: Record<PCCIncidentType, string> = {
    fall: 'Vital signs assessed. Head-to-toe assessment completed. No injuries identified. Physician notified. Fall precautions reviewed and reinforced.',
    behavior: 'De-escalation techniques employed. Environment adjusted. PRN medication considered per order. Care team notified.',
    injury: 'Wound care applied. Physician notified. Comfort measures provided. Documentation completed.',
    other: 'Situation resolved. Staff debriefed. Care plan reviewed.',
    medication_error: 'Physician notified. Incident report filed. No adverse outcomes.',
    elopement: 'Resident safely redirected. Physician and family notified. Elopement precautions reviewed.',
  };

  const familyNotifiedAt = addDays(occurredAt, 0);
  familyNotifiedAt.setUTCMinutes(familyNotifiedAt.getUTCMinutes() + seededInt(prng, 15, 90));

  return [{
    incidentId: uid('inc'),
    residentId: resident.residentId,
    occurredAt: isoDate(occurredAt),
    reportedBy: 'staff-001',
    incidentType,
    severity,
    description: seededPick(prng, descriptions[incidentType]),
    interventionsTaken: interventions[incidentType],
    familyNotified: true,
    familyNotifiedAt: isoDate(familyNotifiedAt),
  }];
}

// ──────────────────────────────────────────────
// Appointment generation
// ──────────────────────────────────────────────

const FACILITY_EVENTS = [
  'Movie Night',
  'Music Therapy',
  'Bingo',
  'Arts & Crafts',
  'Chair Yoga',
  'Garden Club',
  'Trivia Hour',
  'Cooking Demonstration',
];

const SPECIALISTS = [
  { title: 'Cardiology Consultation', provider: 'Dr. James Okafor, MD' },
  { title: 'Pulmonology Consultation', provider: 'Dr. Amy Chen, MD' },
  { title: 'Neurology Consultation', provider: 'Dr. Marco Rivera, MD' },
  { title: 'Ophthalmology Appointment', provider: 'Dr. Susan Park, MD' },
  { title: 'Podiatry Appointment', provider: 'Dr. Kevin Walsh, DPM' },
];

function generateAppointments(
  resident: PCCResident,
  prng: PRNG,
  referenceDate: Date,
  historyDays: number
): PCCAppointment[] {
  const results: PCCAppointment[] = [];
  const startDate = addDays(referenceDate, -historyDays);
  const endDate = addDays(referenceDate, historyDays);
  const totalDays = historyDays * 2;
  const targetCount = seededInt(prng, 8, 12);

  // Physician: 2 per month
  for (let i = 0; i < 2; i++) {
    const dayOffset = seededInt(prng, 0, totalDays - 1);
    const apptDate = addDays(startDate, dayOffset);
    const hour = seededInt(prng, 9, 15);
    const start = setHour(apptDate, hour, 0);
    const end = setHour(apptDate, hour + 1, 0);
    const isPast = apptDate < referenceDate;
    results.push({
      appointmentId: uid('appt'),
      residentId: resident.residentId,
      scheduledStart: isoDate(start),
      scheduledEnd: isoDate(end),
      appointmentType: 'physician',
      title: 'Physician Rounds',
      location: 'Resident Room',
      provider: 'Dr. Patricia Wong, MD',
      notes: null,
      status: isPast ? 'completed' : 'scheduled',
    });
  }

  // Therapy: 3x/week for Robert and Eleanor
  const isActiveRehab = ['pcc-r-002', 'pcc-r-003'].includes(resident.residentId);
  if (isActiveRehab) {
    for (let week = 0; week < Math.ceil(totalDays / 7); week++) {
      for (let session = 0; session < 3; session++) {
        const dayInWeek = seededPick(prng, [1, 2, 3, 4, 5]); // weekday
        const dayOffset = week * 7 + dayInWeek;
        if (dayOffset >= totalDays) continue;
        const apptDate = addDays(startDate, dayOffset);
        const hour = seededInt(prng, 9, 14);
        const start = setHour(apptDate, hour, 0);
        const end = setHour(apptDate, hour, 45);
        const isPast = apptDate < referenceDate;
        results.push({
          appointmentId: uid('appt'),
          residentId: resident.residentId,
          scheduledStart: isoDate(start),
          scheduledEnd: isoDate(end),
          appointmentType: 'therapy',
          title: resident.residentId === 'pcc-r-002' ? 'Physical Therapy' : 'Respiratory Therapy',
          location: 'Therapy Gym',
          provider: resident.residentId === 'pcc-r-002' ? 'PT Maria Santos' : 'RT David Chen',
          notes: null,
          status: isPast ? 'completed' : 'scheduled',
        });
      }
    }
  }

  // Facility events: weekly
  for (let week = 0; week < Math.ceil(totalDays / 7); week++) {
    const dayOffset = week * 7 + seededInt(prng, 0, 6);
    if (dayOffset >= totalDays) continue;
    const apptDate = addDays(startDate, dayOffset);
    const isPast = apptDate < referenceDate;
    const hour = seededInt(prng, 14, 19);
    const start = setHour(apptDate, hour, 0);
    const end = setHour(apptDate, hour + 1, 0);
    results.push({
      appointmentId: uid('appt'),
      residentId: resident.residentId,
      scheduledStart: isoDate(start),
      scheduledEnd: isoDate(end),
      appointmentType: 'facility_event',
      title: seededPick(prng, FACILITY_EVENTS),
      location: 'Activity Room',
      provider: null,
      notes: null,
      status: isPast ? 'completed' : 'scheduled',
    });
  }

  // Specialist: fill up to target count
  const remaining = targetCount - results.length;
  for (let i = 0; i < Math.max(0, remaining); i++) {
    const dayOffset = seededInt(prng, 0, totalDays - 1);
    const apptDate = addDays(startDate, dayOffset);
    const hour = seededInt(prng, 9, 16);
    const start = setHour(apptDate, hour, 0);
    const end = setHour(apptDate, hour + 1, 0);
    const isPast = apptDate < referenceDate;
    const typeRoll = prng();
    let appointmentType: PCCAppointmentType;
    let title: string;
    let provider: string | null;

    if (typeRoll < 0.15) {
      const spec = seededPick(prng, SPECIALISTS);
      appointmentType = 'specialist';
      title = spec.title;
      provider = spec.provider;
    } else if (typeRoll < 0.20) {
      appointmentType = 'family_visit';
      title = 'Family Visit';
      provider = null;
    } else {
      appointmentType = 'physician';
      title = 'Physician Follow-up';
      provider = 'Dr. Patricia Wong, MD';
    }

    results.push({
      appointmentId: uid('appt'),
      residentId: resident.residentId,
      scheduledStart: isoDate(start),
      scheduledEnd: isoDate(end),
      appointmentType,
      title,
      location: appointmentType === 'family_visit' ? 'Resident Room' : 'Clinic',
      provider,
      notes: null,
      status: isPast ? (seededBool(prng, 0.9) ? 'completed' : 'no_show') : 'scheduled',
    });
  }

  // Trim to 8–12 if we have too many
  return results.slice(0, 12);
}

// ──────────────────────────────────────────────
// Main generation functions
// ──────────────────────────────────────────────

export function generateResidentData(
  resident: PCCResident,
  prng: PRNG,
  options: GenerateOptions
): GeneratedResidentData {
  const referenceDate = options.referenceDate ?? new Date();
  const historyDays = options.historyDays ?? 30;
  const includeTodayUpToNow = options.includeTodayUpToNow ?? false;

  // Build array of UTC days from (referenceDate - historyDays) up to and including referenceDate
  const startDate = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate() - historyDays,
  ));

  const days: Date[] = [];
  for (let i = 0; i <= historyDays; i++) {
    days.push(addDays(startDate, i));
  }

  const medicationOrders = generateMedicationOrders(resident);

  return {
    resident,
    vitals: generateVitals(resident, prng, days, includeTodayUpToNow, referenceDate),
    medicationOrders,
    medicationAdministrations: generateMedicationAdministrations(resident, medicationOrders, prng, days, includeTodayUpToNow, referenceDate),
    progressNotes: generateProgressNotes(resident, prng, days, includeTodayUpToNow, referenceDate),
    assessments: generateAssessments(resident, prng, days, includeTodayUpToNow, referenceDate),
    incidents: generateIncidents(resident, prng, startDate),
    appointments: generateAppointments(resident, prng, referenceDate, historyDays),
  };
}

export function generateAll(
  seed = 42,
  options: GenerateOptions = {}
): Map<string, GeneratedResidentData> {
  resetCounter();
  const result = new Map<string, GeneratedResidentData>();

  for (let i = 0; i < PCC_RESIDENTS.length; i++) {
    const resident = PCC_RESIDENTS[i];
    // Each resident gets its own PRNG derived from the seed + index for independence
    const prng = createPRNG(seed + i * 1000);
    const data = generateResidentData(resident, prng, options);
    result.set(resident.residentId, data);
  }

  return result;
}
