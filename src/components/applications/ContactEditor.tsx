import { useApplicationsStore } from '@/store/applicationsStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function ContactEditor({ applicationId }: { applicationId: string }) {
  const { items, update } = useApplicationsStore()
  const app = items.find((x) => x.id === applicationId)
  const [name, setName] = useState('Hiring Manager')
  const [email, setEmail] = useState('')

  if (!app) return null

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Contacts</div>
      <ul className="max-h-32 space-y-1 overflow-auto rounded-md border p-2 text-xs">
        {app.contacts.map((c) => (
          <li key={c.id}>
            {c.name} {c.email ? `• ${c.email}` : ''}
          </li>
        ))}
        {!app.contacts.length && <li className="text-muted-foreground">No contacts.</li>}
      </ul>
      <div className="flex gap-2">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          onClick={() =>
            update(app.id, {
              contacts: [
                {
                  id:
                    typeof crypto !== 'undefined' && crypto.randomUUID
                      ? crypto.randomUUID()
                      : String(Date.now()),
                  name,
                  email,
                },
                ...app.contacts,
              ],
            })
          }
        >
          Add
        </Button>
      </div>
    </div>
  )
}
