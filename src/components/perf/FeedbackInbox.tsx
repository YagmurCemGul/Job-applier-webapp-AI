/**
 * Feedback Inbox Component
 * 
 * Displays received feedback responses with filtering and export.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerf } from '@/stores/perf.store';
import { Download, Quote } from 'lucide-react';
import type { ReviewerRole } from '@/types/perf.types';

/**
 * Inbox for viewing and managing feedback responses.
 */
export function FeedbackInbox() {
  const { t } = useTranslation();
  const { responses, requests } = usePerf();
  const [roleFilter, setRoleFilter] = useState<ReviewerRole | 'all'>('all');

  const filtered = responses.filter((resp) => {
    if (roleFilter === 'all') return true;
    const req = requests.find((r) => r.id === resp.requestId);
    return req?.role === roleFilter;
  });

  const exportCSV = () => {
    const headers = ['Reviewer', 'Role', 'Received', 'Answer Keys'];
    const rows = filtered.map((resp) => {
      const req = requests.find((r) => r.id === resp.requestId);
      return [
        req?.toName || req?.toEmail || 'Unknown',
        req?.role || '',
        resp.receivedAt,
        Object.keys(resp.answers).join('; '),
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback_responses.csv';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'manager', 'peer', 'cross_func'] as const).map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter(r)}
            >
              {r === 'all' ? 'All' : r.replace('_', ' ')}
            </Button>
          ))}
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map((resp) => {
          const req = requests.find((r) => r.id === resp.requestId);
          return (
            <Card key={resp.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{req?.toName || req?.toEmail || 'Anonymous'}</span>
                  <Badge variant="secondary">{req?.role || 'unknown'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Received: {new Date(resp.receivedAt).toLocaleDateString()}
                </p>
                {resp.rubric && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(resp.rubric).map(([k, v]) => (
                      <Badge key={k} variant="outline">
                        {k}: {v}
                      </Badge>
                    ))}
                  </div>
                )}
                {resp.quotes && resp.quotes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {resp.quotes.map((q, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Quote className="mt-1 h-3 w-3 text-muted-foreground" />
                        <p className="text-sm italic">&ldquo;{q}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 space-y-1">
                  {Object.entries(resp.answers).map(([k, v]) => (
                    <div key={k} className="rounded border p-2">
                      <p className="text-xs font-semibold text-muted-foreground">{k}</p>
                      <p className="mt-1 text-sm">{v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No feedback responses yet.
          </p>
        )}
      </div>
    </div>
  );
}
