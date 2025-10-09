/**
 * @fileoverview Email templates library with variables
 * @module components/network/TemplatesLibrary
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, FileText } from 'lucide-react';
import { useOutreach } from '@/stores/outreach.store';
import { DEFAULT_VARS } from '@/services/outreach/templates.service';
import type { Template } from '@/types/outreach.types';

export function TemplatesLibrary() {
  const { t } = useTranslation();
  const { templates, upsertTemplate } = useOutreach();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Partial<Template>>({});

  const handleNew = () => {
    setForm({ variables: DEFAULT_VARS });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.subject || !form.bodyHtml) return;
    const tpl: Template = {
      id: form.id || crypto.randomUUID(),
      name: form.name,
      subject: form.subject,
      bodyHtml: form.bodyHtml,
      variables: form.variables || DEFAULT_VARS,
      category: form.category
    };
    upsertTemplate(tpl);
    setEditOpen(false);
    setForm({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('network.templates')}</h3>
        <Button onClick={handleNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(tpl => (
          <Card key={tpl.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setForm(tpl); setEditOpen(true); }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {tpl.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tpl.subject}</p>
              {tpl.category && (
                <Badge variant="outline" className="mt-2">{tpl.category}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit' : 'Create'} Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tpl-name">Template Name</Label>
              <Input
                id="tpl-name"
                value={form.name || ''}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-subject">Subject Line</Label>
              <Input
                id="tpl-subject"
                value={form.subject || ''}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Use {{FirstName}} for personalization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-body">Body (HTML)</Label>
              <Textarea
                id="tpl-body"
                value={form.bodyHtml || ''}
                onChange={e => setForm({ ...form, bodyHtml: e.target.value })}
                rows={8}
                placeholder="<p>Hi {{FirstName}},</p><p>...</p>"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Available variables: {DEFAULT_VARS.map(v => `{{${v.key}}}`).join(', ')}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.subject}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
