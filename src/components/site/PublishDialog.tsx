/**
 * @fileoverview Publish dialog for exporting and deploying site.
 * @module components/site/PublishDialog
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '@/stores/site.store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Upload, ExternalLink, Loader2 } from 'lucide-react';
import {
  exportStaticZip,
  deployToVercel,
  deployToNetlify,
  deployToGitHubPages,
} from '@/services/site/publish.service';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * PublishDialog - export and deploy portfolio site.
 */
export function PublishDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { site, setTargets } = useSite();
  const [target, setTarget] = useState<'zip' | 'vercel' | 'netlify' | 'github_pages'>('zip');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await exportStaticZip(site);
      setResult({ url: res.url });
      toast.success(`Export complete — ${(res.size / 1024).toFixed(1)} KB`);
      const a = document.createElement('a');
      a.href = res.url;
      a.download = 'portfolio.zip';
      a.click();
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    setLoading(true);
    try {
      let res: { url: string };
      switch (target) {
        case 'vercel':
          res = await deployToVercel(site);
          break;
        case 'netlify':
          res = await deployToNetlify(site);
          break;
        case 'github_pages':
          res = await deployToGitHubPages(site);
          break;
        default:
          throw new Error('Invalid target');
      }
      setResult(res);
      toast.success('Deployment complete — your site is live!');
      setTargets([
        ...site.targets,
        {
          id: crypto.randomUUID(),
          kind: target,
          lastUrl: res.url,
        },
      ]);
    } catch (err: any) {
      toast.error(`Deployment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const publicCount =
    site.cases.filter((c) => c.visibility === 'public').length +
    site.posts.filter((p) => p.visibility === 'public').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('site.publish')}</DialogTitle>
          <DialogDescription>
            Export your site as a static ZIP or deploy to a hosting provider
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Profile:</strong> {site.profile.headline || 'Not set'}
              </p>
              <p>
                <strong>Public Content:</strong> {publicCount} items
              </p>
              <p>
                <strong>Theme:</strong> {site.theme.name}
              </p>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="target">Publish Target</Label>
            <Select
              value={target}
              onValueChange={(v: any) => setTarget(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zip">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export ZIP (Download)
                  </div>
                </SelectItem>
                <SelectItem value="vercel">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Deploy to Vercel
                  </div>
                </SelectItem>
                <SelectItem value="netlify">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Deploy to Netlify
                  </div>
                </SelectItem>
                <SelectItem value="github_pages">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Deploy to GitHub Pages
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {target !== 'zip' && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Deployment adapters are stubs in this
                  version. In production, these would authenticate with the
                  hosting provider and deploy your site.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                <strong>Legal Notice:</strong> By publishing, you confirm that
                all content is your own or properly licensed. Your site will be
                publicly accessible.
              </p>
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">
                    {target === 'zip' ? 'Exported' : 'Deployed'}!
                  </p>
                  {target !== 'zip' && (
                    <p className="text-sm text-green-700">{result.url}</p>
                  )}
                </div>
                {target !== 'zip' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={target === 'zip' ? handleExport : handleDeploy}
            disabled={loading || publicCount === 0}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : target === 'zip' ? (
              <Download className="h-4 w-4 mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {target === 'zip' ? t('site.exportZip') : t('site.deploy')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}