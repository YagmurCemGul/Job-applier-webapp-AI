/**
 * @fileoverview Resignation planner component for Step 37
 * @module components/offer/ResignationPlanner
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const DEFAULT_ITEMS: Omit<ChecklistItem, 'id' | 'completed'>[] = [
  { label: 'Draft resignation letter' },
  { label: 'Schedule meeting with manager' },
  { label: 'Provide 2-week notice (or per contract)' },
  { label: 'Document handover notes' },
  { label: 'Return company assets (laptop, phone, keys)' },
  { label: 'Download/backup personal files' },
  { label: 'Update contact info with colleagues' },
  { label: 'Review final paycheck & unused PTO' },
  { label: 'Confirm benefits continuation (COBRA, etc.)' },
  { label: 'Request reference letters' },
  { label: 'Update LinkedIn profile' },
  { label: 'Set up forwarding for work email (if allowed)' }
];

export function ResignationPlanner() {
  const { t } = useTranslation();

  const [items, setItems] = useState<ChecklistItem[]>(
    DEFAULT_ITEMS.map(item => ({
      ...item,
      id: crypto?.randomUUID?.() ?? String(Math.random()),
      completed: false
    }))
  );

  const [newItem, setNewItem] = useState('');

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addItem = () => {
    if (!newItem.trim()) return;

    setItems([
      ...items,
      {
        id: crypto?.randomUUID?.() ?? String(Math.random()),
        label: newItem,
        completed: false
      }
    ]);
    setNewItem('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleExport = () => {
    const content = [
      '# Resignation Checklist',
      '',
      ...items.map(item => `- [${item.completed ? 'x' : ' '}] ${item.label}`),
      '',
      `Generated on ${new Date().toLocaleDateString()}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resignation-checklist.md';
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Checklist exported');
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Resignation Checklist</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount} of {items.length} completed ({Math.round(progress)}%)
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center space-x-3 flex-1">
                <Checkbox
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <Label
                  htmlFor={item.id}
                  className={`cursor-pointer flex-1 ${
                    item.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {item.label}
                </Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add custom item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
