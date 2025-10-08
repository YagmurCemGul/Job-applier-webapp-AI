/**
 * Panel Editor Component
 * Add/remove/edit interview panelists with roles and requirements
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import type { Panelist } from '@/types/interview.types';
import { Plus, Trash2, User } from 'lucide-react';

interface Props {
  panel: Panelist[];
  onChange: (panel: Panelist[]) => void;
}

export default function PanelEditor({ panel, onChange }: Props) {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;

    const panelist: Panelist = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole.trim() || undefined,
      required: false,
    };

    onChange([...panel, panelist]);
    setNewName('');
    setNewEmail('');
    setNewRole('');
  };

  const handleRemove = (id: string) => {
    onChange(panel.filter(p => p.id !== id));
  };

  const handleToggleRequired = (id: string) => {
    onChange(
      panel.map(p => (p.id === id ? { ...p, required: !p.required } : p))
    );
  };

  return (
    <div className="space-y-3">
      {/* Existing Panel Members */}
      {panel.length > 0 && (
        <div className="space-y-2">
          {panel.map(p => (
            <Card key={p.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.email}
                      {p.role && ` • ${p.role}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Checkbox
                      id={`required-${p.id}`}
                      checked={p.required}
                      onCheckedChange={() => handleToggleRequired(p.id)}
                    />
                    <Label
                      htmlFor={`required-${p.id}`}
                      className="text-xs cursor-pointer"
                    >
                      Required
                    </Label>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Panelist */}
      <Card className="p-3 bg-muted/50">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Name *"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Input
              placeholder="Email *"
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Role (optional)"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || !newEmail.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
