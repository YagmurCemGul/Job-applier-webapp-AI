/**
 * @fileoverview Case study editor with Evidence Binder integration.
 * @module components/site/CaseStudyEditor
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import { useOnboarding } from '@/stores/onboarding.store';
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
import { Plus, Save, Eye, Trash2, FileText, Sparkles } from 'lucide-react';
import { buildCaseFromEvidence } from '@/services/site/caseStudy.service';
import { mdToHtml } from '@/services/site/markdown.service';
import type { CaseStudy, Visibility } from '@/types/site.types';

/**
 * CaseStudyEditor - author and manage case studies.
 */
export function CaseStudyEditor() {
  const { t } = useTranslation();
  const { site, upsertCase, removeCase } = useSite();
  const { plans } = useOnboarding();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<CaseStudy>>({
    visibility: 'draft',
  });
  const [preview, setPreview] = useState(false);

  const handleSave = () => {
    if (!form.title || !form.slug || !form.contentMd) return;
    const cs: CaseStudy = {
      id: form.id || crypto.randomUUID(),
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      contentMd: form.contentMd,
      dateISO: form.dateISO || new Date().toISOString(),
      visibility: form.visibility || 'draft',
      coverUrl: form.coverUrl,
      tags: form.tags,
      highlights: form.highlights,
      quotes: form.quotes,
      links: form.links,
      competenceTags: form.competenceTags,
    };
    upsertCase(cs);
    setDialogOpen(false);
    setForm({ visibility: 'draft' });
  };

  const handleEdit = (cs: CaseStudy) => {
    setForm(cs);
    setDialogOpen(true);
  };

  const handleGenerateFromEvidence = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const title = window.prompt('Case study title:', plan.title);
    if (!title) return;
    const cs = buildCaseFromEvidence(plan, title);
    setForm(cs);
    setGenerateDialogOpen(false);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('site.caseStudies')}</h2>
          <p className="text-muted-foreground">
            Showcase your projects and impact
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setGenerateDialogOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate from Evidence
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Case Study
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {site.cases.map((cs) => (
          <Card key={cs.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{cs.title}</CardTitle>
                <Badge
                  variant={
                    cs.visibility === 'public'
                      ? 'default'
                      : cs.visibility === 'private'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {t(`site.${cs.visibility}`)}
                </Badge>
              </div>
              <CardDescription>{cs.excerpt}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(cs)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCase(cs.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.id ? 'Edit' : 'New'} Case Study
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug ?? ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt ?? ''}
                onChange={(e) =>
                  setForm({ ...form, excerpt: e.target.value })
                }
                maxLength={160}
                rows={2}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Content (Markdown)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreview(!preview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {preview ? 'Edit' : 'Preview'}
                </Button>
              </div>
              {preview ? (
                <div
                  className="prose prose-sm max-w-none p-4 border rounded-md"
                  dangerouslySetInnerHTML={{
                    __html: mdToHtml(form.contentMd ?? ''),
                  }}
                />
              ) : (
                <Textarea
                  id="content"
                  value={form.contentMd ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, contentMd: e.target.value })
                  }
                  rows={12}
                  className="font-mono text-sm"
                />
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v) =>
                    setForm({ ...form, visibility: v as Visibility })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('site.draft')}</SelectItem>
                    <SelectItem value="private">
                      {t('site.private')}
                    </SelectItem>
                    <SelectItem value="public">{t('site.public')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input
                  id="cover"
                  value={form.coverUrl ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, coverUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate from Evidence Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('site.generateDraft')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select an onboarding plan to generate a case study from its
              evidence.
            </p>
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="cursor-pointer hover:border-primary"
                onClick={() => handleGenerateFromEvidence(plan.id)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{plan.title}</CardTitle>
                  <CardDescription>
                    {plan.evidence?.length ?? 0} evidence items
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}