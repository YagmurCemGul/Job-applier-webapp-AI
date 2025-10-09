/**
 * @fileoverview Unsubscribe Preferences Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { suppress } from '@/services/outreach/suppression.service';
import { CheckCircle, Mail } from 'lucide-react';

/**
 * Unsubscribe preferences page (standalone).
 */
export function UnsubscribePreferences() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUnsubscribe = () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    suppress(email, 'unsub');
    setSuccess(true);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>
            <Mail className="inline mr-2 h-5 w-5" />
            Unsubscribe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="font-medium">You have been unsubscribed</p>
              <p className="text-sm text-muted-foreground">
                {email} will no longer receive outreach emails from us.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Enter your email address to unsubscribe from all outreach campaigns.
              </p>
              <div>
                <Label htmlFor="unsub-email">Email Address</Label>
                <Input
                  id="unsub-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button onClick={handleUnsubscribe} className="w-full">
                Unsubscribe
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You can also manage your preferences by contacting us directly.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
