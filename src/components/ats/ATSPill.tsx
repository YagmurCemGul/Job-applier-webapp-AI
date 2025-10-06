import type { ATSSuggestion } from '@/types/ats.types'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ATSPillProps {
  s: ATSSuggestion
  onApply: (id: string) => void
  onDismiss: (id: string) => void
}

/**
 * Interactive ATS suggestion pill
 * Hover to see dismiss button, click to apply
 */
export default function ATSPill({ s, onApply, onDismiss }: ATSPillProps) {
  const severityColor = {
    critical: 'border-red-300 bg-red-50 text-red-900',
    high: 'border-orange-300 bg-orange-50 text-orange-900',
    medium: 'border-yellow-300 bg-yellow-50 text-yellow-900',
    low: 'border-blue-300 bg-blue-50 text-blue-900',
  }[s.severity]

  return (
    <div
      className={cn(
        'group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors',
        severityColor,
        'hover:border-red-400 hover:bg-red-100',
        s.applied ? 'cursor-default opacity-60' : 'cursor-pointer'
      )}
      role="button"
      tabIndex={0}
      aria-label={`${s.category} ${s.severity} suggestion: ${s.title}`}
      onClick={() => !s.applied && onApply(s.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !s.applied) onApply(s.id)
      }}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      <span className="font-medium">{s.title}</span>
      <button
        className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Dismiss suggestion"
        onClick={(e) => {
          e.stopPropagation()
          onDismiss(s.id)
        }}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
