/**
 * Overview Tab
 * Candidate snapshot, application link, and match score
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Interview } from '@/types/interview.types';
import { User, Briefcase, Building, Mail, Phone, Calendar, ExternalLink } from 'lucide-react';

interface Props {
  interview: Interview;
}

export default function OverviewTab({ interview }: Props) {
  return (
    <div className="space-y-6">
      {/* Candidate Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Candidate Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{interview.candidateName}</div>
            </div>
          </div>

          {interview.candidateEmail && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{interview.candidateEmail}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Role</div>
              <div className="font-medium">{interview.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Company</div>
              <div className="font-medium">{interview.company}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Application Link */}
      {interview.applicationId && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Related Application</h2>
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = `/applications?id=${interview.applicationId}`)
            }
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Application
          </Button>
        </Card>
      )}

      {/* Interview Panel */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Interview Panel</h2>
        <div className="space-y-3">
          {interview.panel.length === 0 ? (
            <p className="text-sm text-muted-foreground">No panelists assigned</p>
          ) : (
            interview.panel.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {p.email}
                    {p.role && ` • ${p.role}`}
                  </div>
                </div>
                {p.required && <Badge variant="secondary">Required</Badge>}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Meeting Details */}
      {interview.meeting && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Meeting Details</h2>
          <div className="space-y-3">
            {interview.meeting.whenISO && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                  <div className="font-medium">
                    {new Date(interview.meeting.whenISO).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Duration:</div>
              <div className="font-medium">{interview.meeting.durationMin} minutes</div>
            </div>

            {interview.meeting.link && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Meeting Link:</div>
                <a
                  href={interview.meeting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {interview.meeting.link}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Consent Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recording Consent</h2>
        <div className="flex items-center justify-between">
          <div>
            <Badge variant={interview.consent.recordingAllowed ? 'default' : 'secondary'}>
              {interview.consent.recordingAllowed ? 'Granted' : 'Not Granted'}
            </Badge>
            {interview.consent.capturedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Captured on {new Date(interview.consent.capturedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
