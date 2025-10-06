import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { proposeSlots } from '@/services/integrations/calendar.real.service'
import { buildICS } from '@/services/integrations/ics.service'

export default function CalendarLinkDialog({
  open,
  onOpenChange,
  defaults,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaults?: { durationMin?: number }
}) {
  const now = new Date()
  const in2d = new Date(now.getTime() + 2 * 24 * 3600 * 1000)

  const prop = proposeSlots({
    durationMin: defaults?.durationMin ?? 30,
    windowStartISO: now.toISOString(),
    windowEndISO: in2d.toISOString(),
    timeZone: (Intl.DateTimeFormat().resolvedOptions().timeZone as any) || 'UTC',
  })

  const icsData = buildICS({
    uid:
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: 'Interview with You',
    startISO: prop.slots[0] ?? now.toISOString(),
    durationMin: defaults?.durationMin ?? 30,
  })

  const blob = new Blob([icsData], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>Propose Times</DialogTitle>
        </DialogHeader>
        <div className="text-sm">Suggested slots (next 2 days):</div>
        <div className="flex flex-wrap gap-2 text-xs">
          {prop.slots.slice(0, 10).map((s) => (
            <span key={s} className="rounded-md border px-2 py-1">
              {new Date(s).toLocaleString()}
            </span>
          ))}
          {!prop.slots.length && <span className="text-muted-foreground">No slots in window.</span>}
        </div>
        <div className="flex items-center gap-2">
          <Input readOnly value="Attach ICS to your email for easy scheduling." />
          <Button asChild>
            <a download="proposed_times.ics" href={url}>
              Download ICS
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
