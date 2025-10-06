import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Panelist } from '@/types/interview.types'
import { proposeSlots } from '@/services/integrations/calendar.real.service'

export default function AvailabilityPicker({
  panel,
  durationMin,
  onSelectSlot,
}: {
  panel: Panelist[]
  durationMin: number
  onSelectSlot: (slot: string) => void
}) {
  const now = new Date()
  const in3d = new Date(now.getTime() + 3 * 24 * 3600 * 1000)

  const proposal = proposeSlots({
    durationMin,
    windowStartISO: now.toISOString(),
    windowEndISO: in3d.toISOString(),
    timeZone: (Intl.DateTimeFormat().resolvedOptions().timeZone as any) || 'UTC',
  })

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="text-sm font-medium">Proposed Time Slots (next 3 days)</div>
        <div className="flex flex-wrap gap-2">
          {proposal.slots.slice(0, 12).map((slot) => (
            <Button key={slot} variant="outline" size="sm" onClick={() => onSelectSlot(slot)}>
              {new Date(slot).toLocaleString()}
            </Button>
          ))}
        </div>
        {proposal.slots.length === 0 && (
          <div className="text-xs text-muted-foreground">No available slots in the next 3 days</div>
        )}
      </CardContent>
    </Card>
  )
}
