/**
 * @fileoverview Negotiation playbook component for Step 44
 * @module components/offers/NegotiationPlaybook
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { buildTalkingPoints } from '@/services/negotiation/talkingPoints.service';

/**
 * Negotiation playbook with talking points and strategy
 */
export function NegotiationPlaybook() {
  const { t } = useTranslation();
  
  const talkingPoints = useMemo(() => {
    return buildTalkingPoints();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.negotiate', 'Negotiation Playbook')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Educational guidance only — not financial or legal advice
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="font-semibold">Talking Points</h3>
            <ul className="space-y-1">
              {talkingPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Strategy Checklist</h3>
            <ul className="space-y-1 text-sm">
              <li>✓ Research market rates and comparable offers</li>
              <li>✓ Identify your BATNA (Best Alternative To Negotiated Agreement)</li>
              <li>✓ Set your target, ask, and walk-away numbers</li>
              <li>✓ Prepare evidence of impact and value</li>
              <li>✓ Practice delivery with clear, confident tone</li>
              <li>✓ Schedule call at mutually convenient time</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Common Objections & Rebuttals</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 border-l-4 border-muted-foreground">
                <p className="font-medium">"We can't adjust base, but we can offer more equity"</p>
                <p className="text-muted-foreground mt-1">
                  → "I appreciate the equity offer. Could we discuss a sign-on bonus to bridge the gap?"
                </p>
              </div>
              <div className="p-2 border-l-4 border-muted-foreground">
                <p className="font-medium">"This is our final offer"</p>
                <p className="text-muted-foreground mt-1">
                  → "I understand. Are there other benefits like PTO, remote work, or professional development we could explore?"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
