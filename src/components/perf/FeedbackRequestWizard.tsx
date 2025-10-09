/**
 * Feedback Request Wizard Component
 * 
 * Multi-step wizard for creating and sending 360 feedback requests.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePerf } from '@/stores/perf.store';
import { sendFeedbackRequest } from '@/services/perf/feedback360.service';
import type { FeedbackTemplate, ReviewerRole } from '@/types/perf.types';
import { Mail, Eye, Send } from 'lucide-react';

interface FeedbackRequestWizardProps {
  onComplete: () => void;
}

/**
 * Wizard for requesting 360 feedback with template selection.
 */
export function FeedbackRequestWizard({ onComplete }: FeedbackRequestWizardProps) {
  const { t } = useTranslation();
  const { templates } = usePerf();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<FeedbackTemplate | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<ReviewerRole>('peer');
  const [dueDate, setDueDate] = useState('');
  const [subject, setSubject] = useState('360 Feedback Request');
  const [message, setMessage] = useState('<p>Please share your feedback.</p>');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!selectedTemplate) return;
    setSending(true);
    try {
      const req = {
        id: crypto.randomUUID(),
        toEmail: email,
        toName: name || undefined,
        role,
        subject,
        messageHtml: message,
        dueISO: dueDate ? new Date(dueDate).toISOString() : undefined,
        status: 'draft' as const,
        token: crypto.randomUUID(),
        accountId: '', // Would come from auth context
        clientId: '',
        passphrase: '',
      };
      // await sendFeedbackRequest(req);
      usePerf.getState().upsertRequest(req);
      onComplete();
    } catch (err) {
      console.error('Failed to send feedback request:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Consent Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          ℹ️ Reviewers will receive an email with a private feedback form. Responses are stored locally.
        </p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Choose Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplate(tpl);
                  setStep(2);
                }}
                className="w-full rounded-lg border p-4 text-left transition-colors hover:border-primary"
              >
                <h3 className="font-semibold">{tpl.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {tpl.sections.length} sections
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Reviewer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reviewer@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as ReviewerRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="peer">Peer</SelectItem>
                  <SelectItem value="cross_func">Cross-functional</SelectItem>
                  <SelectItem value="skip_level">Skip Level</SelectItem>
                  <SelectItem value="direct_report">Direct Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!email}>
                Next <Eye className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Preview & Send</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>
            <div className="rounded-lg border bg-muted p-4">
              <p className="text-sm font-semibold">Preview:</p>
              <div
                className="prose prose-sm mt-2 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: message }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline">
                Back
              </Button>
              <Button onClick={handleSend} disabled={sending}>
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
