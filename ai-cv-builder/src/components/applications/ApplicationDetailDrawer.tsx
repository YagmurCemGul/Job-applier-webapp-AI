/**
 * Application Detail Drawer
 * Full details view with contacts, events, logs
 */

import { useApplicationsStore } from '@/stores/applications.store';
import ContactEditor from './ContactEditor';
import EventEditor from './EventEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export default function ApplicationDetailDrawer() {
  const { items, activeId, select } = useApplicationsStore();
  const app = items.find(x => x.id === activeId);

  return (
    <Dialog open={!!app} onOpenChange={() => select(undefined)}>
      <DialogContent className="max-w-4xl space-y-3">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        {app && (
          <div className="grid md:grid-cols-2 gap-4">
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
              <ul className="text-xs list-disc ml-4">
                {app.files.map(f => (
                  <li key={f.id}>{f.name}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <ContactEditor applicationId={app.id} />
              <EventEditor applicationId={app.id} />
              <div className="text-sm font-medium">Logs</div>
              <div className="border rounded-md p-2 max-h-40 overflow-auto text-xs space-y-1">
                {app.logs.map(l => (
                  <div key={l.id}>
                    <b>{l.level.toUpperCase()}</b> •{' '}
                    {new Date(l.at).toLocaleString()} — {l.message}
                  </div>
                ))}
                {!app.logs.length && (
                  <div className="text-muted-foreground">No logs.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
