/**
 * @fileoverview Evidence binder for collecting wins and artifacts.
 * @module components/onboarding/EvidenceBinder
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileDown, FileText } from 'lucide-react';
import type { EvidenceItem } from '@/types/onboarding.types';

interface Props {
  evidence: EvidenceItem[];
  onAdd: (e: EvidenceItem) => void;
  onExportPDF: () => Promise<void>;
  onExportDocs: () => Promise<void>;
}

/**
 * EvidenceBinder - collect and export evidence items.
 */
export function EvidenceBinder({
  evidence,
  onAdd,
  onExportPDF,
  onExportDocs,
}: Props) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<EvidenceItem>>({ kind: 'note' });

  const handleSubmit = () => {
    if (!form.title) return;
    const item: EvidenceItem = {
      id: crypto.randomUUID(),
      title: form.title,
      kind: form.kind || 'note',
      url: form.url,
      text: form.text,
      tags: form.tags,
      createdAt: new Date().toISOString(),
    };
    onAdd(item);
    setDialogOpen(false);
    setForm({ kind: 'note' });
  };

  const kindIcon = (kind: string) => {
    switch (kind) {
      case 'doc':
        return '📄';
      case 'metric':
        return '📊';
      case 'screenshot':
        return '🖼️';
      case 'link':
        return '🔗';
      default:
        return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('onboarding.evidence')}
          </h2>
          <p className="text-slate-600 mt-1">
            {evidence.length} item{evidence.length !== 1 ? 's' : ''} collected
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportPDF}>
            <FileDown className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('onboarding.exportPDF')}
          </Button>
          <Button variant="outline" onClick={onExportDocs}>
            <FileText className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('onboarding.exportDocs')}
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('onboarding.addEvidence')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {evidence.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-slate-500">
                No evidence yet. Add your wins and artifacts.
              </p>
            </CardContent>
          </Card>
        ) : (
          evidence.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start gap-2">
                  <span className="text-2xl" aria-hidden="true">
                    {kindIcon(item.kind)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.text && (
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {item.text}
                  </p>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline block truncate"
                  >
                    {item.url}
                  </a>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('onboarding.addEvidence')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e-title">{t('onboarding.title')}</Label>
              <Input
                id="e-title"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-kind">{t('onboarding.kind')}</Label>
              <Select
                value={form.kind}
                onValueChange={(v) => setForm({ ...form, kind: v as any })}
              >
                <SelectTrigger id="e-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">{t('onboarding.note')}</SelectItem>
                  <SelectItem value="doc">{t('onboarding.doc')}</SelectItem>
                  <SelectItem value="metric">{t('onboarding.metric')}</SelectItem>
                  <SelectItem value="screenshot">
                    {t('onboarding.screenshot')}
                  </SelectItem>
                  <SelectItem value="link">{t('onboarding.link')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-text">{t('onboarding.text')}</Label>
              <Textarea
                id="e-text"
                value={form.text || ''}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-url">{t('onboarding.url')}</Label>
              <Input
                id="e-url"
                type="url"
                value={form.url || ''}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('onboarding.cancel')}
            </Button>
            <Button onClick={handleSubmit}>{t('onboarding.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
