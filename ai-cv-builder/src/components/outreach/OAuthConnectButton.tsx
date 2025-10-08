/**
 * OAuth Connect Button
 * Allows users to connect their Gmail account
 */
import { Button } from '@/components/ui/button';
import { connectGoogleAccount } from '@/services/integrations/google.oauth.service';
import { useEmailAccounts } from '@/stores/emailAccounts.store';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export default function OAuthConnectButton() {
  const { items } = useEmailAccounts();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectGoogleAccount({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        passphrase: import.meta.env.VITE_OAUTH_PASSPHRASE || 'demo-pass',
        dryRun: true
      });
    } catch (error) {
      console.error('OAuth connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        {connecting ? 'Connecting...' : 'Connect Gmail'}
      </Button>

      {items.map((a) => (
        <div
          key={a.id}
          className="text-xs px-3 py-1.5 border rounded-md bg-muted flex items-center gap-2"
        >
          <Mail className="h-3 w-3" />
          <span className="font-medium">{a.displayName || a.id}</span>
          {a.dryRun && (
            <span className="text-muted-foreground">• Dry-Run</span>
          )}
        </div>
      ))}
    </div>
  );
}
