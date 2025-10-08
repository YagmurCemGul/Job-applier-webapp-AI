import type { ATSSuggestion } from '@/types/ats.types'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ATSPillProps {
  suggestion: ATSSuggestion
  onApply: (id: string) => void
  onDismiss: (id: string) => void
}

/**
 * Interactive pill component for ATS suggestions
 * Shows category badge, turns red on hover, reveals dismiss button
 */
export default function ATSPill({ suggestion: s, onApply, onDismiss }: ATSPillProps) {
  const severityColors = {
    critical: 'border-red-500 text-red-700 dark:text-red-400',
    high: 'border-orange-500 text-orange-700 dark:text-orange-400',
    medium: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
    low: 'border-blue-500 text-blue-700 dark:text-blue-400',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border-2 transition-all duration-200',
        'hover:bg-red-50 dark:hover:bg-red-950/20 group cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        s.applied ? 'opacity-50 cursor-default' : '',
        severityColors[s.severity]
      )}
      role="button"
      tabIndex={0}
      aria-label={`${s.category} ${s.severity} suggestion: ${s.title}`}
      onClick={() => !s.applied && onApply(s.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !s.applied) onApply(s.id)
      }}
    >
      <span
        className={cn('w-2 h-2 rounded-full', `bg-current`)}
        aria-hidden
        title={s.severity}
      />
      <span className="font-medium">{s.title}</span>
      <button
        className={cn(
          'ml-1 opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:text-red-600 dark:hover:text-red-400 p-0.5 rounded',
          'focus:outline-none focus:opacity-100'
        )}
        aria-label="Dismiss suggestion"
        onClick={(e) => {
          e.stopPropagation()
          onDismiss(s.id)
        }}
        tabIndex={-1}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
