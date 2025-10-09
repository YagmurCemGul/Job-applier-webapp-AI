/**
 * @fileoverview Apply Page - Main hub for auto-apply workflow
 * @module pages/Apply
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutoApplyDashboard } from '@/components/apply/AutoApplyDashboard';
import { JobIntakeCard } from '@/components/apply/JobIntakeCard';
import { ScreenerQAGenerator } from '@/components/apply/ScreenerQAGenerator';
import { VariantPicker } from '@/components/apply/VariantPicker';
import { CoverageMeter } from '@/components/apply/CoverageMeter';
import { FieldMapperUI } from '@/components/apply/FieldMapperUI';
import { AutofillRunner } from '@/components/apply/AutofillRunner';
import { ReviewAndSubmit } from '@/components/apply/ReviewAndSubmit';
import { RunHistory } from '@/components/apply/RunHistory';
import { SettingsSheet } from '@/components/apply/SettingsSheet';
import { AttachmentVault } from '@/components/apply/AttachmentVault';
import { PostingPreview } from '@/components/apply/PostingPreview';
import { QAPolicyWarnings } from '@/components/apply/QAPolicyWarnings';
import { useApply } from '@/stores/apply.store';
import { useSite } from '@/stores/site.store';
import type { JobPosting, Screener, VariantDoc, ApplyRun } from '@/types/apply.types';
import type { FieldMapping } from '@/types/autofill.types';

export default function Apply() {
  const { t } = useTranslation();
  const { postings, runs, upsertRun, updateRun } = useApply();
  const { profile } = useSite();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPosting, setCurrentPosting] = useState<JobPosting | null>(null);
  const [currentRun, setCurrentRun] = useState<ApplyRun | null>(null);
  const [screeners, setScreeners] = useState<Screener[]>([]);
  const [selectedResume, setSelectedResume] = useState<VariantDoc>();
  const [selectedCover, setSelectedCover] = useState<VariantDoc>();
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);
  
  // Create a new run when a posting is selected
  const handlePostingSelect = (posting: JobPosting) => {
    setCurrentPosting(posting);
    setScreeners(posting.questions);
    
    const run: ApplyRun = {
      id: crypto.randomUUID(),
      postingId: posting.id,
      stage: 'qa',
      coverage: { keywordMatchPct: 0, missingKeywords: [], sectionGaps: [] },
      audit: [{
        at: new Date().toISOString(),
        kind: 'intake',
        note: 'Job posting imported'
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    upsertRun(run);
    setCurrentRun(run);
    setActiveTab('qa');
  };
  
  const handleSubmit = () => {
    if (!currentRun) return;
    
    updateRun(currentRun.id, {
      stage: 'submitted',
      audit: [
        ...currentRun.audit,
        {
          at: new Date().toISOString(),
          kind: 'submit',
          note: 'Application submitted'
        }
      ]
    });
    
    // Reset state
    setCurrentPosting(null);
    setCurrentRun(null);
    setScreeners([]);
    setSelectedResume(undefined);
    setSelectedCover(undefined);
    setActiveTab('history');
  };
  
  // Build data dictionary for autofill
  const autofillData: Record<string, string> = {
    first_name: profile.name?.split(' ')[0] || '',
    last_name: profile.name?.split(' ').slice(1).join(' ') || '',
    email: profile.email || '',
    phone: profile.phone || '',
    resume: selectedResume?.url || '',
    cover: selectedCover?.url || ''
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('apply.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('apply.subtitle')}</p>
        </div>
        <SettingsSheet />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="dashboard">{t('apply.dashboard')}</TabsTrigger>
          <TabsTrigger value="intake">{t('apply.intake')}</TabsTrigger>
          <TabsTrigger value="qa">{t('apply.qa')}</TabsTrigger>
          <TabsTrigger value="variants">{t('apply.variants')}</TabsTrigger>
          <TabsTrigger value="mapping">{t('apply.mapping')}</TabsTrigger>
          <TabsTrigger value="autofill">{t('apply.autofill')}</TabsTrigger>
          <TabsTrigger value="review">{t('apply.review')}</TabsTrigger>
          <TabsTrigger value="history">{t('apply.history')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <AutoApplyDashboard />
        </TabsContent>
        
        <TabsContent value="intake" className="space-y-4">
          <JobIntakeCard />
          {postings.length > 0 && (
            <div className="grid gap-4">
              {postings.slice(0, 5).map(p => (
                <div key={p.id} onClick={() => handlePostingSelect(p)} className="cursor-pointer">
                  <PostingPreview posting={p} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="qa" className="space-y-4">
          {screeners.length > 0 ? (
            <>
              <QAPolicyWarnings screeners={screeners} />
              <ScreenerQAGenerator questions={screeners} onUpdate={setScreeners} />
            </>
          ) : (
            <p className="text-muted-foreground">{t('apply.selectPostingFirst')}</p>
          )}
        </TabsContent>
        
        <TabsContent value="variants" className="space-y-4">
          <AttachmentVault />
          {currentPosting && (
            <>
              <VariantPicker
                keywords={currentPosting.requirements || []}
                role={currentPosting.role}
                company={currentPosting.company}
                onSelect={(resume, cover) => {
                  if (resume) setSelectedResume(resume);
                  if (cover) setSelectedCover(cover);
                }}
              />
              {selectedResume && (
                <CoverageMeter
                  resumeText={selectedResume.title + ' ' + (selectedResume.keywords?.join(' ') || '')}
                  keywords={currentPosting.requirements || []}
                />
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="mapping" className="space-y-4">
          <FieldMapperUI onSelect={setSelectedMapping} />
        </TabsContent>
        
        <TabsContent value="autofill" className="space-y-4">
          {selectedMapping && currentRun ? (
            <AutofillRunner
              mapping={selectedMapping}
              data={autofillData}
              runId={currentRun.id}
              screeners={screeners}
            />
          ) : (
            <p className="text-muted-foreground">{t('apply.selectMappingFirst')}</p>
          )}
        </TabsContent>
        
        <TabsContent value="review" className="space-y-4">
          {currentRun && currentPosting ? (
            <ReviewAndSubmit
              run={currentRun}
              posting={currentPosting}
              variants={[selectedResume, selectedCover].filter(Boolean) as VariantDoc[]}
              screeners={screeners}
              onSubmit={handleSubmit}
            />
          ) : (
            <p className="text-muted-foreground">{t('apply.completeStepsFirst')}</p>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <RunHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
