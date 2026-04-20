'use client'

import { useEffect, useState } from 'react'

interface Props {
  lastSyncTime: Date | null
}

export default function SyncIndicator({ lastSyncTime }: Props) {
  const [label, setLabel] = useState('Connecting...')

  useEffect(() => {
    function update() {
      if (!lastSyncTime) { setLabel('Connecting...'); return }
      const secs = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000)
      if (secs < 10) setLabel('Just now')
      else if (secs < 60) setLabel(`${secs}s ago`)
      else if (secs < 3600) setLabel(`${Math.floor(secs / 60)} min ago`)
      else setLabel(`${Math.floor(secs / 3600)}h ago`)
    }
    update()
    const id = setInterval(update, 15000)
    return () => clearInterval(id)
  }, [lastSyncTime])

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-mint-50 border border-mint-200 rounded-xl text-xs font-medium text-mint-700">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-500" />
      </span>
      <span>PointClickCare</span>
      <span className="text-mint-500 font-normal">· {label}</span>
    </div>
  )
}
