/**
 * @fileoverview Benchmarks panel component for Step 44
 * @module components/offers/BenchmarksPanel
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload } from 'lucide-react';
import { parseBenchmarkCsv } from '@/services/offers/benchmarks.service';
import { computeAnchors } from '@/services/negotiation/strategy.service';
import { useOffers } from '@/stores/offers.store.step44';

/**
 * Benchmarks import and anchor/ask computation
 */
export function BenchmarksPanel() {
  const { t } = useTranslation();
  const { benchmarks, bulkBenchmarks } = useOffers();
  
  const [csvText, setCsvText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedP50, setSelectedP50] = useState(0);
  const [selectedP75, setSelectedP75] = useState(0);

  const handleImportCsv = useCallback(() => {
    const rows = parseBenchmarkCsv(csvText);
    bulkBenchmarks(rows);
    setCsvText('');
  }, [csvText, bulkBenchmarks]);

  const filteredBenchmarks = benchmarks.filter(b =>
    !filterRole || b.role.toLowerCase().includes(filterRole.toLowerCase())
  );

  const anchors = computeAnchors({
    baseP50: selectedP50,
    baseP75: selectedP75
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.benchmarks', 'Benchmarks')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv">Import CSV</Label>
            <textarea
              id="csv"
              className="w-full min-h-[120px] p-2 border rounded-md font-mono text-sm"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="role,level,region,currency,baseP50,baseP75,tcP50,tcP75,source,year&#10;Software Engineer,Senior,US,USD,150000,180000,200000,250000,Levels.fyi,2024"
            />
            <Button onClick={handleImportCsv} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Import Benchmarks
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter">Filter by Role</Label>
            <Input
              id="filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              placeholder="e.g., Software Engineer"
            />
          </div>

          {filteredBenchmarks.length > 0 && (
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>P50 Base</TableHead>
                    <TableHead>P75 Base</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBenchmarks.map((b) => (
                    <TableRow
                      key={b.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => {
                        setSelectedP50(b.baseP50);
                        setSelectedP75(b.baseP75 || b.baseP50);
                      }}
                    >
                      <TableCell>{b.role}</TableCell>
                      <TableCell>{b.level || '—'}</TableCell>
                      <TableCell>{b.region || '—'}</TableCell>
                      <TableCell>{b.currency} {b.baseP50.toLocaleString()}</TableCell>
                      <TableCell>{b.currency} {(b.baseP75 || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.source || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedP50 > 0 && (
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-sm">Anchor & Ask Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Anchor:</strong> ${anchors.anchor.toLocaleString()}
                </div>
                <div>
                  <strong>Ask:</strong> ${anchors.ask.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on P50: ${selectedP50.toLocaleString()}, P75: ${selectedP75.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
