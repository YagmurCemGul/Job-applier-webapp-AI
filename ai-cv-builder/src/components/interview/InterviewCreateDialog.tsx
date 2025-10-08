/**
 * Interview Create Dialog
 * Form for creating new interviews from applications
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useInterviews } from '@/stores/interviews.store';
import type { Interview } from '@/types/interview.types';
import PanelEditor from './PanelEditor';
import ConsentBanner from './ConsentBanner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string;
}

export default function InterviewCreateDialog({ open, onOpenChange, applicationId }: Props) {
  const { t } = useTranslation();
  const { upsert } = useInterviews();
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [panel, setPanel] = useState<Interview['panel']>([]);
  const [recordingConsent, setRecordingConsent] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Try to load from application if provided
      if (applicationId) {
        loadFromApplication(applicationId);
      } else {
        resetForm();
      }
    }
  }, [open, applicationId]);

  const loadFromApplication = async (appId: string) => {
    try {
      const { useApplications } = await import('@/stores/applications.store');
      const app = useApplications.getState().getById(appId);
      if (app) {
        setCandidateName(app.title || '');
        setRole(app.role || '');
        setCompany(app.company || '');
      }
    } catch (error) {
      console.error('Failed to load application:', error);
    }
  };

  const resetForm = () => {
    setCandidateName('');
    setCandidateEmail('');
    setRole('');
    setCompany('');
    setDurationMin(60);
    setPanel([]);
    setRecordingConsent(false);
  };

  const handleCreate = () => {
    const interview: Interview = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      applicationId: applicationId || '',
      candidateName,
      candidateEmail,
      role,
      company,
      stage: 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      meeting: {
        provider: 'google_meet',
        durationMin,
      },
      panel,
      consent: {
        recordingAllowed: recordingConsent,
        capturedAt: recordingConsent ? new Date().toISOString() : undefined,
      },
      scoreSubmissions: [],
    };

    upsert(interview);
    onOpenChange(false);
    resetForm();
    
    // Navigate to the interview detail page
    window.location.href = `/interviews/${interview.id}`;
  };

  const isValid = candidateName.trim() && role.trim() && company.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('interview.create', 'Create Interview')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Candidate Info */}
          <div className="space-y-2">
            <Label htmlFor="candidateName">
              Candidate Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="candidateName"
              value={candidateName}
              onChange={e => setCandidateName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidateEmail">Candidate Email</Label>
            <Input
              id="candidateEmail"
              type="email"
              value={candidateEmail}
              onChange={e => setCandidateEmail(e.target.value)}
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Job Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="Senior Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
          </div>

          {/* Meeting Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Interview Duration (minutes)</Label>
            <Select value={String(durationMin)} onValueChange={v => setDurationMin(Number(v))}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Panel */}
          <div className="space-y-2">
            <Label>Interview Panel</Label>
            <PanelEditor panel={panel} onChange={setPanel} />
          </div>

          {/* Recording Consent */}
          <ConsentBanner />
          <div className="flex items-center gap-2">
            <Checkbox
              id="consent"
              checked={recordingConsent}
              onCheckedChange={(checked) => setRecordingConsent(checked === true)}
            />
            <Label htmlFor="consent" className="cursor-pointer">
              {t('interview.consent', 'I have consent to record and transcribe this interview.')}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isValid}>
            Create Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
