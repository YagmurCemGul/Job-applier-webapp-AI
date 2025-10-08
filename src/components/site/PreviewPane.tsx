/**
 * @fileoverview Live site preview.
 * @module components/site/PreviewPane
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { mdToHtml } from '@/services/site/markdown.service';

/**
 * PreviewPane - live preview of published site.
 */
export function PreviewPane() {
  const { t } = useTranslation();
  const { site } = useSite();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );
  const [page, setPage] = useState<'home' | string>('home');

  const viewportWidth =
    viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px';

  const renderHome = () => (
    <div className="p-8">
      <header className="mb-8 pb-6 border-b">
        <h1 className="text-3xl font-bold mb-2">
          {site.profile.headline || 'Portfolio'}
        </h1>
        <p className="text-muted-foreground">{site.profile.bio}</p>
        {site.profile.links.length > 0 && (
          <nav className="mt-4 flex gap-4">
            {site.profile.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="text-primary hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Case Studies</h2>
        <div className="space-y-4">
          {site.cases
            .filter((c) => c.visibility === 'public')
            .map((cs) => (
              <div
                key={cs.id}
                className="p-4 border rounded-lg hover:border-primary cursor-pointer"
                onClick={() => setPage(`case-${cs.id}`)}
              >
                <h3 className="font-bold">{cs.title}</h3>
                <p className="text-sm text-muted-foreground">{cs.excerpt}</p>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Blog</h2>
        <div className="space-y-4">
          {site.posts
            .filter((p) => p.visibility === 'public')
            .map((post) => (
              <div
                key={post.id}
                className="p-4 border rounded-lg hover:border-primary cursor-pointer"
                onClick={() => setPage(`post-${post.id}`)}
              >
                <h3 className="font-bold">{post.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.dateISO).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );

  const renderCase = (id: string) => {
    const cs = site.cases.find((c) => c.id === id);
    if (!cs) return null;
    return (
      <div className="p-8">
        <button
          onClick={() => setPage('home')}
          className="text-primary hover:underline mb-4"
        >
          ← Back to Portfolio
        </button>
        <article
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: mdToHtml(cs.contentMd) }}
        />
      </div>
    );
  };

  const renderPost = (id: string) => {
    const post = site.posts.find((p) => p.id === id);
    if (!post) return null;
    return (
      <div className="p-8">
        <button
          onClick={() => setPage('home')}
          className="text-primary hover:underline mb-4"
        >
          ← Back to Portfolio
        </button>
        <article>
          <time className="text-sm text-muted-foreground">
            {new Date(post.dateISO).toLocaleDateString()}
          </time>
          <div
            className="prose max-w-none mt-4"
            dangerouslySetInnerHTML={{ __html: mdToHtml(post.contentMd) }}
          />
        </article>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('site.preview')}</h2>
          <p className="text-muted-foreground">Live preview of your site</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewport === 'desktop' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewport('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === 'tablet' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewport('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === 'mobile' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewport('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex justify-center bg-muted p-4">
            <div
              className="bg-background border rounded-lg overflow-hidden"
              style={{
                width: viewportWidth,
                minHeight: '600px',
                transition: 'width 0.3s',
              }}
            >
              {page === 'home' && renderHome()}
              {page.startsWith('case-') && renderCase(page.replace('case-', ''))}
              {page.startsWith('post-') && renderPost(page.replace('post-', ''))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}