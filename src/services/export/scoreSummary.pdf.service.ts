import jsPDF from 'jspdf'
import type { ScoreSubmission } from '@/types/scorecard.types'
import type { Interview } from '@/types/interview.types'

/**
 * Export score summary to PDF
 */
export async function exportScoreSummaryPDF(
  interview: Interview,
  submissions: ScoreSubmission[],
  aggregates: {
    dimensionScores: Array<{ dimensionId: string; name: string; avg: number; variance: number }>
    overallAvg: number
    recommendations: Record<string, number>
  }
): Promise<Blob> {
  const doc = new jsPDF()
  let y = 20

  // Header
  doc.setFontSize(18)
  doc.text('Interview Score Summary', 20, y)
  y += 10

  doc.setFontSize(12)
  doc.text(`Candidate: ${interview.candidateName}`, 20, y)
  y += 6
  doc.text(`Role: ${interview.role} at ${interview.company}`, 20, y)
  y += 6
  doc.text(`Date: ${new Date(interview.updatedAt).toLocaleDateString()}`, 20, y)
  y += 10

  // Dimension Scores
  doc.setFontSize(14)
  doc.text('Dimension Scores', 20, y)
  y += 8

  doc.setFontSize(10)
  for (const dim of aggregates.dimensionScores) {
    doc.text(`${dim.name}: ${dim.avg.toFixed(2)} (variance: ${dim.variance.toFixed(2)})`, 25, y)
    y += 5
  }

  y += 5
  doc.setFontSize(12)
  doc.text(`Overall Average: ${aggregates.overallAvg.toFixed(2)} / 5.0`, 20, y)
  y += 10

  // Recommendations
  doc.setFontSize(14)
  doc.text('Recommendations', 20, y)
  y += 8

  doc.setFontSize(10)
  for (const [rec, count] of Object.entries(aggregates.recommendations)) {
    doc.text(`${rec.replace('_', ' ')}: ${count}`, 25, y)
    y += 5
  }

  // Individual Submissions
  y += 10
  doc.setFontSize(14)
  doc.text('Individual Submissions', 20, y)
  y += 8

  for (const sub of submissions) {
    doc.setFontSize(10)
    doc.text(`Panelist: ${sub.panelistId}`, 25, y)
    y += 5
    doc.text(`Recommendation: ${sub.recommendation}`, 25, y)
    y += 5

    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }

  return doc.output('blob')
}
