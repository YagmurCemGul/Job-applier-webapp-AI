/**
 * Schedule Tab
 * Availability picker, calendar event creation, and invite sending
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Interview } from '@/types/interview.types';
import AvailabilityPicker from '../AvailabilityPicker';
import { createInterviewEvent } from '@/services/interview/scheduling.service';
import { generateMeetingLink } from '@/services/interview/meetingLinks.service';
import { Calendar, Link as LinkIcon, Mail, Copy, Check } from 'lucide-react';

interface Props {
  interview: Interview;
  onUpdate: (interview: Interview) => void;
}

export default function ScheduleTab({ interview, onUpdate }: Props) {
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [meetingLink, setMeetingLink] = useState(interview.meeting?.link || '');
  const [copied, setCopied] = useState(false);

  const handleSlotSelected = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleCreateEvent = async () => {
    if (!selectedSlot) {
      toast({
        title: 'No slot selected',
        description: 'Please select a time slot first',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      // Use first available account - in production, let user select
      const accountId = 'default';
      const event = await createInterviewEvent({
        accountId,
        title: `Interview: ${interview.candidateName} - ${interview.role}`,
        whenISO: selectedSlot,
        durationMin: interview.meeting?.durationMin || 60,
        attendees: [
          ...interview.panel.map(p => p.email),
          ...(interview.candidateEmail ? [interview.candidateEmail] : []),
        ],
        location: interview.meeting?.provider === 'google_meet' ? 'Google Meet' : undefined,
        description: `Interview for ${interview.role} at ${interview.company}`,
      });

      const link = generateMeetingLink(
        interview.meeting?.provider || 'google_meet',
        event.htmlLink
      );

      const updated: Interview = {
        ...interview,
        meeting: {
          ...interview.meeting!,
          calendarEventId: event.id,
          whenISO: selectedSlot,
          link,
        },
        stage: 'scheduled',
      };

      onUpdate(updated);
      setMeetingLink(link);

      toast({
        title: 'Event created',
        description: 'Calendar event created successfully',
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create calendar event',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!meetingLink) return;
    await navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Meeting link copied to clipboard' });
  };

  const handleSendInvites = async () => {
    toast({
      title: 'Sending invites',
      description: 'Email invites will be sent via Gmail integration',
    });
    // TODO: Implement via Step 35 Gmail service
  };

  return (
    <div className="space-y-6">
      {/* Availability Picker */}
      <AvailabilityPicker panel={interview.panel} onSlotSelected={handleSlotSelected} />

      {/* Selected Slot & Actions */}
      {selectedSlot && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-3">Selected Time</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium">
                {new Date(selectedSlot).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Duration: {interview.meeting?.durationMin || 60} minutes
              </div>
            </div>

            <Button onClick={handleCreateEvent} disabled={creating} className="gap-2">
              <Calendar className="w-4 h-4" />
              {creating ? 'Creating...' : 'Create Calendar Event'}
            </Button>
          </div>
        </Card>
      )}

      {/* Meeting Link */}
      {meetingLink && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Meeting Link</h3>
          <div className="flex gap-2">
            <Input value={meetingLink} readOnly className="flex-1" />
            <Button variant="outline" onClick={handleCopyLink} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </Card>
      )}

      {/* Send Invites */}
      {interview.meeting?.calendarEventId && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Send Invitations</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Send email invitations to all panel members and the candidate
          </p>
          <Button onClick={handleSendInvites} variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Send Email Invites
          </Button>
        </Card>
      )}

      {/* Current Schedule */}
      {interview.meeting?.whenISO && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Current Schedule</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{new Date(interview.meeting.whenISO).toLocaleString()}</span>
            </div>
            {interview.meeting.link && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <a
                  href={interview.meeting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {interview.meeting.link}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
