/**
 * Skill Graph Component (Step 47)
 * Visualize skill↔goal↔evidence connections.
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSkills } from '@/stores/skills.store';
import { competencyProgress } from '@/services/skills/skillGraph.service';
import { Link2, ExternalLink } from 'lucide-react';

/**
 * Skill↔Goal↔Evidence graph viewer.
 */
export function SkillGraph() {
  const { t } = useTranslation();
  const { frameworks, evidence } = useSkills();
  
  const fw = frameworks[0];
  if (!fw) return null;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Competencies Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Competencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fw.competencies.map(comp => {
              const prog = competencyProgress(comp.key);
              return (
                <div key={comp.key} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{comp.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {prog.count} evidence • Δ {prog.delta}
                    </p>
                  </div>
                  <Badge variant={prog.count > 0 ? 'default' : 'outline'}>
                    {prog.count > 0 ? 'Linked' : 'No evidence'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Evidence Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {evidence.length === 0 ? (
              <p className="text-muted-foreground text-sm">No evidence linked yet.</p>
            ) : (
              evidence.slice(0, 10).map(link => (
                <div key={link.id} className="flex items-start justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{link.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {link.competencyKey} • Δ {link.delta ?? 0}
                    </p>
                  </div>
                  {link.url && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
