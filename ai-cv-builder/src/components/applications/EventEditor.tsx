/**
 * Event Editor
 * Add and manage events (interviews, calls) for an application
 */

import { useApplicationsStore } from '@/stores/applications.store';
import { createEvent } from '@/services/integrations/calendar.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface EventEditorProps {
  applicationId: string;
}

export default function EventEditor({ applicationId }: EventEditorProps) {
  const { items, addEvent } = useApplicationsStore();
  const app = items.find(x => x.id === applicationId)!;
  const [title, setTitle] = useState('Interview');
  const [when, setWhen] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );

  const handleAdd = async () => {
    if (!title.trim()) return;
    
    const r = await createEvent({ title, when });
    addEvent(app.id, {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      type: 'interview',
      title,
      when
    });
    
    setTitle('Interview');
    setWhen(new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Events</div>
      <ul className="text-xs border rounded-md p-2 space-y-1 max-h-32 overflow-auto">
        {app.events.map(e => (
          <li key={e.id}>
            {e.title} • {new Date(e.when).toLocaleString()}
          </li>
        ))}
        {!app.events.length && (
          <li className="text-muted-foreground">No events.</li>
        )}
      </ul>
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Input
          type="datetime-local"
          value={when}
          onChange={e => setWhen(e.target.value)}
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>
    </div>
  );
}
