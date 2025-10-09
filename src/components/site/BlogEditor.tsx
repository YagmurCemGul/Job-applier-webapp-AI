/**
 * @fileoverview Blog post editor with Markdown support.
 * @module components/site/BlogEditor
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
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
import { Plus, Save, Eye, Trash2, Mail } from 'lucide-react';
import { mdToHtml } from '@/services/site/markdown.service';
import type { BlogPost, Visibility } from '@/types/site.types';

/**
 * BlogEditor - author and manage blog posts.
 */
export function BlogEditor() {
  const { t } = useTranslation();
  const { site, upsertPost, removePost } = useSite();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<BlogPost>>({ visibility: 'draft' });
  const [preview, setPreview] = useState(false);

  const handleSave = () => {
    if (!form.title || !form.slug || !form.contentMd) return;
    const post: BlogPost = {
      id: form.id || crypto.randomUUID(),
      title: form.title,
      slug: form.slug,
      contentMd: form.contentMd,
      dateISO: form.dateISO || new Date().toISOString(),
      visibility: form.visibility || 'draft',
      coverUrl: form.coverUrl,
      tags: form.tags,
    };
    upsertPost(post);
    setDialogOpen(false);
    setForm({ visibility: 'draft' });
  };

  const handleEdit = (post: BlogPost) => {
    setForm(post);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('site.blog')}</h2>
          <p className="text-muted-foreground">
            Share insights and thought leadership
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="space-y-4">
        {site.posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription>
                    {new Date(post.dateISO).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    post.visibility === 'public'
                      ? 'default'
                      : post.visibility === 'private'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {t(`site.${post.visibility}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(post)}
              >
                Edit
              </Button>
              {post.visibility === 'public' && (
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePost(post.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit' : 'New'} Blog Post</DialogTitle>
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
                  rows={16}
                  className="font-mono text-sm"
                />
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={
                    form.dateISO
                      ? new Date(form.dateISO).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dateISO: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
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
    </div>
  );
}