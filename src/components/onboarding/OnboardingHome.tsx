import { useParams, useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useOKRsStore } from '@/store/okrsStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, Users, Calendar, FileText, TrendingUp, CheckSquare } from 'lucide-react'

export default function OnboardingHome() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById } = useOnboardingStore()
  const { byPlan } = useOKRsStore()

  const plan = getById(id || '')
  const okrs = byPlan(id || '')

  if (!plan) {
    return <div className="p-6 text-center text-muted-foreground">Plan not found</div>
  }

  const tasksDone = plan.tasks.filter((t) => t.status === 'done').length
  const tasksTotal = plan.tasks.length
  const checklistsDone = plan.checklists.filter((c) => c.done).length
  const checklistsTotal = plan.checklists.length

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {plan.company} — {plan.role}
          </h1>
          <Badge variant="outline">{plan.stage}</Badge>
        </div>
        {plan.startDateISO && (
          <p className="text-sm text-muted-foreground">
            Start Date: {new Date(plan.startDateISO).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasksDone}/{tasksTotal}
            </div>
            <p className="text-xs text-muted-foreground">
              {tasksTotal > 0
                ? `${Math.round((tasksDone / tasksTotal) * 100)}% complete`
                : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stakeholders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.stakeholders.length}</div>
            <p className="text-xs text-muted-foreground">Mapped</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">OKRs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{okrs.length}</div>
            <p className="text-xs text-muted-foreground">Objectives</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Evidence</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.evidence.length}</div>
            <p className="text-xs text-muted-foreground">Items collected</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checklists</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklistsDone}/{checklistsTotal}
            </div>
            <p className="text-xs text-muted-foreground">Items done</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">1:1s</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plan.stakeholders.filter((s) => s.cadence).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
        <div className="text-sm text-blue-800">
          💡 Assistant outputs are suggestions — verify with your manager
        </div>
      </div>
    </div>
  )
}
