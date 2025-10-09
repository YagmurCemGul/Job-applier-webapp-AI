/**
 * @fileoverview Risk Log component (Step 45)
 * @module components/onboarding/RiskLog
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Download } from 'lucide-react';
import { scoreRisk } from '@/services/onboarding/risk.service';
import type { RiskItem } from '@/types/onboarding.types';

interface Props {
  risks: RiskItem[];
  onAdd: (r: RiskItem) => void;
  onUpdate: (id: string, patch: Partial<RiskItem>) => void;
}

/**
 * Risk Log - track and score risks
 */
export function RiskLog({ risks, onAdd, onUpdate }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<Partial<RiskItem>>({
    title: '',
    probability: 3,
    impact: 3,
    mitigation: '',
    level: 'medium',
    status: 'open'
  });
  
  const handleAdd = () => {
    if (!editing.title?.trim()) return;
    
    const { level } = scoreRisk({
      probability: editing.probability as 1 | 2 | 3 | 4 | 5,
      impact: editing.impact as 1 | 2 | 3 | 4 | 5
    });
    
    onAdd({
      id: crypto.randomUUID(),
      title: editing.title,
      probability: editing.probability as 1 | 2 | 3 | 4 | 5,
      impact: editing.impact as 1 | 2 | 3 | 4 | 5,
      level,
      mitigation: editing.mitigation || '',
      owner: editing.owner,
      status: 'open'
    });
    
    setEditing({ title: '', probability: 3, impact: 3, mitigation: '', level: 'medium', status: 'open' });
  };
  
  const handleExportCSV = () => {
    const csv = [
      ['Title', 'Probability', 'Impact', 'Level', 'Mitigation', 'Status'].join(','),
      ...risks.map(r => [r.title, r.probability, r.impact, r.level, r.mitigation, r.status].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const levelColor = (level: RiskItem['level']) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('onboard.risks')}</CardTitle>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risks list */}
          <div className="space-y-2">
            {risks.map(risk => (
              <div key={risk.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{risk.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{risk.mitigation}</p>
                  </div>
                  <Badge className={levelColor(risk.level)}>{risk.level.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>P: {risk.probability}</span>
                  <span>I: {risk.impact}</span>
                  <span>Score: {risk.probability * risk.impact}</span>
                  <select
                    value={risk.status}
                    onChange={(e) => onUpdate(risk.id, { status: e.target.value as RiskItem['status'] })}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="open">Open</option>
                    <option value="watch">Watch</option>
                    <option value="mitigating">Mitigating</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add risk */}
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label>Risk Title</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Describe the risk..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Probability (1-5)</Label>
                <Input
                  type="range"
                  min={1}
                  max={5}
                  value={editing.probability}
                  onChange={(e) => {
                    const p = Number(e.target.value) as 1 | 2 | 3 | 4 | 5;
                    const { level } = scoreRisk({ probability: p, impact: editing.impact as 1 | 2 | 3 | 4 | 5 });
                    setEditing({ ...editing, probability: p, level });
                  }}
                  className="w-full"
                />
                <div className="text-sm text-center mt-1">{editing.probability}</div>
              </div>
              <div>
                <Label>Impact (1-5)</Label>
                <Input
                  type="range"
                  min={1}
                  max={5}
                  value={editing.impact}
                  onChange={(e) => {
                    const i = Number(e.target.value) as 1 | 2 | 3 | 4 | 5;
                    const { level } = scoreRisk({ probability: editing.probability as 1 | 2 | 3 | 4 | 5, impact: i });
                    setEditing({ ...editing, impact: i, level });
                  }}
                  className="w-full"
                />
                <div className="text-sm text-center mt-1">{editing.impact}</div>
              </div>
            </div>
            <div>
              <Label>Mitigation Plan</Label>
              <Textarea
                value={editing.mitigation}
                onChange={(e) => setEditing({ ...editing, mitigation: e.target.value })}
                placeholder="How will you mitigate this risk?"
                rows={2}
              />
            </div>
            <Button onClick={handleAdd} size="sm" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Risk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
