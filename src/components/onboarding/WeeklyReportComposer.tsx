/**
 * @fileoverview Weekly report composer with AI suggestions and Gmail send.
 * @module components/onboarding/WeeklyReportComposer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, Sparkles } from 'lucide-react';
import type { OnboardingPlan } from '@/types/onboarding.types';
import type { Objective } from '@/types/okr.types';
import {
  buildWeeklyHTML,
  progressForPlan,
} from '@/services/onboarding/weeklyReport.service';

interface Props {
  plan: OnboardingPlan;
  okrs: Objective[];
  onSend: (html: string, recipients: string[], subject: string) => Promise<void>;
}

/**
 * WeeklyReportComposer - compose and send weekly reports.
 */
export function WeeklyReportComposer({ plan, okrs, onSend }: Props) {
  const { t } = useTranslation();
  const [highlights, setHighlights] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [asks, setAsks] = useState<string[]>([]);
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState(
    `${plan.company} Weekly Update — ${new Date().toLocaleDateString()}`
  );
  const [preview, setPreview] = useState('');
  const [sending, setSending] = useState(false);

  const handleAddItem = (
    list: string[],
    setter: (v: string[]) => void,
    value: string
  ) => {
    if (value.trim()) {
      setter([...list, value.trim()]);
    }
  };

  const handlePreview = () => {
    const okrProgress = progressForPlan(plan, okrs);
    const html = buildWeeklyHTML(plan, {
      highlights,
      risks,
      asks,
      okrProgress,
    });
    setPreview(html);
  };

  const handleSend = async () => {
    if (!recipients.trim()) return;
    setSending(true);
    try {
      const okrProgress = progressForPlan(plan, okrs);
      const html = buildWeeklyHTML(plan, {
        highlights,
        risks,
        asks,
        okrProgress,
      });
      const emails = recipients.split(',').map((e) => e.trim());
      await onSend(html, emails, subject);
    } finally {
      setSending(false);
    }
  };

  const ListInput = ({
    label,
    list,
    setter,
    placeholder,
  }: {
    label: string;
    list: string[];
    setter: (v: string[]) => void;
    placeholder: string;
  }) => {
    const [input, setInput] = useState('');
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem(list, setter, input);
                setInput('');
              }
            }}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              handleAddItem(list, setter, input);
              setInput('');
            }}
          >
            Add
          </Button>
        </div>
        {list.length > 0 && (
          <div className="space-y-1">
            {list.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2 bg-slate-50 rounded text-sm"
              >
                <span className="flex-1">{item}</span>
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setter(list.filter((_, idx) => idx !== i))}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('onboarding.reports')}
        </h2>
        <p className="text-slate-600 mt-1">
          Compose weekly updates for your manager and team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('onboarding.composeWeekly')}</CardTitle>
          <CardDescription>{plan.company} — {plan.role}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ListInput
            label={t('onboarding.highlights')}
            list={highlights}
            setter={setHighlights}
            placeholder="What went well this week?"
          />
          <ListInput
            label={t('onboarding.risks')}
            list={risks}
            setter={setRisks}
            placeholder="Any blockers or concerns?"
          />
          <ListInput
            label={t('onboarding.asks')}
            list={asks}
            setter={setAsks}
            placeholder="What do you need help with?"
          />

          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">{t('onboarding.subject')}</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipients">{t('onboarding.recipients')}</Label>
              <Input
                id="recipients"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="manager@company.com, team@company.com"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePreview} variant="outline">
              <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('onboarding.preview')}
            </Button>
            <Button onClick={handleSend} disabled={sending || !recipients.trim()}>
              <Send className="h-4 w-4 mr-1" aria-hidden="true" />
              {sending ? 'Sending...' : t('onboarding.send')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('onboarding.preview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
