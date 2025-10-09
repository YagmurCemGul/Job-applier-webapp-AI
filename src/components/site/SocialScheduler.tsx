/**
 * @fileoverview Social media post scheduler with Calendar integration.
 * @module components/site/SocialScheduler
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
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { scheduleSocial, generatePostCopy } from '@/services/site/socialScheduler.service';
import { toast } from 'sonner';
import type { SocialPost, SocialNetwork } from '@/types/site.types';

/**
 * SocialScheduler - schedule social media posts.
 */
export function SocialScheduler() {
  const { t } = useTranslation();
  const { site, social, upsertSocial, markSocial, removeSocial } = useSite();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<SocialPost>>({
    network: 'linkedin',
    status: 'draft',
  });
  const [filter, setFilter] = useState<SocialPost['status'] | 'all'>('all');

  const handleSave = () => {
    if (!form.title || !form.body) return;
    const post: SocialPost = {
      id: form.id || crypto.randomUUID(),
      network: form.network || 'linkedin',
      title: form.title,
      body: form.body,
      url: form.url,
      scheduledISO: form.scheduledISO,
      status: form.status || 'draft',
    };
    upsertSocial(post);
    setDialogOpen(false);
    setForm({ network: 'linkedin', status: 'draft' });
  };

  const handleEdit = (post: SocialPost) => {
    setForm(post);
    setDialogOpen(true);
  };

  const handleSchedule = async (post: SocialPost) => {
    try {
      // This would use real credentials in production
      await scheduleSocial(post, 'account-id', 'passphrase', 'client-id');
      markSocial(post.id, 'scheduled');
      toast.success(`${t('site.scheduled')} — Calendar reminder created`);
    } catch (err: any) {
      toast.error(`Schedule failed: ${err.message}`);
    }
  };

  const handleGenerate = (caseId: string) => {
    const cs = site.cases.find((c) => c.id === caseId);
    if (!cs) return;
    const copy = generatePostCopy({
      title: cs.title,
      excerpt: cs.excerpt,
      url: `https://example.com/cases/${cs.slug}.html`,
      network: (form.network as any) || 'linkedin',
    });
    setForm({ ...form, title: cs.title, body: copy, url: cs.slug });
  };

  const filtered =
    filter === 'all' ? social : social.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('site.social')}</h2>
          <p className="text-muted-foreground">
            Schedule posts and reminders
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="flex gap-2">
        {['all', 'draft', 'scheduled', 'posted', 'failed'].map((s) => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s as any)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription>
                    {post.network.charAt(0).toUpperCase() +
                      post.network.slice(1)}
                    {post.scheduledISO &&
                      ` • ${new Date(post.scheduledISO).toLocaleString()}`}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    post.status === 'posted'
                      ? 'default'
                      : post.status === 'scheduled'
                        ? 'secondary'
                        : post.status === 'failed'
                          ? 'destructive'
                          : 'outline'
                  }
                >
                  {t(`site.${post.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{post.body}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(post)}
                >
                  Edit
                </Button>
                {post.status === 'draft' && post.scheduledISO && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleSchedule(post)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('site.schedule')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocial(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? 'Edit' : 'New'} Social Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="network">Network</Label>
                <Select
                  value={form.network}
                  onValueChange={(v) =>
                    setForm({ ...form, network: v as SocialNetwork })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="mastodon">Mastodon</SelectItem>
                    <SelectItem value="threads">Threads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="schedule">Schedule (optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={
                    form.scheduledISO
                      ? new Date(form.scheduledISO)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      scheduledISO: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title ?? ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={form.body ?? ''}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.body?.length ?? 0} characters
              </p>
            </div>

            <div>
              <Label htmlFor="url">Link (optional)</Label>
              <Input
                id="url"
                value={form.url ?? ''}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>

            {site.cases.length > 0 && (
              <div>
                <Label>Generate from Case Study</Label>
                <Select onValueChange={handleGenerate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case study" />
                  </SelectTrigger>
                  <SelectContent>
                    {site.cases.map((cs) => (
                      <SelectItem key={cs.id} value={cs.id}>
                        {cs.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}