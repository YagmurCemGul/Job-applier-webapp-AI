import KanbanBoard from './KanbanBoard'
import ApplyLogsPanel from './ApplyLogsPanel'
import SequenceBuilderDialog from './SequenceBuilderDialog'
import EmailTemplateDialog from './EmailTemplateDialog'
import ApplyDialog from './ApplyDialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { funnel } from '@/services/insights/applications.insights.service'

export default function ApplicationsPage() {
  const [openApply, setOpenApply] = useState(false)
  const [openSeq, setOpenSeq] = useState(false)
  const [openTpl, setOpenTpl] = useState(false)
  const f = funnel()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setOpenApply(true)}>Auto-Apply</Button>
        <Button variant="outline" onClick={() => setOpenSeq(true)}>
          Sequences
        </Button>
        <Button variant="outline" onClick={() => setOpenTpl(true)}>
          Email Templates
        </Button>
        <div className="ml-auto text-xs text-muted-foreground">
          Funnel: A {f.applied} • V {f.viewed} • I {f.interview} • O {f.offer} • R {f.rejected}
        </div>
      </div>

      <KanbanBoard />
      <ApplyLogsPanel />

      <ApplyDialog open={openApply} onOpenChange={setOpenApply} />
      <SequenceBuilderDialog open={openSeq} onOpenChange={setOpenSeq} />
      <EmailTemplateDialog open={openTpl} onOpenChange={setOpenTpl} />
    </div>
  )
}
