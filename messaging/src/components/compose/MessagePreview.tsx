'use client'
import { MessageCard } from './MessageCard'

interface PersonalizedMsg {
  contactId: string
  contactName: string
  relationship: string
  residentName: string
  phone: string
  email?: string
  body: string
  originalBody: string
}

interface MessagePreviewProps {
  messages: PersonalizedMsg[]
  onEdit: (contactId: string, newBody: string) => void
}

export function MessagePreview({ messages, onEdit }: MessagePreviewProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--navy-800)' }}>
            Review personalized messages
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--navy-400)' }}>
            {messages.length} message{messages.length !== 1 ? 's' : ''} ready to send. Edit any message before sending.
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
          {messages.filter(m => m.body !== m.originalBody).length} edited
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {messages.map(msg => (
          <MessageCard
            key={msg.contactId}
            {...msg}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}
