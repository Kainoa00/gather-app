'use client'
import { useState } from 'react'

export function SendUpdateButton({ residentId, residentName }: { residentId: string; residentName: string }) {
  const [state, setState] = useState<'idle' | 'open' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSend() {
    if (!message.trim()) return
    setState('sending')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentId, eventType: 'MANUAL', details: { note: message } }),
      })
      if (res.ok) {
        setState('sent')
        setMessage('')
        setTimeout(() => setState('idle'), 3000)
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'idle') {
    return (
      <button
        onClick={() => setState('open')}
        className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
      >
        Send update
      </button>
    )
  }

  if (state === 'sent') {
    return <span className="text-[11px] text-green-600 font-medium">Sent ✓</span>
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type family update..."
        className="text-[11px] px-2.5 py-1.5 border border-gray-200 rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-brand-300"
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        autoFocus
      />
      <button
        onClick={handleSend}
        disabled={state === 'sending' || !message.trim()}
        className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-brand-600 text-white hover:bg-brand-800 disabled:opacity-50 transition-colors"
      >
        {state === 'sending' ? '...' : 'Send'}
      </button>
      <button
        onClick={() => { setState('idle'); setMessage('') }}
        className="text-[11px] text-gray-400 hover:text-gray-600"
      >
        Cancel
      </button>
    </div>
  )
}
