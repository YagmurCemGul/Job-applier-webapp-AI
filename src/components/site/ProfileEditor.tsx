/**
 * @fileoverview Profile editor for portfolio site.
 * @module components/site/ProfileEditor
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import type { SiteProfile } from '@/types/site.types';

/**
 * ProfileEditor - edit profile information.
 */
export function ProfileEditor() {
  const { t } = useTranslation();
  const { site, upsertProfile } = useSite();
  const [form, setForm] = useState<SiteProfile>(site.profile);

  const handleSave = () => {
    upsertProfile(form);
  };

  const addLink = () => {
    setForm({
      ...form,
      links: [...form.links, { label: '', url: '' }],
    });
  };

  const removeLink = (idx: number) => {
    setForm({
      ...form,
      links: form.links.filter((_, i) => i !== idx),
    });
  };

  const updateLink = (idx: number, field: 'label' | 'url', value: string) => {
    setForm({
      ...form,
      links: form.links.map((l, i) =>
        i === idx ? { ...l, [field]: value } : l
      ),
    });
  };

  const addSkill = () => {
    const skill = window.prompt('Enter skill:');
    if (skill) {
      setForm({ ...form, skills: [...form.skills, skill] });
    }
  };

  const removeSkill = (idx: number) => {
    setForm({
      ...form,
      skills: form.skills.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('site.profile')}</CardTitle>
          <CardDescription>Public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={form.headline}
              onChange={(e) =>
                setForm({ ...form, headline: e.target.value })
              }
              placeholder="e.g., Product Manager | Builder | Leader"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.headline.length}/100
            </p>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell your story in 2-3 sentences"
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.bio.length}/500
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location ?? ''}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <Label htmlFor="email">Public Email</Label>
              <Input
                id="email"
                type="email"
                value={form.emailPublic ?? ''}
                onChange={(e) =>
                  setForm({ ...form, emailPublic: e.target.value })
                }
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              value={form.avatarUrl ?? ''}
              onChange={(e) =>
                setForm({ ...form, avatarUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
          <CardDescription>Social profiles, GitHub, website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.links.map((link, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Label"
                value={link.label}
                onChange={(e) => updateLink(idx, 'label', e.target.value)}
              />
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateLink(idx, 'url', e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLink(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addLink}>
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {form.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(idx)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Button variant="outline" onClick={addSkill}>
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Save Profile
      </Button>
    </div>
  );
}