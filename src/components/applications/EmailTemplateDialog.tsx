import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEmailTemplatesStore } from '@/store/emailTemplatesStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function EmailTemplateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { items, upsert, remove } = useEmailTemplatesStore()
  const [name, setName] = useState('Follow up #1')
  const [subject, setSubject] = useState('Following up on {{Role}} at {{Company}}')
  const [body, setBody] = useState(
    'Hi {{RecruiterName}},\n\nJust checking in regarding the {{Role}} role at {{Company}}.\n\nBest,\n{{YourName}}'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl space-y-3">
        <DialogHeader>
          <DialogTitle>Email Templates</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Input
              placeholder="Template name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            <Button onClick={() => upsert({ name, subject, body, lang: 'en' })}>Save</Button>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Saved</div>
            <ul className="max-h-64 divide-y overflow-auto rounded-md border">
              {items.map((t) => (
                <li key={t.id} className="flex items-center justify-between p-2 text-sm">
                  <span className="truncate">{t.name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => remove(t.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
              {!items.length && (
                <li className="p-2 text-xs text-muted-foreground">No templates.</li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
