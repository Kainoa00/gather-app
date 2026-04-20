import type { WellnessDay, MoodData } from '@/types'
import type { PCCAssessment, PCCVitals, PCCMood } from './types'

function mapPCCMoodForWellness(mood: PCCMood | null): MoodData['mood'] | undefined {
  switch (mood) {
    case 'content':   return 'content'
    case 'euphoric':  return 'happy'
    case 'sad':       return 'sad'
    case 'anxious':   return 'anxious'
    case 'agitated':  return 'agitated'
    case 'withdrawn': return 'neutral'
    default:          return undefined
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function eachDayInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  while (cursor <= last) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function deriveWellnessDays(
  assessments: PCCAssessment[],
  vitals: PCCVitals[],
  startDate: Date,
  endDate: Date,
): WellnessDay[] {
  return eachDayInRange(startDate, endDate).map((day) => {
    const dayAssessments = assessments
      .filter((a) => isSameDay(new Date(a.assessedAt), day))
      .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime())

    const amAssessments = dayAssessments.filter((a) => new Date(a.assessedAt).getHours() < 12)
    const pmAssessments = dayAssessments.filter((a) => new Date(a.assessedAt).getHours() >= 12)

    const moodAM = amAssessments.length > 0
      ? mapPCCMoodForWellness(amAssessments[0].mood)
      : undefined

    const moodPM = pmAssessments.length > 0
      ? mapPCCMoodForWellness(pmAssessments[pmAssessments.length - 1].mood)
      : undefined

    const lastAssessment = dayAssessments[dayAssessments.length - 1]
    const appetite = lastAssessment?.appetite ?? undefined

    const dayVitals = vitals.filter((v) => isSameDay(new Date(v.recordedAt), day))
    const painScores = dayVitals
      .map((v) => v.painScore)
      .filter((p): p is number => p !== null)
    const painLevel = painScores.length > 0 ? Math.max(...painScores) : undefined

    // Base score with mood, appetite, and pain adjustments
    let score = 7.0

    if (moodAM === 'happy' || moodPM === 'happy') score += 1.0
    if (moodAM === 'sad' || moodPM === 'sad') score -= 1.0
    // 'withdrawn' maps to 'neutral' before this point; subtract for neutral to preserve spec intent
    if (moodAM === 'neutral' || moodPM === 'neutral') score -= 1.0
    if (moodAM === 'agitated' || moodPM === 'agitated') score -= 1.5

    if (appetite === 'poor') score -= 0.5
    if (appetite === 'refused') score -= 1.0

    if (painLevel !== undefined) {
      if (painLevel >= 8) score -= 1.0
      else if (painLevel >= 6) score -= 0.5
    }

    score = Math.min(10, Math.max(1, score))

    return {
      date: day,
      overallScore: score,
      moodAM,
      moodPM,
      appetite: appetite ?? undefined,
      painLevel,
      socialEngagement: undefined,
      therapySessions: 0,
      visitCount: 0,
    }
  })
}
