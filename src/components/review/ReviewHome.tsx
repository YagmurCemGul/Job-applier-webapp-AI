import { useParams } from 'react-router-dom'
import { useReviewsStore } from '@/store/reviewStore'
import { useFeedbackStore } from '@/store/feedbackStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, MessageSquare, FileText, TrendingUp } from 'lucide-react'
import ConfidentialBanner from './ConfidentialBanner'

export default function ReviewHome() {
  const { id } = useParams<{ id: string }>()
  const { byId, impactsByCycle, selfByCycle } = useReviewsStore()
  const { byCycle } = useFeedbackStore()

  const cycle = byId(id || '')
  const impacts = impactsByCycle(id || '')
  const self = selfByCycle(id || '')
  const { requests, responses } = byCycle(id || '')

  if (!cycle) {
    return <div className="p-6 text-center text-muted-foreground">Review cycle not found</div>
  }

  const responseRate =
    requests.length > 0 ? Math.round((responses.length / requests.length) * 100) : 0

  const completeness = self ? Math.round((self.wordCount / 600) * 100) : 0

  const readiness = impacts.length > 5 && responses.length > 0 && self ? 100 : 50

  return (
    <div className="space-y-6">
      <ConfidentialBanner />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{cycle.title}</h1>
          <Badge variant="outline">{cycle.stage}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {cycle.kind.replace('_', ' ')} • {new Date(cycle.startISO).toLocaleDateString()} -{' '}
          {new Date(cycle.endISO).toLocaleDateString()}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Impacts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{impacts.length}</div>
            <p className="text-xs text-muted-foreground">Entries collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responses.length}</div>
            <p className="text-xs text-muted-foreground">{responseRate}% response rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Self-Review</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completeness}%</div>
            <p className="text-xs text-muted-foreground">
              {self ? `${self.wordCount} words` : 'Not started'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Readiness</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readiness}%</div>
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Target className="mr-2 h-4 w-4" />
              Aggregate Impact
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Request Feedback
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Compose Self-Review
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {cycle.deadlines.length > 0 ? (
              <div className="space-y-2">
                {cycle.deadlines.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <span>{d.label}</span>
                    <Badge variant="secondary">{new Date(d.atISO).toLocaleDateString()}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No deadlines set</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
        <div className="text-sm text-blue-800">
          💡 AI outputs are guidance only — verify with your manager
        </div>
      </div>
    </div>
  )
}
