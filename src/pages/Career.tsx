/**
 * Career Page (Step 47)
 * Skill Matrix & Career Ladder Navigator with tabs.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SkillDashboard } from '@/components/skills/SkillDashboard';
import { RoleFrameworks } from '@/components/skills/RoleFrameworks';
import { SkillMatrix } from '@/components/skills/SkillMatrix';
import { SkillGraph } from '@/components/skills/SkillGraph';
import { PathPlanner } from '@/components/skills/PathPlanner';
import { PracticeCenter } from '@/components/skills/PracticeCenter';
import { AssessmentCenter } from '@/components/skills/AssessmentCenter';
import { BadgeWall } from '@/components/skills/BadgeWall';
import { StudyPlanner } from '@/components/skills/StudyPlanner';
import { GrowthPacketActions } from '@/components/skills/GrowthPacketActions';
import { seedDefaultFramework } from '@/services/skills/frameworks.service';

/**
 * Career Development page with skill matrix, learning paths, and growth planning.
 */
export default function Career() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Seed framework on mount
  useEffect(() => {
    seedDefaultFramework();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('skills.dashboard')}</h1>
        <p className="text-muted-foreground">
          Track skills, plan learning paths, earn badges, and export growth packets.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="dashboard">{t('skills.dashboard')}</TabsTrigger>
          <TabsTrigger value="frameworks">{t('skills.frameworks')}</TabsTrigger>
          <TabsTrigger value="matrix">{t('skills.matrix')}</TabsTrigger>
          <TabsTrigger value="graph">{t('skills.graph')}</TabsTrigger>
          <TabsTrigger value="path">{t('skills.path')}</TabsTrigger>
          <TabsTrigger value="practice">{t('skills.practice')}</TabsTrigger>
          <TabsTrigger value="assessments">{t('skills.assessments')}</TabsTrigger>
          <TabsTrigger value="badges">{t('skills.badges')}</TabsTrigger>
          <TabsTrigger value="study">{t('skills.study')}</TabsTrigger>
          <TabsTrigger value="packet">{t('skills.packet')}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SkillDashboard
            onPlanPath={() => setActiveTab('path')}
            onStartPractice={() => setActiveTab('practice')}
            onReviewCards={() => setActiveTab('study')}
            onExportPacket={() => setActiveTab('packet')}
          />
        </TabsContent>

        <TabsContent value="frameworks">
          <RoleFrameworks />
        </TabsContent>

        <TabsContent value="matrix">
          <SkillMatrix />
        </TabsContent>

        <TabsContent value="graph">
          <SkillGraph />
        </TabsContent>

        <TabsContent value="path">
          <PathPlanner />
        </TabsContent>

        <TabsContent value="practice">
          <PracticeCenter />
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentCenter />
        </TabsContent>

        <TabsContent value="badges">
          <BadgeWall />
        </TabsContent>

        <TabsContent value="study">
          <StudyPlanner />
        </TabsContent>

        <TabsContent value="packet">
          <GrowthPacketActions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
