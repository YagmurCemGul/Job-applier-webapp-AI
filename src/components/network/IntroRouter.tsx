/**
 * @fileoverview Routes approved introductions to target email draft
 * @module components/network/IntroRouter
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';

interface Props {
  introducerName: string;
  targetName: string;
  targetEmail: string;
  context: string;
}

export function IntroRouter({ introducerName, targetName, targetEmail, context }: Props) {
  const message = `Hi ${targetName.split(' ')[0]},\n\n${introducerName} suggested I reach out to you. ${context}\n\nWould you be open to a brief chat? I'm happy to work around your schedule.\n\nBest regards`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Introduction Approved
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {introducerName} has agreed to introduce you. Here's a draft message to {targetName}:
          </p>
          <Textarea value={message} readOnly rows={6} className="bg-muted" />
        </div>
        <div className="flex gap-2">
          <Button>Send via Gmail</Button>
          <Button variant="outline">Copy to Clipboard</Button>
        </div>
      </CardContent>
    </Card>
  );
}
