import { useApplicationsStore } from '@/store/applicationsStore'

export default function ApplyLogsPanel() {
  const { items } = useApplicationsStore()
  const logs = items
    .flatMap((a) =>
      a.logs.map((l) => ({
        ...l,
        appId: a.id,
        company: a.company,
        role: a.role,
      }))
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 100)

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 font-medium">Apply Logs</div>
      <div className="max-h-64 space-y-1 overflow-auto text-xs">
        {logs.map((l) => (
          <div key={l.id}>
            <b>{l.level.toUpperCase()}</b> • {new Date(l.at).toLocaleString()} — {l.company} /{' '}
            {l.role} — {l.message}
          </div>
        ))}
        {!logs.length && <div className="text-muted-foreground">No logs.</div>}
      </div>
    </div>
  )
}
