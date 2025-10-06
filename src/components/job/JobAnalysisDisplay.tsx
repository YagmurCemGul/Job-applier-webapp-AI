import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobPosting } from '@/types/job.types'
import { Briefcase, MapPin, DollarSign, Clock, TrendingUp, CheckCircle, Target } from 'lucide-react'

interface JobAnalysisDisplayProps {
  job: JobPosting
}

export function JobAnalysisDisplay({ job }: JobAnalysisDisplayProps) {
  const { parsed } = job

  return (
    <div className="space-y-4">
      {/* Job Overview */}
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-bold">Job Overview</h3>

        <div className="space-y-3">
          {parsed.title && (
            <div className="flex items-start gap-3">
              <Briefcase className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Position</div>
                <div className="font-medium">{parsed.title}</div>
              </div>
            </div>
          )}

          {parsed.company && (
            <div className="flex items-start gap-3">
              <Briefcase className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Company</div>
                <div className="font-medium">{parsed.company}</div>
              </div>
            </div>
          )}

          {parsed.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Location</div>
                <div className="font-medium">{parsed.location}</div>
              </div>
            </div>
          )}

          {parsed.employmentType && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Employment Type</div>
                <div className="font-medium">{parsed.employmentType}</div>
              </div>
            </div>
          )}

          {parsed.experienceLevel && (
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Experience Level</div>
                <div className="font-medium">{parsed.experienceLevel}</div>
              </div>
            </div>
          )}

          {parsed.salary && (
            <div className="flex items-start gap-3">
              <DollarSign className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Salary Range</div>
                <div className="font-medium">
                  ${parsed.salary.min?.toLocaleString()} - ${parsed.salary.max?.toLocaleString()}{' '}
                  {parsed.salary.currency}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Required Skills */}
      {parsed.skills.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Required Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {parsed.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Requirements */}
      {parsed.requirements.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Requirements</h3>
          <ul className="space-y-2">
            {parsed.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-sm">{req}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Responsibilities */}
      {parsed.responsibilities.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Responsibilities</h3>
          <ul className="space-y-2">
            {parsed.responsibilities.map((resp, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                <span className="text-sm">{resp}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ATS Keywords */}
      {parsed.keywords.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">ATS Keywords</h3>
          <p className="mb-3 text-sm text-gray-600">
            These keywords should appear in your optimized CV
          </p>
          <div className="flex flex-wrap gap-2">
            {parsed.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
