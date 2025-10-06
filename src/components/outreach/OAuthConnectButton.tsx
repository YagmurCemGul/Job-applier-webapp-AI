import { Button } from '@/components/ui/button'
import { connectGoogleAccount } from '@/services/integrations/google.oauth.service'
import { useEmailAccountsStore } from '@/store/emailAccountsStore'
import { Mail } from 'lucide-react'

export default function OAuthConnectButton() {
  const { items } = useEmailAccountsStore()

  const handleConnect = async () => {
    try {
      await connectGoogleAccount({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        passphrase: import.meta.env.VITE_OAUTH_PASSPHRASE || 'demo-pass',
        dryRun: true,
      })
    } catch (error) {
      console.error('OAuth failed:', error)
      alert('Failed to connect Gmail. Check console for details.')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={handleConnect}>
        <Mail className="mr-2 h-4 w-4" />
        Connect Gmail
      </Button>
      {items.map((a) => (
        <span key={a.id} className="rounded-md border px-2 py-1 text-xs">
          {a.id} {a.dryRun ? '• Dry-Run' : '• Live'}
        </span>
      ))}
    </div>
  )
}
