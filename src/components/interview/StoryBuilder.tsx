/**
 * @fileoverview STAR story builder component for Step 43
 * @module components/interview/StoryBuilder
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Copy, Plus, X } from 'lucide-react';
import type { StorySTAR } from '@/types/interview.types';
import { buildStarDraft, saveStory, formatAsbullets } from '@/services/interview/storyBuilder.service';
import { useInterview } from '@/stores/interview.store';
import { toast } from 'sonner';

interface StoryBuilderProps {
  initialStory?: StorySTAR;
  onSave?: (story: StorySTAR) => void;
}

export function StoryBuilder({ initialStory, onSave }: StoryBuilderProps) {
  const { t } = useTranslation();
  const { stories } = useInterview();
  const [story, setStory] = useState<StorySTAR>(
    initialStory || buildStarDraft('New Story')
  );
  const [newTag, setNewTag] = useState('');
  const [newMetric, setNewMetric] = useState('');
  const [newLink, setNewLink] = useState('');

  const handleSave = () => {
    if (!story.title.trim()) {
      toast.error(t('interview.errors.titleRequired'));
      return;
    }
    const saved = saveStory(story);
    toast.success(t('interview.storySaved'));
    onSave?.(saved);
  };

  const handleCopyBullets = () => {
    const bullets = formatAsbullets(story);
    navigator.clipboard.writeText(bullets);
    toast.success(t('interview.copiedToClipboard'));
  };

  const addTag = () => {
    if (newTag && !story.tags.includes(newTag)) {
      setStory({ ...story, tags: [...story.tags, newTag] });
      setNewTag('');
    }
  };

  const addMetric = () => {
    if (newMetric && !story.metrics?.includes(newMetric)) {
      setStory({ ...story, metrics: [...(story.metrics || []), newMetric] });
      setNewMetric('');
    }
  };

  const addLink = () => {
    if (newLink && !story.links?.includes(newLink)) {
      setStory({ ...story, links: [...(story.links || []), newLink] });
      setNewLink('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('interview.storyBuilder')}</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleCopyBullets} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                {t('interview.copyBullets')}
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="mr-2 h-4 w-4" />
                {t('interview.save')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('interview.storyTitle')}</Label>
            <Input
              id="title"
              value={story.title}
              onChange={e => setStory({ ...story, title: e.target.value })}
              placeholder={t('interview.storyTitlePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('interview.tags')}</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder={t('interview.addTag')}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {story.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStory({ ...story, tags: story.tags.filter(t => t !== tag) })}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="S">{t('interview.situation')}</Label>
              <Textarea
                id="S"
                value={story.S}
                onChange={e => setStory({ ...story, S: e.target.value })}
                rows={4}
                placeholder={t('interview.situationPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">{story.S.length} chars</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="T">{t('interview.task')}</Label>
              <Textarea
                id="T"
                value={story.T}
                onChange={e => setStory({ ...story, T: e.target.value })}
                rows={4}
                placeholder={t('interview.taskPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">{story.T.length} chars</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="A">{t('interview.action')}</Label>
              <Textarea
                id="A"
                value={story.A}
                onChange={e => setStory({ ...story, A: e.target.value })}
                rows={4}
                placeholder={t('interview.actionPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">{story.A.length} chars</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="R">{t('interview.result')}</Label>
              <Textarea
                id="R"
                value={story.R}
                onChange={e => setStory({ ...story, R: e.target.value })}
                rows={4}
                placeholder={t('interview.resultPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">{story.R.length} chars</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('interview.metrics')}</Label>
            <div className="flex gap-2">
              <Input
                value={newMetric}
                onChange={e => setNewMetric(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMetric())}
                placeholder={t('interview.addMetric')}
              />
              <Button onClick={addMetric} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="list-disc list-inside">
              {story.metrics?.map((m, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{m}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStory({ ...story, metrics: story.metrics?.filter((_, idx) => idx !== i) })}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label>{t('interview.links')}</Label>
            <div className="flex gap-2">
              <Input
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
                placeholder={t('interview.addLink')}
              />
              <Button onClick={addLink} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="list-disc list-inside">
              {story.links?.map((l, i) => (
                <li key={i} className="flex items-center justify-between">
                  <a href={l} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{l}</a>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStory({ ...story, links: story.links?.filter((_, idx) => idx !== i) })}
                  />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {stories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('interview.savedStories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stories.slice(0, 5).map(s => (
                <div
                  key={s.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setStory(s)}
                >
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.tags.join(', ')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
