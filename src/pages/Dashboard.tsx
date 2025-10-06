import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CVList } from '@/components/dashboard/CVList'
import { useCVDataStore } from '@/store/cvDataStore'
import { FileText, TrendingUp, Calendar, Award } from 'lucide-react'

export default function DashboardPage() {
  const { getStatistics } = useCVDataStore()
  const stats = getStatistics()

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Manage your CVs and track your applications</p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Total CVs</p>
              <p className="text-3xl font-bold">{stats.totalCVs}</p>
            </div>
            <FileText className="h-12 w-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Avg. ATS Score</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{Math.round(stats.avgAtsScore)}</p>
                <Badge
                  variant={stats.avgAtsScore >= 80 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {stats.avgAtsScore >= 80 ? 'Great' : 'Good'}
                </Badge>
              </div>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Applications</p>
              <p className="text-3xl font-bold">{stats.totalApplications}</p>
            </div>
            <Award className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Last Modified</p>
              <p className="text-lg font-semibold">{stats.lastModified.toLocaleDateString()}</p>
            </div>
            <Calendar className="h-12 w-12 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* CV List */}
      <CVList />
    </div>
  )
}
