'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Minimize2,
} from 'lucide-react'
import { PatientInfo, LogEntry, CalendarEvent, Vault, Visit } from '@/types'

interface ChatBotProps {
  patientInfo: PatientInfo
  logEntries: LogEntry[]
  events: CalendarEvent[]
  vault: Vault
  visits: Visit[]
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatBot({
  patientInfo,
  logEntries,
  events,
  vault,
  visits,
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your CareBridge Connect assistant. I can help you with questions about ${patientInfo.name}'s care, the facility, medications, upcoming appointments, or anything else you'd like to know. How can I help you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Build context about the patient for the AI
  const buildPatientContext = useCallback(() => {
    const recentLogs = logEntries.slice(-10)
    const upcomingEvents = events
      .filter((e) => new Date(e.date) >= new Date())
      .slice(0, 5)
    const recentVisits = visits.slice(-5)
    const latestVitals = logEntries.find((e) => e.category === 'vitals')?.vitals
    const latestMood = logEntries.find((e) => e.category === 'mood')?.moodLog

    return {
      patient: {
        name: patientInfo.name,
        room: patientInfo.roomNumber,
        facility: patientInfo.facilityName,
        diagnosis: patientInfo.primaryDiagnosis,
        admissionDate: patientInfo.admissionDate,
      },
      latestVitals,
      latestMood,
      medications: vault.medications,
      providers: vault.providers,
      facilityInfo: vault.facilityInfo,
      recentLogs: recentLogs.map((l) => ({
        category: l.category,
        title: l.title,
        date: l.createdAt,
        notes: l.notes,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        title: e.title,
        date: e.date,
        time: e.time,
        type: e.type,
      })),
      recentVisits: recentVisits.map((v) => ({
        visitor: v.visitorName,
        date: v.checkInTime,
        mood: v.mood,
      })),
    }
  }, [patientInfo, logEntries, events, vault, visits])

  // Fallback mock response when API is unavailable
  const fallbackResponse = useCallback(
    (userMessage: string): string => {
      const context = buildPatientContext()
      const lowerMessage = userMessage.toLowerCase()

      if (lowerMessage.includes('vital') || lowerMessage.includes('blood pressure') || lowerMessage.includes('heart rate')) {
        if (context.latestVitals) {
          const v = context.latestVitals
          return `Here are ${context.patient.name}'s most recent vitals:\n\n• Blood Pressure: ${v.bloodPressureSystolic || '--'}/${v.bloodPressureDiastolic || '--'} mmHg\n• Heart Rate: ${v.heartRate || '--'} bpm\n• Temperature: ${v.temperature?.toFixed(1) || '--'}°F\n• O2 Saturation: ${v.oxygenSaturation || '--'}%\n\nWould you like me to explain what any of these readings mean?`
        }
        return `I don't see any recent vitals recorded for ${context.patient.name}. The nursing staff typically records vitals during their regular rounds.`
      }

      if (lowerMessage.includes('mood') || lowerMessage.includes('feeling') || lowerMessage.includes('how is')) {
        if (context.latestMood) {
          const m = context.latestMood
          return `Based on the most recent mood check, ${context.patient.name} is feeling ${m.mood}. Alertness: ${m.alertness}. Appetite: ${m.appetite}.${m.painLevel !== undefined ? ` Pain level: ${m.painLevel}/10.` : ''}`
        }
        return `I don't have a recent mood update for ${context.patient.name}. Is there something specific you're concerned about?`
      }

      if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
        if (context.medications.length > 0) {
          const medList = context.medications.slice(0, 5).map((m) => `• ${m.name} (${m.dosage}) - ${m.frequency}`).join('\n')
          return `Here are ${context.patient.name}'s current medications:\n\n${medList}`
        }
        return `No medications listed yet. Check the Vault section.`
      }

      if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
        return `I can help you with:\n\n• **Vitals & Health** - Recent vital signs\n• **Mood & Wellbeing** - How ${context.patient.name} is feeling\n• **Medications** - Current prescriptions\n• **Appointments** - Upcoming events\n• **Facility Info** - Visiting hours, contacts\n\nJust ask me anything!`
      }

      return `I'd be happy to help with questions about ${context.patient.name}'s care. Try asking about vitals, mood, medications, appointments, or facility info.\n\nFor urgent concerns, contact the nurse station at ${context.facilityInfo.nurseStation}.`
    },
    [buildPatientContext],
  )

  // Generate response: try real AI API first, fall back to mock
  const generateResponse = useCallback(
    async (userMessage: string): Promise<string> => {
      const context = buildPatientContext()

      // Build message history for the API (last 10 messages)
      const apiMessages = messages
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))
      apiMessages.push({ role: 'user' as const, content: userMessage })

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            patientContext: {
              patientName: context.patient.name,
              roomNumber: context.patient.room,
              facilityName: context.patient.facility,
              diagnosis: context.patient.diagnosis,
              admissionDate: context.patient.admissionDate,
              latestVitals: context.latestVitals,
              latestMood: context.latestMood,
              medications: context.medications,
              providers: context.providers,
              facilityInfo: context.facilityInfo,
              recentLogs: context.recentLogs,
              upcomingEvents: context.upcomingEvents,
            },
          }),
        })

        const data = await response.json()

        if (response.status === 503) {
          // API key not configured — use fallback
          return fallbackResponse(userMessage)
        }

        if (!response.ok) {
          return data.content || fallbackResponse(userMessage)
        }

        return data.content
      } catch {
        // Network error or API down — use fallback
        return fallbackResponse(userMessage)
      }
    },
    [buildPatientContext, messages, fallbackResponse],
  )

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await generateResponse(userMessage.content)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or contact the facility directly for assistance.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 text-white shadow-float hover:shadow-glow hover:scale-105 transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-mint-400 rounded-full flex items-center justify-center">
          <Sparkles className="h-2.5 w-2.5 text-white" />
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-3xl shadow-float overflow-hidden border border-cream-200 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">CareBridge Assistant</h3>
                <p className="text-xs text-lavender-100">Ask me anything</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px] bg-gradient-to-b from-cream-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-peach-100 text-peach-600'
                      : 'bg-lavender-100 text-lavender-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-peach-500 text-white rounded-tr-md'
                      : 'bg-white shadow-soft border border-cream-100 text-navy-800 rounded-tl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.startsWith('•') ? (
                          <span className="block ml-2">{line}</span>
                        ) : line.startsWith('**') && line.endsWith('**') ? (
                          <strong className="block mt-2 first:mt-0">
                            {line.replace(/\*\*/g, '')}
                          </strong>
                        ) : line.includes('**') ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: line.replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong>$1</strong>'
                              ),
                            }}
                          />
                        ) : (
                          line
                        )}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-peach-100'
                        : 'text-navy-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-lavender-100 text-lavender-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white shadow-soft border border-cream-100 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-navy-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-cream-100 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about vitals, visits, medications..."
                className="flex-1 px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 text-navy-900 placeholder-navy-400 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-lavender-500 to-lavender-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-soft transition-all"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-navy-400 mt-2 text-center">
              Press Enter to send • AI assistant for care information
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
