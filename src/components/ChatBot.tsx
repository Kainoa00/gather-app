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
      content: `Hi! I'm your GatherIn assistant. I can help you with questions about ${patientInfo.name}'s care, the facility, medications, upcoming appointments, or anything else you'd like to know. How can I help you today?`,
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

  // Generate a contextual response (mock AI - replace with real API)
  const generateResponse = useCallback(
    async (userMessage: string): Promise<string> => {
      const context = buildPatientContext()
      const lowerMessage = userMessage.toLowerCase()

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

      // Mock responses based on keywords - replace with actual AI API call
      if (lowerMessage.includes('vital') || lowerMessage.includes('blood pressure') || lowerMessage.includes('heart rate')) {
        if (context.latestVitals) {
          const v = context.latestVitals
          return `Here are ${context.patient.name}'s most recent vitals:\n\n• Blood Pressure: ${v.bloodPressureSystolic || '--'}/${v.bloodPressureDiastolic || '--'} mmHg\n• Heart Rate: ${v.heartRate || '--'} bpm\n• Temperature: ${v.temperature?.toFixed(1) || '--'}°F\n• O2 Saturation: ${v.oxygenSaturation || '--'}%\n• Weight: ${v.weight || '--'} lbs\n\nWould you like me to explain what any of these readings mean?`
        }
        return `I don't see any recent vitals recorded for ${context.patient.name}. The nursing staff typically records vitals during their regular rounds. Would you like me to help you understand what vitals are normally tracked?`
      }

      if (lowerMessage.includes('mood') || lowerMessage.includes('feeling') || lowerMessage.includes('how is')) {
        if (context.latestMood) {
          const m = context.latestMood
          return `Based on the most recent mood check, ${context.patient.name} is feeling ${m.mood}. Their alertness level is ${m.alertness}, and appetite has been ${m.appetite}.${m.painLevel !== undefined ? ` Pain level reported as ${m.painLevel}/10.` : ''}\n\nIs there anything specific about their wellbeing you'd like to know more about?`
        }
        return `I don't have a recent mood update for ${context.patient.name}. The care team regularly checks in on residents' emotional wellbeing. Is there something specific you're concerned about?`
      }

      if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('drug')) {
        if (context.medications.length > 0) {
          const medList = context.medications
            .slice(0, 5)
            .map((m) => `• ${m.name} (${m.dosage}) - ${m.frequency}`)
            .join('\n')
          return `Here are ${context.patient.name}'s current medications:\n\n${medList}${context.medications.length > 5 ? `\n\n...and ${context.medications.length - 5} more. You can view the complete list in the Vault section.` : ''}\n\nWould you like more details about any specific medication?`
        }
        return `I don't see any medications listed in the system. You can add medication information in the Vault section, or ask the nursing staff for the current medication list.`
      }

      if (lowerMessage.includes('visit') || lowerMessage.includes('visiting') || lowerMessage.includes('hours')) {
        const info = context.facilityInfo
        return `**Visiting Hours at ${info.facilityName}:**\n\n${info.visitingHours}\n\n**Location:** Room ${info.roomNumber}, ${info.wing} Wing, Floor ${info.floor}\n\n**Parking:** ${info.parkingInfo || 'Check with the front desk for parking information.'}\n\nYou can check in when you arrive using the "I'm Here" button on the Visits tab!`
      }

      if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('upcoming') || lowerMessage.includes('calendar')) {
        if (context.upcomingEvents.length > 0) {
          const eventList = context.upcomingEvents
            .map((e) => {
              const date = new Date(e.date)
              return `• ${e.title} - ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${e.time ? ` at ${e.time}` : ''}`
            })
            .join('\n')
          return `Here are the upcoming events for ${context.patient.name}:\n\n${eventList}\n\nYou can claim a visit slot on the Calendar tab to coordinate with other family members.`
        }
        return `There are no upcoming appointments or events scheduled. You can add events through the Calendar tab, or check with the facility about therapy and activity schedules.`
      }

      if (lowerMessage.includes('doctor') || lowerMessage.includes('provider') || lowerMessage.includes('contact')) {
        if (context.providers.length > 0) {
          const providerList = context.providers
            .slice(0, 3)
            .map((p) => `• **${p.name}** (${p.specialty})\n  ${p.phone}`)
            .join('\n\n')
          return `Here are ${context.patient.name}'s healthcare providers:\n\n${providerList}\n\nYou can find all provider contacts in the Vault section.`
        }
        return `I don't see any providers listed yet. You can add healthcare provider information in the Vault section.`
      }

      if (lowerMessage.includes('facility') || lowerMessage.includes('nursing home') || lowerMessage.includes('where')) {
        const info = context.facilityInfo
        return `**${info.facilityName}**\n\n📍 ${info.facilityAddress}\n📞 ${context.patient.facility ? '' : info.nurseStation}\n\n**Room:** ${info.roomNumber} (${info.wing} Wing, Floor ${info.floor})\n**Nurse Station:** ${info.nurseStation}\n\n${info.wifiNetwork ? `**WiFi:** ${info.wifiNetwork} (Password: ${info.wifiPassword})` : ''}`
      }

      if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
        return `I can help you with:\n\n• **Vitals & Health** - Check recent blood pressure, heart rate, temperature\n• **Mood & Wellbeing** - See how ${context.patient.name} is feeling\n• **Medications** - Review current prescriptions\n• **Appointments** - View upcoming events and visits\n• **Facility Info** - Visiting hours, parking, WiFi, contacts\n• **Care Team** - Find doctor and provider information\n\nJust ask me anything about ${context.patient.name}'s care!`
      }

      // Default response
      return `I understand you're asking about "${userMessage}". While I'm here to help with questions about ${context.patient.name}'s care at ${context.facilityInfo.facilityName}, I want to make sure I give you accurate information.\n\nCould you try asking about:\n• Recent vitals or health updates\n• Current medications\n• Upcoming appointments\n• Visiting hours and facility info\n• How ${context.patient.name} is feeling\n\nOr if you have an urgent concern, please contact the nurse station directly at ${context.facilityInfo.nurseStation}.`
    },
    [buildPatientContext]
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
                <h3 className="font-semibold text-white">GatherIn Assistant</h3>
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
