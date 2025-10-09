/**
 * @fileoverview Sequence Builder Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useOutreach } from '@/stores/outreach.store';
import type { Sequence, SeqStep } from '@/types/outreach.types';
import { Layers, Plus, Trash2 } from 'lucide-react';

/**
 * Sequence builder with draggable steps and rules.
 */
export function SequenceBuilder() {
  const { t } = useTranslation();
  const { sequences, upsertSequence } = useOutreach();
  const [selected, setSelected] = useState<Sequence | null>(sequences[0] || null);

  const handleNew = () => {
    const newSeq: Sequence = {
      id: crypto.randomUUID(),
      name: 'New Sequence',
      steps: [],
      rules: { throttlePerHour: 30, dailyCap: 150, quietHours: true },
      ab: { enabled: false, goal: 'reply_rate', variants: { A: {}, B: {} } },
    };
    setSelected(newSeq);
  };

  const handleSave = () => {
    if (!selected) return;
    upsertSequence(selected);
    alert('Sequence saved');
  };

  const handleAddStep = (kind: SeqStep['kind']) => {
    if (!selected) return;
    const newStep: SeqStep = {
      id: crypto.randomUUID(),
      kind,
      subject: kind === 'email' ? 'Subject here' : undefined,
      html: kind === 'email' ? '<p>Body here</p>' : undefined,
      waitDays: kind === 'wait' ? 3 : undefined,
      channel: kind === 'email' ? 'gmail' : undefined,
      stopOnReply: true,
      stopOnUnsub: true,
    };
    setSelected({ ...selected, steps: [...selected.steps, newStep] });
  };

  const handleRemoveStep = (id: string) => {
    if (!selected) return;
    setSelected({ ...selected, steps: selected.steps.filter(s => s.id !== id) });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Sequence List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              <Layers className="inline mr-2 h-5 w-5" />
              Sequences
            </span>
            <Button onClick={handleNew} variant="outline" size="sm">
              New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sequences.map(seq => (
              <div
                key={seq.id}
                className={`p-2 border rounded cursor-pointer ${selected?.id === seq.id ? 'bg-muted' : ''}`}
                onClick={() => setSelected(seq)}
              >
                <p className="font-medium">{seq.name}</p>
                <p className="text-xs text-muted-foreground">{seq.steps.length} steps</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Builder</span>
            <Button onClick={handleSave} variant="default" size="sm">
              Save
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <p className="text-sm text-muted-foreground">Select a sequence or create a new one</p>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="seq-name">Sequence Name</Label>
                <Input
                  id="seq-name"
                  value={selected.name}
                  onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Steps</Label>
                <div className="space-y-2 mt-2">
                  {selected.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center justify-between border p-2 rounded">
                      <div>
                        <Badge variant="outline" className="mr-2">
                          {idx + 1}
                        </Badge>
                        <span className="font-medium">{step.kind}</span>
                        {step.kind === 'email' && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {step.subject}
                          </span>
                        )}
                        {step.kind === 'wait' && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {step.waitDays} days
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveStep(step.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddStep('email')}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddStep('wait')}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Wait
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddStep('task_manual')}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Manual Task
                  </Button>
                </div>
              </div>

              <div>
                <Label>Rules</Label>
                <div className="space-y-2 mt-2">
                  <div>
                    <Label htmlFor="throttle" className="text-xs">
                      Throttle per hour
                    </Label>
                    <Input
                      id="throttle"
                      type="number"
                      value={selected.rules?.throttlePerHour || 30}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          rules: { ...selected.rules!, throttlePerHour: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dailyCap" className="text-xs">
                      Daily cap
                    </Label>
                    <Input
                      id="dailyCap"
                      type="number"
                      value={selected.rules?.dailyCap || 150}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          rules: { ...selected.rules!, dailyCap: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
