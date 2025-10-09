/**
 * @fileoverview Event detail dialog with RSVP and QR card
 * @module components/network/EventDetail
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { QrCode } from 'lucide-react';
import { useEvents } from '@/stores/events.store';
import { BusinessCardQR } from './BusinessCardQR';
import type { EventItem } from '@/types/events.types';

interface Props {
  eventId: string;
  open: boolean;
  onClose: () => void;
}

export function EventDetail({ eventId, open, onClose }: Props) {
  const { t } = useTranslation();
  const { items, upsert } = useEvents();
  const event = items.find(e => e.id === eventId);
  const [form, setForm] = useState<Partial<EventItem>>(event || {
    title: '',
    dateISO: new Date().toISOString().split('T')[0],
    attendees: [],
    rsvp: 'maybe'
  });
  const [showQR, setShowQR] = useState(false);

  const handleSave = () => {
    const evt: EventItem = {
      id: event?.id || crypto.randomUUID(),
      title: form.title!,
      dateISO: form.dateISO!,
      location: form.location,
      url: form.url,
      attendees: form.attendees || [],
      notes: form.notes,
      rsvp: form.rsvp
    };
    upsert(evt);
    onClose();
  };

  return (
    <>
      <Dialog open={open && !showQR} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{event ? 'Edit' : 'Create'} Event</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., React Summit 2025"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.dateISO?.split('T')[0]}
                  onChange={e => setForm({ ...form, dateISO: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rsvp">RSVP Status</Label>
                <Select value={form.rsvp} onValueChange={(v: any) => setForm({ ...form, rsvp: v })}>
                  <SelectTrigger id="rsvp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t('network.rsvp.yes')}</SelectItem>
                    <SelectItem value="no">{t('network.rsvp.no')}</SelectItem>
                    <SelectItem value="maybe">{t('network.rsvp.maybe')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location || ''}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Convention Center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={form.url || ''}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes || ''}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Session notes, contacts made, etc."
              />
            </div>

            <Button variant="outline" onClick={() => setShowQR(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Show Business Card QR
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.dateISO}>
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showQR && (
        <BusinessCardQR open={showQR} onClose={() => setShowQR(false)} />
      )}
    </>
  );
}
