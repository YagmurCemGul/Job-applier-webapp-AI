/**
 * Role Frameworks Component (Step 47)
 * View and browse role frameworks and competency ladders.
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSkills } from '@/stores/skills.store';
import { Link2 } from 'lucide-react';
import type { LevelKey } from '@/types/skills.types';

/**
 * Role Frameworks viewer with competency bars.
 */
export function RoleFrameworks() {
  const { t } = useTranslation();
  const { frameworks } = useSkills();
  
  const fw = frameworks[0];
  if (!fw) return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">No frameworks loaded. Seed default framework first.</p>
      </CardContent>
    </Card>
  );

  const levels = fw.ladder;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{fw.role} — Career Ladder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {levels.map(level => (
              <Badge key={level} variant="outline">{level}</Badge>
            ))}
          </div>

          <div className="space-y-6">
            {fw.competencies.map(comp => (
              <div key={comp.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{comp.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{comp.kind}</p>
                  </div>
                  {comp.rubricKey && (
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Link2 className="h-4 w-4" />
                      {comp.rubricKey} rubric
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {levels.map(level => {
                    const expected = comp.expectedByLevel[level] ?? 0;
                    return (
                      <div key={level} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{level}</div>
                        <Progress value={expected * 25} className="h-2" />
                        <div className="text-xs mt-1">{expected}/4</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
