# Step 27: Advanced Job Parsing & Multi-Source Ingestion

## Overview

This module extends Step 25's basic job parser into a robust, multi-source ingestion pipeline supporting text, HTML, PDF, and DOCX formats with confidence scoring, normalization, and taxonomy-driven keyword extraction.

## Architecture

### Ingestion Pipeline

```
Input Sources → Ingestion → Parsing → Normalization → Finalization
    │              │           │            │              │
    ├─ Text ───────┼───────────┼────────────┼──────────────┤
    ├─ HTML ───────┼───────────┼────────────┼──────────────┤
    ├─ PDF  ───────┼───────────┼────────────┼──────────────┤
    └─ DOCX ───────┼───────────┼────────────┼──────────────┤
                   │           │            │              │
                   v           v            v              v
              Router      Extractors   Normalizers    Confidence
                                                       Aggregation
```

### Core Components

**1. Ingestion Layer** (`ingest.ts`):
- Universal `ingestAndParseJob()` function
- Auto-routing based on input kind
- Type-safe input discriminated union
- Centralized error handling

**2. Format Parsers**:
- `parse-text.ts`: Plain text with section detection
- `parse-html.ts`: HTML with JSON-LD/meta/body extraction
- `parse-pdf.ts`: PDF with hyphenation fixes
- `parse-docx.ts`: DOCX via mammoth conversion

**3. Extraction Modules**:
- `sections.ts`: Section splitting (EN/TR headers)
- `entities.ts`: Title, company, location, recruiter, email
- `salary.ts`: Salary ranges with currency/period
- `dates.ts`: Posted date and deadline (relative/absolute)
- `keywords.ts`: Taxonomy-based extraction
- `employment.ts`: Type and seniority inference

**4. Support Modules**:
- `normalize.ts`: Text normalization, language detection, confidence
- `taxonomy.ts`: Stopwords, skill aliases, role keywords
- `confidence.ts`: Confidence score combination
- `readability.ts`: HTML text extraction

## Multi-Source Ingestion

### Text Parsing

```typescript
Input: Plain text job posting

Process:
1. Detect language (EN/TR via character distribution)
2. Split into sections (summary, requirements, responsibilities, etc.)
3. Extract entities (title, company, location)
4. Parse salary ranges
5. Parse dates (posted, deadline)
6. Extract keywords with taxonomy
7. Infer employment type, seniority, remote mode
8. Calculate confidence scores

Output: ParsedJob with all fields + confidences
```

### HTML Parsing

```typescript
Input: HTML job posting (from URL)

Priority Order:
1. JSON-LD structured data (if available)
   - JobPosting schema
   - Direct title, company extraction
2. Meta tags (OG, Twitter)
   - Fallback for title, company
3. Body text extraction
   - Remove header, nav, footer
   - Strip scripts and styles
   - Clean whitespace

Then: Parse as text
```

### PDF Parsing

```typescript
Input: PDF file (ArrayBuffer)

Process:
1. Load with pdfjs-dist
2. Extract text from all pages
3. Fix hyphenation:
   - Merge "soft-\nware" → "software"
4. Normalize whitespace
5. Parse as text

Worker Setup:
  GlobalWorkerOptions.workerSrc = 
    "//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js"

Fallback: If PDF parsing fails, return minimal result
```

### DOCX Parsing

```typescript
Input: DOCX file (ArrayBuffer)

Process:
1. Convert to HTML with mammoth
2. Style mapping for lists:
   - "List Paragraph" → <ul><li>
3. Parse as HTML
4. Extract text

Fallback: If DOCX parsing fails, return minimal result
```

## Field Extraction

### Entities

**Title Extraction**:
```typescript
Priority:
1. Explicit pattern: "title: Software Engineer"
2. First line heuristic (after "we are hiring:")
3. Confidence: 0.8 (pattern), 0.6 (heuristic)
```

**Company Extraction**:
```typescript
Pattern: "company: TechCorp"
Confidence: 0.8
Fallback: Meta tags (HTML), JSON-LD
```

**Location Extraction**:
```typescript
Pattern: "location: San Francisco"
Fallback: Email signature cities
Confidence: 0.7 (pattern), 0.4 (fallback)
```

**Recruiter Extraction**:
```typescript
Pattern: "recruiter: Jane Doe" or email
Confidence: 0.8 (if email present), 0.3 (otherwise)
```

### Salary Parsing

Supported Formats:
```typescript
Examples:
  "$60k-$80k"           → min: 60000, max: 80000, currency: USD
  "₺35.000–₺45.000"    → min: 35000, max: 45000, currency: TRY
  "60,000-80,000 EUR/year" → min: 60000, max: 80000, currency: EUR, period: y

Patterns:
  - Currency symbols: $, €, ₺
  - Currency codes: USD, EUR, TRY, TL
  - Multipliers: k (×1000)
  - Separators: comma, dot (normalized)
  - Periods: year, month, day, hour (or y/m/d/h)

Confidence: 0.6 (if found), 0 (if not)
```

### Date Parsing

**Posted Date** (Relative):
```typescript
Patterns (EN):
  "posted 2 days ago"
  "posted 1 week ago"
  "posted 3 months ago"

Patterns (TR):
  "2 gün önce yayınlandı"
  "1 hafta önce"
  "3 ay önce"

Confidence: 0.6
```

**Deadline** (Absolute):
```typescript
Patterns:
  "deadline: 12.31.2023"
  "son başvuru: 31 Aralık 2023"
  "apply by: January 15, 2024"

Confidence: 0.8
```

### Employment Type Inference

```typescript
Patterns:
  full-time / tam zamanlı  → full_time
  part-time / yarı zamanlı → part_time
  contract / sözleşmeli    → contract
  intern / staj            → intern
  temporary / geçici       → temporary
  freelance / serbest      → freelance
  (default)                → other

Confidence: 0.5 (heuristic)
```

### Seniority Inference

```typescript
Patterns (by priority):
  c-level, CTO, CEO, CFO  → c_level
  VP, vice president      → vp
  director / direktör     → director
  manager, lead / yönetici → manager
  senior / kıdemli        → senior
  mid / orta seviye       → mid
  junior / jr. / asistan  → junior
  intern / staj           → intern
  (default)               → na

Confidence: 0.5 (heuristic)
```

### Remote Type Inference

```typescript
Patterns:
  remote / uzaktan        → remote
  hybrid / hibrit         → hybrid
  onsite / ofis / yerinde → onsite
  (default)               → unknown

Confidence: Built into remoteType (no separate score)
```

## Keyword Extraction

### Taxonomy System

**Stopwords** (EN):
```
and, or, the, a, an, to, for, of, in, on, with, is, are, be, have, has
```

**Stopwords** (TR):
```
ve, ile, bir, için, de, da, ya, veya, olan, olarak
```

**Skill Aliases** (EN):
```typescript
{
  'react': ['reactjs', 'react.js'],
  'node': ['nodejs', 'node.js'],
  'typescript': ['ts'],
  'python': ['py'],
  'javascript': ['js'],
  'project management': ['pm', 'scrum', 'kanban', 'agile'],
  'kubernetes': ['k8s'],
  'docker': ['containerization']
}
```

**Skill Aliases** (TR):
```typescript
{
  'proje yönetimi': ['scrum', 'kanban', 'çevik'],
  'pazarlama': ['marketing', 'dijital pazarlama']
}
```

**Role Keywords** (EN):
```
product manager, frontend developer, backend developer, data analyst,
marketing manager, designer, software engineer, devops engineer
```

**Role Keywords** (TR):
```
ürün yöneticisi, önyüz geliştirici, arkayüz geliştirici, veri analisti,
pazarlama yöneticisi, tasarımcı, yazılım mühendisi
```

### Extraction Process

```typescript
1. Combine text from:
   - requirements
   - qualifications
   - responsibilities
   - summary

2. Tokenize:
   - Match: [a-zğüşöçıİ0-9+.#]{2,}
   - Lowerca se

3. Filter stopwords:
   - Remove common words (EN/TR)

4. Expand aliases:
   - If token matches alias, add canonical form
   - Example: "reactjs" → add "react"

5. Add role keywords:
   - If full phrase found in text
   - Example: "product manager" if present

6. Dedupe and limit:
   - Remove duplicates
   - Keep top 150 keywords

Output: string[] (keywords)
```

## Confidence Scoring

### Per-Field Confidence

```typescript
FieldConfidence<T> {
  value?: T
  confidence: number  // 0..1
}

Examples:
  title: { value: "Software Engineer", confidence: 0.8 }
  company: { value: "TechCorp", confidence: 0.8 }
  location: { value: "San Francisco", confidence: 0.7 }
  salary: { value: { min: 60000, max: 80000, currency: "USD" }, confidence: 0.6 }
  postedAt: { value: Date, confidence: 0.6 }
  recruiter: { value: { email: "jane@tech.com" }, confidence: 0.8 }
```

### Overall Confidence

```typescript
Algorithm:
1. Collect core field confidences:
   - title.confidence
   - company.confidence
   - location.confidence
   
2. Average:
   overall = sum(confidences) / count(confidences)
   
3. Fallback:
   If no confidences: overall = 0.4
   
4. Clamp:
   overall = clamp(overall, 0, 1)

Example:
  title: 0.8
  company: 0.8
  location: 0.7
  → overall = (0.8 + 0.8 + 0.7) / 3 = 0.77
```

## Section Splitting

### Header Detection

**English Headers**:
```typescript
{
  summary: [/summary|about the role|about us|job description/i],
  responsibilities: [/responsibilities|what you will do|your role|duties/i],
  requirements: [/requirements|what you bring|must have|required skills/i],
  qualifications: [/qualifications|nice to have|preferred|bonus/i],
  benefits: [/benefits|perks|what we offer/i]
}
```

**Turkish Headers**:
```typescript
{
  summary: [/özet|pozisyon hakkında|hakkımızda|iş tanımı/i],
  responsibilities: [/görevler|sorumluluklar|ne yapacaksın|yapılacaklar/i],
  requirements: [/gereksinimler|aranan nitelikler|şartlar|zorunlu/i],
  qualifications: [/nitelikler|tercihen|artı|bonus/i],
  benefits: [/yan haklar|avantajlar|sunduklarımız/i]
}
```

### Extraction Process

```typescript
For each section:
1. Find header match in text
2. Extract content until next header or double newline
3. Normalize whitespace
4. If bullets found:
   - Split by newline
   - Strip bullet markers (-, *, •)
   - Filter empty lines
5. Return array of strings (or single string for summary)
```

## Normalization

### Text Normalization

```typescript
normalizeText(text):
1. Unicode normalization: NFKD
2. Remove diacritics: /\p{Diacritic}/gu
3. Normalize whitespace: [^\S\r\n]+ → ' '
4. Trim

Example:
  "Müh  endis   lik" → "muhendislik"
  "Café" → "cafe"
```

### Language Detection

```typescript
detectLang(text):
1. Check for Turkish characters:
   - [ığüşöçİĞÜŞÖÇ]
2. If found: return 'tr'
3. Check for English characters:
   - [a-z]/i
4. If found: return 'en'
5. Otherwise: return 'unknown'

Note: Turkish detection has priority
```

### Hyphenation Fix (PDF)

```typescript
fixHyphenation(text):
1. Merge broken words:
   - (\w)-\s+(\w) → $1$2
   - "soft-\nware" → "software"
2. Normalize whitespace
3. Trim

Use case: PDF extraction often breaks words at line ends
```

## Backward Compatibility

### Step 25 Integration

**Preserved Exports**:
```typescript
// Old (still works):
import { parseJobText } from '@/services/ats/jobParser'

// New (recommended):
import { ingestAndParseJob } from '@/services/jobs/parsing/ingest'
```

**Non-Breaking Changes**:
- ParsedJob type extended with optional fields
- All Step 25 fields remain unchanged
- New fields: employmentType, seniority, postedAt, deadlineAt, recruiter, _conf
- Step 26 SavedJobsList continues to work
- Step 25 ATS analysis unchanged

**Store Integration**:
```typescript
// Old parseJob() flow:
parseJob() → parseJobText() → ParsedJob

// New parseJob() flow:
parseJob() → ingestAndParseJob({ kind: 'text', ... }) → ParsedJob

// Result: Same API, enhanced output
```

## Security & Performance

### Security

**HTML Sanitization**:
```typescript
- Remove all <script> tags
- Remove all <style> tags
- Strip event handlers (onclick, etc.)
- Never render fetched HTML directly
```

**Input Validation**:
```typescript
- Cap text input: ~300k characters
- Validate file types: .pdf, .docx
- Check ArrayBuffer size
- Timeout on parsing: 30s max
```

**Error Handling**:
```typescript
- Try-catch on all parsers
- Fallback to minimal result on failure
- No PII in error logs
- Redact emails before telemetry
```

### Performance

**Optimization**:
```typescript
- Lazy imports: Dynamic import() for parsers
- Memoized taxonomy: Loaded once
- Debounced UI parsing: 250ms
- Regex compilation: Pre-compiled patterns
- Avoid quadratic algorithms
```

**Memory Management**:
```typescript
- Stream PDF pages (not all at once)
- Release ArrayBuffer after parsing
- Limit keyword array: 150 max
- No circular references
```

**CORS Handling**:
```typescript
- Fetch with mode: 'cors'
- Catch network errors gracefully
- Fallback: Prompt user to paste text
- Never crash on failed URL fetch
```

## Testing Strategy

### Unit Tests

**parse-text.spec.ts**:
- Section splitting (EN/TR)
- Title/company/location inference
- Salary parsing (ranges, currencies)
- Date parsing (relative/absolute)
- Keyword extraction

**parse-html.spec.ts**:
- JSON-LD extraction
- Meta tag fallback
- Body text extraction
- Priority order verification

**parse-pdf.spec.ts**:
- Multi-page extraction
- Hyphenation fixes
- Page order correctness

**parse-docx.spec.ts**:
- List detection
- Style mapping
- HTML conversion

**normalize.spec.ts**:
- Language detection
- Text normalization
- Confidence aggregation

**salary.spec.ts**:
- Currency detection
- Range parsing
- Period extraction

**dates.spec.ts**:
- Relative dates (EN/TR)
- Absolute dates
- Format variations

**entities.spec.ts**:
- Title heuristics
- Company/location regex
- Email extraction

**keywords.spec.ts**:
- Stopword filtering
- Alias expansion
- Role keyword detection

**confidence.spec.ts**:
- Score combination
- Bounds checking [0,1]

### E2E Tests

**step27-ingest-flow.spec.ts**:
```typescript
Scenarios:
1. Paste EN text → Parse → Verify fields + confidences
2. Paste TR text → Parse → Verify language detection
3. Fetch HTML URL → Parse → Verify JSON-LD priority
4. Upload PDF → Parse → Verify text extraction
5. Upload DOCX → Parse → Verify list detection
6. Analyze after parsing → Verify ATS results
```

## Future Enhancements

### Step 31+ AI Integration

```typescript
// Current: Heuristic parsing
const result = await ingestAndParseJob({ kind: 'text', data })

// Future: AI-enhanced parsing
const result = await ingestAndParseJob({
  kind: 'text',
  data,
  options: {
    aiProvider: 'claude',
    confidence: 'ai-scored',
    enrichment: true
  }
})

// Clean swap: Same API, enhanced results
```

**AI Improvements**:
- Better title/company extraction
- Contextual keyword extraction
- Skill level inference
- Soft skills detection
- Industry classification
- Salary range validation
- Company size inference

### Additional Formats

```typescript
// Future formats:
- parse-json.ts   (structured JSON job ads)
- parse-xml.ts    (XML job feeds)
- parse-md.ts     (Markdown job posts)
- parse-image.ts  (OCR for image-based postings)
```

### Advanced Features

```typescript
// Future capabilities:
- Multi-language support (ES, FR, DE, etc.)
- Company logo extraction
- Skills graph mapping
- Salary benchmarking
- Location normalization to lat/lng
- Industry taxonomy
- Job level scoring
- Application difficulty prediction
```

## Troubleshooting

### PDF Worker Issues

```typescript
Error: "Cannot find worker"

Solution:
  GlobalWorkerOptions.workerSrc = 
    "//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js"

Alternative:
  Copy worker to /public and use local path
```

### CORS Failures

```typescript
Error: "CORS policy blocked"

Solutions:
1. User paste workflow (always works)
2. Server-side proxy (future enhancement)
3. Browser extension (advanced users)

Handling:
  - Try fetch with mode: 'cors'
  - Catch error gracefully
  - Show helpful message
  - Offer paste alternative
```

### Large File Handling

```typescript
Error: "Out of memory"

Limits:
  - PDF: Max 10MB
  - DOCX: Max 5MB
  - Text: Max 300k chars

Handling:
  - Check file size before parsing
  - Show warning for large files
  - Offer to process first N pages
  - Stream processing (future)
```

## References

- pdfjs-dist: https://mozilla.github.io/pdf.js/
- mammoth.js: https://github.com/mwilliamson/mammoth.js
- JSON-LD JobPosting: https://schema.org/JobPosting
- OpenGraph Protocol: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards
