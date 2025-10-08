/**
 * Contact Editor
 * Add and manage contacts for an application
 */

import { useApplicationsStore } from '@/stores/applications.store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ContactEditorProps {
  applicationId: string;
}

export default function ContactEditor({ applicationId }: ContactEditorProps) {
  const { items, update } = useApplicationsStore();
  const app = items.find(x => x.id === applicationId)!;
  const [name, setName] = useState('Hiring Manager');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    
    update(app.id, {
      contacts: [
        {
          id: crypto?.randomUUID?.() ?? String(Date.now()),
          name,
          email
        },
        ...app.contacts
      ]
    });
    
    setName('Hiring Manager');
    setEmail('');
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Contacts</div>
      <ul className="text-xs border rounded-md p-2 space-y-1 max-h-32 overflow-auto">
        {app.contacts.map(c => (
          <li key={c.id}>
            {c.name} {c.email ? `• ${c.email}` : ''}
          </li>
        ))}
        {!app.contacts.length && (
          <li className="text-muted-foreground">No contacts.</li>
        )}
      </ul>
      <div className="flex gap-2">
        <Input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>
    </div>
  );
}
