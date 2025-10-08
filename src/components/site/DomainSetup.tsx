/**
 * @fileoverview Custom domain setup guide.
 * @module components/site/DomainSetup
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

/**
 * DomainSetup - guide for custom domain configuration.
 */
export function DomainSetup() {
  const { t } = useTranslation();
  const [domain, setDomain] = useState('');
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

  const handleCheck = async () => {
    setChecking(true);
    setStatus('checking');
    // Stub: simulate DNS check
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus(Math.random() > 0.5 ? 'valid' : 'invalid');
    setChecking(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Custom Domain</h2>
        <p className="text-muted-foreground">
          Set up a custom domain for your portfolio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domain Configuration</CardTitle>
          <CardDescription>
            Enter your custom domain and check DNS settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="domain">Your Domain</Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="portfolio.example.com"
              />
              <Button onClick={handleCheck} disabled={!domain || checking}>
                {checking ? 'Checking...' : 'Check DNS'}
              </Button>
            </div>
          </div>

          {status === 'valid' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">
                DNS configured correctly!
              </p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">
                DNS not configured. Please add a CNAME record.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DNS Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">For Vercel:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your domain registrar's DNS settings</li>
              <li>Add a CNAME record pointing to cname.vercel-dns.com</li>
              <li>Wait for DNS propagation (up to 48 hours)</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">For Netlify:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your domain registrar's DNS settings</li>
              <li>Add a CNAME record pointing to your-site.netlify.app</li>
              <li>Wait for DNS propagation</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">For GitHub Pages:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your domain registrar's DNS settings</li>
              <li>Add A records pointing to GitHub's IP addresses</li>
              <li>Add a CNAME file to your repository</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SSL/TLS Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Most hosting providers automatically provision SSL certificates for
            custom domains. Verify HTTPS is enabled after DNS propagation.
          </p>
          <Button variant="outline" asChild>
            <a
              href="https://www.ssllabs.com/ssltest/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test SSL Configuration
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}