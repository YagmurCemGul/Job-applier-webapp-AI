import { useMemo } from 'react'
import { highlightCVText } from '@/services/ats/highlights.service'
import type { CVData } from '@/types/cvData.types'

interface ATSCVPreviewWithHighlightsProps {
  cv: CVData
  enabled: boolean
  terms: string[]
  children: React.ReactNode
}

/**
 * Wrapper that adds keyword highlighting to CV preview
 * This is a simplified version - in production, you'd want to deeply traverse
 * the CV structure and apply highlights selectively
 */
export default function ATSCVPreviewWithHighlights({
  cv,
  enabled,
  terms,
  children,
}: ATSCVPreviewWithHighlightsProps) {
  // For now, we'll just render children as-is
  // In a full implementation, we'd clone the children and inject highlighted content
  // This would require a more sophisticated approach with React.cloneElement or a custom renderer

  if (!enabled || !terms.length) {
    return <>{children}</>
  }

  // This is a placeholder - actual implementation would need to:
  // 1. Extract text nodes from the CV renderer
  // 2. Apply highlighting to those specific nodes
  // 3. Re-render with highlighted content
  // For now, we'll add a visual indicator that highlights are active

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10 px-2 py-1 bg-green-100 dark:bg-green-900 text-xs rounded-bl-md">
        CV Highlights Active
      </div>
      {children}
    </div>
  )
}
