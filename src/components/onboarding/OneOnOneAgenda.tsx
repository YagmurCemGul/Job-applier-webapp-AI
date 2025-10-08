/**
 * @fileoverview 1:1 meeting agenda and notes component.
 * @module components/onboarding/OneOnOneAgenda
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, Calendar } from 'lucide-react';
import type { OneOnOneSeries, OneOnOneEntry } from '@/types/oneonone.types';
import { extractActions } from '@/services/onboarding/aiActionItems.service';

interface Props {
  series: OneOnOneSeries[];
  entries: OneOnOneEntry[];
  onCreateSeries: (s: OneOnOneSeries) => void;
  onCreateEntry: (e: OneOnOneEntry) => void;
  onUpdateEntry: (id: string, patch: Partial<OneOnOneEntry>) => void;
}

/**
 * OneOnOneAgenda - manage 1:1 series and meeting entries.
 */
export function OneOnOneAgenda({
  series,
  entries,
  onCreateSeries,
  onCreateEntry,
  onUpdateEntry,
}: Props) {
  const { t } = useTranslation();
  const [selectedEntry, setSelectedEntry] = useState<OneOnOneEntry | null>(null);
  const [extracting, setExtracting] = useState(false);

  const handleExtractActions = async () => {
    if (!selectedEntry) return;
    setExtracting(true);
    try {
      const actions = await extractActions(selectedEntry.notes || '');
      onUpdateEntry(selectedEntry.id, { actions });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('onboarding.oneonones')}
          </h2>
          <p className="text-slate-600 mt-1">
            {series.length} active series, {entries.length} total meetings
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('onboarding.createSeries')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Series</CardTitle>
            <CardDescription>Recurring 1:1 schedules</CardDescription>
          </CardHeader>
          <CardContent>
            {series.length === 0 ? (
              <p className="text-sm text-slate-500">
                No series yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {series.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between gap-2 p-2 rounded border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{s.counterpartName}</p>
                      <p className="text-xs text-slate-600">
                        {t(`onboarding.${s.cadence}`)} • {s.timeHHMM}
                      </p>
                    </div>
                    <Badge variant="outline">{s.cadence}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Meetings</CardTitle>
            <CardDescription>Past 1:1 entries</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-slate-500">No meetings logged yet.</p>
            ) : (
              <div className="space-y-3">
                {entries.slice(0, 5).map((e) => {
                  const seriesName =
                    series.find((s) => s.id === e.seriesId)?.counterpartName ||
                    'Unknown';
                  return (
                    <button
                      key={e.id}
                      className="w-full text-left p-2 rounded border hover:bg-slate-50 transition-colors"
                      onClick={() => setSelectedEntry(e)}
                    >
                      <p className="font-medium text-sm">{seriesName}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(e.dateISO).toLocaleDateString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meeting Details</CardTitle>
            <CardDescription>
              {new Date(selectedEntry.dateISO).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">{t('onboarding.notes')}</Label>
              <Textarea
                id="notes"
                value={selectedEntry.notes || ''}
                onChange={(e) =>
                  onUpdateEntry(selectedEntry.id, { notes: e.target.value })
                }
                rows={6}
                placeholder="Meeting notes..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleExtractActions}
                disabled={extracting}
                size="sm"
                variant="outline"
              >
                <Sparkles className="h-4 w-4 mr-1" aria-hidden="true" />
                {extracting ? 'Extracting...' : t('onboarding.extractActions')}
              </Button>
            </div>

            {selectedEntry.actions && selectedEntry.actions.length > 0 && (
              <div className="space-y-2">
                <Label>{t('onboarding.actions')}</Label>
                <div className="space-y-1">
                  {selectedEntry.actions.map((a, i) => (
                    <div
                      key={i}
                      className="text-sm p-2 bg-slate-50 rounded flex items-start gap-2"
                    >
                      <span className="flex-1">{a.text}</span>
                      {a.owner && (
                        <Badge variant="outline" className="shrink-0">
                          {a.owner}
                        </Badge>
                      )}
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
