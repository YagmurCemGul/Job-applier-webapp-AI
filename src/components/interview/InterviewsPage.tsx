import { useState } from 'react'
import { useInterviewsStore } from '@/store/interviewsStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, FileText, Users } from 'lucide-react'
import InterviewCreateDialog from './InterviewCreateDialog'
import { useNavigate } from 'react-router-dom'

export default function InterviewsPage() {
  const { items } = useInterviewsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()

  const filtered = items.filter((i) => {
    const matchesSearch =
      i.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = stageFilter === 'all' || i.stage === stageFilter

    return matchesSearch && matchesStage
  })

  const stages = ['all', 'planned', 'scheduled', 'in_progress', 'completed']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Interviews</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Interview
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search interviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-md border px-3 py-2"
        >
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage === 'all' ? 'All Stages' : stage}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.map((interview) => (
          <Card
            key={interview.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/interviews/${interview.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{interview.candidateName}</h3>
                    <Badge variant="outline">{interview.stage}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {interview.role} at {interview.company}
                  </p>
                  {interview.meeting?.whenISO && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(interview.meeting.whenISO).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {interview.panel.length}
                  </div>
                  {interview.scoreSubmissions.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {interview.scoreSubmissions.length}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">No interviews found</div>
        )}
      </div>

      <InterviewCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
