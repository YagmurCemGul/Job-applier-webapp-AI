import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Share2,
  Link2,
  Mail,
  QrCode,
  Copy,
  CheckCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { shareService } from '@/services/share.service'
import { useAuthStore } from '@/stores/auth.store'
import { ShareSettings, DEFAULT_SHARE_SETTINGS } from '@/types/share.types'
import QRCode from 'qrcode'

interface ShareDialogProps {
  cvId: string
  cvName: string
  trigger?: React.ReactNode
}

export function ShareDialog({ cvId, cvName, trigger }: ShareDialogProps) {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState<ShareSettings>(DEFAULT_SHARE_SETTINGS)

  const handleCreateLink = async () => {
    if (!user) return

    setLoading(true)
    try {
      const sharedCV = await shareService.createShareLink(user.uid, cvId, settings)
      setShareLink(sharedCV.shareLink)
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(sharedCV.shareLink)
      setQrCodeUrl(qrCode)
    } catch (error) {
      console.error('Error creating share link:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEmailShare = () => {
    if (!shareLink) return
    
    const subject = encodeURIComponent(`Check out my CV: ${cvName}`)
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to share my CV with you.\n\nView it here: ${shareLink}\n\nBest regards`
    )
    
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.download = `${cvName}-qr.png`
    link.href = qrCodeUrl
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share CV: {cvName}</DialogTitle>
          <DialogDescription>
            Create a shareable link or send via email
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">
              <Link2 className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
          </TabsList>

          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4">
            {!shareLink ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requirePassword">Require Password</Label>
                      <p className="text-sm text-gray-500">
                        Protect link with password
                      </p>
                    </div>
                    <Switch
                      id="requirePassword"
                      checked={settings.requirePassword}
                      onCheckedChange={(checked: boolean) =>
                        setSettings({ ...settings, requirePassword: checked })
                      }
                    />
                  </div>

                  {settings.requirePassword && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={settings.password || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSettings({ ...settings, password: e.target.value })
                        }
                        placeholder="Enter password"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="expiresIn">Link Expires In</Label>
                    <Select
                      value={settings.expiresIn?.toString() || 'never'}
                      onValueChange={(value: string) =>
                        setSettings({
                          ...settings,
                          expiresIn: value === 'never' ? undefined : parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger id="expiresIn">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowDownload">Allow Download</Label>
                      <p className="text-sm text-gray-500">
                        Let viewers download CV
                      </p>
                    </div>
                    <Switch
                      id="allowDownload"
                      checked={settings.allowDownload}
                      onCheckedChange={(checked: boolean) =>
                        setSettings({ ...settings, allowDownload: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleCreateLink} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Link...
                    </>
                  ) : (
                    'Create Share Link'
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Share link created successfully!
                  </AlertDescription>
                </Alert>

                <div>
                  <Label>Share Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={shareLink} readOnly />
                    <Button variant="outline" onClick={handleCopyLink}>
                      {copied ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.open(shareLink)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Link
                  </Button>
                  <Button variant="outline" onClick={() => setShareLink(null)}>
                    Create New Link
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            {shareLink ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Click the button below to open your email client with a pre-filled message.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleEmailShare} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Create a share link first, then you can send it via email.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4">
            {qrCodeUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center p-6 bg-white rounded-lg border">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>

                <Button onClick={handleDownloadQR} className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Create a share link first, then you can generate a QR code.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
