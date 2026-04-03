'use client'
import { useState, useCallback } from 'react'
import { ResidentPicker, ResidentOption } from './ResidentPicker'
import { MessageEditor } from './MessageEditor'
import { MessagePreview } from './MessagePreview'
import { SendResults } from './SendResults'
import { ArrowLeft, ArrowRight, Sparkles, Send, Loader2 } from 'lucide-react'

interface Contact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  residentId: string
  residentFirstName: string
  residentLastName: string
}

interface ComposeWizardProps {
  residents: ResidentOption[]
  contacts: Contact[]
}

type Step = 'select' | 'write' | 'personalizing' | 'preview' | 'sending' | 'done'

interface PersonalizedMsg {
  contactId: string
  contactName: string
  relationship: string
  residentName: string
  phone: string
  email?: string
  body: string
  originalBody: string
  residentId: string
}

export function ComposeWizard({ residents, contacts }: ComposeWizardProps) {
  const [step, setStep] = useState<Step>('select')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [baseMessage, setBaseMessage] = useState('')
  const [messages, setMessages] = useState<PersonalizedMsg[]>([])
  const [sendResults, setSendResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Contacts for selected residents
  const selectedContacts = contacts.filter(c => selectedIds.has(c.residentId))

  const handleToggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(residents.map(r => r.id)))
  }, [residents])

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handlePersonalize = async () => {
    setStep('personalizing')
    setError(null)
    try {
      const res = await fetch('/api/compose/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseMessage,
          contacts: selectedContacts.map(c => ({
            contactId: c.id,
            contactName: c.name,
            relationship: c.relationship,
            residentFirstName: c.residentFirstName,
            residentLastName: c.residentLastName,
          })),
        }),
      })

      if (!res.ok) throw new Error('Failed to personalize')

      const data = await res.json()
      const personalized: PersonalizedMsg[] = data.messages.map((m: any) => {
        const contact = selectedContacts.find(c => c.id === m.contactId)
        return {
          contactId: m.contactId,
          contactName: contact?.name ?? 'Unknown',
          relationship: contact?.relationship ?? '',
          residentName: `${contact?.residentFirstName} ${contact?.residentLastName}`,
          phone: contact?.phone ?? '',
          email: contact?.email,
          body: m.body,
          originalBody: m.body,
          residentId: contact?.residentId ?? '',
        }
      })
      setMessages(personalized)
      setStep('preview')
    } catch (err) {
      setError('Failed to personalize messages. Please try again.')
      setStep('write')
    }
  }

  const handleEdit = useCallback((contactId: string, newBody: string) => {
    setMessages(prev => prev.map(m =>
      m.contactId === contactId ? { ...m, body: newBody } : m
    ))
  }, [])

  const handleSend = async () => {
    setStep('sending')
    setError(null)
    try {
      const res = await fetch('/api/compose/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            residentId: m.residentId,
            contactId: m.contactId,
            body: m.body,
            phone: m.phone,
          })),
        }),
      })

      if (!res.ok) throw new Error('Failed to send')

      const data = await res.json()
      setSendResults(data.results.map((r: any, i: number) => ({
        ...r,
        contactName: messages[i]?.contactName ?? 'Unknown',
      })))
      setStep('done')
    } catch {
      setError('Failed to send messages. Please try again.')
      setStep('preview')
    }
  }

  const handleDone = () => {
    setStep('select')
    setSelectedIds(new Set())
    setBaseMessage('')
    setMessages([])
    setSendResults([])
    setError(null)
  }

  // Step indicator
  const steps = [
    { key: 'select', label: 'Select' },
    { key: 'write', label: 'Write' },
    { key: 'preview', label: 'Review' },
    { key: 'done', label: 'Send' },
  ]
  const activeIndex = step === 'select' ? 0 : step === 'write' ? 1 : (step === 'personalizing' || step === 'preview') ? 2 : 3

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              i <= activeIndex ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= activeIndex ? 'text-brand-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px ${i < activeIndex ? 'bg-brand-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Steps */}
      {step === 'select' && (
        <>
          <ResidentPicker
            residents={residents}
            selected={selectedIds}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep('write')}
              disabled={selectedIds.size === 0}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {step === 'write' && (
        <>
          <MessageEditor
            value={baseMessage}
            onChange={setBaseMessage}
            selectedCount={selectedIds.size}
            contactCount={selectedContacts.length}
          />
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep('select')} className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handlePersonalize}
              disabled={!baseMessage.trim()}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4" /> Personalize messages
            </button>
          </div>
        </>
      )}

      {step === 'personalizing' && (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--primary-600)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--navy-800)' }}>Personalizing {selectedContacts.length} messages...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--navy-400)' }}>AI is crafting a unique message for each family member</p>
        </div>
      )}

      {step === 'preview' && (
        <>
          <MessagePreview messages={messages} onEdit={handleEdit} />
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep('write')} className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Edit update
            </button>
            <button onClick={handleSend} className="btn-primary inline-flex items-center gap-2">
              <Send className="w-4 h-4" /> Send {messages.length} messages
            </button>
          </div>
        </>
      )}

      {step === 'sending' && (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--primary-600)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--navy-800)' }}>Sending messages...</p>
        </div>
      )}

      {step === 'done' && (
        <SendResults results={sendResults} onDone={handleDone} />
      )}
    </div>
  )
}
