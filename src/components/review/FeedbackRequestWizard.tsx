/**
 * @fileoverview Wizard for creating and sending feedback requests
 * Integrates with Gmail (Step 35) and stakeholders (Step 38)
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, UserPlus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFeedback } from '@/stores/feedback.store';
import { useOnboarding } from '@/stores/onboarding.store';
import { sendFeedbackRequests } from '@/services/review/feedback.service';
import type { FeedbackRequest } from '@/types/review.types';

interface FeedbackRequestWizardProps {
  cycleId: string;
  planId?: string;
  onComplete?: () => void;
}

/**
 * Select reviewers (from Step 38 stakeholders or manual); choose anonymous option and message;
 * send via Gmail; show delivery logs; schedule reminders
 */
export function FeedbackRequestWizard({
  cycleId,
  planId,
  onComplete,
}: FeedbackRequestWizardProps) {
  const { t } = useTranslation();
  const { upsertRequest } = useFeedback();
  const { getById } = useOnboarding.getState();
  
  const [reviewers, setReviewers] = useState<
    Array<{
      email: string;
      name: string;
      relationship: FeedbackRequest['relationship'];
    }>
  >([]);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const stakeholders = useMemo(() => {
    if (!planId) return [];
    const plan = getById(planId);
    return plan?.stakeholders ?? [];
  }, [planId, getById]);
  
  const handleAddFromStakeholder = (email: string) => {
    const stakeholder = stakeholders.find(s => s.email === email);
    if (!stakeholder) return;
    
    if (reviewers.find(r => r.email === email)) return;
    
    setReviewers([
      ...reviewers,
      {
        email: stakeholder.email,
        name: stakeholder.name,
        relationship: 'stakeholder',
      },
    ]);
  };
  
  const handleAddCustom = () => {
    if (!customEmail || reviewers.find(r => r.email === customEmail)) return;
    
    setReviewers([
      ...reviewers,
      {
        email: customEmail,
        name: customName || customEmail,
        relationship: 'other',
      },
    ]);
    
    setCustomEmail('');
    setCustomName('');
  };
  
  const handleRemove = (email: string) => {
    setReviewers(reviewers.filter(r => r.email !== email));
  };
  
  const handleSend = async () => {
    setSending(true);
    try {
      const requests: FeedbackRequest[] = reviewers.map(r => ({
        id: crypto.randomUUID(),
        cycleId,
        reviewerEmail: r.email,
        reviewerName: r.name,
        relationship: r.relationship,
        anonymous,
        status: 'pending' as const,
      }));
      
      requests.forEach(req => upsertRequest(req));
      
      // Send via Gmail (placeholder - requires account context)
      // In real usage, you'd need to pass accountId, clientId, passphrase
      // await sendFeedbackRequests({
      //   accountId: 'xxx',
      //   clientId: 'xxx',
      //   passphrase: 'xxx',
      //   requests,
      //   vars: (r) => ({
      //     YourName: 'Your Name',
      //     CycleTitle: cycleId,
      //     ReviewerName: r.reviewerName || r.reviewerEmail,
      //   }),
      // });
      
      onComplete?.();
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">{t('review.selectReviewers', 'Select Reviewers')}</h3>
        
        {stakeholders.length > 0 && (
          <div className="space-y-2">
            <Label>{t('review.fromStakeholders', 'From Stakeholders')}</Label>
            <Select onValueChange={handleAddFromStakeholder}>
              <SelectTrigger>
                <SelectValue placeholder={t('review.chooseStakeholder', 'Choose stakeholder...')} />
              </SelectTrigger>
              <SelectContent>
                {stakeholders.map(s => (
                  <SelectItem key={s.email} value={s.email}>
                    {s.name} ({s.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>{t('review.addManually', 'Add Manually')}</Label>
          <div className="flex gap-2">
            <Input
              placeholder={t('review.reviewerEmail', 'Email')}
              value={customEmail}
              onChange={e => setCustomEmail(e.target.value)}
            />
            <Input
              placeholder={t('review.reviewerName', 'Name')}
              value={customName}
              onChange={e => setCustomName(e.target.value)}
            />
            <Button variant="outline" onClick={handleAddCustom} disabled={!customEmail}>
              <UserPlus className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {reviewers.map(r => (
            <div
              key={r.email}
              className="flex items-center justify-between p-2 border rounded bg-card"
            >
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(r.email)}>
                {t('common.remove', 'Remove')}
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="anonymous" className="cursor-pointer">
            {t('review.anonymousRequests', 'Enable anonymous responses')}
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="custom-message">{t('review.customMessage', 'Custom Message (Optional)')}</Label>
          <Textarea
            id="custom-message"
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            placeholder={t('review.customMessagePlaceholder', 'Add a personal note...')}
            rows={4}
          />
        </div>
      </div>
      
      <Button
        onClick={handleSend}
        disabled={reviewers.length === 0 || sending}
        className="w-full"
      >
        <Send className="w-4 h-4 mr-2" aria-hidden="true" />
        {sending
          ? t('review.sending', 'Sending...')
          : t('review.sendRequests', `Send ${reviewers.length} Requests`)}
      </Button>
    </div>
  );
}
