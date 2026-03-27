'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // wait for exit animation
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed top-6 right-6 z-[9999]">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-xl transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        } ${
          type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 hover:opacity-70 transition">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
