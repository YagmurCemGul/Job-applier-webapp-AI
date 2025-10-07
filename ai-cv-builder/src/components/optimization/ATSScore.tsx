import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface ATSScoreProps {
  score: number
  matchingSkills: string[]
  missingSkills: string[]
}

export function ATSScore({ score, matchingSkills, missingSkills }: ATSScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">ATS Compatibility Score</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-2xl text-gray-400">/100</span>
        </div>
        <Progress value={score} className="h-3 mb-2" />
        <p className={`text-sm font-medium ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </p>
      </div>

      <div className="space-y-4">
        {/* Matching Skills */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">
              Matching Skills ({matchingSkills.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchingSkills.slice(0, 10).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md"
              >
                {skill}
              </span>
            ))}
            {matchingSkills.length > 10 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                +{matchingSkills.length - 10} more
              </span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-sm">
                Missing Skills ({missingSkills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.slice(0, 10).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
              {missingSkills.length > 10 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                  +{missingSkills.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>Tip:</strong> ATS systems scan for keywords. Scores above 80 significantly
          increase your chances of passing initial screening.
        </p>
      </div>
    </Card>
  )
}