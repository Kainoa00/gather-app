'use client'
import { useState } from 'react'
import { sendConsentSMS } from './actions'

export function SendConsentButton({ contactId, residentName }: { contactId: string; residentName: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handle() {
    setState('sending')
    setErrorMsg('')
    try {
      const result = await sendConsentSMS(contactId)
      if (result.success) {
        setState('sent')
      } else {
        setState('error')
        setErrorMsg(result.error ?? 'Failed to send')
      }
    } catch {
      setState('error')
      setErrorMsg('Network error — please retry')
    }
  }

  if (state === 'sent') {
    return <span className="text-[11px] font-medium text-green-600 px-3 py-1.5">Sent ✓</span>
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-red-500">{errorMsg}</span>
        <button
          onClick={handle}
          className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handle}
      disabled={state === 'sending'}
      className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-800 disabled:opacity-50 transition-colors shrink-0"
    >
      {state === 'sending' ? 'Sending...' : 'Send consent SMS'}
    </button>
  )
}
