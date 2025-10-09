/**
 * @fileoverview SEO inspector and metadata validator.
 * @module components/site/SEOInspector
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Download, Image } from 'lucide-react';
import { validateSEO, buildMeta, buildSitemap } from '@/services/site/seo.service';
import { renderOgImage } from '@/services/site/ogImage.service';
import { toast } from 'sonner';

/**
 * SEOInspector - validate SEO metadata and generate assets.
 */
export function SEOInspector() {
  const { t } = useTranslation();
  const { site } = useSite();
  const [selectedItem, setSelectedItem] = useState<{
    type: 'case' | 'post';
    id: string;
  } | null>(null);
  const [ogImageUrl, setOgImageUrl] = useState<string>('');

  const items = [
    ...site.cases.map((c) => ({ type: 'case' as const, ...c })),
    ...site.posts.map((p) => ({ type: 'post' as const, ...p })),
  ];

  const selectedContent = items.find(
    (i) => i.id === selectedItem?.id && i.type === selectedItem?.type
  );

  const validation = selectedContent
    ? validateSEO({
        title: selectedContent.title,
        description:
          'excerpt' in selectedContent
            ? selectedContent.excerpt
            : selectedContent.contentMd.slice(0, 160),
        slug: selectedContent.slug,
      })
    : null;

  const handleGenerateOgImage = async () => {
    if (!selectedContent) return;
    const url = await renderOgImage(selectedContent.title, {
      primary: site.theme.primary,
      accent: site.theme.accent,
      fontFamily: site.theme.fontHead,
    });
    setOgImageUrl(url);
    toast.success('OG image generated — preview below');
  };

  const handleDownloadSitemap = () => {
    const slugs = [''].concat(
      site.cases
        .filter((c) => c.visibility === 'public')
        .map((c) => `cases/${c.slug}.html`),
      site.posts
        .filter((p) => p.visibility === 'public')
        .map((p) => `blog/${p.slug}.html`)
    );
    const xml = buildSitemap('https://example.com', slugs);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    toast.success('Sitemap downloaded');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('site.seo')}</h2>
        <p className="text-muted-foreground">
          SEO inspector, metadata validator, and OG image generator
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Inspector</CardTitle>
          <CardDescription>
            Select a case study or blog post to inspect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`p-3 border rounded-md cursor-pointer hover:bg-accent ${
                  selectedItem?.id === item.id &&
                  selectedItem?.type === item.type
                    ? 'bg-accent'
                    : ''
                }`}
                onClick={() =>
                  setSelectedItem({ type: item.type, id: item.id })
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.type === 'case' ? 'Case Study' : 'Blog Post'}
                    </p>
                  </div>
                  <Badge variant="outline">{item.slug}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedContent && validation && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>SEO Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title Length</Label>
                <Progress
                  value={(selectedContent.title.length / 60) * 100}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedContent.title.length}/60 characters
                </p>
              </div>

              <div>
                <Label>Description Length</Label>
                <Progress
                  value={
                    (('excerpt' in selectedContent
                      ? selectedContent.excerpt?.length ?? 0
                      : selectedContent.contentMd.slice(0, 160).length) /
                      160) *
                    100
                  }
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {('excerpt' in selectedContent
                    ? selectedContent.excerpt?.length ?? 0
                    : selectedContent.contentMd.slice(0, 160).length)}
                  /160 characters
                </p>
              </div>

              {validation.warnings.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-destructive">Warnings</Label>
                  {validation.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-destructive"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {w}
                    </div>
                  ))}
                </div>
              )}

              {validation.valid && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  SEO looks good!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Graph Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateOgImage}>
                <Image className="h-4 w-4 mr-2" />
                Generate OG Image
              </Button>

              {ogImageUrl && (
                <div>
                  <img
                    src={ogImageUrl}
                    alt="OG preview"
                    className="w-full border rounded-md"
                  />
                </div>
              )}

              <div>
                <Label>Meta Tags Preview</Label>
                <Textarea
                  value={buildMeta({
                    title: selectedContent.title,
                    description:
                      'excerpt' in selectedContent
                        ? selectedContent.excerpt
                        : selectedContent.contentMd.slice(0, 160),
                    noAI: site.noAITrainingMeta,
                  })}
                  readOnly
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sitemap</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadSitemap}>
            <Download className="h-4 w-4 mr-2" />
            Download sitemap.xml
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}