import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Interview } from '@/types/interview.types'
import { useInterviewsStore } from '@/store/interviewsStore'
import PanelEditor from '../PanelEditor'
import AvailabilityPicker from '../AvailabilityPicker'

export default function ScheduleTab({ interview }: { interview: Interview }) {
  const { update } = useInterviewsStore()
  const [showAvailability, setShowAvailability] = useState(false)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interview Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <PanelEditor
            panel={interview.panel}
            onChange={(panel) => update(interview.id, { panel })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {interview.meeting?.whenISO ? (
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium">Scheduled Time</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(interview.meeting.whenISO).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">
                  {interview.meeting.durationMin} minutes
                </div>
              </div>
              {interview.meeting.link && (
                <div>
                  <div className="text-sm font-medium">Meeting Link</div>
                  <a
                    href={interview.meeting.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {interview.meeting.link}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No meeting scheduled yet</div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAvailability(!showAvailability)}>
              {showAvailability ? 'Hide' : 'Show'} Availability Picker
            </Button>
            <Button variant="outline">Create Calendar Event</Button>
            <Button variant="outline">Send Invites</Button>
          </div>

          {showAvailability && (
            <AvailabilityPicker
              panel={interview.panel}
              durationMin={interview.meeting?.durationMin || 60}
              onSelectSlot={(slot) => {
                update(interview.id, {
                  meeting: {
                    ...interview.meeting,
                    whenISO: slot,
                    durationMin: interview.meeting?.durationMin || 60,
                    provider: 'google_meet',
                  },
                  stage: 'scheduled',
                })
                setShowAvailability(false)
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
