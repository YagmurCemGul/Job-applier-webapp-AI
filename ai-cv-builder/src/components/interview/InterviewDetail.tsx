/**
 * Interview Detail View
 * Main detail page with tabs for all interview aspects
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInterviews } from '@/stores/interviews.store';
import type { Interview } from '@/types/interview.types';
import OverviewTab from './tabs/OverviewTab';
import ScheduleTab from './tabs/ScheduleTab';
import ScorecardsTab from './tabs/ScorecardsTab';
import NotesTranscriptTab from './tabs/NotesTranscriptTab';
import FilesTab from './tabs/FilesTab';
import EmailsTab from './tabs/EmailsTab';
import OfferPrepDialog from './OfferPrepDialog';
import { Calendar, Users, Award, FileText, Mail, Files, ArrowLeft, DollarSign } from 'lucide-react';

export default function InterviewDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { getById, setStage } = useInterviews();
  const [interview, setInterview] = useState<Interview | undefined>();
  const [openOfferPrep, setOpenOfferPrep] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      const item = getById(id);
      setInterview(item);
    }
  }, [id, getById]);

  if (!interview) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Interview not found
      </div>
    );
  }

  const handleStageChange = (stage: Interview['stage']) => {
    setStage(interview.id, stage);
    setInterview({ ...interview, stage });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.history.back())}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{interview.candidateName}</h1>
            <p className="text-lg text-muted-foreground">{interview.role}</p>
            <p className="text-sm text-muted-foreground">{interview.company}</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={interview.stage === 'completed' ? 'default' : 'secondary'}>
              {t(`interview.stage.${interview.stage}`, interview.stage)}
            </Badge>

            <Button variant="outline" size="sm" onClick={() => setOpenOfferPrep(true)}>
              <DollarSign className="w-4 h-4 mr-2" />
              {t('interview.offerPrep', 'Offer Prep')}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {interview.panel.length} panelists
          </div>
          {interview.scoreSubmissions.length > 0 && (
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              {interview.scoreSubmissions.length} scores
            </div>
          )}
          {interview.meeting?.whenISO && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(interview.meeting.whenISO).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            {t('interview.schedule', 'Schedule')}
          </TabsTrigger>
          <TabsTrigger value="scorecards">
            <Award className="w-4 h-4 mr-2" />
            {t('interview.scorecards', 'Scorecards')}
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="w-4 h-4 mr-2" />
            {t('interview.notes', 'Notes & Transcript')}
          </TabsTrigger>
          <TabsTrigger value="files">
            <Files className="w-4 h-4 mr-2" />
            {t('interview.files', 'Files')}
          </TabsTrigger>
          <TabsTrigger value="emails">
            <Mail className="w-4 h-4 mr-2" />
            {t('interview.emails', 'Emails')}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <OverviewTab interview={interview} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab interview={interview} onUpdate={setInterview} />
          </TabsContent>

          <TabsContent value="scorecards">
            <ScorecardsTab interview={interview} onUpdate={setInterview} />
          </TabsContent>

          <TabsContent value="notes">
            <NotesTranscriptTab interview={interview} onUpdate={setInterview} />
          </TabsContent>

          <TabsContent value="files">
            <FilesTab interview={interview} />
          </TabsContent>

          <TabsContent value="emails">
            <EmailsTab interview={interview} />
          </TabsContent>
        </div>
      </Tabs>

      <OfferPrepDialog
        open={openOfferPrep}
        onOpenChange={setOpenOfferPrep}
        interview={interview}
      />
    </div>
  );
}
