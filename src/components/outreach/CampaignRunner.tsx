/**
 * @fileoverview Campaign Runner Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOutreach } from '@/stores/outreach.store';
import { runCampaignTick } from '@/services/outreach/campaign.service';
import type { Campaign } from '@/types/outreach.types';
import { PlayCircle, PauseCircle, Activity } from 'lucide-react';

/**
 * Campaign runner with live logs and metrics.
 */
export function CampaignRunner() {
  const { t } = useTranslation();
  const { campaigns, sequences, lists, logs, upsertCampaign } = useOutreach();
  const [selected, setSelected] = useState<Campaign | null>(campaigns[0] || null);
  const [running, setRunning] = useState(false);

  const handleNew = () => {
    const newCamp: Campaign = {
      id: crypto.randomUUID(),
      name: 'New Campaign',
      sequenceId: sequences[0]?.id || '',
      listId: lists[0]?.id || '',
      status: 'draft',
      metrics: { sent: 0, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };
    setSelected(newCamp);
  };

  const handleSave = () => {
    if (!selected) return;
    upsertCampaign(selected);
    alert('Campaign saved');
  };

  const handleRunTick = async () => {
    if (!selected) return;
    setRunning(true);
    try {
      const sent = await runCampaignTick({
        campaignId: selected.id,
        accountId: 'demo-account',
        clientId: 'demo-client',
        passphrase: 'demo-pass',
        unsubscribeUrl: `${location.origin}/unsubscribe`,
        postalAddress: '123 Main St, San Francisco, CA 94102',
      });
      alert(`Tick completed: ${sent} emails sent`);
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  const handlePause = () => {
    if (!selected) return;
    upsertCampaign({ ...selected, status: 'paused' });
    setSelected({ ...selected, status: 'paused' });
  };

  const campaignLogs = selected ? logs.filter(l => l.campaignId === selected.id) : [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              <Activity className="inline mr-2 h-5 w-5" />
              Campaigns
            </span>
            <Button onClick={handleNew} variant="outline" size="sm">
              New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {campaigns.map(camp => (
              <div
                key={camp.id}
                className={`p-2 border rounded cursor-pointer ${selected?.id === camp.id ? 'bg-muted' : ''}`}
                onClick={() => setSelected(camp)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{camp.name}</p>
                  <Badge variant={camp.status === 'running' ? 'default' : 'secondary'}>
                    {camp.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {camp.metrics.sent || 0} sent • {camp.metrics.replies || 0} replies
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Runner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Runner</span>
            <div className="space-x-2">
              {selected?.status === 'running' ? (
                <Button onClick={handlePause} variant="outline" size="sm">
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button onClick={handleRunTick} variant="default" size="sm" disabled={running}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {t('outreach.runTick')}
                </Button>
              )}
              <Button onClick={handleSave} variant="outline" size="sm">
                Save
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <p className="text-sm text-muted-foreground">Select a campaign or create a new one</p>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="camp-name">Campaign Name</Label>
                <Input
                  id="camp-name"
                  value={selected.name}
                  onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="camp-seq">Sequence</Label>
                <Select
                  value={selected.sequenceId}
                  onValueChange={(v) => setSelected({ ...selected, sequenceId: v })}
                >
                  <SelectTrigger id="camp-seq">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sequences.map(seq => (
                      <SelectItem key={seq.id} value={seq.id}>
                        {seq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="camp-list">Prospect List</Label>
                <Select
                  value={selected.listId}
                  onValueChange={(v) => setSelected({ ...selected, listId: v })}
                >
                  <SelectTrigger id="camp-list">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map(list => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.count || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Metrics</Label>
                <div className="grid grid-cols-2 gap-2 mt-2" role="status" aria-live="polite">
                  {Object.entries(selected.metrics).map(([k, v]) => (
                    <div key={k} className="border p-2 rounded">
                      <p className="text-xs text-muted-foreground">{k}</p>
                      <p className="text-lg font-bold">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Recent Logs ({campaignLogs.length})</Label>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {campaignLogs.slice(0, 10).map(log => (
                    <div key={log.id} className="text-xs border-b pb-1">
                      <Badge variant={log.status === 'sent' ? 'default' : 'secondary'}>
                        {log.status}
                      </Badge>
                      <span className="ml-2 text-muted-foreground">
                        {new Date(log.sentAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
