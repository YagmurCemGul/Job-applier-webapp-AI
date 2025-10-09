/**
 * @fileoverview Pre-Start Checklist component (Step 45)
 * @module components/onboarding/PreStartChecklist
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Plus } from 'lucide-react';
import type { ChecklistItem } from '@/types/onboarding.types';

interface Props {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onAdd: (item: ChecklistItem) => void;
  onLoadDefaults: () => void;
}

/**
 * Pre-Start Checklist - manage onboarding checklist items
 */
export function PreStartChecklist({ items, onToggle, onAdd, onLoadDefaults }: Props) {
  const { t } = useTranslation();
  const [newLabel, setNewLabel] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  const handleAdd = () => {
    if (!newLabel.trim()) return;
    
    onAdd({
      id: crypto.randomUUID(),
      label: newLabel,
      done: false,
      notes: newNotes || undefined
    });
    
    setNewLabel('');
    setNewNotes('');
  };
  
  const handleExportCSV = () => {
    const csv = [
      ['Label', 'Done', 'Notes'].join(','),
      ...items.map(i => [i.label, i.done ? 'Yes' : 'No', i.notes || ''].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'onboarding-checklist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('onboard.checklist')}</CardTitle>
            <div className="flex gap-2">
              <Button onClick={onLoadDefaults} variant="outline" size="sm">
                {t('onboard.loadDefaults')}
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Checklist items */}
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Checkbox
                  id={item.id}
                  checked={item.done}
                  onCheckedChange={() => onToggle(item.id)}
                  aria-label={`Toggle ${item.label}`}
                />
                <div className="flex-1">
                  <Label htmlFor={item.id} className={item.done ? 'line-through text-muted-foreground' : ''}>
                    {item.label}
                  </Label>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Add new item */}
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label htmlFor="new-label">New Item</Label>
              <Input
                id="new-label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Item label..."
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div>
              <Label htmlFor="new-notes">Notes (optional)</Label>
              <Textarea
                id="new-notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
            <Button onClick={handleAdd} size="sm" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
