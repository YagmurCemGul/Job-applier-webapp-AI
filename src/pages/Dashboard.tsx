import { useAuth, useToast } from '@/hooks'
import { useCVStore, useJobStore, useProfileStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const { user } = useAuth()
  const toast = useToast()
  const cvs = useCVStore((state) => state.cvs)
  const savedJobs = useJobStore((state) => state.savedJobs)
  const profiles = useProfileStore((state) => state.profiles)

  const handleTestToast = () => {
    toast.success('Success!', 'This is a success message from Zustand store.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {user?.firstName || 'Guest'}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* CVs Card */}
        <Card>
          <CardHeader>
            <CardTitle>My CVs</CardTitle>
            <CardDescription>Total CVs created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cvs.length}</div>
          </CardContent>
        </Card>

        {/* Saved Jobs Card */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Jobs</CardTitle>
            <CardDescription>Jobs you've saved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{savedJobs.length}</div>
          </CardContent>
        </Card>

        {/* Profiles Card */}
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

      {/* Test Store Button */}
      <Card>
        <CardHeader>
          <CardTitle>Store Test</CardTitle>
          <CardDescription>Test Zustand store functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestToast}>Test Toast Notification</Button>
        </CardContent>
      </Card>

      {/* User Info */}
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
