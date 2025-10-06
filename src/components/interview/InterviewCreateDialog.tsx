import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInterviewsStore } from '@/store/interviewsStore'
import { useApplicationsStore } from '@/store/applicationsStore'
import { useNavigate } from 'react-router-dom'

export default function InterviewCreateDialog({
  open,
  onOpenChange,
  applicationId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  applicationId?: string
}) {
  const { upsert } = useInterviewsStore()
  const { items: applications } = useApplicationsStore()
  const navigate = useNavigate()

  const [selectedAppId, setSelectedAppId] = useState(applicationId || '')
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [durationMin, setDurationMin] = useState(60)

  const handleCreate = () => {
    const app = applications.find((a) => a.id === selectedAppId)
    if (!app) return

    const interview = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      applicationId: selectedAppId,
      candidateName: candidateName || 'Candidate',
      candidateEmail: candidateEmail,
      role: app.role,
      company: app.company,
      stage: 'planned' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      meeting: {
        provider: 'google_meet' as const,
        durationMin: durationMin,
      },
      panel: [],
      consent: { recordingAllowed: false },
      scoreSubmissions: [],
    }

    upsert(interview)
    onOpenChange(false)
    navigate(`/interviews/${interview.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Interview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Application</Label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select Application</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.role} at {app.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Candidate Name</Label>
            <Input
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter candidate name"
            />
          </div>

          <div>
            <Label>Candidate Email</Label>
            <Input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="candidate@example.com"
            />
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              min={15}
              max={240}
            />
          </div>

          <Button onClick={handleCreate} className="w-full">
            Create Interview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
