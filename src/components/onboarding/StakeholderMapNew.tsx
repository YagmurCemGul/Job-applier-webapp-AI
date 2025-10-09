/**
 * @fileoverview Stakeholder Map component (Step 45)
 * @module components/onboarding/StakeholderMapNew
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { quadrant } from '@/services/onboarding/stakeholders.service';
import type { Stakeholder } from '@/types/onboarding.types';

interface Props {
  stakeholders: Stakeholder[];
  onAdd: (s: Stakeholder) => void;
}

/**
 * Stakeholder Map - power/interest matrix
 */
export function StakeholderMapNew({ stakeholders, onAdd }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<Partial<Stakeholder>>({
    name: '',
    email: '',
    role: '',
    power: 3,
    interest: 3
  });
  
  const handleAdd = () => {
    if (!editing.name?.trim()) return;
    
    onAdd({
      id: crypto.randomUUID(),
      name: editing.name,
      email: editing.email,
      role: editing.role,
      org: editing.org,
      power: editing.power as 1 | 2 | 3 | 4 | 5,
      interest: editing.interest as 1 | 2 | 3 | 4 | 5,
      notes: editing.notes
    });
    
    setEditing({ name: '', email: '', role: '', power: 3, interest: 3 });
  };
  
  const byQuadrant = (q: ReturnType<typeof quadrant>) => stakeholders.filter(s => quadrant(s) === q);
  
  const quadrantColor = (q: ReturnType<typeof quadrant>) => {
    switch (q) {
      case 'manage_closely': return 'bg-red-50 border-red-200';
      case 'keep_satisfied': return 'bg-amber-50 border-amber-200';
      case 'keep_informed': return 'bg-blue-50 border-blue-200';
      case 'monitor': return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Matrix quadrants */}
      <div className="grid grid-cols-2 gap-4">
        {(['manage_closely', 'keep_satisfied', 'keep_informed', 'monitor'] as const).map(q => (
          <Card key={q} className={quadrantColor(q)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm capitalize">{q.replace('_', ' ')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {byQuadrant(q).map(s => (
                  <div key={s.id} className="text-sm">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-muted-foreground">{s.role}</div>
                    <div className="text-xs">P:{s.power} / I:{s.interest}</div>
                  </div>
                ))}
                {byQuadrant(q).length === 0 && (
                  <p className="text-sm text-muted-foreground">No stakeholders</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Add stakeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Add Stakeholder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Full name..."
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                placeholder="email@company.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Role</Label>
              <Input
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                placeholder="e.g., Manager"
              />
            </div>
            <div>
              <Label>Org</Label>
              <Input
                value={editing.org}
                onChange={(e) => setEditing({ ...editing, org: e.target.value })}
                placeholder="e.g., Engineering"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Power (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={editing.power}
                onChange={(e) => setEditing({ ...editing, power: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
              />
            </div>
            <div>
              <Label>Interest (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={editing.interest}
                onChange={(e) => setEditing({ ...editing, interest: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              placeholder="Additional context..."
              rows={2}
            />
          </div>
          <Button onClick={handleAdd} size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Stakeholder
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
