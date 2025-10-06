import { useApplicationsStore } from '@/store/applicationsStore'
import { createEvent } from '@/services/integrations/calendar.service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function EventEditor({ applicationId }: { applicationId: string }) {
  const { items, addEvent } = useApplicationsStore()
  const app = items.find((x) => x.id === applicationId)
  const [title, setTitle] = useState('Interview')
  const [when, setWhen] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  )

  if (!app) return null

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Events</div>
      <ul className="max-h-32 space-y-1 overflow-auto rounded-md border p-2 text-xs">
        {app.events.map((e) => (
          <li key={e.id}>
            {e.title} • {new Date(e.when).toLocaleString()}
          </li>
        ))}
        {!app.events.length && <li className="text-muted-foreground">No events.</li>}
      </ul>
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <Button
          onClick={async () => {
            await createEvent({ title, when })
            addEvent(app.id, {
              id:
                typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : String(Date.now()),
              type: 'interview',
              title,
              when,
            })
          }}
        >
          Add
        </Button>
      </div>
    </div>
  )
}
