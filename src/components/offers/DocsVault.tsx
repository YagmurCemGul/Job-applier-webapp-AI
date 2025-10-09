/**
 * @fileoverview Documents vault component for Step 44
 * @module components/offers/DocsVault
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText } from 'lucide-react';

/**
 * Documents vault for offer-related files
 */
export function DocsVault() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Documents Vault</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Attach signed offer letters, negotiation emails, and related documents here.
              All files are stored locally and can be redacted for exports.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center text-muted-foreground">
            Document upload feature coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
