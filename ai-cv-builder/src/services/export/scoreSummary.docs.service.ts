/**
 * Score Summary Google Docs Export Service
 * Creates Google Docs from interview scorecards
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
 * Exports score summary to Google Docs
 * Requires Google Docs API access from Step 35
 */
export async function exportScoreSummaryDocs(
  data: ScoreSummaryData,
  accountId: string
): Promise<{ id: string; url: string }> {
  try {
    // Import Google OAuth service from Step 35
    const { getBearer } = await import('@/services/integrations/google.oauth.service');

    const bearer = await getBearer(
      accountId,
      import.meta.env.VITE_OAUTH_PASSPHRASE,
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    );

    const content = generateDocsContent(data);
    const title = `Interview Score Summary - ${data.interview.candidateName} - ${data.interview.role}`;

    // Create Google Doc using Docs API
    const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create document: ${createResponse.statusText}`);
    }

    const doc = await createResponse.json();

    // Insert content into the document
    await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      }),
    });

    return {
      id: doc.documentId,
      url: `https://docs.google.com/document/d/${doc.documentId}/edit`,
    };
  } catch (error) {
    console.error('Failed to export to Google Docs:', error);
    throw error;
  }
}

/**
 * Generates plain text content for Google Doc
 */
function generateDocsContent(data: ScoreSummaryData): string {
  const { interview, submissions, aggregates } = data;

  let content = `INTERVIEW SCORE SUMMARY\n\n`;
  content += `Candidate: ${interview.candidateName}\n`;
  content += `Role: ${interview.role}\n`;
  content += `Company: ${interview.company}\n`;
  content += `Date: ${new Date(interview.createdAt).toLocaleDateString()}\n`;
  content += `Panelists: ${submissions.length}\n\n`;

  content += `OVERALL SCORE\n`;
  content += `${aggregates.overall.toFixed(2)}/5\n\n`;

  content += `DIMENSION SCORES\n`;
  for (const dim of aggregates.dimensions) {
    content += `• ${dim.name}: ${dim.average.toFixed(2)}/5 (variance: ${dim.variance.toFixed(2)})\n`;
  }
  content += `\n`;

  content += `RECOMMENDATIONS\n`;
  for (const [rec, count] of Object.entries(aggregates.recommendations)) {
    content += `• ${rec.replace(/_/g, ' ').toUpperCase()}: ${count}\n`;
  }
  content += `\n`;

  content += `INDIVIDUAL SUBMISSIONS\n\n`;
  for (const submission of submissions) {
    content += `Panelist: ${submission.panelistId}\n`;
    content += `Recommendation: ${submission.recommendation.replace(/_/g, ' ').toUpperCase()}\n`;
    if (submission.overall) {
      content += `Overall: ${submission.overall}/5\n`;
    }
    content += `Ratings:\n`;
    for (const rating of submission.ratings) {
      const dimName = aggregates.dimensions.find(d => d.dimensionId === rating.dimensionId)?.name || rating.dimensionId;
      content += `  • ${dimName}: ${rating.score}/5`;
      if (rating.note) {
        content += ` - ${rating.note}`;
      }
      content += `\n`;
    }
    content += `\n`;
  }

  content += `---\n`;
  content += `Generated on ${new Date().toLocaleString()}\n`;

  return content;
}

/**
 * Fallback: Export as plain text file
 */
export function exportAsTextFile(data: ScoreSummaryData): Blob {
  const content = generateDocsContent(data);
  return new Blob([content], { type: 'text/plain' });
}
