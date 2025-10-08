/**
 * @fileoverview Standalone Negotiation Coach component for Step 37
 * @module components/offer/NegotiationCoach
 * 
 * This is a standalone version that can be used independently from the tabs.
 * The tab version is in tabs/NegotiationTab.tsx
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import type { Offer } from '@/types/offer.types';
import type { NegotiationPlan } from '@/types/negotiation.types';
import { buildNegotiationPlan } from '@/services/offer/negotiationCoach.service';

interface NegotiationCoachProps {
  offer: Offer;
  onPlanGenerated?: (plan: NegotiationPlan) => void;
}

/**
 * AI-powered negotiation coach
 * Generates strategy, talking points, and draft emails
 */
export function NegotiationCoach({ offer, onPlanGenerated }: NegotiationCoachProps) {
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
      onPlanGenerated?.(result);
    } catch (error) {
      console.error('Failed to generate negotiation plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          AI-generated guidance. Be respectful, verify company policies, and adapt to your situation.
        </AlertDescription>
      </Alert>

      {!plan ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('offer.negotiation.coach')}</CardTitle>
            <CardDescription>
              Provide context to generate a personalized negotiation strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="market">{t('offer.negotiation.market')}</Label>
              <Textarea
                id="market"
                value={context.market}
                onChange={(e) => setContext({ ...context, market: e.target.value })}
                placeholder="E.g., Senior SWE in SF Bay Area typically makes $180-220k base, 10-20% bonus, RSUs..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorities">{t('offer.negotiation.priorities')}</Label>
              <Textarea
                id="priorities"
                value={context.priorities}
                onChange={(e) => setContext({ ...context, priorities: e.target.value })}
                placeholder="Comma-separated: base salary, remote flexibility, equity vesting, learning budget, PTO"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batna">{t('offer.negotiation.batna')}</Label>
              <Textarea
                id="batna"
                value={context.batna}
                onChange={(e) => setContext({ ...context, batna: e.target.value })}
                placeholder="E.g., I have another offer at $150k + strong equity, or I'm happy staying in my current role..."
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Negotiation Plan Generated</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setPlan(null)}>
              Regenerate
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t('offer.negotiation.strategy')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{plan.strategy}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">{t('offer.negotiation.talkingPoints')}</h4>
              <ul className="space-y-1">
                {plan.talkingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.targetAdjustments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">{t('offer.negotiation.targetAdjustments')}</h4>
                <div className="space-y-2">
                  {plan.targetAdjustments.map((adj, i) => (
                    <div key={i} className="p-3 border rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{adj.field}</span>
                        <span className="text-muted-foreground">
                          {adj.askPct ? `+${adj.askPct}%` : `+${adj.askAbs}`}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{adj.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
