# Step 26: Visual Guide & Screenshots Checklist

## 🖼️ UI Flow Visualization

### Main Job Tab Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CV Builder                                                  [Save CV]  │
├─────────────────────────────────────────────────────────────────────────┤
│  [1. Upload CV]  [2. Edit]  [3. Job]  [ATS Optimize]  [4. AI Optimize] │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  Job Tab                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  [Input]  [Saved Jobs] ← Sub-tabs                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────┬───────────────────────────────────────┐  │
│  │ Parse Job Posting       │ Job Details                           │  │
│  │ ┌────────────────────┐  │ ┌──────────────────────────────────┐  │  │
│  │ │ [Paste] [URL] [File]│ │ │ Title:                           │  │  │
│  │ ├────────────────────┤  │ │ [Senior Frontend Developer___]   │  │  │
│  │ │                    │  │ │                                  │  │  │
│  │ │ Paste job text...  │  │ │ Company:                         │  │  │
│  │ │                    │  │ │ [Tech Corp________________]      │  │  │
│  │ │                    │  │ │                                  │  │  │
│  │ │                    │  │ │ Location:                        │  │  │
│  │ └────────────────────┘  │ │ [Remote___________________]      │  │  │
│  │                         │ │                                  │  │  │
│  │ 150 words               │ │ Remote Type: [Remote ▼]          │  │  │
│  │                         │ │ Employment:  [Full-time ▼]       │  │  │
│  │                         │ │ Seniority:   [Senior ▼]          │  │  │
│  │                         │ │                                  │  │  │
│  │                         │ │ Salary: [80000] - [120000]       │  │  │
│  │                         │ │ Currency: [USD] Period: [Year ▼] │  │  │
│  │                         │ │                                  │  │  │
│  │                         │ │ Tags: [react, typescript, ...]   │  │  │
│  │                         │ │ Notes: [__________________]      │  │  │
│  │                         │ │                                  │  │  │
│  │                         │ │ [Save Job] [Analyze with CV]     │  │  │
│  │                         │ └──────────────────────────────────┘  │  │
│  └─────────────────────────┴───────────────────────────────────────┘  │
│                                                                         │
│  [← Back to Edit]                      [Analyze Against CV →]          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Saved Jobs Tab Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Job Tab                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  [Input]  [Saved Jobs] ← Sub-tabs                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Filters:                                                               │
│  ┌────────────────────┬───────────┬───────────┬─────────────────────┐ │
│  │ Search...          │ Status ▼  │ Site      │ ☐ Favorites only    │ │
│  └────────────────────┴───────────┴───────────┴─────────────────────┘ │
│                                                                         │
│  Jobs:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ ◉ Senior Frontend Developer • Tech Corp                         │  │
│  │   linkedin • Remote • remote                                    │  │
│  │   [☆] [Analyze] [Open] [🗑️]                                     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ ◉ Lead Engineer • Startup Inc                                   │  │
│  │   indeed • San Francisco • hybrid                               │  │
│  │   [★] [Analyze] [Open] [🗑️]                                     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ ◉ Product Manager • Big Tech                                    │  │
│  │   glassdoor • New York • onsite                                 │  │
│  │   [☆] [Analyze] [Open] [🗑️]                                     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Showing 3 of 12 jobs                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Job Detail Drawer (Sheet)

```
┌─────────────────────────────────────┐
│  Senior Frontend Developer      [×] │
│  Tech Corp                          │
├─────────────────────────────────────┤
│                                     │
│  Location: Remote                   │
│  Remote Type: [Remote]              │
│  Employment: [Full-time]            │
│  Seniority: [Senior]                │
│  Salary: 80000 - 120000 USD / year  │
│                                     │
│  Source: linkedin.com/jobs/...  ↗   │
│                                     │
│  Tags: [react] [typescript] [senior]│
│                                     │
│  Notes                              │
│  ─────────────────────────────────  │
│  Interesting position, remote...    │
│                                     │
│  Job Description                    │
│  ─────────────────────────────────  │
│  ┌─────────────────────────────┐   │
│  │ We are seeking an           │   │
│  │ experienced Frontend        │   │
│  │ Developer...                │   │
│  │                             │   │
│  │ (scrollable raw text)       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Analyze with current CV]          │
│  [📋 Duplicate]                     │
│                                     │
└─────────────────────────────────────┘
```

---

## 📸 Screenshot Checklist

### Input Tab Screenshots
- [ ] Empty state (before parsing)
- [ ] Job text pasted in Paste tab
- [ ] URL fetched in URL tab
- [ ] File uploaded in File tab
- [ ] Form auto-prefilled after parse
- [ ] All form fields filled
- [ ] Validation error states (empty title, invalid URL)
- [ ] Success toast after save

### Saved Jobs Tab Screenshots
- [ ] Empty state ("No saved jobs yet")
- [ ] List with 3-5 jobs
- [ ] Search active (filtered results)
- [ ] Status filter (Applied only)
- [ ] Favorites filter active
- [ ] No results state ("No jobs match filters")
- [ ] Hover state on job row
- [ ] Star icon filled (favorited job)

### Job Detail Drawer Screenshots
- [ ] Drawer open with full job details
- [ ] Tags displayed
- [ ] Notes section
- [ ] Raw text scrollable
- [ ] Salary formatted
- [ ] External link icon on source URL
- [ ] Duplicate button
- [ ] Analyze button

### Mobile Responsive Screenshots
- [ ] Input tab on mobile (stacked layout)
- [ ] Saved jobs list on mobile
- [ ] Filters on mobile (stacked)
- [ ] Drawer on mobile (full width)

### Interaction Screenshots
- [ ] Favorite toggle animation
- [ ] Delete confirmation (if implemented)
- [ ] Search typing (debounce indicator)
- [ ] Loading state (spinner)
- [ ] Error state (alert)

---

## 🎨 Visual Design Tokens

### Colors

```css
/* Job Status Colors */
.status-saved     { color: #3b82f6; } /* blue-500 */
.status-applied   { color: #8b5cf6; } /* purple-500 */
.status-interview { color: #eab308; } /* yellow-500 */
.status-offer     { color: #22c55e; } /* green-500 */
.status-rejected  { color: #ef4444; } /* red-500 */

/* Action Colors */
.favorite-active  { color: #fbbf24; } /* amber-400 */
.favorite-hover   { color: #f59e0b; } /* amber-500 */
.delete-hover     { color: #dc2626; } /* red-600 */
.analyze-primary  { color: #3b82f6; } /* blue-500 */
```

### Typography

```css
/* Job Title */
.job-title { 
  font-weight: 500; 
  font-size: 0.875rem; /* 14px */
  color: hsl(var(--foreground));
}

/* Job Company */
.job-company { 
  font-weight: 400; 
  color: hsl(var(--muted-foreground));
}

/* Job Metadata */
.job-meta { 
  font-size: 0.75rem; /* 12px */
  color: hsl(var(--muted-foreground));
}
```

### Spacing

```css
/* Job Row */
.job-row { padding: 0.75rem; } /* 12px */
.job-row-gap { gap: 0.5rem; } /* 8px */

/* Form Fields */
.form-field-gap { gap: 0.375rem; } /* 6px */
.form-grid-gap { gap: 1rem; } /* 16px */

/* Drawer */
.drawer-padding { padding: 1.5rem; } /* 24px */
.drawer-gap { gap: 1.5rem; } /* 24px */
```

---

## 🎭 Component States

### SavedJobRow States

```
┌─────────────────────────────────────────────────┐
│ STATE: Default                                  │
│ ◉ Senior Developer • Tech Corp                 │
│   linkedin • Remote                             │
│   [☆] [Analyze] [Open] [🗑️]                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ STATE: Hover (bg-accent/50)                     │
│ ◉ Senior Developer • Tech Corp                 │
│   linkedin • Remote                             │
│   [☆] [Analyze] [Open] [🗑️]                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ STATE: Favorited                                │
│ ◉ Senior Developer • Tech Corp                 │
│   linkedin • Remote                             │
│   [★] [Analyze] [Open] [🗑️]                    │
│   (star is filled with yellow)                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ STATE: Loading (after clicking Analyze)         │
│ ◉ Senior Developer • Tech Corp                 │
│   linkedin • Remote                             │
│   [☆] [⟳ Analyzing...] [Open] [🗑️]             │
└─────────────────────────────────────────────────┘
```

### JobStructuredForm States

```
┌─────────────────────────────────────────────────┐
│ STATE: Empty (before parse)                     │
│ Title: [_________________________]              │
│ Company: [_________________________]            │
│ All fields empty                                │
│ [Save Job] ← disabled                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ STATE: Auto-prefilled (after parse)             │
│ Title: [Senior Frontend Developer]              │
│ Company: [Tech Corp______________]              │
│ Fields populated from parsedJob                 │
│ [Save Job] ← enabled                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ STATE: Validation error                         │
│ Title: [__________________________]             │
│        ⚠️ Title must be at least 2 characters   │
│ Company: [Te_____________________]              │
│ [Save Job] ← disabled                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ STATE: Saving                                    │
│ Title: [Senior Frontend Developer]              │
│ Company: [Tech Corp______________]              │
│ [⟳ Saving...] ← disabled                        │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Interaction Flows

### Flow 1: Parse & Save Job

```
1. User pastes job text
   │
   ▼
2. Step 25 parser extracts metadata
   │
   ▼
3. Form auto-prefills
   │
   ▼
4. User reviews/edits fields
   │
   ▼
5. User clicks "Save Job"
   │
   ▼
6. Validation runs (Zod schema)
   │
   ├─ Valid ──────────────┐
   │                      ▼
   │                   Hash calculated
   │                      │
   │                      ▼
   │                   Dedupe check
   │                      │
   │                      ├─ New ────────┐
   │                      │              ▼
   │                      │           Create ID
   │                      │              │
   │                      │              ▼
   │                      │           Save to DB
   │                      │
   │                      └─ Existing ──┐
   │                                     ▼
   │                                  Update existing
   │                                     │
   │                                     ▼
   │                                  Save to DB
   │
   └─ Invalid ───────────┐
                         ▼
                      Show errors
```

### Flow 2: Search & Filter

```
1. User types in search box
   │
   ▼
2. Debounce (250ms)
   │
   ▼
3. Update filter.q state
   │
   ▼
4. useMemo recalculates filteredJobs
   │
   ├─ Matches found ───────┐
   │                       ▼
   │                    Display jobs
   │
   └─ No matches ─────────┐
                          ▼
                       Show "No jobs match"
```

### Flow 3: Analyze Saved Job

```
1. User clicks "Analyze" button
   │
   ▼
2. Set jobText from saved job.rawText
   │
   ▼
3. Call Step 25 parseJob()
   │
   ▼
4. parsedJob → ATS store
   │
   ▼
5. Call analyze(currentCV)
   │
   ▼
6. Navigate to ATS Optimize tab
   │
   ▼
7. Display suggestions & score
```

---

## 📱 Responsive Breakpoints

### Desktop (xl: 1280px+)
```
┌────────────────────────┬─────────────────────┐
│ Job Input/Form         │ Live CV Preview     │
│ (50% width)            │ (50% width, sticky) │
└────────────────────────┴─────────────────────┘
```

### Tablet (md: 768px - 1279px)
```
┌────────────────────────┬─────────────────────┐
│ Job Input/Form         │ Live CV Preview     │
│ (50% width)            │ (50% width)         │
└────────────────────────┴─────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────────────────────────────────┐
│ Job Input/Form                               │
│ (100% width, stacked)                        │
├──────────────────────────────────────────────┤
│ Live CV Preview                              │
│ (hidden or below)                            │
└──────────────────────────────────────────────┘
```

---

## 🎬 Animation Guidelines

### Hover Transitions
```css
transition: background-color 200ms ease-in-out;
```

### Drawer Open/Close
```css
/* Enter */
data-[state=open]:animate-in
data-[state=open]:slide-in-from-right

/* Exit */
data-[state=closed]:animate-out
data-[state=closed]:slide-out-to-right
```

### Favorite Toggle
```css
/* Star fill */
transition: fill 150ms ease-out;
```

### Loading Spinner
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## ✅ Visual QA Checklist

### Layout
- [ ] Form grid aligns properly
- [ ] Job rows have consistent height
- [ ] Drawer doesn't exceed viewport
- [ ] Filters stack correctly on mobile
- [ ] No horizontal scroll on any screen

### Typography
- [ ] All text readable (min 12px)
- [ ] Proper line height (1.5)
- [ ] No text overflow (use truncate)
- [ ] Consistent font weights

### Colors
- [ ] Sufficient contrast (WCAG AA)
- [ ] Status colors intuitive
- [ ] Hover states visible
- [ ] Focus rings prominent

### Spacing
- [ ] Consistent padding (4px grid)
- [ ] Adequate touch targets (44px min)
- [ ] Proper gap between elements
- [ ] No crowding on small screens

### Icons
- [ ] Proper size (16px or 20px)
- [ ] Aligned with text
- [ ] Semantic meaning clear
- [ ] Accessible (with aria-label)

---

**Use this guide for:**
- Visual regression testing
- Design review
- Screenshot documentation
- QA testing
- User demos

**Status**: Complete ✅  
**Last Updated**: 2025-10-08
