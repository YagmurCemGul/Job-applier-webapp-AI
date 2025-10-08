/**
 * @fileoverview Relocation and visa checklist for Step 37
 * @module components/offer/RelocationVisaChecklist
 */

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const VISA_ITEMS: Omit<ChecklistItem, 'id' | 'completed'>[] = [
  { label: 'Passport valid for 6+ months' },
  { label: 'Visa application form completed' },
  { label: 'Employer sponsorship letter' },
  { label: 'Educational certificates & transcripts' },
  { label: 'Employment verification letters' },
  { label: 'Medical examination (if required)' },
  { label: 'Police clearance certificate' },
  { label: 'Visa fees paid' },
  { label: 'Embassy/Consulate appointment scheduled' },
  { label: 'Travel insurance arranged' }
];

const RELOCATION_ITEMS: Omit<ChecklistItem, 'id' | 'completed'>[] = [
  { label: 'Housing search & lease signed' },
  { label: 'Moving company or shipment arranged' },
  { label: 'Bank account in new location' },
  { label: 'Driver\'s license / ID transfer' },
  { label: 'Utilities setup (electricity, internet, etc.)' },
  { label: 'School enrollment (if applicable)' },
  { label: 'Healthcare provider identified' },
  { label: 'Mail forwarding setup' },
  { label: 'Vehicle registration transfer (if applicable)' },
  { label: 'Update address with institutions' },
  { label: 'Research local tax requirements' },
  { label: 'Emergency contacts & local support network' }
];

export function RelocationVisaChecklist() {
  const [visaItems, setVisaItems] = useState<ChecklistItem[]>(
    VISA_ITEMS.map(item => ({
      ...item,
      id: crypto?.randomUUID?.() ?? String(Math.random()),
      completed: false
    }))
  );

  const [relocationItems, setRelocationItems] = useState<ChecklistItem[]>(
    RELOCATION_ITEMS.map(item => ({
      ...item,
      id: crypto?.randomUUID?.() ?? String(Math.random()),
      completed: false
    }))
  );

  const [newVisa, setNewVisa] = useState('');
  const [newRelocation, setNewRelocation] = useState('');

  const toggleItem = (items: ChecklistItem[], setItems: (items: ChecklistItem[]) => void, id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addItem = (items: ChecklistItem[], setItems: (items: ChecklistItem[]) => void, label: string, setter: (v: string) => void) => {
    if (!label.trim()) return;
    setItems([
      ...items,
      {
        id: crypto?.randomUUID?.() ?? String(Math.random()),
        label,
        completed: false
      }
    ]);
    setter('');
  };

  const removeItem = (items: ChecklistItem[], setItems: (items: ChecklistItem[]) => void, id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleExport = () => {
    const content = [
      '# Relocation & Visa Checklist',
      '',
      '## Visa/Immigration',
      ...visaItems.map(item => `- [${item.completed ? 'x' : ' '}] ${item.label}`),
      '',
      '## Relocation',
      ...relocationItems.map(item => `- [${item.completed ? 'x' : ' '}] ${item.label}`),
      '',
      `Generated on ${new Date().toLocaleDateString()}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relocation-visa-checklist.md';
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Checklist exported');
  };

  const renderChecklist = (
    items: ChecklistItem[],
    setItems: (items: ChecklistItem[]) => void,
    newItem: string,
    setNewItem: (v: string) => void
  ) => {
    const completed = items.filter(i => i.completed).length;
    const progress = items.length > 0 ? (completed / items.length) * 100 : 0;

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {completed} of {items.length} completed ({Math.round(progress)}%)
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
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
                  onCheckedChange={() => toggleItem(items, setItems, item.id)}
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
                onClick={() => removeItem(items, setItems, item.id)}
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
            onKeyPress={(e) => e.key === 'Enter' && addItem(items, setItems, newItem, setNewItem)}
          />
          <Button onClick={() => addItem(items, setItems, newItem, setNewItem)} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relocation & Visa Checklist</CardTitle>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visa" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visa">Visa/Immigration</TabsTrigger>
            <TabsTrigger value="relocation">Relocation</TabsTrigger>
          </TabsList>

          <TabsContent value="visa" className="mt-4">
            {renderChecklist(visaItems, setVisaItems, newVisa, setNewVisa)}
          </TabsContent>

          <TabsContent value="relocation" className="mt-4">
            {renderChecklist(relocationItems, setRelocationItems, newRelocation, setNewRelocation)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
