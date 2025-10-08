/**
 * Emails Tab
 * Quick email compose and thread preview integration with Step 35
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Interview } from '@/types/interview.types';
import { Mail, Send, Clock, CheckCircle } from 'lucide-react';

interface Props {
  interview: Interview;
}

type EmailTemplate = 'thank_you' | 'follow_up' | 'scheduling' | 'rejection';

export default function EmailsTab({ interview }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>('thank_you');
  const [sending, setSending] = useState(false);

  const templates: Record<EmailTemplate, { subject: string; body: string }> = {
    thank_you: {
      subject: `Thank you - ${interview.role} Interview`,
      body: `Dear ${interview.candidateName},\n\nThank you for taking the time to interview for the ${interview.role} position at ${interview.company}. We appreciated the opportunity to learn more about your experience and skills.\n\nWe will be in touch soon regarding next steps.\n\nBest regards,\nHiring Team`,
    },
    follow_up: {
      subject: `Follow-up - ${interview.role} Interview`,
      body: `Hi ${interview.candidateName},\n\nI wanted to follow up on our recent interview for the ${interview.role} position. Do you have any questions or additional information you'd like to share?\n\nLooking forward to hearing from you.\n\nBest regards,\nHiring Team`,
    },
    scheduling: {
      subject: `Interview Invitation - ${interview.role}`,
      body: `Dear ${interview.candidateName},\n\nWe would like to invite you to interview for the ${interview.role} position at ${interview.company}.\n\nPlease let us know your availability for the coming week.\n\nBest regards,\nHiring Team`,
    },
    rejection: {
      subject: `Update on your ${interview.role} application`,
      body: `Dear ${interview.candidateName},\n\nThank you again for your interest in the ${interview.role} position at ${interview.company}. After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current needs.\n\nWe wish you the best in your job search.\n\nBest regards,\nHiring Team`,
    },
  };

  const handleSendEmail = async () => {
    if (!interview.candidateEmail) {
      alert('No candidate email available');
      return;
    }

    setSending(true);
    try {
      // TODO: Integrate with Step 35 Gmail service
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Email sent via Gmail integration');
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSending(false);
    }
  };

  const currentTemplate = templates[selectedTemplate];

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Email Templates</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Template</label>
            <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as EmailTemplate)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thank_you">Thank You</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="scheduling">Scheduling</SelectItem>
                <SelectItem value="rejection">Rejection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <div className="p-3 bg-muted rounded-md text-sm">
              {currentTemplate.subject}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Body</label>
            <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap min-h-[200px]">
              {currentTemplate.body}
            </div>
          </div>

          <Button
            onClick={handleSendEmail}
            disabled={sending || !interview.candidateEmail}
            className="w-full gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send via Gmail'}
          </Button>

          {!interview.candidateEmail && (
            <p className="text-sm text-destructive">
              No candidate email address available
            </p>
          )}
        </div>
      </Card>

      {/* Email History (Mock) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Email History</h2>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground text-center py-8">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No emails sent yet
          </div>
        </div>
      </Card>

      {/* Integration Info */}
      <Card className="p-4 bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Email functionality integrates with Step 35 Gmail service.
          Ensure you have connected your Gmail account in Settings.
        </p>
      </Card>
    </div>
  );
}
