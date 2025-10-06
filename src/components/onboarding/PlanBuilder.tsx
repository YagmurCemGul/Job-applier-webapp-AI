import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useOnboardingStore } from '@/store/onboardingStore'
import {
  defaultMilestones,
  seedTasks,
  personalizeTasksWithAI,
} from '@/services/onboarding/planBuilder.service'
import type { OnboardingPlan } from '@/types/onboarding.types'
import { Sparkles, Plus } from 'lucide-react'

export default function PlanBuilder({
  plan,
  onUpdate,
}: {
  plan?: OnboardingPlan
  onUpdate?: (plan: OnboardingPlan) => void
}) {
  const { upsert, setTask } = useOnboardingStore()
  const [isPersonalizing, setIsPersonalizing] = useState(false)

  const handleSeedPlan = () => {
    if (!plan) return

    const milestones = defaultMilestones()
    const tasks = seedTasks(plan.role)

    const updated = {
      ...plan,
      milestones,
      tasks,
      updatedAt: new Date().toISOString(),
    }

    upsert(updated)
    onUpdate?.(updated)
  }

  const handlePersonalize = async () => {
    if (!plan) return

    setIsPersonalizing(true)
    try {
      const newTasks = await personalizeTasksWithAI(plan.tasks, {
        role: plan.role,
        company: plan.company,
      })

      const updated = {
        ...plan,
        tasks: newTasks,
        updatedAt: new Date().toISOString(),
      }

      upsert(updated)
      onUpdate?.(updated)
    } finally {
      setIsPersonalizing(false)
    }
  }

  const handleToggleTask = (taskId: string) => {
    if (!plan) return

    const task = plan.tasks.find((t) => t.id === taskId)
    if (!task) return

    setTask(plan.id, taskId, {
      status: task.status === 'done' ? 'todo' : 'done',
    })
  }

  if (!plan) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Plan Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Company</Label>
              <Input value={plan.company} disabled />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={plan.role} disabled />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSeedPlan} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Seed Plan
            </Button>
            <Button
              onClick={handlePersonalize}
              disabled={isPersonalizing || plan.tasks.length === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isPersonalizing ? 'Personalizing...' : 'Personalize with AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks ({plan.tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 rounded-md border p-2">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => handleToggleTask(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className={task.status === 'done' ? 'line-through' : undefined}>
                    {task.title}
                  </div>
                  {task.details && (
                    <div className="mt-1 text-xs text-muted-foreground">{task.details}</div>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge variant="outline">{task.status}</Badge>
              </div>
            ))}
            {plan.tasks.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No tasks yet. Click "Seed Plan" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
