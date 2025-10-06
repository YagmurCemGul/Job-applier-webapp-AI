import type { ParsedJob } from '@/types/ats.types'
import { parseJobText } from './parse-text'
import { parseJobHtml } from './parse-html'
import { parseJobPdf } from './parse-pdf'
import { parseJobDocx } from './parse-docx'
import { finalizeParsedJob } from './normalize'

/**
 * Universal ingestion input types
 */
export type IngestInput =
  | { kind: 'text'; data: string; meta?: { url?: string; filename?: string; site?: string } }
  | { kind: 'html'; data: string; meta?: { url?: string; site?: string } }
  | { kind: 'pdf'; data: ArrayBuffer; meta?: { filename?: string } }
  | { kind: 'docx'; data: ArrayBuffer; meta?: { filename?: string } }

/**
 * High-level ingestion and parsing with normalization & confidence aggregation
 * Auto-detects format and routes to appropriate parser
 */
export async function ingestAndParseJob(input: IngestInput): Promise<ParsedJob> {
  let pj: ParsedJob

  switch (input.kind) {
    case 'text':
      pj = await parseJobText(input.data, input.meta)
      break
    case 'html':
      pj = await parseJobHtml(input.data, input.meta)
      break
    case 'pdf':
      pj = await parseJobPdf(input.data, input.meta)
      break
    case 'docx':
      pj = await parseJobDocx(input.data, input.meta)
      break
    default:
      throw new Error('Unsupported ingest kind')
  }

  return finalizeParsedJob(pj)
}
