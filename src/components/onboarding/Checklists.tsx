/**
 * @fileoverview Checklists for IT/HR/policies/equipment setup.
 * @module components/onboarding/Checklists
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import type { ChecklistItem, ChecklistKind } from '@/types/onboarding.types';

interface Props {
  checklists: ChecklistItem[];
  onAdd: (item: ChecklistItem) => void;
  onToggle: (id: string, done: boolean) => void;
}

/**
 * Checklists - manage onboarding checklists.
 */
export function Checklists({ checklists, onAdd, onToggle }: Props) {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<ChecklistKind>('other');

  const handleAdd = () => {
    if (!label.trim()) return;
    const item: ChecklistItem = {
      id: crypto.randomUUID(),
      kind,
      label: label.trim(),
      done: false,
    };
    onAdd(item);
    setLabel('');
  };

  const byKind = (k: ChecklistKind) => checklists.filter((c) => c.kind === k);
  const progress = (k: ChecklistKind) => {
    const items = byKind(k);
    if (!items.length) return 0;
    return (items.filter((i) => i.done).length / items.length) * 100;
  };

  const kinds: ChecklistKind[] = ['it', 'hr', 'policies', 'equipment', 'other'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('onboarding.checklists')}
        </h2>
        <p className="text-slate-600 mt-1">
          Track setup and onboarding tasks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Checklist Item</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Select value={kind} onValueChange={(v) => setKind(v as ChecklistKind)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kinds.map((k) => (
                <SelectItem key={k} value={k}>
                  {t(`onboarding.${k}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Checklist item..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {kinds.map((k) => {
          const items = byKind(k);
          const pct = progress(k);
          return (
            <Card key={k}>
              <CardHeader>
                <CardTitle className="text-lg">{t(`onboarding.${k}`)}</CardTitle>
                <CardDescription>
                  {items.filter((i) => i.done).length} / {items.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={pct} className="h-2" />
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">No items yet</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-2">
                        <Checkbox
                          id={item.id}
                          checked={item.done}
                          onCheckedChange={(checked) =>
                            onToggle(item.id, Boolean(checked))
                          }
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={item.id}
                          className={`flex-1 text-sm ${item.done ? 'line-through text-slate-500' : ''}`}
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
