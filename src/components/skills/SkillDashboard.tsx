/**
 * Skill Dashboard Component (Step 47)
 * KPIs and quick actions for skill development.
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSkills } from '@/stores/skills.store';
import { dueCards } from '@/services/skills/spacedRep.service';
import {
  Target,
  Book,
  Award,
  Calendar,
  Download,
  Brain,
} from 'lucide-react';

interface SkillDashboardProps {
  onPlanPath: () => void;
  onStartPractice: () => void;
  onReviewCards: () => void;
  onExportPacket: () => void;
}

/**
 * Skill Development Dashboard with KPIs and quick actions.
 */
export function SkillDashboard({
  onPlanPath,
  onStartPractice,
  onReviewCards,
  onExportPacket,
}: SkillDashboardProps) {
  const { t } = useTranslation();
  const { frameworks, inventory, badges, paths } = useSkills();
  
  const fw = frameworks[0];
  const targetLevel = 'L5'; // TODO: make dynamic
  const atBar = inventory.filter(i => {
    const comp = fw?.competencies.find(c => c.key === i.competencyKey);
    return comp && i.selfLevel >= (comp.expectedByLevel[targetLevel] ?? 0);
  }).length;
  
  const latestPath = paths[0];
  const thisWeekMinutes = latestPath ? Math.min(latestPath.totalMinutes, 300) : 0;
  const dueCount = dueCards().length;
  const badgeCount = badges.length;

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          📚 {t('skills.educational')}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills at Bar</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atBar}/{fw?.competencies.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">for {targetLevel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study This Week</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(thisWeekMinutes / 60)}h {thisWeekMinutes % 60}m</div>
            <p className="text-xs text-muted-foreground">planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Cards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueCount}</div>
            <p className="text-xs text-muted-foreground">flashcards to review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badgeCount}</div>
            <p className="text-xs text-muted-foreground">achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={onPlanPath} className="gap-2">
            <Target className="h-4 w-4" />
            {t('skills.planPath')}
          </Button>
          <Button onClick={onStartPractice} variant="outline" className="gap-2">
            <Book className="h-4 w-4" />
            Start Practice
          </Button>
          <Button onClick={onReviewCards} variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            {t('skills.reviewCards')}
          </Button>
          <Button onClick={onExportPacket} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t('skills.exportPacket')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
