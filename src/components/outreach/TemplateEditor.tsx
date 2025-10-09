/**
 * @fileoverview Template Editor Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useOutreach } from '@/stores/outreach.store';
import { renderTemplate } from '@/services/outreach/templates.service';
import type { Template } from '@/types/outreach.types';
import { FileText, Eye, Copy } from 'lucide-react';

/**
 * Template editor with variables, snippets, and preview.
 */
export function TemplateEditor() {
  const { t } = useTranslation();
  const { templates, upsertTemplate } = useOutreach();
  const [selected, setSelected] = useState<Template | null>(templates[0] || null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    if (!selected) return;
    upsertTemplate(selected);
    alert('Template saved');
  };

  const handleNew = () => {
    const newTpl: Template = {
      id: crypto.randomUUID(),
      name: 'New Template',
      subject: '',
      html: '',
      footer: '<p style="color:#6b7280;font-size:12px">You are receiving this because we believe this is relevant to your role. <a href="{{unsubscribeUrl}}">Unsubscribe</a> • {{postalAddress}}</p>',
      variables: [],
      snippets: {},
    };
    setSelected(newTpl);
  };

  const sampleVars = {
    firstName: 'Alex',
    company: 'Acme Corp',
    schedulerLink: 'https://example.com/schedule',
    unsubscribeUrl: 'https://example.com/unsub',
    postalAddress: '123 Main St, San Francisco, CA 94102',
  };

  const preview = selected ? renderTemplate(selected, sampleVars) : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Template List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              <FileText className="inline mr-2 h-5 w-5" />
              Templates
            </span>
            <Button onClick={handleNew} variant="outline" size="sm">
              New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                className={`p-2 border rounded cursor-pointer ${selected?.id === tpl.id ? 'bg-muted' : ''}`}
                onClick={() => setSelected(tpl)}
              >
                <p className="font-medium">{tpl.name}</p>
                <p className="text-xs text-muted-foreground">{tpl.subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Editor</span>
            <div className="space-x-2">
              <Button onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleSave} variant="default" size="sm">
                Save
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <p className="text-sm text-muted-foreground">Select a template or create a new one</p>
          ) : showPreview ? (
            <div className="space-y-4">
              <div>
                <Label>Subject Preview</Label>
                <p className="text-sm border p-2 rounded mt-1">{preview?.subject}</p>
              </div>
              <div>
                <Label>Body Preview</Label>
                <div
                  className="text-sm border p-2 rounded mt-1"
                  dangerouslySetInnerHTML={{ __html: preview?.html || '' }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tpl-name">Template Name</Label>
                <Input
                  id="tpl-name"
                  value={selected.name}
                  onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tpl-subject">Subject</Label>
                <Input
                  id="tpl-subject"
                  value={selected.subject}
                  onChange={(e) => setSelected({ ...selected, subject: e.target.value })}
                  placeholder="Use {{variable}} for dynamic content"
                />
              </div>
              <div>
                <Label htmlFor="tpl-html">Body HTML</Label>
                <Textarea
                  id="tpl-html"
                  value={selected.html}
                  onChange={(e) => setSelected({ ...selected, html: e.target.value })}
                  rows={10}
                  placeholder="Use {{variable}} and {{snippet:name}}"
                />
              </div>
              <div>
                <Label>Variables</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: firstName, company, schedulerLink, unsubscribeUrl, postalAddress
                </p>
              </div>
              <div>
                <Label htmlFor="tpl-footer">Compliance Footer</Label>
                <Textarea
                  id="tpl-footer"
                  value={selected.footer || ''}
                  onChange={(e) => setSelected({ ...selected, footer: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
