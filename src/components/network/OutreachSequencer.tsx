/**
 * @fileoverview Outreach sequencer to send multi-step campaigns
 * @module components/network/OutreachSequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Play, Pause } from 'lucide-react';
import { useContacts } from '@/stores/contacts.store';
import { useOutreach } from '@/stores/outreach.store';
import type { SequenceRun } from '@/types/outreach.types';

export function OutreachSequencer() {
  const { t } = useTranslation();
  const { items: contacts } = useContacts();
  const { sequences, runs, upsertRun } = useOutreach();
  const [selectedSequence, setSelectedSequence] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const handleStart = () => {
    selectedContacts.forEach(contactId => {
      const run: SequenceRun = {
        id: crypto.randomUUID(),
        sequenceId: selectedSequence,
        contactId,
        startedAt: new Date().toISOString(),
        status: 'scheduled',
        history: []
      };
      upsertRun(run);
    });
    setSelectedContacts(new Set());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outreach Sequencer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedSequence} onValueChange={setSelectedSequence}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select sequence..." />
            </SelectTrigger>
            <SelectContent>
              {sequences.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleStart} disabled={!selectedSequence || selectedContacts.size === 0}>
            <Play className="mr-2 h-4 w-4" />
            Start for {selectedContacts.size} contact(s)
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Sequence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Last Step</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No active sequences
                  </TableCell>
                </TableRow>
              )}
              {runs.map(run => {
                const contact = contacts.find(c => c.id === run.contactId);
                const sequence = sequences.find(s => s.id === run.sequenceId);
                const lastHistory = run.history[0];
                return (
                  <TableRow key={run.id}>
                    <TableCell>{contact?.name || 'Unknown'}</TableCell>
                    <TableCell>{sequence?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant={run.status === 'running' ? 'default' : 'secondary'}>
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(run.startedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {lastHistory && (
                        <Badge variant={lastHistory.status === 'sent' ? 'default' : 'outline'}>
                          {lastHistory.status}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
