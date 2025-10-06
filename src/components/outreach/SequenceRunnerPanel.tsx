import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSequenceRunsStore } from '@/store/sequenceRunsStore'
import { useSequenceSchedulerStore } from '@/store/sequenceSchedulerStore'
import {
  startSequenceScheduler,
  stopSequenceScheduler,
} from '@/services/outreach/sequenceRunner.service'
import { Pause, Play } from 'lucide-react'

export default function SequenceRunnerPanel() {
  const { runs, setStatus } = useSequenceRunsStore()
  const { running, setRunning } = useSequenceSchedulerStore()

  const toggleScheduler = () => {
    const newRunning = !running
    setRunning(newRunning)
    if (newRunning) {
      startSequenceScheduler()
    } else {
      stopSequenceScheduler()
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Sequence Runner</div>
          <div className="flex gap-2">
            <Button size="sm" variant={running ? 'secondary' : 'default'} onClick={toggleScheduler}>
              {running ? (
                <>
                  <Pause className="mr-1 h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-1 h-3 w-3" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="max-h-64 space-y-2 overflow-auto text-xs">
          {runs.map((r) => (
            <div key={r.id} className="rounded-md border p-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{r.sequenceId}</div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">{r.status}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus(r.id, r.status === 'running' ? 'paused' : 'running')}
                  >
                    {r.status === 'running' ? 'Pause' : 'Run'}
                  </Button>
                </div>
              </div>
              <div className="text-xs">
                Step #{r.currentStepIndex + 1} • Next:{' '}
                {r.nextSendAt ? new Date(r.nextSendAt).toLocaleString() : 'now'}
              </div>
              <div className="text-xs text-muted-foreground">
                Vars: {Object.keys(r.variables).join(', ') || '—'}
              </div>
            </div>
          ))}
          {!runs.length && <div className="text-muted-foreground">No active runs.</div>}
        </div>
      </CardContent>
    </Card>
  )
}
