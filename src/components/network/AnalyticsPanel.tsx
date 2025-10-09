/**
 * @fileoverview Analytics panel for outreach metrics
 * @module components/network/AnalyticsPanel
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Mail, CheckCircle } from 'lucide-react';
import { useOutreach } from '@/stores/outreach.store';

export function AnalyticsPanel() {
  const { sequences, runs } = useOutreach();

  const stats = sequences.map(seq => {
    const seqRuns = runs.filter(r => r.sequenceId === seq.id);
    const sent = seqRuns.reduce((acc, r) => acc + r.history.filter(h => h.status === 'sent').length, 0);
    const total = seqRuns.length;
    return {
      name: seq.name,
      sent,
      total,
      rate: total > 0 ? ((sent / total) * 100).toFixed(1) : '0'
    };
  });

  const totalSent = stats.reduce((acc, s) => acc + s.sent, 0);
  const totalRuns = stats.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Analytics</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Sequences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runs.filter(r => r.status === 'running').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRuns > 0 ? ((runs.filter(r => r.status === 'finished').length / totalRuns) * 100).toFixed(1) : '0'}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sequence Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sequence</TableHead>
                <TableHead>Total Runs</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Send Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No sequences yet
                  </TableCell>
                </TableRow>
              )}
              {stats.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.total}</TableCell>
                  <TableCell>{s.sent}</TableCell>
                  <TableCell>
                    <Badge variant={Number(s.rate) > 50 ? 'default' : 'secondary'}>
                      {s.rate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
