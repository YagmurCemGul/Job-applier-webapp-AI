/**
 * @fileoverview Scheduler Widget Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOutreach } from '@/stores/outreach.store';
import { createSchedulerLink } from '@/services/outreach/scheduler.service';
import { schedulerSnippet } from '@/services/integrations/calendarLink.service';
import { Calendar, Copy, Link } from 'lucide-react';

/**
 * Scheduler widget for creating meeting links.
 */
export function SchedulerWidget() {
  const { t } = useTranslation();
  const { schedulers } = useOutreach();
  const [title, setTitle] = useState('Quick Chat');
  const [durationMin, setDurationMin] = useState(30);
  const [tz, setTz] = useState('America/Los_Angeles');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const link = await createSchedulerLink({
        accountId: 'demo-account',
        clientId: 'demo-client',
        passphrase: 'demo-pass',
        tz,
        durationMin,
        title,
      });
      alert(`Scheduler link created: ${link.url}`);
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleCopySnippet = (url: string) => {
    const snippet = schedulerSnippet(url, 'Book a time');
    navigator.clipboard.writeText(snippet);
    alert('Snippet copied to clipboard');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard');
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Create Link */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Calendar className="inline mr-2 h-5 w-5" />
            {t('outreach.scheduler')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sch-title">Meeting Title</Label>
            <Input
              id="sch-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick Chat"
            />
          </div>

          <div>
            <Label htmlFor="sch-duration">Duration (minutes)</Label>
            <Input
              id="sch-duration"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="sch-tz">Timezone</Label>
            <Input
              id="sch-tz"
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              placeholder="America/Los_Angeles"
            />
          </div>

          <Button onClick={handleCreate} disabled={creating} className="w-full">
            Create Scheduler Link
          </Button>
        </CardContent>
      </Card>

      {/* Existing Links */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduler Links</CardTitle>
        </CardHeader>
        <CardContent>
          {schedulers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scheduler links yet. Create one to insert into email templates.
            </p>
          ) : (
            <div className="space-y-2">
              {schedulers.map(sch => (
                <div key={sch.id} className="border p-2 rounded">
                  <p className="font-medium">{sch.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {sch.durationMin} min • {sch.tz}
                  </p>
                  <p className="text-xs text-blue-600 mt-1 break-all">{sch.url}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(sch.url)}
                    >
                      <Link className="mr-1 h-3 w-3" />
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopySnippet(sch.url)}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Snippet
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
