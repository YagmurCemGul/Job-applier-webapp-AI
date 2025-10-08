/**
 * Fetch Run Log
 * Step 32 - Display fetch operation logs
 */

import { useJobsStore } from '@/stores/jobs.store';

export default function FetchRunLog() {
  const { logs } = useJobsStore();

  return (
    <div className="border rounded-md p-3">
      <div className="font-medium mb-2">Fetch Logs</div>
      
      <div className="space-y-1 max-h-64 overflow-auto">
        {logs.map(l => (
          <div key={l.id} className="text-xs">
            <b>{l.ok ? 'OK' : 'ERR'}</b> • {l.source} • {' '}
            {new Date(l.startedAt).toLocaleString()} → {' '}
            {new Date(l.finishedAt || Date.now()).toLocaleTimeString()} • {' '}
            +{l.created}/{l.updated}/{l.skipped}
            {l.message ? ` • ${l.message}` : ''}
          </div>
        ))}
        
        {!logs.length && (
          <div className="text-xs text-muted-foreground">
            No runs yet.
          </div>
        )}
      </div>
    </div>
  );
}
