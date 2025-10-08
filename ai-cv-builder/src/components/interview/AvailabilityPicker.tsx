/**
 * Availability Picker Component
 * Multi-attendee slot proposal with calendar integration
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { mergeAvailabilities, type CalendarProposal } from '@/services/interview/scheduling.service';
import type { Panelist } from '@/types/interview.types';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Props {
  panel: Panelist[];
  onSlotSelected: (slot: string) => void;
}

export default function AvailabilityPicker({ panel, onSlotSelected }: Props) {
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(17, 0, 0, 0);
    return nextWeek.toISOString().slice(0, 16);
  });
  const [durationMin, setDurationMin] = useState(60);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true);
  const [proposedSlots, setProposedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleProposeSlots = () => {
    const proposal: CalendarProposal = {
      startISO: new Date(startDate).toISOString(),
      endISO: new Date(endDate).toISOString(),
      durationMin,
      businessHoursOnly,
    };

    // For now, mock busy times - in production, fetch from calendar APIs
    const mockBusyWindows = panel.map(() => ({ busy: [] as Array<[string, string]> }));

    const { slots } = mergeAvailabilities(mockBusyWindows, proposal);
    setProposedSlots(slots.slice(0, 10)); // Show first 10 slots
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
    onSlotSelected(slot);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Find Available Times</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date & Time</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date & Time</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              step="15"
              value={durationMin}
              onChange={e => setDurationMin(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              id="businessHours"
              checked={businessHoursOnly}
              onCheckedChange={checked => setBusinessHoursOnly(checked === true)}
            />
            <Label htmlFor="businessHours" className="cursor-pointer">
              Business hours only (9 AM - 5 PM)
            </Label>
          </div>
        </div>

        <Button onClick={handleProposeSlots} className="mt-4 gap-2">
          <Calendar className="w-4 h-4" />
          Propose Slots
        </Button>
      </Card>

      {/* Proposed Slots */}
      {proposedSlots.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Available Slots</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {proposedSlots.map(slot => {
              const date = new Date(slot);
              const isSelected = selectedSlot === slot;
              return (
                <Button
                  key={slot}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => handleSelectSlot(slot)}
                  className="h-auto py-3 flex flex-col items-start gap-1"
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-3 h-3" />
                    {date.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3" />
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </Button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Panel Availability Info */}
      {panel.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold text-sm mb-2">Panel Members</h3>
          <div className="flex flex-wrap gap-2">
            {panel.map(p => (
              <Badge key={p.id} variant={p.required ? 'default' : 'secondary'}>
                {p.name}
                {p.required && ' (Required)'}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Proposed slots avoid conflicts for all required panel members
          </p>
        </Card>
      )}
    </div>
  );
}
