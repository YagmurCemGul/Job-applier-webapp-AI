import type { ScoreSubmission } from '@/types/scorecard.types'
import type { Interview } from '@/types/interview.types'

/**
 * Export score summary to Google Docs format (HTML)
 * In production, this would use Google Docs API
 * For now, returns formatted HTML
 */
export async function exportScoreSummaryDocs(
  interview: Interview,
  submissions: ScoreSubmission[],
  aggregates: {
    dimensionScores: Array<{
      dimensionId: string
      name: string
      avg: number
      variance: number
    }>
    overallAvg: number
    recommendations: Record<string, number>
  }
): Promise<string> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Interview Score Summary</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 20px; }
    .header { margin-bottom: 30px; }
    .dimension { margin: 10px 0; }
    .submission { border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Interview Score Summary</h1>
    <p><strong>Candidate:</strong> ${interview.candidateName}</p>
    <p><strong>Role:</strong> ${interview.role} at ${interview.company}</p>
    <p><strong>Date:</strong> ${new Date(interview.updatedAt).toLocaleDateString()}</p>
  </div>

  <h2>Dimension Scores</h2>
  ${aggregates.dimensionScores
    .map(
      (dim) =>
        `<div class="dimension">
      <strong>${dim.name}:</strong> ${dim.avg.toFixed(2)} / 5.0 (variance: ${dim.variance.toFixed(2)})
    </div>`
    )
    .join('')}

  <h2>Overall Score</h2>
  <p><strong>${aggregates.overallAvg.toFixed(2)} / 5.0</strong></p>

  <h2>Recommendations</h2>
  <ul>
    ${Object.entries(aggregates.recommendations)
      .map(([rec, count]) => `<li>${rec.replace('_', ' ')}: ${count}</li>`)
      .join('')}
  </ul>

  <h2>Individual Submissions</h2>
  ${submissions
    .map(
      (sub) =>
        `<div class="submission">
      <p><strong>Panelist:</strong> ${sub.panelistId}</p>
      <p><strong>Recommendation:</strong> ${sub.recommendation}</p>
      <p><strong>Overall Score:</strong> ${sub.overall || 'N/A'}</p>
    </div>`
    )
    .join('')}
</body>
</html>
  `

  return html
}
