import type { PCCAssessment, PCCIncident, PCCProgressNote } from '../types';
import type { GeneratedResidentData } from './generator';

export type ScenarioMode = 'none' | 'demo';

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

function isoDate(d: Date): string {
  return d.toISOString();
}

let _scenarioCounter = 0;
function uid(prefix: string): string {
  _scenarioCounter++;
  return `${prefix}-sc-${String(_scenarioCounter).padStart(4, '0')}`;
}

function resetScenarioCounter() {
  _scenarioCounter = 0;
}

// ──────────────────────────────────────────────
// Robert scenario: mood decline over final 10 days
// ──────────────────────────────────────────────

function applyRobertScenario(data: GeneratedResidentData, referenceDate: Date): GeneratedResidentData {
  const assessments = data.assessments.map((a): PCCAssessment => {
    const assessedDate = new Date(a.assessedAt);
    const daysAgo = Math.round((referenceDate.getTime() - assessedDate.getTime()) / 86400000);

    if (daysAgo >= 8 && daysAgo <= 10) {
      return { ...a, mood: 'sad', appetite: 'fair' };
    }
    if (daysAgo >= 5 && daysAgo <= 7) {
      return { ...a, mood: 'sad', appetite: 'poor' };
    }
    if (daysAgo >= 1 && daysAgo <= 4) {
      return { ...a, mood: 'withdrawn', appetite: 'poor' };
    }
    return a;
  });

  const progressNotes = data.progressNotes.map((n): PCCProgressNote => {
    const noteDate = new Date(n.authoredAt);
    const daysAgo = Math.round((referenceDate.getTime() - noteDate.getTime()) / 86400000);

    if (daysAgo >= 1 && daysAgo <= 10) {
      const content = daysAgo >= 8
        ? `Resident appears withdrawn today. Minimal verbal interaction during morning care. Appetite has declined from previous days. Offered encouragement and engaged in reminiscence. Will monitor.`
        : daysAgo >= 5
        ? `Appetite has declined at most meals. Resident consuming less than 50% of portions offered. Mood subdued. Social worker notified. Family contact made per protocol.`
        : `Resident increasingly withdrawn compared to earlier in admission. Participating minimally in therapy exercises. Care team discussing approach. Family updated by phone.`;
      return { ...n, content };
    }
    return n;
  });

  // Add a specific nurse note 3 days ago
  const threeDaysAgo = addDays(referenceDate, -3);
  const extraNote: PCCProgressNote = {
    noteId: uid('n'),
    residentId: data.resident.residentId,
    authoredAt: isoDate(setHour(threeDaysAgo, 10, 15)),
    authoredBy: 'staff-001',
    authorRole: 'rn',
    noteType: 'general',
    content: `Resident has been increasingly withdrawn over the past week. Minimal participation in activities. Appetite poor at most meals. Social worker notified. Family contact made.`,
    tags: ['mood-change', 'appetite-decline', 'social-worker-notified'],
  };

  return { ...data, assessments, progressNotes: [...progressNotes, extraNote] };
}

// ──────────────────────────────────────────────
// Eleanor scenario: fall 3 days ago
// ──────────────────────────────────────────────

function applyEleanorScenario(data: GeneratedResidentData, referenceDate: Date): GeneratedResidentData {
  const fallDate = addDays(referenceDate, -3);
  const fallTime = setHour(fallDate, 14, 30);
  const familyNotifiedAt = setHour(fallDate, 15, 10);

  const fallIncident: PCCIncident = {
    incidentId: uid('inc'),
    residentId: data.resident.residentId,
    occurredAt: isoDate(fallTime),
    reportedBy: 'staff-001',
    incidentType: 'fall',
    severity: 'moderate',
    description: `Resident found on floor of bathroom. No loss of consciousness. Denies hitting head. Right hip pain noted. X-ray ordered.`,
    interventionsTaken: `Called rapid response. Vital signs assessed. X-ray of right hip obtained — no fracture identified. Wound care applied to minor abrasion on right knee. Physician and family notified. Fall precautions implemented. Non-skid socks applied.`,
    familyNotified: true,
    familyNotifiedAt: isoDate(familyNotifiedAt),
  };

  // Increase monitoring notes in past 3 days (assessments have no painScore field; pain tracked via vitals)
  const assessments = data.assessments.map((a): PCCAssessment => {
    const assessedDate = new Date(a.assessedAt);
    const daysAgo = Math.round((referenceDate.getTime() - assessedDate.getTime()) / 86400000);
    if (daysAgo >= 0 && daysAgo <= 3) {
      return { ...a, notes: 'Increased monitoring following fall incident. Resident reports right hip discomfort.' };
    }
    return a;
  });

  // Add progress note on the fall day
  const fallNote: PCCProgressNote = {
    noteId: uid('n'),
    residentId: data.resident.residentId,
    authoredAt: isoDate(setHour(fallDate, 15, 0)),
    authoredBy: 'staff-001',
    authorRole: 'rn',
    noteType: 'incident',
    content: `Resident experienced a fall at approximately 14:30. See incident report. Resident is shaken but medically stable per physician assessment. Increased monitoring initiated. Family members notified by phone.`,
    tags: ['fall', 'incident-report', 'family-notified'],
  };

  return {
    ...data,
    assessments,
    incidents: [...data.incidents, fallIncident],
    progressNotes: [...data.progressNotes, fallNote],
  };
}

// ──────────────────────────────────────────────
// Frank scenario: BP trending up over final 14 days
// ──────────────────────────────────────────────

function applyFrankScenario(data: GeneratedResidentData, referenceDate: Date): GeneratedResidentData {
  const vitals = data.vitals.map((v) => {
    const recordedDate = new Date(v.recordedAt);
    const daysAgo = Math.round((referenceDate.getTime() - recordedDate.getTime()) / 86400000);

    if (daysAgo >= 0 && daysAgo <= 14) {
      const dayIndex = 14 - daysAgo; // 0 = 14 days ago, 13 = yesterday
      const systolicAdd = Math.round(dayIndex * 1.2);
      const diastolicAdd = Math.round(dayIndex * 0.6);

      const newSystolic = v.bloodPressureSystolic !== null
        ? Math.min(165, v.bloodPressureSystolic + systolicAdd)
        : null;
      const newDiastolic = v.bloodPressureDiastolic !== null
        ? Math.min(100, v.bloodPressureDiastolic + diastolicAdd)
        : null;

      return { ...v, bloodPressureSystolic: newSystolic, bloodPressureDiastolic: newDiastolic };
    }
    return v;
  });

  const twoDaysAgo = addDays(referenceDate, -2);
  const bpNote: PCCProgressNote = {
    noteId: uid('n'),
    residentId: data.resident.residentId,
    authoredAt: isoDate(setHour(twoDaysAgo, 11, 0)),
    authoredBy: 'staff-001',
    authorRole: 'rn',
    noteType: 'general',
    content: `Resident's blood pressure has been trending upward over the past two weeks. Physician notified. Medication review ordered. Resident instructed to reduce sodium intake. Will continue close monitoring.`,
    tags: ['blood-pressure', 'physician-notified', 'medication-review'],
  };

  return { ...data, vitals, progressNotes: [...data.progressNotes, bpNote] };
}

// ──────────────────────────────────────────────
// Dorothy scenario: increased agitation over final 7 days
// ──────────────────────────────────────────────

function applyDorothyScenario(data: GeneratedResidentData, referenceDate: Date): GeneratedResidentData {
  const assessments = data.assessments.map((a): PCCAssessment => {
    const assessedDate = new Date(a.assessedAt);
    const daysAgo = Math.round((referenceDate.getTime() - assessedDate.getTime()) / 86400000);

    if (daysAgo >= 5 && daysAgo <= 7) {
      return { ...a, mood: 'anxious', appetite: 'fair' };
    }
    if (daysAgo >= 1 && daysAgo <= 4) {
      return { ...a, mood: 'agitated', appetite: 'poor' };
    }
    if (daysAgo === 0) {
      return { ...a, mood: 'agitated', appetite: 'poor' };
    }
    return a;
  });

  const agitationNotes: PCCProgressNote[] = [];
  for (let daysAgo = 5; daysAgo >= 1; daysAgo--) {
    const noteDate = addDays(referenceDate, -daysAgo);
    const success = daysAgo <= 3 ? 'minimal' : 'partial';
    const content = daysAgo === 3
      ? `Resident increasingly agitated today. Redirection techniques employed with ${success} success. PRN medication administered per order. Physician notified of behavioral changes.`
      : daysAgo <= 2
      ? `Resident resistive to personal care this morning. De-escalation strategies used. Environment adjusted for sensory comfort. Care team briefed at shift change.`
      : `Resident appears anxious and restless. Offered familiar activities and music therapy. Redirection with ${success} success. Will continue monitoring behavioral patterns.`;

    agitationNotes.push({
      noteId: uid('n'),
      residentId: data.resident.residentId,
      authoredAt: isoDate(setHour(noteDate, 9, 0)),
      authoredBy: daysAgo % 2 === 0 ? 'staff-001' : 'staff-003',
      authorRole: daysAgo % 2 === 0 ? 'rn' : 'lpn',
      noteType: 'behavior',
      content,
      tags: ['agitation', 'behavioral-change', 'redirection'],
    });
  }

  return { ...data, assessments, progressNotes: [...data.progressNotes, ...agitationNotes] };
}

// ──────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────

export function applyScenarios(
  data: Map<string, GeneratedResidentData>,
  mode: ScenarioMode,
  referenceDate: Date
): Map<string, GeneratedResidentData> {
  if (mode === 'none') return data;

  resetScenarioCounter();
  const result = new Map(data);

  const robert = result.get('pcc-r-002');
  if (robert) result.set('pcc-r-002', applyRobertScenario(robert, referenceDate));

  const eleanor = result.get('pcc-r-003');
  if (eleanor) result.set('pcc-r-003', applyEleanorScenario(eleanor, referenceDate));

  const frank = result.get('pcc-r-004');
  if (frank) result.set('pcc-r-004', applyFrankScenario(frank, referenceDate));

  const dorothy = result.get('pcc-r-005');
  if (dorothy) result.set('pcc-r-005', applyDorothyScenario(dorothy, referenceDate));

  return result;
}
