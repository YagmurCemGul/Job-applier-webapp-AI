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
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">ATS Compatibility Score</h3>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-end justify-between">
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</span>
          <span className="text-2xl text-gray-400">/100</span>
        </div>
        <Progress value={score} className="mb-2 h-3" />
        <p className={`text-sm font-medium ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
      </div>

      <div className="space-y-4">
        {/* Matching Skills */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Matching Skills ({matchingSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchingSkills.slice(0, 10).map((skill, index) => (
              <span key={index} className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                {skill}
              </span>
            ))}
            {matchingSkills.length > 10 && (
              <span className="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                +{matchingSkills.length - 10} more
              </span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Missing Skills ({missingSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.slice(0, 10).map((skill, index) => (
                <span
                  key={index}
                  className="rounded-md bg-orange-50 px-2 py-1 text-xs text-orange-700"
                >
                  {skill}
                </span>
              ))}
              {missingSkills.length > 10 && (
                <span className="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                  +{missingSkills.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-3">
        <p className="text-xs text-blue-900">
          <strong>Tip:</strong> ATS systems scan for keywords. Scores above 80 significantly
          increase your chances of passing initial screening.
        </p>
      </div>
    </Card>
  )
}
