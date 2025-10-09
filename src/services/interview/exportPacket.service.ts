/**
 * @fileoverview Interview packet export service for Step 43
 * @module services/interview/exportPacket
 */

import type { SessionRun, InterviewPlan, StorySTAR, QuestionItem } from '@/types/interview.types';
import { exportHTMLToPDF } from '@/services/export/pdf.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';

/**
 * Export interview packet as PDF or Google Doc
 * @param opts - Export options
 * @returns Export result (URL or doc ID)
 */
export async function exportInterviewPacket(opts: {
  run: SessionRun;
  plan?: InterviewPlan;
  questions: QuestionItem[];
  stories: StorySTAR[];
  kind: 'pdf' | 'gdoc';
}): Promise<string> {
  const html = buildPacketHTML(opts);

  if (opts.kind === 'pdf') {
    const result = await exportHTMLToPDF(
      html,
      'Interview_Packet.pdf',
      'en',
      { returnUrl: true } as any
    );
    return typeof result === 'string' ? result : '';
  } else {
    const result = await exportHTMLToGoogleDoc(html, 'Interview Packet');
    return result.id || '';
  }
}

/**
 * Build HTML for interview packet
 * @param opts - Packet content
 * @returns HTML string
 */
function buildPacketHTML(opts: {
  run: SessionRun;
  plan?: InterviewPlan;
  questions: QuestionItem[];
  stories: StorySTAR[];
}): string {
  const { run, plan, questions, stories } = opts;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Interview Packet</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    h3 { color: #3b82f6; }
    .metadata { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .question { margin: 15px 0; padding: 10px; border-left: 3px solid #3b82f6; }
    .story { margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 5px; }
    .metrics { color: #059669; font-weight: bold; }
    .transcript { background: #f3f4f6; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; }
    .rubric { margin: 10px 0; }
    .rubric-score { display: inline-block; padding: 5px 10px; background: #dbeafe; border-radius: 3px; margin-right: 10px; }
    ul { margin: 10px 0; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
  <h1>Interview Packet</h1>
  
  ${plan ? `
  <div class="metadata">
    <h2>Interview Details</h2>
    <p><strong>Company:</strong> ${plan.company || 'N/A'}</p>
    <p><strong>Role:</strong> ${plan.role || 'N/A'}</p>
    <p><strong>Type:</strong> ${plan.kind}</p>
    <p><strong>Medium:</strong> ${plan.medium}</p>
    <p><strong>Date:</strong> ${new Date(plan.startISO).toLocaleString()}</p>
    ${plan.interviewer ? `<p><strong>Interviewer:</strong> ${plan.interviewer}</p>` : ''}
  </div>
  ` : ''}

  <h2>Questions Practiced</h2>
  ${questions.length > 0 ? `
    <ol>
      ${questions.map(q => `
        <li class="question">
          <strong>${q.prompt}</strong>
          <div><small>Type: ${q.kind} | Difficulty: ${q.difficulty}/5 | Tags: ${q.tags.join(', ')}</small></div>
        </li>
      `).join('')}
    </ol>
  ` : '<p>No questions recorded</p>'}

  <h2>STAR Stories Used</h2>
  ${stories.length > 0 ? stories.map(s => `
    <div class="story">
      <h3>${s.title}</h3>
      <p><strong>Situation:</strong> ${s.S}</p>
      <p><strong>Task:</strong> ${s.T}</p>
      <p><strong>Action:</strong> ${s.A}</p>
      <p><strong>Result:</strong> ${s.R}</p>
      ${s.metrics && s.metrics.length > 0 ? `
        <p class="metrics">Metrics: ${s.metrics.join(' | ')}</p>
      ` : ''}
      ${s.links && s.links.length > 0 ? `
        <p><strong>Links:</strong></p>
        <ul>${s.links.map(l => `<li><a href="${l}">${l}</a></li>`).join('')}</ul>
      ` : ''}
    </div>
  `).join('') : '<p>No stories recorded</p>'}

  ${run.transcript ? `
  <h2>Transcript (Excerpt)</h2>
  <div class="transcript">${run.transcript.text.slice(0, 2000)}${run.transcript.text.length > 2000 ? '...' : ''}</div>
  
  ${run.transcript.wordsPerMin ? `<p><strong>Words Per Minute:</strong> ${run.transcript.wordsPerMin}</p>` : ''}
  ${run.transcript.fillerCount ? `<p><strong>Filler Words:</strong> ${run.transcript.fillerCount}</p>` : ''}
  ${run.transcript.talkListenRatio ? `<p><strong>Talk/Listen Ratio:</strong> ${(run.transcript.talkListenRatio * 100).toFixed(0)}%</p>` : ''}
  ` : ''}

  ${run.rubric ? `
  <h2>Rubric Score</h2>
  <div class="rubric">
    <p><strong>Total Score:</strong> <span class="rubric-score">${run.rubric.total.toFixed(2)}/4.0</span></p>
    <p><strong>Breakdown:</strong></p>
    <ul>
      ${Object.entries(run.rubric.scores).map(([key, score]) => `
        <li>${key}: ${score}/4</li>
      `).join('')}
    </ul>
    ${run.rubric.notes ? `<p><strong>Notes:</strong> ${run.rubric.notes}</p>` : ''}
  </div>
  ` : ''}

  ${run.feedbackHtml ? `
  <h2>AI Feedback</h2>
  ${run.feedbackHtml}
  ` : ''}

  ${run.notes ? `
  <h2>Additional Notes</h2>
  <p>${run.notes}</p>
  ` : ''}

  <hr>
  <p><small>Generated on ${new Date().toLocaleString()}</small></p>
</body>
</html>
  `.trim();
}
