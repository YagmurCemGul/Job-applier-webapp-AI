/**
 * Sequence Runner Panel
 * Displays and controls active sequence runs
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSequenceRuns } from '@/stores/sequenceRuns.store';
import { useSequenceScheduler } from '@/stores/sequenceScheduler.store';
import {
  startSequenceScheduler,
  stopSequenceScheduler
} from '@/services/outreach/sequenceRunner.service';
import { Play, Pause, Clock, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function SequenceRunnerPanel() {
  const { runs, setStatus } = useSequenceRuns();
  const { running, setRunning } = useSequenceScheduler();

  // Start scheduler on mount if running
  useEffect(() => {
    if (running) {
      startSequenceScheduler();
    }
    return () => stopSequenceScheduler();
  }, []);

  const toggleScheduler = () => {
    const newRunning = !running;
    setRunning(newRunning);
    if (newRunning) {
      startSequenceScheduler();
    } else {
      stopSequenceScheduler();
    }
  };

  const activeRuns = runs.filter((r) => r.status === 'running' || r.status === 'paused');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sequence Runner
          </CardTitle>
          <Button
            size="sm"
            variant={running ? 'secondary' : 'default'}
            onClick={toggleScheduler}
            className="gap-2"
          >
            {running ? (
              <>
                <Pause className="h-4 w-4" />
                Pause All
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Resume All
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="max-h-80 overflow-auto space-y-2">
          {activeRuns.map((run) => {
            const hasErrors = run.history.some((h) => !h.ok);

            return (
              <div
                key={run.id}
                className="border rounded-md p-3 space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm">
                      {run.sequenceId}
                    </div>
                    {hasErrors && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-xs ${
                        run.status === 'running'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      {run.status}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setStatus(
                          run.id,
                          run.status === 'running' ? 'paused' : 'running'
                        )
                      }
                    >
                      {run.status === 'running' ? 'Pause' : 'Resume'}
                    </Button>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-muted-foreground">
                    Step: {run.currentStepIndex + 1}
                  </div>
                  <div className="text-muted-foreground">
                    Next send:{' '}
                    {run.nextSendAt
                      ? new Date(run.nextSendAt).toLocaleString()
                      : 'Now'}
                  </div>
                  {Object.keys(run.variables).length > 0 && (
                    <div className="text-muted-foreground">
                      Variables: {Object.keys(run.variables).join(', ')}
                    </div>
                  )}
                  {run.history.length > 0 && (
                    <div className="text-muted-foreground">
                      History: {run.history.length} step(s) executed
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {activeRuns.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center border rounded-md">
              No active sequence runs.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
