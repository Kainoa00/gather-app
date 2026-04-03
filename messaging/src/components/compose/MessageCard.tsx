'use client'
import { useState } from 'react'
import { Phone, Mail, RotateCcw } from 'lucide-react'

interface MessageCardProps {
  contactId: string
  contactName: string
  relationship: string
  residentName: string
  phone: string
  email?: string
  body: string
  originalBody: string
  onEdit: (contactId: string, newBody: string) => void
}

export function MessageCard({
  contactId, contactName, relationship, residentName,
  phone, email, body, originalBody, onEdit,
}: MessageCardProps) {
  const wasEdited = body !== originalBody

  return (
    <div className="card-glass p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--navy-800)' }}>{contactName}</p>
          <p className="text-xs" style={{ color: 'var(--navy-400)' }}>
            {relationship} of {residentName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {phone && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              <Phone className="w-3 h-3" /> SMS
            </span>
          )}
          {email && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              <Mail className="w-3 h-3" /> Email
            </span>
          )}
        </div>
      </div>

      <textarea
        value={body}
        onChange={(e) => onEdit(contactId, e.target.value)}
        rows={4}
        className="w-full text-[12px] leading-relaxed px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 resize-none"
        style={{
          borderColor: wasEdited ? 'var(--primary-300)' : 'var(--navy-200)',
          color: 'var(--navy-800)',
        }}
      />

      {wasEdited && (
        <button
          onClick={() => onEdit(contactId, originalBody)}
          className="flex items-center gap-1 mt-2 text-[11px] font-medium hover:underline"
          style={{ color: 'var(--primary-600)' }}
        >
          <RotateCcw className="w-3 h-3" /> Reset to AI version
        </button>
      )}
    </div>
  )
}
