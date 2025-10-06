import { useJobsStore } from '@/store/jobsStore'

export default function FetchRunLog() {
  const { logs } = useJobsStore()

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 font-medium">Fetch Logs</div>
      <div className="max-h-64 space-y-1 overflow-auto">
        {logs.map((l) => (
          <div key={l.id} className="text-xs">
            <b>{l.ok ? 'OK' : 'ERR'}</b> • {l.source} • {new Date(l.startedAt).toLocaleString()} →{' '}
            {new Date(l.finishedAt || Date.now()).toLocaleTimeString()} • +{l.created}/{l.updated}/
            {l.skipped} {l.message ? `• ${l.message}` : ''}
          </div>
        ))}
        {!logs.length && <div className="text-xs text-muted-foreground">No runs yet.</div>}
      </div>
    </div>
  )
}
