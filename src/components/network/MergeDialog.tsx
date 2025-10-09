/**
 * @fileoverview Merge duplicate contacts dialog
 * @module components/network/MergeDialog
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useContacts } from '@/stores/contacts.store';
import type { Contact } from '@/types/contacts.types';

interface Props {
  contacts: Contact[];
  open: boolean;
  onClose: () => void;
}

export function MergeDialog({ contacts, open, onClose }: Props) {
  const { upsert, remove } = useContacts();
  const [selected, setSelected] = useState<Partial<Contact>>({});

  const handleMerge = () => {
    const merged: Contact = {
      id: contacts[0].id,
      name: selected.name || contacts[0].name,
      email: selected.email || contacts[0].email,
      phone: selected.phone || contacts[0].phone,
      company: selected.company || contacts[0].company,
      title: selected.title || contacts[0].title,
      city: selected.city || contacts[0].city,
      tags: Array.from(new Set(contacts.flatMap(c => c.tags))),
      kind: selected.kind || contacts[0].kind,
      relationship: selected.relationship || contacts[0].relationship,
      notes: contacts.map(c => c.notes).filter(Boolean).join('\n---\n'),
      createdAt: contacts[0].createdAt,
      updatedAt: new Date().toISOString()
    };
    
    upsert(merged);
    contacts.slice(1).forEach(c => remove(c.id));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge {contacts.length} Contacts</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Select the preferred value for each field:
          </p>
          {/* Simple merge UI - in production would have field-by-field selection */}
          <div className="mt-4 space-y-2">
            {contacts.map((c, i) => (
              <div key={c.id} className="p-2 border rounded text-sm">
                <div className="font-medium">{c.name}</div>
                <div className="text-muted-foreground">{c.email}</div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleMerge}>Merge Contacts</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
