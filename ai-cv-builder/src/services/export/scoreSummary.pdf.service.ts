/**
 * Score Summary PDF Export Service
 * Generates PDF reports for interview scorecards and aggregated results
 */

import type { ScoreSubmission, ScorecardTemplate } from '@/types/scorecard.types';
import type { Interview } from '@/types/interview.types';

export interface ScoreSummaryData {
  interview: Interview;
  template: ScorecardTemplate;
  submissions: ScoreSubmission[];
  aggregates: {
    overall: number;
    dimensions: Array<{ dimensionId: string; name: string; average: number; variance: number }>;
    recommendations: Record<string, number>;
  };
}

/**
 * Generates a PDF blob from score summary data
 * Uses browser print API as fallback; production should use jsPDF or similar
 */
export async function exportScoreSummaryPDF(data: ScoreSummaryData): Promise<Blob> {
  const html = generateHTMLReport(data);

  try {
    // Try to use jsPDF if available
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Simple text-based PDF
    doc.setFontSize(16);
    doc.text(`Interview Score Summary`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Candidate: ${data.interview.candidateName}`, 20, 35);
    doc.text(`Role: ${data.interview.role}`, 20, 45);
    doc.text(`Company: ${data.interview.company}`, 20, 55);
    
    let yPos = 70;
    doc.setFontSize(14);
    doc.text('Overall Score', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Average: ${data.aggregates.overall.toFixed(2)}/5`, 20, yPos);
    
    yPos += 20;
    doc.setFontSize(14);
    doc.text('Dimension Scores', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    for (const dim of data.aggregates.dimensions) {
      doc.text(`${dim.name}: ${dim.average.toFixed(2)}/5 (variance: ${dim.variance.toFixed(2)})`, 20, yPos);
      yPos += 7;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    }
    
    return doc.output('blob');
  } catch (error) {
    console.warn('jsPDF not available, using HTML fallback', error);
    
    // Fallback: create HTML blob
    return new Blob([html], { type: 'text/html' });
  }
}

/**
 * Generates HTML report for printing or viewing
 */
function generateHTMLReport(data: ScoreSummaryData): string {
  const { interview, template, submissions, aggregates } = data;

  const dimensionRows = aggregates.dimensions
    .map(
      dim => `
      <tr>
        <td class="border px-4 py-2">${dim.name}</td>
        <td class="border px-4 py-2">${dim.average.toFixed(2)}/5</td>
        <td class="border px-4 py-2">${dim.variance.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const recommendationRows = Object.entries(aggregates.recommendations)
    .map(
      ([rec, count]) => `
      <tr>
        <td class="border px-4 py-2">${rec.replace(/_/g, ' ').toUpperCase()}</td>
        <td class="border px-4 py-2">${count}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Interview Score Summary - ${interview.candidateName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
    th { background-color: #f3f4f6; font-weight: 600; }
    .meta { color: #6b7280; margin: 10px 0; }
    .score-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 600; }
    .score-high { background-color: #d1fae5; color: #065f46; }
    .score-medium { background-color: #fef3c7; color: #92400e; }
    .score-low { background-color: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <h1>Interview Score Summary</h1>
  
  <div class="meta">
    <strong>Candidate:</strong> ${interview.candidateName}<br>
    <strong>Role:</strong> ${interview.role}<br>
    <strong>Company:</strong> ${interview.company}<br>
    <strong>Date:</strong> ${new Date(interview.createdAt).toLocaleDateString()}<br>
    <strong>Panelists:</strong> ${submissions.length}
  </div>

  <h2>Overall Score</h2>
  <p>
    <span class="score-badge ${aggregates.overall >= 4 ? 'score-high' : aggregates.overall >= 3 ? 'score-medium' : 'score-low'}">
      ${aggregates.overall.toFixed(2)}/5
    </span>
  </p>

  <h2>Dimension Scores</h2>
  <table>
    <thead>
      <tr>
        <th>Dimension</th>
        <th>Average Score</th>
        <th>Variance</th>
      </tr>
    </thead>
    <tbody>
      ${dimensionRows}
    </tbody>
  </table>

  <h2>Recommendations</h2>
  <table>
    <thead>
      <tr>
        <th>Recommendation</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      ${recommendationRows}
    </tbody>
  </table>

  <p style="margin-top: 40px; color: #6b7280; font-size: 0.875rem;">
    Generated on ${new Date().toLocaleString()}
  </p>
</body>
</html>
  `;
}

/**
 * Downloads the PDF blob
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
