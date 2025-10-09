/**
 * @fileoverview Attachment Vault component for managing resume/cover variants
 * @module components/apply/AttachmentVault
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApply } from '@/stores/apply.store';
import { validateAttachment } from '@/services/apply/attachments.service';
import { FileText, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import type { VariantDoc } from '@/types/apply.types';

export function AttachmentVault() {
  const { t } = useTranslation();
  const { variants, upsertVariant } = useApply();
  
  const handleUpload = () => {
    // Stub: would open file picker
    const mockVariant: VariantDoc = {
      id: crypto.randomUUID(),
      kind: 'resume',
      title: 'Software_Engineer_Resume_2024.pdf',
      format: 'pdf',
      keywords: ['react', 'typescript', 'node.js', 'aws']
    };
    upsertVariant(mockVariant);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t('apply.attachmentVault')}
          <Button variant="outline" size="sm" onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            {t('common.upload')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('apply.noVariants')}</p>
          )}
          {variants.map((v) => {
            const validation = validateAttachment(v);
            return (
              <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{v.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {v.kind} • {v.format.toUpperCase()}
                    </div>
                  </div>
                </div>
                {validation.ok ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {validation.warnings[0]}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
