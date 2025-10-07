import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Check, Info } from 'lucide-react'
import { OptimizationChange } from '@/services/ai.service'
import { useOptimizationStore } from '@/store/optimizationStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface OptimizationChangesProps {
  changes: OptimizationChange[]
}

export function OptimizationChanges({ changes }: OptimizationChangesProps) {
  const { toggleChange, revertChange } = useOptimizationStore()
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set())

  const toggleExpand = (changeId: string) => {
    setExpandedChanges((prev) => {
      const next = new Set(prev)
      if (next.has(changeId)) {
        next.delete(changeId)
      } else {
        next.add(changeId)
      }
      return next
    })
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-100 text-green-800'
      case 'modified':
        return 'bg-blue-100 text-blue-800'
      case 'removed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const appliedChanges = changes.filter((c) => c.applied)
  const revertedChanges = changes.filter((c) => !c.applied)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Optimization Changes ({appliedChanges.length}/{changes.length} applied)
        </h3>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {changes.map((change) => (
          <div
            key={change.id}
            className={`
              border rounded-lg p-4 transition-all duration-200
              ${change.applied ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-60'}
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getChangeTypeColor(change.type)}>
                    {change.type}
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">
                    {change.section}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleExpand(change.id)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{change.reason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {change.applied ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    onClick={() => revertChange(change.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                    onClick={() => toggleChange(change.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Change Preview */}
            {expandedChanges.has(change.id) && (
              <div className="space-y-2 mt-3">
                {change.original && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <div className="font-medium text-red-900 mb-1">Original:</div>
                    <div className="text-red-800">{change.original}</div>
                  </div>
                )}
                {change.optimized && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <div className="font-medium text-green-900 mb-1">Optimized:</div>
                    <div className="text-green-800">{change.optimized}</div>
                  </div>
                )}
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <div className="font-medium text-blue-900 mb-1">Reason:</div>
                  <div className="text-blue-800">{change.reason}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {revertedChanges.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-900">
            <strong>Note:</strong> {revertedChanges.length} change(s) have been reverted.
            Click the checkmark to reapply.
          </p>
        </div>
      )}
    </Card>
  )
}