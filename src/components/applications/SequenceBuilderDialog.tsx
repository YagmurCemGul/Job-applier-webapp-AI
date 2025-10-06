import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useOutreachStore } from '@/store/outreachStore'
import { useEmailTemplatesStore } from '@/store/emailTemplatesStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function SequenceBuilderDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { sequences, upsert, remove } = useOutreachStore()
  const { items: templates } = useEmailTemplatesStore()
  const [name, setName] = useState('Follow-Up')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl space-y-3">
        <DialogHeader>
          <DialogTitle>Outreach Sequences</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Create</div>
            <Input
              placeholder="Sequence name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={() => upsert({ name, active: true, steps: [] })}>Save</Button>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Existing</div>
            <ul className="max-h-64 divide-y overflow-auto rounded-md border">
              {sequences.map((s) => (
                <li key={s.id} className="flex items-center justify-between p-2 text-sm">
                  <span>
                    {s.name} • {s.steps.length} steps
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        upsert({
                          ...s,
                          steps: [
                            ...s.steps,
                            {
                              id:
                                typeof crypto !== 'undefined' && crypto.randomUUID
                                  ? crypto.randomUUID()
                                  : String(Date.now()),
                              offsetDays: 3,
                              templateId: templates[0]?.id ?? '',
                              sendTime: '09:00',
                            },
                          ],
                        })
                      }
                    >
                      + Step
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
              {!sequences.length && (
                <li className="p-2 text-xs text-muted-foreground">No sequences.</li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
