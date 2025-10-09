/**
 * @fileoverview Plan Editor component (Step 45)
 * @module components/onboarding/PlanEditor
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Circle, AlertCircle, XCircle } from 'lucide-react';
import { validateSmart } from '@/services/onboarding/smartGoal.service';
import type { Plan, SmartGoal, MilestoneKey, Priority } from '@/types/onboarding.types';

interface Props {
  plan?: Plan;
  onUpdate: (patch: Partial<Plan>) => void;
}

/**
 * Plan Editor - manage SMART goals by milestone
 */
export function PlanEditor({ plan, onUpdate }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MilestoneKey>('d30');
  const [editingGoal, setEditingGoal] = useState<Partial<SmartGoal>>({
    title: '',
    description: '',
    metric: '',
    target: '',
    priority: 'P1',
    milestone: activeTab,
    tags: [],
    status: 'not_started'
  });
  
  const goalsByMilestone = (milestone: MilestoneKey) => (plan?.goals ?? []).filter(g => g.milestone === milestone);
  
  const handleAddGoal = () => {
    const newGoal: SmartGoal = {
      id: crypto.randomUUID(),
      title: editingGoal.title || '',
      description: editingGoal.description || '',
      metric: editingGoal.metric,
      target: editingGoal.target,
      priority: editingGoal.priority as Priority,
      milestone: activeTab,
      status: 'not_started',
      tags: editingGoal.tags || []
    };
    
    const { ok } = validateSmart(newGoal);
    if (!ok) {
      alert('Goal should include metric/target and a due date or milestone.');
      return;
    }
    
    onUpdate({ goals: [...(plan?.goals ?? []), newGoal] });
    setEditingGoal({ title: '', description: '', metric: '', target: '', priority: 'P1', milestone: activeTab, tags: [], status: 'not_started' });
  };
  
  const handleUpdateGoal = (id: string, patch: Partial<SmartGoal>) => {
    onUpdate({
      goals: (plan?.goals ?? []).map(g => g.id === id ? { ...g, ...patch } : g)
    });
  };
  
  const getStatusIcon = (status: SmartGoal['status']) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Circle className="h-4 w-4 text-blue-600" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('onboard.plan')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MilestoneKey)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="d30">30 Days</TabsTrigger>
              <TabsTrigger value="d60">60 Days</TabsTrigger>
              <TabsTrigger value="d90">90 Days</TabsTrigger>
            </TabsList>
            
            {(['d30', 'd60', 'd90'] as MilestoneKey[]).map(milestone => (
              <TabsContent key={milestone} value={milestone} className="space-y-4 mt-4">
                {/* Goals list */}
                <div className="space-y-2">
                  {goalsByMilestone(milestone).map(goal => (
                    <div key={goal.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          {getStatusIcon(goal.status)}
                          <div className="flex-1">
                            <h4 className="font-medium">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                            {goal.metric && (
                              <p className="text-sm mt-1">
                                <span className="font-medium">Metric:</span> {goal.metric} → {goal.target}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={goal.priority === 'P0' ? 'default' : 'secondary'}>
                          {goal.priority}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={goal.status}
                          onChange={(e) => handleUpdateGoal(goal.id, { status: e.target.value as SmartGoal['status'] })}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="blocked">Blocked</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add new goal */}
                <div className="border-t pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editingGoal.title}
                        onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                        placeholder="Goal title..."
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <select
                        value={editingGoal.priority}
                        onChange={(e) => setEditingGoal({ ...editingGoal, priority: e.target.value as Priority })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="P0">P0 - Critical</option>
                        <option value="P1">P1 - High</option>
                        <option value="P2">P2 - Medium</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editingGoal.description}
                      onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                      placeholder="Goal description..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Metric</Label>
                      <Input
                        value={editingGoal.metric}
                        onChange={(e) => setEditingGoal({ ...editingGoal, metric: e.target.value })}
                        placeholder="e.g., Response time"
                      />
                    </div>
                    <div>
                      <Label>Target</Label>
                      <Input
                        value={editingGoal.target}
                        onChange={(e) => setEditingGoal({ ...editingGoal, target: e.target.value })}
                        placeholder="e.g., < 200ms"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddGoal} size="sm" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
