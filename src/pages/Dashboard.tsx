import { useAuth, useToast, useCommonTranslation } from '@/hooks'
import { useCVStore, useJobStore, useProfileStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/formatters'

export default function DashboardPage() {
  const { user } = useAuth()
  const toast = useToast()
  const { t } = useCommonTranslation()
  const cvs = useCVStore((state) => state.cvs)
  const savedJobs = useJobStore((state) => state.savedJobs)
  const profiles = useProfileStore((state) => state.profiles)

  const handleTestToast = () => {
    toast.success(t('status.success'), 'This is a success message from Zustand store.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('navigation.dashboard')}</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {user?.firstName || 'Guest'}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My CVs</CardTitle>
            <CardDescription>Total CVs created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cvs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Jobs</CardTitle>
            <CardDescription>Jobs you've saved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{savedJobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
            <CardDescription>Career profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Format Test */}
      <Card>
        <CardHeader>
          <CardTitle>Format Tests (i18n)</CardTitle>
          <CardDescription>Testing date and currency formatting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Date: {formatDate(new Date())}</p>
          <p>Currency (USD): {formatCurrency(12345.67, 'USD')}</p>
          <p>Currency (TRY): {formatCurrency(12345.67, 'TRY')}</p>
          <p>Status: {t('status.loading')}</p>
          <Button onClick={handleTestToast}>{t('actions.save')}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Data from user store</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-md bg-muted p-4 text-sm">{JSON.stringify(user, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
