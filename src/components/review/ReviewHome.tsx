import { useParams } from 'react-router-dom'
import { useReviewsStore } from '@/store/reviewStore'
import { useFeedbackStore } from '@/store/feedbackStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfidentialBanner from './ConfidentialBanner'
import { FileText, Users, Target, TrendingUp, MessageSquare } from 'lucide-react'

export default function ReviewHome() {
  const { id } = useParams<{ id: string }>()
  const { byId, impactsByCycle, selfByCycle } = useReviewsStore()
  const { byCycle } = useFeedbackStore()

  const cycle = byId(id || '')
  const impacts = impactsByCycle(id || '')
  const self = selfByCycle(id || '')
  const feedback = byCycle(id || '')

  if (!cycle) {
    return <div className="p-6 text-center text-muted-foreground">Review cycle not found</div>
  }

  const responseRate = feedback.requests.length
    ? (feedback.responses.length / feedback.requests.length) * 100
    : 0

  return (
    <div className="space-y-6">
      <ConfidentialBanner />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{cycle.title}</h1>
          <Badge variant="outline">{cycle.stage}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {cycle.kind.replace('_', ' ')} • {new Date(cycle.startISO).toLocaleDateString()} -{' '}
          {new Date(cycle.endISO).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Impacts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{impacts.length}</div>
            <p className="text-xs text-muted-foreground">Evidence collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.responses.length}/{feedback.requests.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(responseRate)}% response rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Self-Review</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{self ? `${self.wordCount}` : '0'}</div>
            <p className="text-xs text-muted-foreground">Words written</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Readiness</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {self && impacts.length > 0 ? 'Ready' : 'Draft'}
            </div>
            <p className="text-xs text-muted-foreground">Status</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
