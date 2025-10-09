/**
 * @fileoverview Referral/Warm Intro Hub Component
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
import { requestIntro } from '@/services/outreach/referral.service';
import type { Referral, Prospect } from '@/types/outreach.types';
import { UserPlus, Send } from 'lucide-react';

/**
 * Warm intro/referral hub with request tracking.
 */
export function ReferralHub() {
  const { t } = useTranslation();
  const { referrals, prospects, templates, upsertReferral } = useOutreach();
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [introducerEmail, setIntroducerEmail] = useState('');
  const [blurb, setBlurb] = useState('');
  const [sending, setSending] = useState(false);

  const warmIntroTemplate = templates.find(t => t.name.includes('Warm Intro'));

  const handleRequestIntro = async () => {
    if (!selectedProspect || !introducerEmail) {
      alert('Please select a prospect and enter introducer email');
      return;
    }

    setSending(true);
    try {
      const subject = `Could you introduce me to ${selectedProspect.name || 'this contact'}?`;
      const html = `<p>Hi,</p><p>Would you be open to introducing me to ${selectedProspect.name} (${selectedProspect.role || 'contact'}) at ${selectedProspect.company || 'their company'}?</p><p>${blurb}</p><p>Thanks!</p>`;

      await requestIntro({
        accountId: 'demo-account',
        clientId: 'demo-client',
        passphrase: 'demo-pass',
        introducerEmail,
        subject,
        html,
        prospectId: selectedProspect.id,
      });

      alert('Intro request sent!');
      setIntroducerEmail('');
      setBlurb('');
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateState = (refId: string, state: Referral['introState']) => {
    const ref = referrals.find(r => r.id === refId);
    if (ref) {
      upsertReferral({ ...ref, introState: state });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            <UserPlus className="inline mr-2 h-5 w-5" />
            Request Warm Intro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prospect-select">Select Prospect</Label>
            <select
              id="prospect-select"
              className="w-full border rounded p-2 mt-1"
              value={selectedProspect?.id || ''}
              onChange={(e) => {
                const p = prospects.find(x => x.id === e.target.value);
                setSelectedProspect(p || null);
              }}
            >
              <option value="">-- Choose --</option>
              {prospects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name || p.email} ({p.company || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="introducer">Introducer Email</Label>
            <Input
              id="introducer"
              type="email"
              value={introducerEmail}
              onChange={(e) => setIntroducerEmail(e.target.value)}
              placeholder="friend@example.com"
            />
          </div>

          <div>
            <Label htmlFor="blurb">Forwardable Blurb</Label>
            <Textarea
              id="blurb"
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              rows={4}
              placeholder="Short intro about yourself and why you want to connect..."
            />
          </div>

          <Button onClick={handleRequestIntro} disabled={sending} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Send Intro Request
          </Button>

          {warmIntroTemplate && (
            <p className="text-xs text-muted-foreground">
              Using template: {warmIntroTemplate.name}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Referral Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No referrals yet. Request a warm intro to get started.</p>
          ) : (
            <div className="space-y-2">
              {referrals.map(ref => {
                const prospect = prospects.find(p => p.id === ref.prospectId);
                return (
                  <div key={ref.id} className="border p-2 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{prospect?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          Introducer: {ref.introducerEmail}
                        </p>
                      </div>
                      <Badge
                        variant={
                          ref.introState === 'intro_made' ? 'default' :
                          ref.introState === 'declined' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {ref.introState}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateState(ref.id, 'sent')}
                      >
                        Mark Sent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateState(ref.id, 'intro_made')}
                      >
                        Intro Made
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
