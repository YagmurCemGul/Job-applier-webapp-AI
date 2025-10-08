# Step 27: Advanced Job Parsing & Multi-Source Ingestion

## Overview

Step 27 extends the basic Step 25 job parser into a robust, multi-source ingestion pipeline that handles **Text, HTML, PDF, and DOCX** inputs. It provides:

- **Richer structured output** with confidence scores
- **Normalization & inference** (employment type, seniority, dates, remote mode)
- **Taxonomy-driven keyword extraction** (EN/TR)
- **Backward compatibility** with Step 25

## Architecture

### Ingestion Flow

```
User Input (Text/HTML/PDF/DOCX)
    ↓
ingestAndParseJob()
    ↓
Format-specific parser (parse-text, parse-html, parse-pdf, parse-docx)
    ↓
Normalization & Entity Extraction
    ↓
Confidence Scoring
    ↓
finalizeParsedJob()
    ↓
ParsedJob with confidence scores
```

### Module Structure

```
src/services/jobs/parsing/
├── ingest.ts              # Main ingestion API
├── parse-text.ts          # Plain text parser
├── parse-html.ts          # HTML parser with JSON-LD support
├── parse-pdf.ts           # PDF parser (pdfjs-dist)
├── parse-docx.ts          # DOCX parser (mammoth)
├── normalize.ts           # Text normalization & finalization
├── sections.ts            # Section splitting (EN/TR headers)
├── salary.ts              # Salary parsing (multi-currency)
├── dates.ts               # Posted/deadline date parsing
├── entities.ts            # Title, company, location, recruiter extraction
├── location.ts            # Remote type inference
├── employment.ts          # Employment type & seniority inference
├── taxonomy.ts            # Skills, roles, aliases, stopwords
├── keywords.ts            # Keyword extraction with taxonomy
├── confidence.ts          # Confidence scoring utilities
└── readability.ts         # HTML text/meta/JSON-LD extraction
```

## Priority Order for Data Extraction

When parsing HTML:

1. **JSON-LD schema** (highest confidence: 0.9)
2. **Open Graph / Twitter meta tags** (high confidence: 0.8)
3. **Body text extraction** (medium confidence: 0.6)

This ensures structured data is preferred over heuristic extraction.

## Confidence Scoring

### Per-Field Confidence

Each parsed field can have an associated `FieldConfidence<T>`:

```typescript
{
  value: T,
  confidence: number // 0..1
}
```

### Overall Confidence

The `_conf.overall` score is computed as the average of core field confidences:

```typescript
overall = avg(title.conf, company.conf, location.conf)
```

Clamped to [0, 1] range.

### Confidence Heuristics

| Source | Confidence |
|--------|-----------|
| JSON-LD structured data | 0.9 |
| Labeled field (e.g., "Title: X") | 0.8 |
| Meta tags (OG, Twitter) | 0.8 |
| First-line heuristic | 0.6 |
| Regex pattern match | 0.5-0.7 |
| Keyword in signature | 0.4 |

## Language Detection

Turkish is detected by presence of special characters: `ığüşöçİĞÜŞÖÇ`

English is detected by Latin alphabet without Turkish chars.

This affects:
- Section header detection
- Stopword filtering
- Taxonomy selection

## Taxonomy & Keywords

### Skill Aliases

Skills are normalized to canonical forms:

```typescript
'reactjs', 'react.js' → 'react'
'nodejs', 'node.js' → 'node'
'ts' → 'typescript'
```

### Role Keywords

Common job titles are recognized:

```
EN: 'product manager', 'frontend', 'backend', 'data scientist'...
TR: 'ürün yöneticisi', 'önyüz', 'arkayüz', 'veri bilimcisi'...
```

### Stopwords

Common words filtered from keywords:

```
EN: and, or, the, a, is, are, was...
TR: ve, ile, bir, için, de, da...
```

### Keyword Limit

Maximum 150 keywords to avoid noise.

## Adding New Languages

1. Add language detection pattern in `normalize.ts`
2. Add header patterns in `sections.ts`
3. Add stopwords in `taxonomy.ts`
4. Add skill aliases and role keywords in `taxonomy.ts`
5. Update date/salary parsing patterns in `dates.ts` and `salary.ts`

## PDF Worker Setup

For `pdfjs-dist` to work in browser:

1. Install: `npm install pdfjs-dist`
2. Worker is configured in `parse-pdf.ts` to use CDN:
   ```typescript
   pdfjs.GlobalWorkerOptions.workerSrc = 
     '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js'
   ```
3. For production, consider self-hosting the worker

## DOCX Parsing

Uses `mammoth` for browser-side extraction:

1. Install: `npm install mammoth`
2. Converts DOCX to HTML, then parses as HTML
3. Style mapping for lists:
   ```typescript
   styleMap: ["p[style-name='List Paragraph'] => ul > li:fresh"]
   ```

## Security Considerations

- **HTML Sanitization**: Scripts and styles are stripped
- **CORS Handling**: URL fetch failures fall back gracefully
- **Payload Limits**: Cap input text at ~300k characters (not enforced yet, add if needed)
- **No PII in Logs**: Email addresses should be redacted in telemetry

## Performance

- **Debouncing**: Heavy parsing should be debounced in UI (not implemented here)
- **Memoization**: Taxonomy data is statically imported (no runtime overhead)
- **Regex Optimization**: Avoid quadratic patterns (all patterns tested)

## Backward Compatibility

The original `parseJobText(raw: string)` function from Step 25 is preserved:

```typescript
// Step 25 usage (still works)
import { parseJobText } from '@/services/ats/jobParser'
const pj = parseJobText(text) // Synchronous, legacy

// Step 27 usage (new)
import { ingestAndParseJob } from '@/services/ats/jobParser'
const pj = await ingestAndParseJob({ kind: 'text', data: text })
```

## API Usage Examples

### Text Parsing

```typescript
import { ingestAndParseJob } from '@/services/jobs/parsing/ingest'

const result = await ingestAndParseJob({
  kind: 'text',
  data: jobText,
  meta: { filename: 'job.txt' }
})
```

### HTML Parsing

```typescript
const result = await ingestAndParseJob({
  kind: 'html',
  data: htmlString,
  meta: { url: 'https://company.com/jobs/123', site: 'company.com' }
})
```

### PDF Parsing

```typescript
const arrayBuffer = await file.arrayBuffer()
const result = await ingestAndParseJob({
  kind: 'pdf',
  data: arrayBuffer,
  meta: { filename: 'job.pdf' }
})
```

### DOCX Parsing

```typescript
const arrayBuffer = await file.arrayBuffer()
const result = await ingestAndParseJob({
  kind: 'docx',
  data: arrayBuffer,
  meta: { filename: 'job.docx' }
})
```

## Testing

### Unit Tests

Located in `src/tests/unit/`:

- `parse-text.spec.ts` - Text parsing with all features
- `parse-html.spec.ts` - HTML & JSON-LD extraction
- `normalize.spec.ts` - Language detection & normalization
- `salary.spec.ts` - Multi-currency salary parsing
- `dates.spec.ts` - Relative & absolute date parsing
- `entities.spec.ts` - Entity extraction with confidence
- `keywords.spec.ts` - Taxonomy-driven extraction
- `confidence.spec.ts` - Score aggregation

### E2E Tests

Located in `src/tests/e2e/`:

- `step27-ingest-flow.spec.ts` - Multi-source ingestion flows

### Test Fixtures

Located in `src/tests/fixtures/`:

- `job-en.txt` - English text sample
- `job-tr.txt` - Turkish text sample
- `job-en.html` - English HTML with JSON-LD
- `job-tr.html` - Turkish HTML sample

## Known Limitations

1. **PDF/DOCX in Tests**: Unit tests are placeholders; complex binary parsing is tested in E2E
2. **Heuristic Accuracy**: Confidence scores are estimates; no ML validation
3. **Language Support**: Only EN/TR currently; extensible to others
4. **Async Compatibility**: Step 25's synchronous `parseJobText` uses fallback; new code should use async `ingestAndParseJob`

## Future Enhancements

- Add more languages (FR, DE, ES)
- ML-based confidence scoring
- Named entity recognition for company names
- Location geocoding & normalization
- Salary normalization to single currency
- Integration with job board APIs

## Troubleshooting

### PDF parsing fails in browser

- Check that `pdfjs-dist` is installed
- Verify worker URL is accessible
- For local development, may need to configure Vite to handle worker assets

### DOCX parsing returns empty

- Verify `mammoth` is installed
- Check file is valid DOCX (not DOC)
- Ensure browser supports ArrayBuffer

### Keywords missing

- Check language detection (EN/TR)
- Verify sections are being split correctly
- Review stopword list (may be too aggressive)

### Confidence scores always 0

- Ensure `finalizeParsedJob()` is called
- Check that field extractions have confidence values
- Review entity extraction patterns

## Changelog

### Step 27 (Current)

- ✅ Multi-source ingestion (Text/HTML/PDF/DOCX)
- ✅ Confidence scoring system
- ✅ Extended fields (employmentType, seniority, dates, recruiter)
- ✅ Taxonomy-driven keyword extraction
- ✅ JSON-LD support for HTML
- ✅ EN/TR language support
- ✅ Comprehensive tests

### Step 25 (Previous)

- Basic text parsing
- Section splitting
- Simple keyword extraction
- Language detection

## Support

For questions or issues, refer to:
- Type definitions: `src/types/ats.types.ts`
- Main API: `src/services/jobs/parsing/ingest.ts`
- Tests: `src/tests/unit/` and `src/tests/e2e/`
