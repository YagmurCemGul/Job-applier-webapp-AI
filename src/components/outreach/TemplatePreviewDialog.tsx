import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { renderTemplate } from '@/services/outreach/templateRender.service'
import { useEmailTemplatesStore } from '@/store/emailTemplatesStore'

export default function TemplatePreviewDialog({
  open,
  onOpenChange,
  templateId,
  vars,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  templateId?: string
  vars: Record<string, string>
}) {
  const tpl = useEmailTemplatesStore.getState().getById(templateId ?? '')

  const rendered = tpl ? renderTemplate({ subject: tpl.subject, body: tpl.body }, vars) : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl space-y-3">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
        </DialogHeader>
        {!tpl ? (
          <div className="text-sm text-muted-foreground">No template.</div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Subject:</span> {rendered?.subject}
            </div>
            <div
              className="prose max-w-none rounded-md border p-3"
              dangerouslySetInnerHTML={{ __html: rendered?.html || '' }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
