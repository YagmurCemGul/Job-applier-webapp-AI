import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CVList } from '@/components/dashboard/CVList'
import { useCVDataStore } from '@/stores/cvData.store'
import { FileText, TrendingUp, Calendar, Award } from 'lucide-react'
import { BatchExport } from '@/components/export/BatchExport'

export default function DashboardPage() {
  const { getStatistics } = useCVDataStore()
  const stats = getStatistics()

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Manage your CVs and track your applications
          </p>
        </div>
        
        <BatchExport />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total CVs</p>
              <p className="text-3xl font-bold">{stats.totalCVs}</p>
            </div>
            <FileText className="h-12 w-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. ATS Score</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">
                  {Math.round(stats.avgAtsScore)}
                </p>
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
              <p className="text-sm text-gray-600 mb-1">Applications</p>
              <p className="text-3xl font-bold">{stats.totalApplications}</p>
            </div>
            <Award className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Modified</p>
              <p className="text-lg font-semibold">
                {stats.lastModified.toLocaleDateString()}
              </p>
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
