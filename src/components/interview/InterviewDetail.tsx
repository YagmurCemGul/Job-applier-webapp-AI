import { useParams } from 'react-router-dom'
import { useInterviewsStore } from '@/store/interviewsStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, FileText, Users, Mail, Folder, StickyNote } from 'lucide-react'
import OverviewTab from './tabs/OverviewTab'
import ScheduleTab from './tabs/ScheduleTab'
import ScorecardsTab from './tabs/ScorecardsTab'
import NotesTranscriptTab from './tabs/NotesTranscriptTab'
import FilesTab from './tabs/FilesTab'
import EmailsTab from './tabs/EmailsTab'

export default function InterviewDetail() {
  const { id } = useParams<{ id: string }>()
  const { getById } = useInterviewsStore()
  const interview = getById(id || '')

  if (!interview) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Interview not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{interview.candidateName}</h1>
            <Badge variant="outline">{interview.stage}</Badge>
          </div>
          <p className="text-muted-foreground">
            {interview.role} at {interview.company}
          </p>
          {interview.meeting?.whenISO && (
            <p className="text-sm text-muted-foreground">
              Scheduled: {new Date(interview.meeting.whenISO).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Scorecards
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Users className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="scorecards">
            <FileText className="mr-2 h-4 w-4" />
            Scorecards
          </TabsTrigger>
          <TabsTrigger value="notes">
            <StickyNote className="mr-2 h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="files">
            <Folder className="mr-2 h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="emails">
            <Mail className="mr-2 h-4 w-4" />
            Emails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab interview={interview} />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleTab interview={interview} />
        </TabsContent>

        <TabsContent value="scorecards">
          <ScorecardsTab interview={interview} />
        </TabsContent>

        <TabsContent value="notes">
          <NotesTranscriptTab interview={interview} />
        </TabsContent>

        <TabsContent value="files">
          <FilesTab interview={interview} />
        </TabsContent>

        <TabsContent value="emails">
          <EmailsTab interview={interview} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
