/**
 * @fileoverview Deadlines tab for Step 37
 * @module components/offer/tabs/DeadlinesTab
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import type { Offer, OfferDeadline, DeadlineKind } from '@/types/offer.types';
import { useOffers } from '@/stores/offers.store';
import { createDeadlineEvent, getDeadlineStatus } from '@/services/offer/deadline.service';
import { toast } from 'sonner';

interface DeadlinesTabProps {
  offer: Offer;
}

export function DeadlinesTab({ offer }: DeadlinesTabProps) {
  const { t } = useTranslation();
  const { update } = useOffers();

  const [deadlines, setDeadlines] = useState<OfferDeadline[]>(offer.deadlines ?? []);
  const [showAdd, setShowAdd] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    label: '',
    atISO: '',
    kind: 'other' as DeadlineKind
  });

  const handleAdd = () => {
    if (!newDeadline.label || !newDeadline.atISO) return;

    const deadline: OfferDeadline = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      ...newDeadline
    };

    const updated = [...deadlines, deadline];
    setDeadlines(updated);
    update(offer.id, { deadlines: updated });

    setNewDeadline({ label: '', atISO: '', kind: 'other' });
    setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    update(offer.id, { deadlines: updated });
  };

  const handleCreateEvent = async (deadline: OfferDeadline) => {
    try {
      // This would need a connected Google account
      const result = await createDeadlineEvent({
        accountId: 'default', // Would come from user selection
        label: deadline.label,
        atISO: deadline.atISO,
        attendees: []
      });

      toast.success('Calendar event created');

      // Update deadline with event ID
      const updated = deadlines.map(d =>
        d.id === deadline.id ? { ...d, calendarEventId: result.eventId } : d
      );
      setDeadlines(updated);
      update(offer.id, { deadlines: updated });
    } catch (error) {
      toast.error('Failed to create calendar event. Ensure Google Calendar is connected.');
    }
  };

  const statusColors = {
    past: 'bg-gray-500',
    approaching: 'bg-orange-500',
    future: 'bg-blue-500'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('offer.deadlines.title')}</CardTitle>
          <Button onClick={() => setShowAdd(!showAdd)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('offer.deadlines.addDeadline')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAdd && (
            <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dl-label">{t('offer.deadlines.label')}</Label>
                  <Input
                    id="dl-label"
                    value={newDeadline.label}
                    onChange={(e) => setNewDeadline({ ...newDeadline, label: e.target.value })}
                    placeholder="Accept by..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dl-date">{t('offer.deadlines.date')}</Label>
                  <Input
                    id="dl-date"
                    type="datetime-local"
                    value={newDeadline.atISO}
                    onChange={(e) => setNewDeadline({ ...newDeadline, atISO: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dl-kind">{t('offer.deadlines.kind')}</Label>
                  <Select
                    value={newDeadline.kind}
                    onValueChange={(v) => setNewDeadline({ ...newDeadline, kind: v as DeadlineKind })}
                  >
                    <SelectTrigger id="dl-kind">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accept">{t('offer.deadlines.kinds.accept')}</SelectItem>
                      <SelectItem value="expire">{t('offer.deadlines.kinds.expire')}</SelectItem>
                      <SelectItem value="background">{t('offer.deadlines.kinds.background')}</SelectItem>
                      <SelectItem value="other">{t('offer.deadlines.kinds.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {deadlines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deadlines set
            </div>
          ) : (
            <div className="space-y-3">
              {deadlines.map((deadline) => {
                const status = getDeadlineStatus(deadline.atISO);

                return (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{deadline.label}</h4>
                        <Badge className={statusColors[status]}>
                          {status === 'approaching' ? t('offer.deadlines.approaching') : status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t(`offer.deadlines.kinds.${deadline.kind}`)} • {new Date(deadline.atISO).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!deadline.calendarEventId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateEvent(deadline)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {t('offer.deadlines.createEvent')}
                        </Button>
                      )}

                      {deadline.calendarEventId && (
                        <Badge variant="outline" className="text-green-600">
                          <Calendar className="mr-1 h-3 w-3" />
                          On Calendar
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(deadline.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
