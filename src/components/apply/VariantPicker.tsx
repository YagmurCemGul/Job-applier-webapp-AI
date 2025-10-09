/**
 * @fileoverview Resume/Cover Variant Picker component
 * @module components/apply/VariantPicker
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApply } from '@/stores/apply.store';
import { rankVariants } from '@/services/apply/resumeSelector.service';
import { validateAttachment } from '@/services/apply/attachments.service';
import { FileText, AlertTriangle } from 'lucide-react';
import type { VariantDoc } from '@/types/apply.types';

interface Props {
  keywords: string[];
  role?: string;
  company?: string;
  onSelect: (resume?: VariantDoc, cover?: VariantDoc) => void;
}

export function VariantPicker({ keywords, role, company, onSelect }: Props) {
  const { t } = useTranslation();
  const { variants } = useApply();
  
  const resumes = variants.filter(v => v.kind === 'resume');
  const covers = variants.filter(v => v.kind === 'cover');
  
  const rankedResumes = rankVariants(resumes, keywords, role, company);
  const rankedCovers = rankVariants(covers, keywords, role, company);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('apply.pickVariants')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">{t('apply.resume')}</h3>
            <div className="space-y-2">
              {rankedResumes.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('apply.noVariants')}</p>
              )}
              {rankedResumes.map((v) => {
                const validation = validateAttachment(v);
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => onSelect(v, undefined)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{v.title}</div>
                        <div className="text-xs text-muted-foreground">{v.format.toUpperCase()}</div>
                      </div>
                    </div>
                    {!validation.ok && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {validation.warnings[0]}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">{t('apply.coverLetter')}</h3>
            <div className="space-y-2">
              {rankedCovers.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('apply.noVariants')}</p>
              )}
              {rankedCovers.map((v) => {
                const validation = validateAttachment(v);
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => onSelect(undefined, v)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{v.title}</div>
                        <div className="text-xs text-muted-foreground">{v.format.toUpperCase()}</div>
                      </div>
                    </div>
                    {!validation.ok && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {validation.warnings[0]}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
