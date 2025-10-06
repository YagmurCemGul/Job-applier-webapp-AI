import ApplicationsPage from '@/components/applications/ApplicationsPage'
import ApplicationDetailDrawer from '@/components/applications/ApplicationDetailDrawer'

export default function Applications() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Application Tracker</h1>
      <ApplicationsPage />
      <ApplicationDetailDrawer />
    </div>
  )
}
