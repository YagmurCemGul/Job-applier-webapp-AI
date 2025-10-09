/**
 * @fileoverview Job Posting Preview component
 * @module components/apply/PostingPreview
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Calendar, FileText } from 'lucide-react';
import type { JobPosting } from '@/types/apply.types';

interface Props {
  posting: JobPosting;
}

export function PostingPreview({ posting }: Props) {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {posting.company || t('apply.unknownCompany')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-medium text-lg">{posting.role || t('apply.unknownRole')}</div>
          {posting.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {posting.location}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(posting.extractedAt).toLocaleDateString()}
          <Badge variant="outline">{posting.source}</Badge>
        </div>
        
        {posting.description && (
          <div className="text-sm">
            <strong>{t('apply.description')}:</strong>
            <p className="mt-1 text-muted-foreground line-clamp-3">{posting.description}</p>
          </div>
        )}
        
        {posting.requirements && posting.requirements.length > 0 && (
          <div className="text-sm">
            <strong>{t('apply.requirements')}:</strong>
            <ul className="mt-1 list-disc list-inside text-muted-foreground">
              {posting.requirements.slice(0, 3).map((req, idx) => (
                <li key={idx} className="line-clamp-1">{req}</li>
              ))}
              {posting.requirements.length > 3 && (
                <li className="text-xs">+{posting.requirements.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{posting.questions.length} {t('apply.questions')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
