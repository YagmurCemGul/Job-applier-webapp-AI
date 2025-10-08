/**
 * Sequence Builder Dialog
 * Create and manage outreach sequences
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useOutreachStore } from '@/stores/outreach.store';
import { useEmailTemplates } from '@/stores/emailTemplates.store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SequenceBuilderDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function SequenceBuilderDialog({
  open,
  onOpenChange
}: SequenceBuilderDialogProps) {
  const { sequences, upsert, remove } = useOutreachStore();
  const { items: templates } = useEmailTemplates();
  const [name, setName] = useState('Follow-Up');

  const handleCreate = () => {
    upsert({ name, active: true, steps: [] });
    setName('Follow-Up');
  };

  const handleAddStep = (seqId: string) => {
    const seq = sequences.find(s => s.id === seqId);
    if (!seq) return;
    
    upsert({
      ...seq,
      steps: [
        ...seq.steps,
        {
          id: crypto?.randomUUID?.() ?? String(Date.now()),
          offsetDays: 3,
          templateId: templates[0]?.id ?? '',
          sendTime: '09:00'
        }
      ]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>Outreach Sequences</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Create</div>
            <Input
              placeholder="Sequence name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Button onClick={handleCreate}>Save</Button>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Existing</div>
            <ul className="border rounded-md divide-y">
              {sequences.map(s => (
                <li
                  key={s.id}
                  className="p-2 text-sm flex items-center justify-between"
                >
                  <span>
                    {s.name} • {s.steps.length} steps
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddStep(s.id)}
                    >
                      + Step
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(s.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
              {!sequences.length && (
                <li className="p-2 text-xs text-muted-foreground">
                  No sequences.
                </li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
