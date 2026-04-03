'use client'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface SendResult {
  contactId: string
  contactName: string
  status: string
  reason?: string
  error?: string
}

interface SendResultsProps {
  results: SendResult[]
  onDone: () => void
}

export function SendResults({ results, onDone }: SendResultsProps) {
  const sent = results.filter(r => r.status === 'SENT')
  const suppressed = results.filter(r => r.status === 'SUPPRESSED')
  const failed = results.filter(r => r.status === 'FAILED')

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--primary-50)' }}>
          <CheckCircle className="w-7 h-7" style={{ color: 'var(--primary-600)' }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--navy-800)' }}>Messages sent</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--navy-400)' }}>
          {sent.length} delivered, {suppressed.length} suppressed, {failed.length} failed
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-green-700">{sent.length}</p>
          <p className="text-xs text-green-600 mt-0.5">Sent</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-amber-700">{suppressed.length}</p>
          <p className="text-xs text-amber-600 mt-0.5">No consent</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-red-700">{failed.length}</p>
          <p className="text-xs text-red-600 mt-0.5">Failed</p>
        </div>
      </div>

      {/* Detail list */}
      <div className="card-glass overflow-hidden mb-6">
        {results.map(r => (
          <div key={r.contactId} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
            {r.status === 'SENT' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
            {r.status === 'SUPPRESSED' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
            {r.status === 'FAILED' && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
            <span className="text-sm flex-1" style={{ color: 'var(--navy-800)' }}>{r.contactName}</span>
            <span className="text-xs" style={{ color: 'var(--navy-400)' }}>
              {r.status === 'SUPPRESSED' ? 'No consent' : r.status === 'FAILED' ? 'Send failed' : 'Delivered'}
            </span>
          </div>
        ))}
      </div>

      <button onClick={onDone} className="btn-primary w-full text-center">
        Done
      </button>
    </div>
  )
}
