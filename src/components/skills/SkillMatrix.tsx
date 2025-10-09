/**
 * Skill Matrix Component (Step 47)
 * Editable grid for self-assessment with evidence inference.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useSkills } from '@/stores/skills.store';
import { inferInventoryFromEvidence, upsertInventoryRow } from '@/services/skills/inventory.service';
import { Sparkles } from 'lucide-react';

/**
 * Skill Matrix with self-assessment and inference.
 */
export function SkillMatrix() {
  const { t } = useTranslation();
  const { frameworks, inventory } = useSkills();
  const [editKey, setEditKey] = useState<string | null>(null);
  
  const fw = frameworks[0];
  if (!fw) return null;

  const handleInfer = (competencyKey: string) => {
    const inferred = inferInventoryFromEvidence(competencyKey);
    const existing = inventory.find(i => i.competencyKey === competencyKey);
    upsertInventoryRow({
      competencyKey,
      selfLevel: inferred.selfLevel ?? existing?.selfLevel ?? 0,
      confidencePct: inferred.confidencePct ?? existing?.confidencePct ?? 0,
      lastEvidenceAt: inferred.lastEvidenceAt ?? existing?.lastEvidenceAt,
      notes: existing?.notes
    });
  };

  const handleUpdate = (competencyKey: string, field: 'selfLevel' | 'confidencePct', value: number) => {
    const existing = inventory.find(i => i.competencyKey === competencyKey);
    upsertInventoryRow({
      competencyKey,
      selfLevel: existing?.selfLevel ?? 0,
      confidencePct: existing?.confidencePct ?? 0,
      notes: existing?.notes,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Matrix — Self-Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fw.competencies.map(comp => {
            const inv = inventory.find(i => i.competencyKey === comp.key);
            const isEdit = editKey === comp.key;
            
            return (
              <div 
                key={comp.key} 
                className="grid grid-cols-[1fr,auto,auto,auto] gap-4 items-center p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{comp.title}</h4>
                  <p className="text-sm text-muted-foreground">{comp.key}</p>
                </div>
                
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <label className="text-xs text-muted-foreground">Level (0-4)</label>
                  {isEdit ? (
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      value={inv?.selfLevel ?? 0}
                      onChange={e => handleUpdate(comp.key, 'selfLevel', Number(e.target.value))}
                      className="w-20"
                    />
                  ) : (
                    <div className="text-lg font-medium">{inv?.selfLevel ?? 0}/4</div>
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-[140px]">
                  <label className="text-xs text-muted-foreground">Confidence</label>
                  {isEdit ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={inv?.confidencePct ?? 0}
                      onChange={e => handleUpdate(comp.key, 'confidencePct', Number(e.target.value))}
                      className="w-20"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Progress value={inv?.confidencePct ?? 0} className="w-20" />
                      <span className="text-sm">{inv?.confidencePct ?? 0}%</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditKey(isEdit ? null : comp.key)}
                  >
                    {isEdit ? 'Done' : 'Edit'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleInfer(comp.key)}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Infer
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
