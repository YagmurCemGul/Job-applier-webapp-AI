/**
 * @fileoverview Cadence Scheduler component (Step 45)
 * @module components/onboarding/CadenceScheduler
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, AlertCircle } from 'lucide-react';
import { buildCadences } from '@/services/onboarding/cadences.service';
import { createCadenceEvents } from '@/services/integrations/calendarOnboarding.service';
import type { CadenceEvent } from '@/types/onboarding.types';

interface Props {
  onCadencesCreated: (events: CadenceEvent[]) => void;
}

/**
 * Cadence Scheduler - create recurring meetings
 */
export function CadenceScheduler({ onCadencesCreated }: Props) {
  const { t } = useTranslation();
  const [config, setConfig] = useState({
    managerEmail: '',
    mentorEmail: '',
    buddyEmail: '',
    startDate: new Date().toISOString().split('T')[0],
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [previews, setPreviews] = useState<CadenceEvent[]>([]);
  const [creating, setCreating] = useState(false);
  
  const handlePreview = () => {
    const events = buildCadences({
      tz: config.tz,
      startISO: new Date(config.startDate).toISOString(),
      managerEmail: config.managerEmail,
      mentorEmail: config.mentorEmail,
      buddyEmail: config.buddyEmail
    });
    setPreviews(events);
  };
  
  const handleCreate = async () => {
    setCreating(true);
    try {
      // In production, get credentials from auth store
      const accountId = 'demo@example.com';
      const clientId = 'demo-client-id';
      const passphrase = 'demo-passphrase';
      
      const results = await createCadenceEvents(previews, accountId, clientId, passphrase);
      const eventsWithIds = previews.map((ev, i) => ({
        ...ev,
        calendarEventId: results[i]?.id
      }));
      
      onCadencesCreated(eventsWithIds);
    } catch (err) {
      console.error('Failed to create cadence events:', err);
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('onboard.cadences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration */}
          <div className="space-y-3">
            <div>
              <Label>Manager Email</Label>
              <Input
                type="email"
                value={config.managerEmail}
                onChange={(e) => setConfig({ ...config, managerEmail: e.target.value })}
                placeholder="manager@company.com"
              />
            </div>
            <div>
              <Label>Mentor Email (optional)</Label>
              <Input
                type="email"
                value={config.mentorEmail}
                onChange={(e) => setConfig({ ...config, mentorEmail: e.target.value })}
                placeholder="mentor@company.com"
              />
            </div>
            <div>
              <Label>Buddy Email (optional)</Label>
              <Input
                type="email"
                value={config.buddyEmail}
                onChange={(e) => setConfig({ ...config, buddyEmail: e.target.value })}
                placeholder="buddy@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Timezone</Label>
                <Input
                  value={config.tz}
                  onChange={(e) => setConfig({ ...config, tz: e.target.value })}
                  placeholder="America/New_York"
                />
              </div>
            </div>
          </div>
          
          <Button onClick={handlePreview} variant="outline" className="w-full">
            Preview Cadences
          </Button>
          
          {/* Preview */}
          {previews.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium">Cadences Preview</h4>
              <div className="space-y-2">
                {previews.map(ev => (
                  <div key={ev.id} className="text-sm border rounded p-2">
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-muted-foreground">
                      {new Date(ev.startISO).toLocaleString()} ({ev.recurrence})
                    </div>
                    {ev.attendees.length > 0 && (
                      <div className="text-xs mt-1">Attendees: {ev.attendees.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-3">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Events have been adjusted to respect quiet hours (10pm-7am).
                </p>
              </div>
              
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                {creating ? 'Creating...' : t('onboard.createCalendar')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
