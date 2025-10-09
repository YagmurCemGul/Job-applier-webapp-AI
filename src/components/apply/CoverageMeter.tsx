/**
 * @fileoverview Resume Coverage Meter component
 * @module components/apply/CoverageMeter
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { coverageFromText } from '@/services/apply/coverage.service';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { CoverageReport } from '@/types/apply.types';

interface Props {
  resumeText: string;
  keywords: string[];
}

export function CoverageMeter({ resumeText, keywords }: Props) {
  const { t } = useTranslation();
  const coverage = coverageFromText(resumeText, keywords);
  
  const getColorClass = (pct: number) => {
    if (pct >= 75) return 'text-green-600';
    if (pct >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {coverage.keywordMatchPct >= 75 ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          {t('apply.coverage')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t('apply.keywordMatch')}</span>
            <span className={`text-2xl font-bold ${getColorClass(coverage.keywordMatchPct)}`}>
              {coverage.keywordMatchPct}%
            </span>
          </div>
          <Progress value={coverage.keywordMatchPct} />
        </div>
        
        {coverage.missingKeywords.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">{t('apply.missingKeywords')}</div>
            <div className="flex flex-wrap gap-1">
              {coverage.missingKeywords.slice(0, 10).map((kw) => (
                <Badge key={kw} variant="outline">
                  {kw}
                </Badge>
              ))}
              {coverage.missingKeywords.length > 10 && (
                <Badge variant="outline">+{coverage.missingKeywords.length - 10}</Badge>
              )}
            </div>
          </div>
        )}
        
        {coverage.sectionGaps.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2 text-yellow-600">
              {t('apply.sectionGaps')}
            </div>
            <div className="flex flex-wrap gap-1">
              {coverage.sectionGaps.map((gap) => (
                <Badge key={gap} variant="destructive">
                  {gap}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
