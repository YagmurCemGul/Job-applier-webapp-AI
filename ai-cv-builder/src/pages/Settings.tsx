import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useTemplateStore } from '@/stores/template.store'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { settings, loading, loadSettings, updateSettings, resetSettings } = useSettingsStore()
  const { templates } = useTemplateStore()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSettings(user.uid)
    }
  }, [user, loadSettings])

  const handleUpdatePreference = async (key: string, value: string | boolean) => {
    if (!user || !settings) return

    try {
      await updateSettings(user.uid, {
        preferences: {
          ...settings.preferences,
          [key]: value,
        },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError('Failed to update settings')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleUpdatePrivacy = async (key: string, value: string | boolean) => {
    if (!user || !settings) return

    try {
      await updateSettings(user.uid, {
        privacy: {
          ...settings.privacy,
          [key]: value,
        },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError('Failed to update settings')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleUpdateNotification = async (key: string, value: boolean) => {
    if (!user || !settings) return

    try {
      await updateSettings(user.uid, {
        notifications: {
          ...settings.notifications,
          [key]: value,
        },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError('Failed to update settings')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleResetSettings = async () => {
    if (!user) return

    try {
      await resetSettings(user.uid)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to reset settings')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeleteAccount = async () => {
    // This would need additional implementation
    alert('Account deletion requires additional verification. Feature coming soon.')
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your application preferences</p>
      </div>

      {success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Settings updated successfully!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Preferences */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-gray-500">
                  Choose your preferred theme
                </p>
              </div>
              <Select
                value={settings.preferences.theme}
                onValueChange={(value) => handleUpdatePreference('theme', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Language</Label>
                <p className="text-sm text-gray-500">
                  Select your preferred language
                </p>
              </div>
              <Select
                value={settings.preferences.language}
                onValueChange={(value) => handleUpdatePreference('language', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Template</Label>
                <p className="text-sm text-gray-500">
                  Choose your default CV template
                </p>
              </div>
              <Select
                value={settings.preferences.defaultTemplate}
                onValueChange={(value) => handleUpdatePreference('defaultTemplate', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSave">Auto-Save</Label>
                <p className="text-sm text-gray-500">
                  Automatically save changes
                </p>
              </div>
              <Switch
                id="autoSave"
                checked={settings.preferences.autoSave}
                onCheckedChange={(checked) => handleUpdatePreference('autoSave', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive email notifications
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  handleUpdatePreference('emailNotifications', checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Privacy</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-gray-500">
                  Control who can see your profile
                </p>
              </div>
              <Select
                value={settings.privacy.profileVisibility}
                onValueChange={(value) => handleUpdatePrivacy('profileVisibility', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showEmail">Show Email</Label>
                <p className="text-sm text-gray-500">
                  Display email on public profile
                </p>
              </div>
              <Switch
                id="showEmail"
                checked={settings.privacy.showEmail}
                onCheckedChange={(checked) => handleUpdatePrivacy('showEmail', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showPhone">Show Phone</Label>
                <p className="text-sm text-gray-500">
                  Display phone on public profile
                </p>
              </div>
              <Switch
                id="showPhone"
                checked={settings.privacy.showPhone}
                onCheckedChange={(checked) => handleUpdatePrivacy('showPhone', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newFeatures">New Features</Label>
                <p className="text-sm text-gray-500">
                  Get notified about new features
                </p>
              </div>
              <Switch
                id="newFeatures"
                checked={settings.notifications.newFeatures}
                onCheckedChange={(checked) => handleUpdateNotification('newFeatures', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tips">Tips & Tricks</Label>
                <p className="text-sm text-gray-500">
                  Receive helpful tips
                </p>
              </div>
              <Switch
                id="tips"
                checked={settings.notifications.tips}
                onCheckedChange={(checked) => handleUpdateNotification('tips', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                <p className="text-sm text-gray-500">
                  Get weekly summary emails
                </p>
              </div>
              <Switch
                id="weeklyDigest"
                checked={settings.notifications.weeklyDigest}
                onCheckedChange={(checked) => handleUpdateNotification('weeklyDigest', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing">Marketing</Label>
                <p className="text-sm text-gray-500">
                  Receive promotional emails
                </p>
              </div>
              <Switch
                id="marketing"
                checked={settings.notifications.marketing}
                onCheckedChange={(checked) => handleUpdateNotification('marketing', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200">
          <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reset Settings</Label>
                <p className="text-sm text-gray-500">
                  Reset all settings to default values
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Reset</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Settings?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all your settings to their default values. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetSettings}>
                      Reset Settings
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delete Account</Label>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and all associated data including CVs, cover letters, and settings. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
