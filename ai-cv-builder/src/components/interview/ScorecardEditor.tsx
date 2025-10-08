/**
 * Scorecard Editor Component
 * Create and edit scorecard templates with dimensions and rubrics
 */

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useScorecards } from '@/stores/scorecards.store';
import type { ScorecardTemplate, ScoreDimension, Scale } from '@/types/scorecard.types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ScorecardTemplate;
}

export default function ScorecardEditor({ open, onOpenChange, template }: Props) {
  const { upsertTemplate } = useScorecards();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dimensions, setDimensions] = useState<ScoreDimension[]>([]);
  const [rubric, setRubric] = useState<Record<Scale, string>>({
    1: 'Does not meet expectations',
    2: 'Partially meets expectations',
    3: 'Meets expectations',
    4: 'Exceeds expectations',
    5: 'Significantly exceeds expectations',
  });

  useEffect(() => {
    if (template) {
      setName(template.name);
      setRole(template.role || '');
      setDimensions(template.dimensions);
      setRubric(template.rubric || rubric);
    } else {
      resetForm();
    }
  }, [template, open]);

  const resetForm = () => {
    setName('');
    setRole('');
    setDimensions([]);
    setRubric({
      1: 'Does not meet expectations',
      2: 'Partially meets expectations',
      3: 'Meets expectations',
      4: 'Exceeds expectations',
      5: 'Significantly exceeds expectations',
    });
  };

  const handleAddDimension = () => {
    const newDim: ScoreDimension = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      name: '',
      weight: 1.0,
    };
    setDimensions([...dimensions, newDim]);
  };

  const handleUpdateDimension = (id: string, updates: Partial<ScoreDimension>) => {
    setDimensions(dimensions.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const handleRemoveDimension = (id: string) => {
    setDimensions(dimensions.filter(d => d.id !== id));
  };

  const handleSave = () => {
    const scorecard: ScorecardTemplate = {
      id: template?.id || crypto?.randomUUID?.() || String(Date.now()),
      name,
      role: role || undefined,
      dimensions: dimensions.filter(d => d.name.trim()),
      rubric,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertTemplate(scorecard);
    onOpenChange(false);
    resetForm();
  };

  const isValid = name.trim() && dimensions.some(d => d.name.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Scorecard Template' : 'Create Scorecard Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="templateName">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="templateName"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Software Engineering Interview"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateRole">Role (optional)</Label>
              <Input
                id="templateRole"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="Senior Software Engineer"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Evaluation Dimensions <span className="text-destructive">*</span>
              </Label>
              <Button onClick={handleAddDimension} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Dimension
              </Button>
            </div>

            {dimensions.map(dim => (
              <Card key={dim.id} className="p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_2fr_100px_auto]">
                  <Input
                    placeholder="Name"
                    value={dim.name}
                    onChange={e => handleUpdateDimension(dim.id, { name: e.target.value })}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={dim.description || ''}
                    onChange={e =>
                      handleUpdateDimension(dim.id, { description: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Weight"
                    value={dim.weight || 1}
                    onChange={e =>
                      handleUpdateDimension(dim.id, { weight: Number(e.target.value) })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDimension(dim.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {dimensions.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                Add dimensions to evaluate candidates on
              </Card>
            )}
          </div>

          {/* Rubric */}
          <div className="space-y-3">
            <Label>Rating Scale Rubric</Label>
            {([1, 2, 3, 4, 5] as Scale[]).map(scale => (
              <div key={scale} className="flex items-center gap-3">
                <div className="w-12 text-center font-semibold">{scale}</div>
                <Input
                  value={rubric[scale]}
                  onChange={e => setRubric({ ...rubric, [scale]: e.target.value })}
                  placeholder={`Description for ${scale}`}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {template ? 'Update' : 'Create'} Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
