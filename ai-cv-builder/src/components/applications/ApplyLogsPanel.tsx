/**
 * Apply Logs Panel
 * System-wide view of all application logs
 */

import { useApplicationsStore } from '@/stores/applications.store';

export default function ApplyLogsPanel() {
  const { items } = useApplicationsStore();
  
  const logs = items
    .flatMap(a =>
      a.logs.map(l => ({
        ...l,
        appId: a.id,
        company: a.company,
        role: a.role
      }))
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 100);

  return (
    <div className="border rounded-md p-3">
      <div className="font-medium mb-2">Apply Logs</div>
      <div className="max-h-64 overflow-auto text-xs space-y-1">
        {logs.map(l => (
          <div key={l.id}>
            <b>{l.level.toUpperCase()}</b> • {new Date(l.at).toLocaleString()} —{' '}
            {l.company} / {l.role} — {l.message}
          </div>
        ))}
        {!logs.length && (
          <div className="text-muted-foreground">No logs.</div>
        )}
      </div>
    </div>
  );
}
