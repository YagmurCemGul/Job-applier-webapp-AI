/**
 * @fileoverview Compliance Panel Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useOutreach } from '@/stores/outreach.store';
import { suppress } from '@/services/outreach/suppression.service';
import { Shield, Ban, Upload } from 'lucide-react';

/**
 * Compliance panel for suppression, do-not-contact, and footer settings.
 */
export function CompliancePanel() {
  const { t } = useTranslation();
  const { suppressions } = useOutreach();
  const [newEmail, setNewEmail] = useState('');
  const [defaultFooter, setDefaultFooter] = useState(
    '<p style="color:#6b7280;font-size:12px">You are receiving this because we believe this is relevant to your role. <a href="{{unsubscribeUrl}}">Unsubscribe</a> • {{postalAddress}}</p>'
  );

  const handleAddSuppression = () => {
    if (!newEmail) return;
    suppress(newEmail, 'manual');
    setNewEmail('');
    alert(`${newEmail} added to suppression list`);
  };

  const handleUploadDoNotContact = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          const emails = text.split(/[\n,]/).map(e => e.trim()).filter(Boolean);
          emails.forEach(email => suppress(email, 'manual'));
          alert(`${emails.length} emails added to suppression list`);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Suppression List */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Ban className="inline mr-2 h-5 w-5" />
            Suppression List ({suppressions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="new-suppression">Add Email to Suppression</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="new-suppression"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
              />
              <Button onClick={handleAddSuppression}>Add</Button>
            </div>
          </div>

          <div>
            <Button onClick={handleUploadDoNotContact} variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Do-Not-Contact List
            </Button>
          </div>

          <div>
            <Label>Suppressed Emails</Label>
            <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
              {suppressions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No suppressed emails</p>
              ) : (
                suppressions.map(s => (
                  <div key={s.id} className="flex items-center justify-between border-b pb-1">
                    <span className="text-sm">{s.email}</span>
                    <Badge variant="secondary">{s.reason}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Shield className="inline mr-2 h-5 w-5" />
            {t('outreach.compliance')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="default-footer">Default Compliance Footer</Label>
            <Textarea
              id="default-footer"
              value={defaultFooter}
              onChange={(e) => setDefaultFooter(e.target.value)}
              rows={4}
              placeholder="Include unsubscribe link and postal address"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Variables: {`{{unsubscribeUrl}}`}, {`{{postalAddress}}`}
            </p>
          </div>

          <div>
            <Label>Quiet Hours</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Outreach respects quiet hours (22:00–07:00 local time) by default. Adjust in sequence rules.
            </p>
          </div>

          <div>
            <Label>Anti-Spam Policy</Label>
            <p className="text-sm text-muted-foreground mt-1">
              • Rate limits enforced per sequence<br />
              • One-click unsubscribe available<br />
              • No automation on third-party platforms
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
