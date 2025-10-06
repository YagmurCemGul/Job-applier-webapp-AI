import OAuthConnectButton from './OAuthConnectButton'
import AccountSettingsCard from './AccountSettingsCard'
import SequenceRunnerPanel from './SequenceRunnerPanel'
import ThreadView from './ThreadView'
import { useOutboxStore } from '@/store/outboxStore'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function OutboxPage() {
  const { messages } = useOutboxStore()
  const [activeThread, setActiveThread] = useState<string | undefined>(undefined)

  return (
    <div className="space-y-4">
      <OAuthConnectButton />
      <AccountSettingsCard />
      <SequenceRunnerPanel />

      <Card>
        <CardContent className="space-y-2 p-3">
          <div className="font-medium">Outbox</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              {messages.map((m) => (
                <div key={m.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-start justify-between">
                    <div className="truncate font-medium">{m.subject}</div>
                    <Badge variant={m.status === 'sent' ? 'default' : 'secondary'}>
                      {m.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.to.join(', ')} • {new Date(m.createdAt).toLocaleString()}
                  </div>
                  {m.error && <div className="mt-1 text-xs text-red-600">{m.error}</div>}
                  <div className="mt-1 flex gap-2 text-xs">
                    {m.threadId && (
                      <button className="underline" onClick={() => setActiveThread(m.threadId)}>
                        Open Thread
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!messages.length && (
                <div className="text-xs text-muted-foreground">Nothing sent yet.</div>
              )}
            </div>
            <div>
              {/* Thread viewer placeholder */}
              <ThreadView />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
