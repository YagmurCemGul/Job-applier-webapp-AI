/**
 * @fileoverview Events board for meetups, conferences, networking events
 * @module components/network/EventsBoard
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin } from 'lucide-react';
import { useEvents } from '@/stores/events.store';
import { EventDetail } from './EventDetail';

export function EventsBoard() {
  const { t } = useTranslation();
  const { items } = useEvents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const sortedEvents = [...items].sort((a, b) => 
    new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('network.events')}</h3>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEvents.map(event => (
          <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedId(event.id)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(event.dateISO).toLocaleDateString()}
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                {event.rsvp && (
                  <Badge variant={event.rsvp === 'yes' ? 'default' : 'outline'}>
                    {t(`network.rsvp.${event.rsvp}`)}
                  </Badge>
                )}
                {event.attendees.length > 0 && (
                  <Badge variant="secondary">
                    {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedId && (
        <EventDetail
          eventId={selectedId}
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
      {createOpen && (
        <EventDetail
          eventId="new"
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}
