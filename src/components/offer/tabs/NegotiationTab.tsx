/**
 * @fileoverview Negotiation tab for Step 37
 * @module components/offer/tabs/NegotiationTab
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Mail } from 'lucide-react';
import type { Offer } from '@/types/offer.types';
import type { NegotiationPlan } from '@/types/negotiation.types';
import { buildNegotiationPlan } from '@/services/offer/negotiationCoach.service';
import { toast } from 'sonner';

interface NegotiationTabProps {
  offer: Offer;
}

export function NegotiationTab({ offer }: NegotiationTabProps) {
  const { t } = useTranslation();

  const [context, setContext] = useState({
    market: '',
    priorities: '',
    batna: ''
  });

  const [plan, setPlan] = useState<NegotiationPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await buildNegotiationPlan(offer, {
        market: context.market,
        priorities: context.priorities.split(',').map(p => p.trim()).filter(Boolean),
        batna: context.batna
      });

      setPlan(result);
      toast.success('Negotiation plan generated');
    } catch (error) {
      toast.error('Failed to generate plan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (email: any) => {
    // Would integrate with Step 35 Gmail service
    toast.info('Email composer would open here (Step 35 integration)');
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          AI-powered negotiation guidance. Be respectful and verify company policies.
        </AlertDescription>
      </Alert>

      {!plan ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('offer.negotiation.coach')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="market">{t('offer.negotiation.market')}</Label>
              <Textarea
                id="market"
                value={context.market}
                onChange={(e) => setContext({ ...context, market: e.target.value })}
                placeholder="E.g., Senior SWE in SF Bay Area typically makes $180-220k base..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorities">{t('offer.negotiation.priorities')}</Label>
              <Textarea
                id="priorities"
                value={context.priorities}
                onChange={(e) => setContext({ ...context, priorities: e.target.value })}
                placeholder="Base salary, remote flexibility, equity, learning budget (comma-separated)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batna">{t('offer.negotiation.batna')}</Label>
              <Textarea
                id="batna"
                value={context.batna}
                onChange={(e) => setContext({ ...context, batna: e.target.value })}
                placeholder="E.g., I have another offer at $150k + strong equity, or I'm happy staying at current role..."
                rows={2}
              />
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('offer.negotiation.generatePlan')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('offer.negotiation.strategy')}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setPlan(null)}>
                Regenerate
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{plan.strategy}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('offer.negotiation.talkingPoints')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.talkingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {plan.targetAdjustments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('offer.negotiation.targetAdjustments')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.targetAdjustments.map((adj, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{adj.field}</span>
                        <span className="text-sm text-muted-foreground">
                          {adj.askPct ? `+${adj.askPct}%` : `+${adj.askAbs}`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{adj.rationale}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {plan.riskNotes && plan.riskNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('offer.negotiation.riskNotes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.riskNotes.map((note, i) => (
                    <li key={i} className="text-sm text-orange-600">⚠️ {note}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {plan.emails && plan.emails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('offer.negotiation.emails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.emails.map((email) => (
                  <div key={email.id} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Subject</div>
                      <div className="font-medium">{email.subject}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Body</div>
                      <div
                        className="text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleSendEmail(email)}>
                      <Mail className="mr-2 h-4 w-4" />
                      {t('offer.negotiation.sendEmail')}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
