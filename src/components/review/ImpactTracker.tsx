/**
 * @fileoverview Impact tracker component
 * Aggregates and displays impact entries from evidence, OKRs, and manual input
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { aggregateImpact } from '@/services/review/impactAggregator.service';
import { useReviews } from '@/stores/review.store';
import type { ImpactEntry, Competency } from '@/types/review.types';

interface ImpactTrackerProps {
  cycleId: string;
}

const competencyColors: Record<Competency, string> = {
  execution: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  craft: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  leadership: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  collaboration: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  communication: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  impact: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

/**
 * Run aggregateImpact; tag competency; edit metrics; quick add from Evidence/OKRs;
 * sort by score; export CSV; a11y table + filter chips
 */
export function ImpactTracker({ cycleId }: ImpactTrackerProps) {
  const { t } = useTranslation();
  const { impactsByCycle, addImpact, setImpact } = useReviews();
  const [filter, setFilter] = useState<Competency | 'all'>('all');
  const [search, setSearch] = useState('');
  
  const impacts = useMemo(() => {
    const stored = impactsByCycle(cycleId);
    if (stored.length === 0) {
      // Auto-aggregate on first load
      const aggregated = aggregateImpact(cycleId);
      aggregated.forEach(i => addImpact(i));
      return aggregated;
    }
    return stored;
  }, [cycleId, impactsByCycle, addImpact]);
  
  const filtered = useMemo(() => {
    let result = impacts;
    
    if (filter !== 'all') {
      result = result.filter(i => i.competency === filter);
    }
    
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(term) ||
        i.detail?.toLowerCase().includes(term)
      );
    }
    
    return result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [impacts, filter, search]);
  
  const handleAddManual = () => {
    const entry: ImpactEntry = {
      id: crypto.randomUUID(),
      cycleId,
      source: 'manual',
      title: 'New Impact',
      competency: 'impact',
      confidence: 3,
    };
    addImpact(entry);
  };
  
  const handleExportCSV = () => {
    const headers = ['Title', 'Detail', 'Competency', 'Score', 'Source', 'Date'];
    const rows = filtered.map(i => [
      i.title,
      i.detail || '',
      i.competency || '',
      i.score?.toFixed(2) || '',
      i.source,
      i.dateISO || '',
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impact_${cycleId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder={t('review.searchImpacts', 'Search impacts...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
            aria-label={t('review.searchImpacts', 'Search impacts')}
          />
          
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-40" aria-label={t('review.filterByCompetency', 'Filter by competency')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
              <SelectItem value="execution">{t('review.competencies.execution', 'Execution')}</SelectItem>
              <SelectItem value="craft">{t('review.competencies.craft', 'Craft')}</SelectItem>
              <SelectItem value="leadership">{t('review.competencies.leadership', 'Leadership')}</SelectItem>
              <SelectItem value="collaboration">{t('review.competencies.collaboration', 'Collaboration')}</SelectItem>
              <SelectItem value="communication">{t('review.competencies.communication', 'Communication')}</SelectItem>
              <SelectItem value="impact">{t('review.competencies.impact', 'Impact')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('common.exportCSV', 'Export CSV')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddManual}>
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('review.addImpact', 'Add Impact')}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {t('review.impactsCount', { count: filtered.length, defaultValue: `${filtered.length} impacts` })}
      </div>
      
      <div
        className="space-y-3"
        role="list"
        aria-label={t('review.impactsList', 'Impacts list')}
      >
        {filtered.map(impact => (
          <div
            key={impact.id}
            className="border rounded-md p-4 bg-card hover:bg-accent/50 transition-colors"
            role="listitem"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Input
                  value={impact.title}
                  onChange={e => setImpact(impact.id, { title: e.target.value })}
                  className="font-medium mb-2"
                  aria-label={t('review.impactTitle', 'Impact title')}
                />
                
                <Input
                  value={impact.detail || ''}
                  onChange={e => setImpact(impact.id, { detail: e.target.value })}
                  className="text-sm mb-2"
                  placeholder={t('review.impactDetail', 'Add details...')}
                  aria-label={t('review.impactDetail', 'Impact details')}
                />
                
                {impact.metrics && impact.metrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {impact.metrics.map((m, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted"
                      >
                        {m.label}: <strong className="ml-1">{m.value}{m.unit}</strong>
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{impact.source}</span>
                  {impact.dateISO && (
                    <>
                      <span>•</span>
                      <span>{new Date(impact.dateISO).toLocaleDateString()}</span>
                    </>
                  )}
                  {impact.score !== undefined && (
                    <>
                      <span>•</span>
                      <span>Score: {impact.score.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select
                  value={impact.competency}
                  onValueChange={(v: Competency) => setImpact(impact.id, { competency: v })}
                >
                  <SelectTrigger className="w-36" aria-label={t('review.competency', 'Competency')}>
                    <Tag className="w-3 h-3 mr-1" aria-hidden="true" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="execution">Execution</SelectItem>
                    <SelectItem value="craft">Craft</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="impact">Impact</SelectItem>
                  </SelectContent>
                </Select>
                
                {impact.competency && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${competencyColors[impact.competency]}`}>
                    {impact.competency}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('review.noImpacts', 'No impacts found. Add manually or aggregate from evidence.')}</p>
        </div>
      )}
    </div>
  );
}
