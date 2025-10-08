/**
 * Interviews Page
 * Main container for interview management with filters and list view
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useInterviews } from '@/stores/interviews.store';
import InterviewCreateDialog from './InterviewCreateDialog';
import type { InterviewStage } from '@/types/interview.types';
import { Calendar, Users, FileText, Mail, Award, Plus, Search } from 'lucide-react';

export default function InterviewsPage() {
  const { t } = useTranslation();
  const { items } = useInterviews();
  const [openCreate, setOpenCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<InterviewStage | 'all'>('all');

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchesSearch =
        search.length === 0 ||
        i.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        i.role.toLowerCase().includes(search.toLowerCase()) ||
        i.company.toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageFilter === 'all' || i.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [items, search, stageFilter]);

  const stageGroups = useMemo(() => {
    const groups: Record<InterviewStage, typeof items> = {
      planned: [],
      scheduled: [],
      in_progress: [],
      completed: [],
      canceled: [],
    };
    filtered.forEach(i => groups[i.stage].push(i));
    return groups;
  }, [filtered]);

  const stages: InterviewStage[] = ['planned', 'scheduled', 'in_progress', 'completed', 'canceled'];

  return (
    <div className="space-y-4 p-6">
      {/* Toolbar */}
      <div className="flex gap-3 items-center flex-wrap">
        <Button onClick={() => setOpenCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('interview.create', 'Create Interview')}
        </Button>

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by candidate, role, or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={stageFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStageFilter('all')}
          >
            All ({items.length})
          </Button>
          {stages.map(stage => (
            <Button
              key={stage}
              variant={stageFilter === stage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStageFilter(stage)}
            >
              {t(`interview.stage.${stage}`, stage)} ({stageGroups[stage].length})
            </Button>
          ))}
        </div>
      </div>

      {/* Grouped List */}
      <div className="space-y-6">
        {stages.map(stage => {
          const group = stageGroups[stage];
          if (group.length === 0 && stageFilter !== 'all' && stageFilter !== stage) return null;

          return (
            <div key={stage}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {t(`interview.stage.${stage}`, stage)}
                <Badge variant="secondary">{group.length}</Badge>
              </h2>

              {group.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No interviews in this stage
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.map(interview => (
                    <Card
                      key={interview.id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => (window.location.href = `/interviews/${interview.id}`)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{interview.candidateName}</h3>
                            <p className="text-sm text-muted-foreground">{interview.role}</p>
                            <p className="text-xs text-muted-foreground">{interview.company}</p>
                          </div>
                          <Badge>{t(`interview.stage.${interview.stage}`, interview.stage)}</Badge>
                        </div>

                        {interview.meeting?.whenISO && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(interview.meeting.whenISO).toLocaleString()}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {interview.panel.length}
                          </div>
                          {interview.scoreSubmissions.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {interview.scoreSubmissions.length}
                            </div>
                          )}
                          {interview.transcriptId && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Transcript
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <InterviewCreateDialog open={openCreate} onOpenChange={setOpenCreate} />
    </div>
  );
}
