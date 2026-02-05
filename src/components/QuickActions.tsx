'use client'

import { useState } from 'react'
import {
  Zap,
  Heart,
  Pill,
  Utensils,
  Smile,
  Activity,
  Bath,
  X,
  Check,
  Clock,
  Moon,
  Sun,
  CloudSun,
} from 'lucide-react'
import { LogEntry, LogEntryCategory, Medication } from '@/types'

interface QuickActionsProps {
  medications: Medication[]
  currentUserId: string
  currentUserName: string
  onAddLogEntry: (entry: Omit<LogEntry, 'id' | 'createdAt' | 'comments'>) => void
}

type ActionType = 'vitals' | 'meds' | 'meal' | 'mood' | 'walk' | 'resting' | 'pt' | 'bathed' | null

const quickActions = [
  { id: 'vitals' as const, label: 'Vitals', sublabel: 'Check', emoji: '❤️', category: 'vitals' as LogEntryCategory },
  { id: 'meds' as const, label: 'Meds', sublabel: 'Given', emoji: '💊', category: 'medication' as LogEntryCategory },
  { id: 'meal' as const, label: 'Meal', sublabel: 'Update', emoji: '🍽️', category: 'activity' as LogEntryCategory },
  { id: 'mood' as const, label: 'Mood', sublabel: 'Check', emoji: '😊', category: 'mood' as LogEntryCategory },
  { id: 'walk' as const, label: 'Walk', sublabel: 'Completed', emoji: '🚶', category: 'activity' as LogEntryCategory },
  { id: 'resting' as const, label: 'Resting', sublabel: 'Comfortably', emoji: '😴', category: 'mood' as LogEntryCategory },
  { id: 'pt' as const, label: 'PT Session', sublabel: 'Done', emoji: '🏃', category: 'activity' as LogEntryCategory },
  { id: 'bathed' as const, label: 'Bathed', sublabel: 'Groomed', emoji: '🚿', category: 'activity' as LogEntryCategory },
]

export default function QuickActions({
  medications,
  currentUserId,
  currentUserName,
  onAddLogEntry,
}: QuickActionsProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Vitals form state
  const [vitals, setVitals] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    o2: '',
    temp: '',
  })
  const [vitalsNote, setVitalsNote] = useState('')

  // Meds form state
  const [selectedMeds, setSelectedMeds] = useState<string[]>([])
  const [medsTime, setMedsTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
  const [medsIssue, setMedsIssue] = useState<'none' | 'nausea' | 'refused'>('none')

  // Meal form state
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch')
  const [mealAmount, setMealAmount] = useState<'all' | 'most' | 'some' | 'refused'>('most')
  const [mealServed, setMealServed] = useState('')
  const [fluidIntake, setFluidIntake] = useState<'good' | 'fair' | 'poor'>('good')

  // Mood form state
  const [mood, setMood] = useState<'happy' | 'content' | 'neutral' | 'anxious' | 'sad' | 'agitated'>('content')
  const [alertness, setAlertness] = useState<'alert' | 'drowsy' | 'lethargic'>('alert')
  const [appetite, setAppetite] = useState<'good' | 'fair' | 'poor' | 'refused'>('good')
  const [painLevel, setPainLevel] = useState(3)
  const [moodNotes, setMoodNotes] = useState('')

  // Simple actions state
  const [simpleNotes, setSimpleNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [participation, setParticipation] = useState<'active' | 'moderate' | 'minimal'>('active')

  const resetForms = () => {
    setVitals({ systolic: '', diastolic: '', heartRate: '', o2: '', temp: '' })
    setVitalsNote('')
    setSelectedMeds([])
    setMedsTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    setMedsIssue('none')
    setMealType('lunch')
    setMealAmount('most')
    setMealServed('')
    setFluidIntake('good')
    setMood('content')
    setAlertness('alert')
    setAppetite('good')
    setPainLevel(3)
    setMoodNotes('')
    setSimpleNotes('')
    setDuration('')
    setParticipation('active')
  }

  const showSuccessToast = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const handleSubmitVitals = () => {
    onAddLogEntry({
      category: 'vitals',
      title: 'Vitals Check',
      notes: vitalsNote || 'Routine vitals check',
      enteredBy: currentUserId,
      enteredByName: currentUserName,
      enteredByRole: 'nurse',
      vitals: {
        bloodPressureSystolic: vitals.systolic ? parseInt(vitals.systolic) : undefined,
        bloodPressureDiastolic: vitals.diastolic ? parseInt(vitals.diastolic) : undefined,
        heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : undefined,
        oxygenSaturation: vitals.o2 ? parseInt(vitals.o2) : undefined,
        temperature: vitals.temp ? parseFloat(vitals.temp) : undefined,
      },
    })
    setActiveAction(null)
    resetForms()
    showSuccessToast()
  }

  const handleSubmitMeds = () => {
    const medNames = medications
      .filter((m) => selectedMeds.includes(m.id))
      .map((m) => `${m.name} ${m.dosage}`)
      .join(', ')

    onAddLogEntry({
      category: 'medication',
      title: 'Medications Administered',
      notes: medsIssue === 'none' ? 'All medications given on schedule' : medsIssue === 'nausea' ? 'Patient experienced nausea' : 'Patient refused medication',
      enteredBy: currentUserId,
      enteredByName: currentUserName,
      enteredByRole: 'nurse',
      medicationLog: {
        medicationName: medNames,
        dosage: 'As prescribed',
        route: 'Oral',
        administeredBy: currentUserName,
      },
    })
    setActiveAction(null)
    resetForms()
    showSuccessToast()
  }

  const handleSubmitMeal = () => {
    const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
    const amountLabels = { all: 'Ate all', most: 'Ate most', some: 'Ate some', refused: 'Refused meal' }

    onAddLogEntry({
      category: 'activity',
      title: `${mealLabels[mealType]} Update`,
      notes: `${amountLabels[mealAmount]}. ${mealServed ? `Served: ${mealServed}.` : ''} Fluid intake: ${fluidIntake}.`,
      enteredBy: currentUserId,
      enteredByName: currentUserName,
      enteredByRole: 'nurse',
      activityLog: {
        activityType: 'meal',
        description: `${mealLabels[mealType]} - ${amountLabels[mealAmount]}`,
        participation: mealAmount === 'all' ? 'active' : mealAmount === 'most' ? 'moderate' : 'minimal',
      },
    })
    setActiveAction(null)
    resetForms()
    showSuccessToast()
  }

  const handleSubmitMood = () => {
    const moodLabels = { happy: 'Happy', content: 'Content', neutral: 'Neutral', anxious: 'Anxious', sad: 'Sad', agitated: 'Agitated' }

    onAddLogEntry({
      category: 'mood',
      title: 'Mood & Wellness Check',
      notes: moodNotes || `Patient is ${moodLabels[mood].toLowerCase()} and ${alertness}. Appetite: ${appetite}.`,
      enteredBy: currentUserId,
      enteredByName: currentUserName,
      enteredByRole: 'nurse',
      moodLog: {
        mood,
        alertness,
        appetite,
        painLevel,
        notes: moodNotes,
      },
    })
    setActiveAction(null)
    resetForms()
    showSuccessToast()
  }

  const handleSubmitSimple = (type: 'walk' | 'resting' | 'pt' | 'bathed') => {
    const configs = {
      walk: { title: 'Walk Completed', activityType: 'walk' as const, defaultNote: 'Completed walking exercise' },
      resting: { title: 'Resting Comfortably', activityType: 'other' as const, defaultNote: 'Patient resting comfortably' },
      pt: { title: 'Physical Therapy Session', activityType: 'physical_therapy' as const, defaultNote: 'Completed PT session' },
      bathed: { title: 'Bathed & Groomed', activityType: 'other' as const, defaultNote: 'Bathing and grooming completed' },
    }

    const config = configs[type]

    if (type === 'resting') {
      onAddLogEntry({
        category: 'mood',
        title: config.title,
        notes: simpleNotes || config.defaultNote,
        enteredBy: currentUserId,
        enteredByName: currentUserName,
        enteredByRole: 'nurse',
        moodLog: {
          mood: 'content',
          alertness: 'drowsy',
          appetite: 'good',
        },
      })
    } else {
      onAddLogEntry({
        category: 'activity',
        title: config.title,
        notes: simpleNotes || config.defaultNote,
        enteredBy: currentUserId,
        enteredByName: currentUserName,
        enteredByRole: 'nurse',
        activityLog: {
          activityType: config.activityType,
          description: config.defaultNote,
          duration: duration ? parseInt(duration) : undefined,
          participation: type === 'pt' ? participation : 'active',
        },
      })
    }
    setActiveAction(null)
    resetForms()
    showSuccessToast()
  }

  const inputClass = 'w-full px-3 py-2.5 border border-lavender-200 rounded-xl focus:ring-2 focus:ring-lavender-400 focus:border-transparent text-navy-900'
  const toggleActiveClass = 'bg-lavender-100 text-lavender-700 border-lavender-300'
  const toggleInactiveClass = 'border border-lavender-100 text-navy-600 hover:bg-cream-50'

  return (
    <div className="space-y-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-mint-500 text-white px-4 py-3 rounded-2xl shadow-float flex items-center gap-2 animate-slide-down">
          <Check className="h-5 w-5" />
          <span className="font-medium">Entry logged successfully!</span>
        </div>
      )}

      {/* Quick Actions Header */}
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-lavender-500" />
        <h3 className="font-semibold text-navy-900">Quick Actions</h3>
      </div>
      <p className="text-sm text-navy-500 mb-4">Tap to instantly log common entries</p>

      {/* Action Grid */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => setActiveAction(action.id)}
            className="border border-lavender-100 rounded-2xl p-4 text-center hover:border-lavender-300 hover:shadow-soft transition-all duration-200 group"
          >
            <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{action.emoji}</span>
            <span className="text-sm font-medium text-navy-900 block">{action.label}</span>
            <span className="text-xs text-navy-500">{action.sublabel}</span>
          </button>
        ))}
      </div>

      {/* Vitals Modal */}
      {activeAction === 'vitals' && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-glass-lg animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" /> Quick Vitals Entry
              </h3>
              <button onClick={() => setActiveAction(null)} className="p-2 hover:bg-cream-100 rounded-xl">
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-navy-500 mb-1 block">BP Systolic</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={vitals.systolic}
                    onChange={(e) => setVitals({ ...vitals, systolic: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-500 mb-1 block">BP Diastolic</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={vitals.diastolic}
                    onChange={(e) => setVitals({ ...vitals, diastolic: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-navy-500 mb-1 block">HR (bpm)</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={vitals.heartRate}
                    onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-500 mb-1 block">O2 (%)</label>
                  <input
                    type="number"
                    placeholder="97"
                    value={vitals.o2}
                    onChange={(e) => setVitals({ ...vitals, o2: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-500 mb-1 block">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={vitals.temp}
                    onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-navy-500 mb-2 block">Quick notes</label>
                <div className="flex flex-wrap gap-2">
                  {['✅ Normal', '⬆️ High', '⬇️ Low', '⚠️ See notes'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setVitalsNote(chip.replace(/[^\w\s]/gi, '').trim())}
                      className={`px-3 py-1.5 rounded-lg text-sm ${vitalsNote.includes(chip.replace(/[^\w\s]/gi, '').trim()) ? toggleActiveClass : toggleInactiveClass}`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Additional notes (optional)"
                value={vitalsNote}
                onChange={(e) => setVitalsNote(e.target.value)}
                className={`${inputClass} h-20 resize-none`}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setActiveAction(null)} className="flex-1 px-4 py-2.5 border border-lavender-200 text-navy-700 rounded-xl hover:bg-cream-50">
                Cancel
              </button>
              <button onClick={handleSubmitVitals} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Log Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meds Modal */}
      {activeAction === 'meds' && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-glass-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-500" /> Medications Administered
              </h3>
              <button onClick={() => setActiveAction(null)} className="p-2 hover:bg-cream-100 rounded-xl">
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {medications.map((med) => (
                <label key={med.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedMeds.includes(med.id) ? 'border-lavender-300 bg-lavender-50' : 'border-lavender-100 hover:border-lavender-200'}`}>
                  <input
                    type="checkbox"
                    checked={selectedMeds.includes(med.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMeds([...selectedMeds, med.id])
                      } else {
                        setSelectedMeds(selectedMeds.filter((id) => id !== med.id))
                      }
                    }}
                    className="mt-1 w-4 h-4 text-lavender-600 rounded"
                  />
                  <div>
                    <div className="font-medium text-navy-900">{med.name} {med.dosage}</div>
                    <div className="text-xs text-navy-500">Oral · {med.frequency}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-navy-500 mb-1 block">Time administered</label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-navy-400" />
                <input
                  type="text"
                  value={medsTime}
                  onChange={(e) => setMedsTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-navy-500 mb-2 block">Any issues?</label>
              <div className="flex gap-2">
                {[
                  { id: 'none' as const, label: '✅ None' },
                  { id: 'nausea' as const, label: '🤢 Nausea' },
                  { id: 'refused' as const, label: '❌ Refused' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMedsIssue(opt.id)}
                    className={`px-3 py-2 rounded-xl text-sm flex-1 ${medsIssue === opt.id ? toggleActiveClass : toggleInactiveClass}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setActiveAction(null)} className="flex-1 px-4 py-2.5 border border-lavender-200 text-navy-700 rounded-xl hover:bg-cream-50">
                Cancel
              </button>
              <button onClick={handleSubmitMeds} disabled={selectedMeds.length === 0} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Check className="h-4 w-4" /> Log Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Modal */}
      {activeAction === 'meal' && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-glass-lg animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-peach-500" /> Meal Update
              </h3>
              <button onClick={() => setActiveAction(null)} className="p-2 hover:bg-cream-100 rounded-xl">
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-navy-500 mb-2 block">Meal</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'breakfast' as const, label: '☀️ Breakfast' },
                    { id: 'lunch' as const, label: '🌤️ Lunch' },
                    { id: 'dinner' as const, label: '🌙 Dinner' },
                    { id: 'snack' as const, label: '🍪 Snack' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMealType(opt.id)}
                      className={`px-2 py-2 rounded-xl text-xs ${mealType === opt.id ? toggleActiveClass : toggleInactiveClass}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-navy-500 mb-2 block">How much did they eat?</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'all' as const, label: 'All', color: '🟢' },
                    { id: 'most' as const, label: 'Most', color: '🟡' },
                    { id: 'some' as const, label: 'Some', color: '🟠' },
                    { id: 'refused' as const, label: 'Refused', color: '🔴' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMealAmount(opt.id)}
                      className={`px-2 py-2 rounded-xl text-xs ${mealAmount === opt.id ? toggleActiveClass : toggleInactiveClass}`}
                    >
                      {opt.color} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-navy-500 mb-1 block">What was served</label>
                <input
                  type="text"
                  placeholder="e.g., soup, sandwich, fruit"
                  value={mealServed}
                  onChange={(e) => setMealServed(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs text-navy-500 mb-2 block">Fluid intake</label>
                <div className="flex gap-2">
                  {(['good', 'fair', 'poor'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFluidIntake(opt)}
                      className={`px-4 py-2 rounded-xl text-sm flex-1 capitalize ${fluidIntake === opt ? toggleActiveClass : toggleInactiveClass}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setActiveAction(null)} className="flex-1 px-4 py-2.5 border border-lavender-200 text-navy-700 rounded-xl hover:bg-cream-50">
                Cancel
              </button>
              <button onClick={handleSubmitMeal} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Log Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mood Modal */}
      {activeAction === 'mood' && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-glass-lg animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Smile className="h-5 w-5 text-purple-500" /> Mood Check
              </h3>
              <button onClick={() => setActiveAction(null)} className="p-2 hover:bg-cream-100 rounded-xl">
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-navy-500 mb-2 block">Mood</label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { id: 'happy' as const, emoji: '😊' },
                    { id: 'content' as const, emoji: '🙂' },
                    { id: 'neutral' as const, emoji: '😐' },
                    { id: 'anxious' as const, emoji: '😟' },
                    { id: 'sad' as const, emoji: '😢' },
                    { id: 'agitated' as const, emoji: '😤' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMood(opt.id)}
                      className={`p-3 rounded-xl text-2xl ${mood === opt.id ? 'bg-lavender-100 ring-2 ring-lavender-400' : 'hover:bg-cream-100'}`}
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-navy-500 mb-2 block">Alertness</label>
                <div className="flex gap-2">
                  {(['alert', 'drowsy', 'lethargic'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAlertness(opt)}
                      className={`px-4 py-2 rounded-xl text-sm flex-1 capitalize ${alertness === opt ? toggleActiveClass : toggleInactiveClass}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-navy-500 mb-2 block">Appetite</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['good', 'fair', 'poor', 'refused'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAppetite(opt)}
                      className={`px-3 py-2 rounded-xl text-sm capitalize ${appetite === opt ? toggleActiveClass : toggleInactiveClass}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-navy-500 mb-2 block">Pain level: {painLevel}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(parseInt(e.target.value))}
                  className="w-full accent-lavender-500"
                />
                <div className="flex justify-between text-xs text-navy-400">
                  <span>0 (none)</span>
                  <span>10 (severe)</span>
                </div>
              </div>

              <textarea
                placeholder="Additional notes (optional)"
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                className={`${inputClass} h-20 resize-none`}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setActiveAction(null)} className="flex-1 px-4 py-2.5 border border-lavender-200 text-navy-700 rounded-xl hover:bg-cream-50">
                Cancel
              </button>
              <button onClick={handleSubmitMood} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Log Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Actions Modal (walk, resting, pt, bathed) */}
      {(activeAction === 'walk' || activeAction === 'pt' || activeAction === 'bathed' || activeAction === 'resting') && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-glass-lg animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-mint-500" />
                {activeAction === 'walk' && 'Walk Completed'}
                {activeAction === 'pt' && 'PT Session Done'}
                {activeAction === 'bathed' && 'Bathed & Groomed'}
                {activeAction === 'resting' && 'Resting Comfortably'}
              </h3>
              <button onClick={() => setActiveAction(null)} className="p-2 hover:bg-cream-100 rounded-xl">
                <X className="h-5 w-5 text-navy-500" />
              </button>
            </div>

            <div className="space-y-4">
              {(activeAction === 'walk' || activeAction === 'pt') && (
                <div>
                  <label className="text-xs text-navy-500 mb-1 block">Duration (minutes)</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}

              {activeAction === 'pt' && (
                <div>
                  <label className="text-xs text-navy-500 mb-2 block">Participation level</label>
                  <div className="flex gap-2">
                    {(['active', 'moderate', 'minimal'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setParticipation(opt)}
                        className={`px-4 py-2 rounded-xl text-sm flex-1 capitalize ${participation === opt ? toggleActiveClass : toggleInactiveClass}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                placeholder="Notes (optional)"
                value={simpleNotes}
                onChange={(e) => setSimpleNotes(e.target.value)}
                className={`${inputClass} h-20 resize-none`}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setActiveAction(null)} className="flex-1 px-4 py-2.5 border border-lavender-200 text-navy-700 rounded-xl hover:bg-cream-50">
                Cancel
              </button>
              <button onClick={() => handleSubmitSimple(activeAction)} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Log Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
