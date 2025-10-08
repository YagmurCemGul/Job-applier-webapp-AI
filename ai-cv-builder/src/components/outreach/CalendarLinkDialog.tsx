/**
 * Calendar Link Dialog
 * Propose meeting times and generate ICS files
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { proposeSlots } from '@/services/integrations/calendar.real.service';
import { buildICS } from '@/services/integrations/ics.service';
import { Calendar, Download, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';

interface CalendarLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: { durationMin?: number; title?: string };
}

export default function CalendarLinkDialog({
  open,
  onOpenChange,
  defaults
}: CalendarLinkDialogProps) {
  const [durationMin, setDurationMin] = useState(defaults?.durationMin ?? 30);
  const [title, setTitle] = useState(defaults?.title ?? 'Interview Discussion');

  const proposal = useMemo(() => {
    const now = new Date();
    const in2Days = new Date(now.getTime() + 2 * 24 * 3600 * 1000);

    return proposeSlots({
      durationMin,
      windowStartISO: now.toISOString(),
      windowEndISO: in2Days.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }, [durationMin]);

  const downloadICS = (slot: string) => {
    const icsData = buildICS({
      uid: crypto?.randomUUID?.() ?? String(Date.now()),
      title,
      startISO: slot,
      durationMin,
      description: 'Proposed meeting time'
    });

    const blob = new Blob([icsData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${new Date(slot).toISOString().split('T')[0]}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Propose Meeting Times
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Interview Discussion"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                min={15}
                max={180}
                step={15}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Suggested Slots (Next 2 Days)
            </div>
            
            <div className="grid gap-2 max-h-64 overflow-auto">
              {proposal.slots.map((slot) => {
                const date = new Date(slot);
                return (
                  <div
                    key={slot}
                    className="flex items-center justify-between border rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm">
                        {date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadICS(slot)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download ICS
                    </Button>
                  </div>
                );
              })}

              {proposal.slots.length === 0 && (
                <div className="text-sm text-muted-foreground py-8 text-center border rounded-md">
                  No available slots in the time window.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
