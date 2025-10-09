/**
 * @fileoverview Prospect Table Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useOutreach } from '@/stores/outreach.store';
import type { Prospect } from '@/types/outreach.types';
import { enrichProspect } from '@/services/outreach/enrich.service';
import { suppress } from '@/services/outreach/suppression.service';
import { importProspectsCsv } from '@/services/outreach/importCsv.service';
import { User, Upload, Sparkles, Ban } from 'lucide-react';

interface ProspectTableProps {
  onSelectProspect?: (prospect: Prospect) => void;
}

/**
 * Prospect management table with import, enrich, and suppress actions.
 */
export function ProspectTable({ onSelectProspect }: ProspectTableProps) {
  const { t } = useTranslation();
  const { prospects } = useOutreach();
  const [filter, setFilter] = useState('');

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const count = await importProspectsCsv(file);
        alert(`Imported ${count} prospects`);
      }
    };
    input.click();
  };

  const handleEnrich = (id: string) => {
    enrichProspect(id);
  };

  const handleSuppress = (email?: string) => {
    if (!email) return;
    suppress(email, 'manual');
    alert(`${email} added to suppression list`);
  };

  const filtered = prospects.filter(p =>
    !filter ||
    p.name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.email?.toLowerCase().includes(filter.toLowerCase()) ||
    p.company?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            <User className="inline mr-2 h-5 w-5" />
            {t('outreach.prospects')} ({filtered.length})
          </span>
          <Button onClick={handleImport} variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            {t('outreach.importCsv')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Filter by name, email, or company..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No prospects yet. Import a CSV to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Prospect list with enrichment and suppression actions</caption>
              <thead className="border-b">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Company</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Tags</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => onSelectProspect?.(p)}
                  >
                    <td className="p-2">{p.name || '—'}</td>
                    <td className="p-2">{p.email || '—'}</td>
                    <td className="p-2">{p.role || '—'}</td>
                    <td className="p-2">{p.company || '—'}</td>
                    <td className="p-2">
                      <Badge variant={p.status === 'replied' ? 'default' : 'secondary'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {p.tags.map(t => (
                        <Badge key={t} variant="outline" className="mr-1">
                          {t}
                        </Badge>
                      ))}
                    </td>
                    <td className="p-2 space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnrich(p.id);
                        }}
                        title="Enrich prospect data"
                      >
                        <Sparkles className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuppress(p.email);
                        }}
                        title="Add to suppression list"
                      >
                        <Ban className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
