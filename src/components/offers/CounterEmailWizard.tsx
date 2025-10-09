/**
 * @fileoverview Counter email wizard component for Step 44
 * @module components/offers/CounterEmailWizard
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Copy } from 'lucide-react';
import { COUNTER_TEMPLATES } from '@/services/negotiation/emailTemplates.service';
import { bulletsHtml } from '@/services/negotiation/strategy.service';
import { buildTalkingPoints } from '@/services/negotiation/talkingPoints.service';

/**
 * Counter email wizard with template rendering
 */
export function CounterEmailWizard() {
  const { t } = useTranslation();
  
  const [templateKey, setTemplateKey] = useState<'baseRaise' | 'signOn'>('baseRaise');
  const [recipientName, setRecipientName] = useState('');
  const [role, setRole] = useState('');
  const [askBase, setAskBase] = useState(0);
  const [askEquity, setAskEquity] = useState(0);
  const [askSignOn, setAskSignOn] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [senderName, setSenderName] = useState('');
  const [timeslot, setTimeslot] = useState('');

  const talkingPoints = useMemo(() => buildTalkingPoints(), []);

  const renderedEmail = useMemo(() => {
    const template = COUNTER_TEMPLATES[templateKey];
    let body = template.body
      .replace(/\{\{Name\}\}/g, recipientName)
      .replace(/\{\{Role\}\}/g, role)
      .replace(/\{\{AskBaseCurrency\}\}/g, currency)
      .replace(/\{\{AskBase\}\}/g, askBase.toLocaleString())
      .replace(/\{\{AskEquityShares\}\}/g, askEquity.toLocaleString())
      .replace(/\{\{AskCurrency\}\}/g, currency)
      .replace(/\{\{AskSignOn\}\}/g, askSignOn.toLocaleString())
      .replace(/\{\{Sender\}\}/g, senderName)
      .replace(/\{\{Timeslot\}\}/g, timeslot)
      .replace(/\{\{Bullets\}\}/g, bulletsHtml(talkingPoints));

    return {
      subject: template.subject,
      body
    };
  }, [templateKey, recipientName, role, askBase, askEquity, askSignOn, currency, senderName, timeslot, talkingPoints]);

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedEmail.body.replace(/<[^>]*>/g, ''));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Counter Email Wizard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={templateKey} onValueChange={(v) => setTemplateKey(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseRaise">Base & Equity Raise</SelectItem>
                  <SelectItem value="signOn">Sign-On Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipient Name</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., Sarah"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Senior Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="USD"
              />
            </div>
            {templateKey === 'baseRaise' && (
              <>
                <div className="space-y-2">
                  <Label>Ask Base</Label>
                  <Input
                    type="number"
                    value={askBase}
                    onChange={(e) => setAskBase(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ask Equity (shares)</Label>
                  <Input
                    type="number"
                    value={askEquity}
                    onChange={(e) => setAskEquity(Number(e.target.value))}
                  />
                </div>
              </>
            )}
            {templateKey === 'signOn' && (
              <div className="space-y-2">
                <Label>Ask Sign-On</Label>
                <Input
                  type="number"
                  value={askSignOn}
                  onChange={(e) => setAskSignOn(Number(e.target.value))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Timeslot</Label>
              <Input
                value={timeslot}
                onChange={(e) => setTimeslot(e.target.value)}
                placeholder="e.g., Tuesday 2-4pm EST"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <Alert>
              <AlertDescription>
                <div className="font-semibold mb-2">Subject: {renderedEmail.subject}</div>
                <div
                  className="text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: renderedEmail.body }}
                />
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
            <Button className="flex-1" disabled>
              <Send className="mr-2 h-4 w-4" />
              {t('offer.sendCounter', 'Send Counter')} (Gmail integration)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
