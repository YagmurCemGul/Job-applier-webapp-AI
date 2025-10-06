import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Panelist } from '@/types/interview.types'
import { Plus, Trash2 } from 'lucide-react'

export default function PanelEditor({
  panel,
  onChange,
}: {
  panel: Panelist[]
  onChange: (panel: Panelist[]) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  const addPanelist = () => {
    if (!name || !email) return

    const newPanelist: Panelist = {
      id: email,
      name,
      email,
      role: role || undefined,
      required: false,
    }

    onChange([...panel, newPanelist])
    setName('')
    setEmail('')
    setRole('')
  }

  const removePanelist = (id: string) => {
    onChange(panel.filter((p) => p.id !== id))
  }

  const toggleRequired = (id: string) => {
    onChange(panel.map((p) => (p.id === id ? { ...p, required: !p.required } : p)))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {panel.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-md border p-2">
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.email} {p.role && `• ${p.role}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={p.required} onChange={() => toggleRequired(p.id)} />
                Required
              </label>
              <Button variant="ghost" size="sm" onClick={() => removePanelist(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {panel.length === 0 && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No panelists added yet
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <div>
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Interviewer name"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="interviewer@company.com"
          />
        </div>
        <div>
          <Label>Role (optional)</Label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Hiring Manager"
          />
        </div>
        <Button onClick={addPanelist} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Panelist
        </Button>
      </div>
    </div>
  )
}
