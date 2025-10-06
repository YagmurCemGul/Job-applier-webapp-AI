import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Interview } from '@/types/interview.types'
import { useApplicationsStore } from '@/store/applicationsStore'
import { Badge } from '@/components/ui/badge'

export default function OverviewTab({ interview }: { interview: Interview }) {
  const { items: applications } = useApplicationsStore()
  const app = applications.find((a) => a.id === interview.applicationId)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="text-sm font-medium">Name</div>
            <div className="text-sm text-muted-foreground">{interview.candidateName}</div>
          </div>
          {interview.candidateEmail && (
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-muted-foreground">{interview.candidateEmail}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium">Role</div>
            <div className="text-sm text-muted-foreground">{interview.role}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Company</div>
            <div className="text-sm text-muted-foreground">{interview.company}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="text-sm font-medium">Stage</div>
            <Badge variant="outline">{interview.stage}</Badge>
          </div>
          <div>
            <div className="text-sm font-medium">Panel Size</div>
            <div className="text-sm text-muted-foreground">
              {interview.panel.length} interviewer(s)
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Score Submissions</div>
            <div className="text-sm text-muted-foreground">
              {interview.scoreSubmissions.length} submitted
            </div>
          </div>
          {app && (
            <div>
              <div className="text-sm font-medium">Match Score</div>
              <div className="text-sm text-muted-foreground">
                {app.score ? `${app.score}%` : 'N/A'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {interview.panel.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Interview Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {interview.panel.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-2">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {p.email} {p.role && `• ${p.role}`}
                    </div>
                  </div>
                  {p.required && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
