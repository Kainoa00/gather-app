// src/app/consent/SendConsentButton.tsx
'use client'
import { useState } from 'react'
import { sendConsentSMS } from './actions'

export function SendConsentButton({ contactId, residentName }: { contactId: string; residentName: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function handle() {
    setState('sending')
    await sendConsentSMS(contactId)
    setState('sent')
  }

  return (
    <button
      onClick={handle}
      disabled={state !== 'idle'}
      className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-800 disabled:opacity-50 transition-colors shrink-0"
    >
      {state === 'idle' ? 'Send consent SMS' : state === 'sending' ? 'Sending…' : 'Sent ✓'}
    </button>
  )
}
