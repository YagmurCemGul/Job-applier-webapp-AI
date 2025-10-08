/**
 * Template Preview Dialog
 * Shows rendered template with variable substitution
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { renderTemplate } from '@/services/outreach/templateRender.service';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  vars: Record<string, string>;
}

export default function TemplatePreviewDialog({
  open,
  onOpenChange,
  templateId,
  vars
}: TemplatePreviewDialogProps) {
  const [template, setTemplate] = useState<any>(null);
  const [rendered, setRendered] = useState<any>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;
      
      try {
        const { useEmailTemplates } = await import('@/stores/emailTemplates.store');
        const tpl = useEmailTemplates.getState().getById(templateId);
        setTemplate(tpl);
        
        if (tpl) {
          const result = renderTemplate(
            { subject: tpl.subject, body: tpl.body },
            vars
          );
          setRendered(result);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
      }
    };

    loadTemplate();
  }, [templateId, vars]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Template Preview
          </DialogTitle>
        </DialogHeader>

        {!template ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No template selected.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Subject:</div>
              <div className="text-sm border rounded-md p-3 bg-muted">
                {rendered?.subject || template.subject}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Body:</div>
              <div
                className="border rounded-md p-4 prose prose-sm max-w-none bg-background"
                dangerouslySetInnerHTML={{ __html: rendered?.html || '' }}
              />
            </div>

            {Object.keys(vars).length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Variables:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(vars).map(([key, value]) => (
                    <div
                      key={key}
                      className="text-xs px-2 py-1 border rounded-md bg-muted"
                    >
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
