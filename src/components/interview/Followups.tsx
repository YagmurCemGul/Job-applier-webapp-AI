/**
 * @fileoverview Follow-up email composer for Step 43
 * @module components/interview/Followups
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Calendar } from 'lucide-react';
import type { FollowUp, InterviewPlan } from '@/types/interview.types';
import { useInterview } from '@/stores/interview.store';
import { generateThankYouEmail, generateFollowUpEmail, sendFollowUp } from '@/services/interview/emailFollowup.service';
import { toast } from 'sonner';

interface FollowupsProps {
  plan?: InterviewPlan;
}

export function Followups({ plan }: FollowupsProps) {
  const { t } = useTranslation();
  const { upsertFollow } = useInterview();
  const [kind, setKind] = useState<'thank_you' | 'follow_up'>('thank_you');
  const [to, setTo] = useState(plan?.interviewer || '');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    if (kind === 'thank_you') {
      const email = generateThankYouEmail(
        plan?.interviewer || 'Hiring Manager',
        plan?.company || 'the company',
        plan?.role || 'the position',
        ''
      );
      setSubject(`Thank you for your time - ${plan?.company || ''} ${plan?.role || ''}`);
      setHtml(email);
    } else {
      const daysSince = plan ? Math.floor((Date.now() - Date.parse(plan.startISO)) / (1000 * 60 * 60 * 24)) : 5;
      const email = generateFollowUpEmail(
        plan?.interviewer || 'Hiring Manager',
        plan?.company || 'the company',
        daysSince
      );
      setSubject(`Following up - ${plan?.company || ''} ${plan?.role || ''}`);
      setHtml(email);
    }
  };

  const handleSend = async () => {
    if (!to || !subject || !html) {
      toast.error(t('interview.errors.emailFieldsRequired'));
      return;
    }

    setLoading(true);
    try {
      const followUp: FollowUp = {
        id: crypto.randomUUID(),
        planId: plan?.id,
        to,
        subject,
        html,
        kind
      };

      // This would need OAuth in production
      const accountId = 'default';
      const clientId = process.env.VITE_GOOGLE_CLIENT_ID || '';
      const passphrase = 'temp';

      const result = await sendFollowUp(followUp, accountId, clientId, passphrase);
      followUp.sentId = result.id;
      upsertFollow(followUp);
      toast.success(t('interview.emailSent'));
    } catch (error) {
      toast.error(t('interview.errors.emailSendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReminder = () => {
    const followUp: FollowUp = {
      id: crypto.randomUUID(),
      planId: plan?.id,
      to,
      subject,
      html,
      kind,
      scheduledISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    upsertFollow(followUp);
    toast.success(t('interview.reminderScheduled'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('interview.followups')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('interview.emailKind')}</Label>
            <Select value={kind} onValueChange={v => setKind(v as 'thank_you' | 'follow_up')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thank_you">{t('interview.thankYou')}</SelectItem>
                <SelectItem value="follow_up">{t('interview.followUp')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">{t('interview.to')}</Label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder={t('interview.emailPlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">{t('interview.subject')}</Label>
          <Input
            id="subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={t('interview.subjectPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="html">{t('interview.emailBody')}</Label>
          <Textarea
            id="html"
            value={html.replace(/<[^>]+>/g, '')}
            onChange={e => setHtml(`<p>${e.target.value.split('\n').join('</p><p>')}</p>`)}
            rows={8}
            placeholder={t('interview.emailBodyPlaceholder')}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerate} variant="outline" className="flex-1">
            {t('interview.generateTemplate')}
          </Button>
          <Button onClick={handleSend} disabled={loading} className="flex-1">
            <Mail className="mr-2 h-4 w-4" />
            {t('interview.sendThankYou')}
          </Button>
          <Button onClick={handleScheduleReminder} variant="outline" className="flex-1">
            <Calendar className="mr-2 h-4 w-4" />
            {t('interview.scheduleReminder')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
