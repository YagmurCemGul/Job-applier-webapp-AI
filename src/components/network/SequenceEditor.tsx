/**
 * @fileoverview Sequence editor to build multi-step outreach campaigns
 * @module components/network/SequenceEditor
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useOutreach } from '@/stores/outreach.store';
import type { Sequence, SequenceStep } from '@/types/outreach.types';

interface Props {
  sequence?: Sequence;
  open: boolean;
  onClose: () => void;
}

export function SequenceEditor({ sequence, open, onClose }: Props) {
  const { t } = useTranslation();
  const { upsertSequence } = useOutreach();
  const [form, setForm] = useState<Partial<Sequence>>(sequence || {
    name: '',
    steps: [],
    maxPerDay: 10,
    unsubscribeFooter: true
  });

  const handleAddStep = () => {
    const step: SequenceStep = {
      id: crypto.randomUUID(),
      dayOffset: (form.steps?.length || 0),
      channel: 'email',
      templateId: undefined
    };
    setForm({ ...form, steps: [...(form.steps || []), step] });
  };

  const handleRemoveStep = (stepId: string) => {
    setForm({ ...form, steps: (form.steps || []).filter(s => s.id !== stepId) });
  };

  const handleSave = () => {
    const seq: Sequence = {
      id: sequence?.id || crypto.randomUUID(),
      name: form.name!,
      steps: form.steps || [],
      maxPerDay: form.maxPerDay || 10,
      quiet: form.quiet,
      unsubscribeFooter: form.unsubscribeFooter
    };
    upsertSequence(seq);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{sequence ? 'Edit' : 'Create'} Sequence</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sequence Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Recruiter Follow-up"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxPerDay">Max Sends per Day</Label>
              <Input
                id="maxPerDay"
                type="number"
                value={form.maxPerDay}
                onChange={e => setForm({ ...form, maxPerDay: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="unsubscribe"
                checked={form.unsubscribeFooter}
                onCheckedChange={checked => setForm({ ...form, unsubscribeFooter: checked })}
              />
              <Label htmlFor="unsubscribe">{t('network.unsubscribe')}</Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Steps</Label>
              <Button size="sm" variant="outline" onClick={handleAddStep}>
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {(form.steps || []).map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 p-2 border rounded">
                  <Badge>{i + 1}</Badge>
                  <span className="text-sm">Day {step.dayOffset}</span>
                  <span className="text-sm text-muted-foreground">{step.channel}</span>
                  <div className="flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveStep(step.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(form.steps || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No steps yet. Click "Add Step" to begin.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name}>
            Save Sequence
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
