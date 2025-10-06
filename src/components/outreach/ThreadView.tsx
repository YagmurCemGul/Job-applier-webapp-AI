import { Card, CardContent } from '@/components/ui/card'
import type { GmailThread } from '@/types/gmail.types'

export default function ThreadView({ thread }: { thread?: GmailThread }) {
  if (!thread) return null

  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        <div className="font-medium">Thread: {thread.subject}</div>
        <div className="max-h-96 space-y-3 overflow-auto">
          {thread.messages.map((m) => (
            <div key={m.id} className="rounded-md border p-2 text-sm">
              <div className="text-xs text-muted-foreground">
                {m.from} → {m.to.join(', ')} • {new Date(m.date).toLocaleString()}
              </div>
              {m.html ? (
                <div
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: m.html }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-xs">{m.text}</pre>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
