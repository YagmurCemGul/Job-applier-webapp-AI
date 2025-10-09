/**
 * @fileoverview Media library for images and assets.
 * @module components/site/MediaLibrary
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaItem } from '@/types/site.types';

/**
 * MediaLibrary - upload and manage media files.
 */
export function MediaLibrary() {
  const { t } = useTranslation();
  const { site, addMedia, removeMedia } = useSite();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<MediaItem>>({});

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.url) return;
    const item: MediaItem = {
      id: crypto.randomUUID(),
      url: form.url,
      alt: form.alt,
      caption: form.caption,
      uploadedAt: new Date().toISOString(),
    };
    addMedia(item);
    setDialogOpen(false);
    setForm({});
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('site.media')}</h2>
          <p className="text-muted-foreground">
            Upload images for case studies and blog posts
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {site.media.map((item) => (
          <Card key={item.id}>
            <CardHeader className="p-0">
              <img
                src={item.url}
                alt={item.alt ?? 'Media'}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <CardDescription className="text-xs truncate">
                {item.alt ?? 'No alt text'}
              </CardDescription>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(item.url)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedia(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Image File</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleUpload}
              />
            </div>

            {form.url && (
              <div>
                <Label>Preview</Label>
                <img
                  src={form.url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}

            <div>
              <Label htmlFor="alt">Alt Text (accessibility)</Label>
              <Input
                id="alt"
                value={form.alt ?? ''}
                onChange={(e) => setForm({ ...form, alt: e.target.value })}
                placeholder="Describe the image for screen readers"
              />
            </div>

            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={form.caption ?? ''}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
              />
            </div>
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