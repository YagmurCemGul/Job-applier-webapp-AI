import { useApplicationsStore } from '@/store/applicationsStore'
import ContactEditor from './ContactEditor'
import EventEditor from './EventEditor'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ApplicationDetailDrawer() {
  const { items, activeId, select } = useApplicationsStore()
  const app = items.find((x) => x.id === activeId)

  return (
    <Dialog open={!!app} onOpenChange={() => select(undefined)}>
      <DialogContent className="max-h-[90vh] max-w-4xl space-y-3 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        {app && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Company:</span> {app.company}
              </div>
              <div className="text-sm">
                <span className="font-medium">Role:</span> {app.role}
              </div>
              <div className="text-sm">
                <span className="font-medium">Stage:</span> {app.stage}
              </div>
              <div className="text-sm">
                <span className="font-medium">Notes:</span> {app.notes || '-'}
              </div>
              <div className="text-sm font-medium">Files</div>
              <ul className="ml-4 list-disc text-xs">
                {app.files.map((f) => (
                  <li key={f.id}>{f.name}</li>
                ))}
                {!app.files.length && <li className="text-muted-foreground">No files</li>}
              </ul>
            </div>
            <div className="space-y-3">
              <ContactEditor applicationId={app.id} />
              <EventEditor applicationId={app.id} />
              <div className="text-sm font-medium">Logs</div>
              <div className="max-h-40 space-y-1 overflow-auto rounded-md border p-2 text-xs">
                {app.logs.map((l) => (
                  <div key={l.id}>
                    <b>{l.level.toUpperCase()}</b> • {new Date(l.at).toLocaleString()} — {l.message}
                  </div>
                ))}
                {!app.logs.length && <div className="text-muted-foreground">No logs.</div>}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
