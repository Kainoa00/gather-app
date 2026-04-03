'use client'

interface MessageEditorProps {
  value: string
  onChange: (value: string) => void
  selectedCount: number
  contactCount: number
}

export function MessageEditor({ value, onChange, selectedCount, contactCount }: MessageEditorProps) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--navy-800)' }}>Write your update</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--navy-400)' }}>
          Write a general update. AI will personalize it for each of the {contactCount} family contacts across {selectedCount} resident{selectedCount !== 1 ? 's' : ''}.
        </p>
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={6}
        placeholder="e.g., Had a wonderful week — appetite is improving, enjoyed group activities, and physical therapy is going well..."
        className="w-full px-4 py-3 rounded-xl border text-sm leading-relaxed focus:outline-none focus:ring-2 resize-none"
        style={{ borderColor: 'var(--navy-200)', color: 'var(--navy-800)' }}
      />

      <p className="text-xs mt-2" style={{ color: 'var(--navy-400)' }}>
        {value.length}/2000 characters
      </p>
    </div>
  )
}
