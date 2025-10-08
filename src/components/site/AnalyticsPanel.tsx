/**
 * @fileoverview Analytics panel with UTM builder.
 * @module components/site/AnalyticsPanel
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, BarChart3 } from 'lucide-react';
import { buildUtm, UTM_PRESETS } from '@/services/site/analytics.service';
import { toast } from 'sonner';

/**
 * AnalyticsPanel - opt-in, UTM builder, and counters stub.
 */
export function AnalyticsPanel() {
  const { t } = useTranslation();
  const { site, setAnalyticsOptIn } = useSite();
  const [utmUrl, setUtmUrl] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [result, setResult] = useState('');

  const handleBuild = () => {
    if (!utmUrl) return;
    const tagged = buildUtm(utmUrl, {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    });
    setResult(tagged);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success('URL copied to clipboard');
  };

  const handlePreset = (
    preset: 'linkedinPost' | 'twitterPost' | 'email'
  ) => {
    if (!utmUrl) return;
    const tagged = UTM_PRESETS[preset](utmUrl, utmCampaign || 'campaign');
    setResult(tagged);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('site.analytics')}</h2>
        <p className="text-muted-foreground">
          Privacy-friendly analytics and UTM builder
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Opt-In</CardTitle>
          <CardDescription>
            Enable cookieless, privacy-friendly analytics for your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="opt-in">{t('site.optInAnalytics')}</Label>
              <p className="text-sm text-muted-foreground">
                Counts page views without cookies or personal data
              </p>
            </div>
            <Switch
              id="opt-in"
              checked={site.analyticsOptIn}
              onCheckedChange={setAnalyticsOptIn}
            />
          </div>

          {site.analyticsOptIn && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Analytics adapters are stubs in this
                version. In production, integrate with services like Plausible,
                Fathom, or Simple Analytics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {site.analyticsOptIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sample Metrics (Stub)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Top Case Study
              </p>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Blog Post</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>UTM Link Builder</CardTitle>
          <CardDescription>
            Tag links for campaign tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="utm-url">Base URL</Label>
            <Input
              id="utm-url"
              value={utmUrl}
              onChange={(e) => setUtmUrl(e.target.value)}
              placeholder="https://example.com/cases/my-case-study.html"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="utm-source">Source</Label>
              <Input
                id="utm-source"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="linkedin"
              />
            </div>
            <div>
              <Label htmlFor="utm-medium">Medium</Label>
              <Input
                id="utm-medium"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="social"
              />
            </div>
            <div>
              <Label htmlFor="utm-campaign">Campaign</Label>
              <Input
                id="utm-campaign"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="launch"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleBuild}>Build URL</Button>
            <Button
              variant="outline"
              onClick={() => handlePreset('linkedinPost')}
            >
              LinkedIn Preset
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePreset('twitterPost')}
            >
              Twitter Preset
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePreset('email')}
            >
              Email Preset
            </Button>
          </div>

          {result && (
            <div className="p-4 bg-muted rounded-md">
              <Label>Tagged URL</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input value={result} readOnly className="font-mono text-xs" />
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}