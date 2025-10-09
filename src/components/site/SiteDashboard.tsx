/**
 * @fileoverview Portfolio dashboard overview.
 * @module components/site/SiteDashboard
 */

import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  FileText,
  BookOpen,
  Image,
  Globe,
  Share2,
  BarChart3,
  Mail,
  Eye,
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

/**
 * SiteDashboard - overview cards for portfolio site.
 */
export function SiteDashboard({ onNavigate }: Props) {
  const { t } = useTranslation();
  const { site, setAnalyticsOptIn, setNoAITraining } = useSite();

  const publicCases = site.cases.filter((c) => c.visibility === 'public').length;
  const publicPosts = site.posts.filter((p) => p.visibility === 'public').length;

  const cards = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: t('site.caseStudies'),
      description: `${publicCases} ${t('site.public').toLowerCase()}`,
      total: site.cases.length,
      tab: 'cases',
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t('site.blog'),
      description: `${publicPosts} ${t('site.public').toLowerCase()}`,
      total: site.posts.length,
      tab: 'blog',
    },
    {
      icon: <Image className="h-5 w-5" />,
      title: t('site.media'),
      description: `${site.media.length} files`,
      total: site.media.length,
      tab: 'media',
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: t('site.seo'),
      description: 'SEO & metadata',
      tab: 'seo',
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      title: t('site.social'),
      description: 'Social scheduler',
      tab: 'social',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: t('site.analytics'),
      description: site.analyticsOptIn ? 'Enabled' : 'Disabled',
      tab: 'analytics',
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: t('site.contact'),
      description: site.contact ? 'Configured' : 'Not set',
      tab: 'contact',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('site.dashboard')}</h2>
        <p className="text-muted-foreground">
          Manage your portfolio site, case studies, and blog
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Card
            key={i}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onNavigate(card.tab)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.total ?? '—'}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Privacy and site preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics-opt-in">
                {t('site.optInAnalytics')}
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable privacy-friendly, cookieless analytics
              </p>
            </div>
            <Switch
              id="analytics-opt-in"
              checked={site.analyticsOptIn}
              onCheckedChange={setAnalyticsOptIn}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="no-ai-meta">{t('site.noAiMeta')}</Label>
              <p className="text-sm text-muted-foreground">
                Add "noai" meta tag to prevent AI training
              </p>
            </div>
            <Switch
              id="no-ai-meta"
              checked={site.noAITrainingMeta}
              onCheckedChange={setNoAITraining}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview & Publish
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <button
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md"
            onClick={() => onNavigate('preview')}
          >
            {t('site.preview')}
          </button>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
            onClick={() => onNavigate('publish')}
          >
            {t('site.publish')}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}