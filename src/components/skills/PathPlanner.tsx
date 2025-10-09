/**
 * Path Planner Component (Step 47)
 * Generate and schedule learning paths.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/stores/skills.store';
import { planPath } from '@/services/skills/pathPlanner.service';
import type { LevelKey } from '@/types/skills.types';
import { Target, Calendar, Mail } from 'lucide-react';

/**
 * Learning Path Planner with scheduling.
 */
export function PathPlanner() {
  const { t } = useTranslation();
  const { paths, upsertPath } = useSkills();
  const [targetLevel, setTargetLevel] = useState<LevelKey>('L5');
  const [dailyCap, setDailyCap] = useState(45);
  
  const latestPath = paths[0];

  const handlePlan = () => {
    const path = planPath(targetLevel, dailyCap);
    upsertPath(path);
  };

  return (
    <div className="space-y-6">
      {/* Planner Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Learning Path</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Level</label>
              <select
                value={targetLevel}
                onChange={e => setTargetLevel(e.target.value as LevelKey)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="L3">L3</option>
                <option value="L4">L4</option>
                <option value="L5">L5</option>
                <option value="L6">L6</option>
                <option value="L7">L7</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Daily Time Cap (min)</label>
              <Input
                type="number"
                value={dailyCap}
                onChange={e => setDailyCap(Number(e.target.value))}
                min="15"
                max="240"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePlan} className="gap-2">
              <Target className="h-4 w-4" />
              Generate Path
            </Button>
            <Button variant="outline" className="gap-2" disabled={!latestPath}>
              <Calendar className="h-4 w-4" />
              Schedule Study
            </Button>
            <Button variant="outline" className="gap-2" disabled={!latestPath}>
              <Mail className="h-4 w-4" />
              Email Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Path Preview */}
      {latestPath && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Path → {latestPath.targetLevel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant="outline">
                {Math.round(latestPath.totalMinutes / 60)}h {latestPath.totalMinutes % 60}m total
              </Badge>
            </div>
            
            <div className="space-y-2">
              {latestPath.steps.slice(0, 10).map((step, idx) => (
                <div key={step.id} className="flex items-center gap-3 p-2 border rounded">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.competencyKey}</p>
                    <p className="text-xs text-muted-foreground">Resource: {step.resourceId}</p>
                  </div>
                  <Badge variant="secondary">{step.estMinutes}m</Badge>
                </div>
              ))}
              {latestPath.steps.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... and {latestPath.steps.length - 10} more steps
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
