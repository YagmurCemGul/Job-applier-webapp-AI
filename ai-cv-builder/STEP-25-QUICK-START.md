# Step 25: Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd /workspace/ai-cv-builder
npm install
```

**Note**: The following packages should already be in your `package.json`. If not, install them:

```bash
npm install zustand lucide-react
```

### 2. Run the Development Server

```bash
npm run dev
```

### 3. Test the ATS Flow

#### **Step-by-Step User Journey**:

1. **Navigate to CV Builder**
   - Open http://localhost:5173 (or your dev port)
   - Go to the CV Builder page

2. **Upload or Create a CV**
   - Use the "Upload" tab or create a new CV in the "Edit" tab
   - Make sure you have some personal info, summary, and experience

3. **Add a Job Posting**
   - Click the **"Job"** tab
   - Choose one of three input methods:
     - **Paste Text**: Copy/paste a job description
     - **From URL**: Enter a job posting URL (note: CORS may block some sites)
     - **Upload File**: Upload a .txt or .md file
   - Click **"Parse"** button

4. **Run ATS Analysis**
   - After parsing, click **"Analyze Against CV"**
   - The system will navigate to the **"ATS Optimize"** tab

5. **Interact with Suggestions (Pills)**
   - **Hover** over a pill → turns red and shows "×" dismiss button
   - **Click** a pill → applies the suggestion (pill becomes semi-transparent)
   - **Click "×"** → dismisses the suggestion
   - Use **Undo/Redo** buttons to navigate history

6. **Filter & Search**
   - Use **Category** dropdown to filter by type (Keywords, Sections, etc.)
   - Use **Severity** dropdown to filter by importance (Critical, High, Medium, Low)
   - Use **Search** box to find specific suggestions

7. **View Live Preview**
   - On larger screens (xl+), the live CV preview appears on the right
   - Changes to your CV reflect immediately as you apply suggestions

---

## 📝 Sample Job Posting (for testing)

Copy and paste this into the "Paste Text" tab:

```
Title: Senior Software Engineer
Company: TechCorp Inc.
Location: San Francisco, CA
Remote: Yes

About the Role:
We are looking for an experienced software engineer to join our growing team.

Responsibilities:
- Build scalable web applications using React and TypeScript
- Lead technical projects and mentor junior developers
- Design and implement RESTful APIs with Node.js
- Deploy and maintain cloud infrastructure on AWS
- Collaborate with cross-functional teams

Requirements:
- 5+ years of experience in software development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with AWS, Docker, and Kubernetes
- Excellent problem-solving and communication skills
- Bachelor's degree in Computer Science or related field

Benefits:
- Competitive salary ($120k-$150k)
- Health insurance and 401(k)
- Flexible work hours and remote options
- Professional development budget
```

---

## 🔧 Configuration (Optional)

### **Enable Unit Tests (Vitest)**

1. Install Vitest:
   ```bash
   npm install -D vitest @vitest/ui
   ```

2. Add to `package.json` scripts:
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui"
     }
   }
   ```

3. Create `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       globals: true,
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   })
   ```

4. Run tests:
   ```bash
   npm test
   ```

### **Enable E2E Tests (Playwright)**

1. Install Playwright:
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. Create `playwright.config.ts`:
   ```typescript
   import { defineConfig } from '@playwright/test'

   export default defineConfig({
     testDir: './src/tests/e2e',
     webServer: {
       command: 'npm run dev',
       port: 5173,
     },
   })
   ```

3. Run E2E tests:
   ```bash
   npx playwright test
   ```

---

## 📚 Key Components Reference

### **Stores**
- **`useATSStore()`** — Main ATS state management
  - `currentJobText`, `parsedJob`, `result`
  - `parseJob()`, `analyze()`, `applySuggestion()`, `dismissSuggestion()`
  - `undo()`, `redo()`

### **Services**
- **`parseJobText(text)`** — Parse job posting text
- **`analyzeCVAgainstJob(cv, job)`** — Generate ATS analysis
- **`fetchJobUrl(url)`** — Fetch job from URL

### **Components**
- **`<JobInput />`** — Job posting input with tabs
- **`<ATSPanel />`** — Main ATS suggestions panel
- **`<ATSPill />`** — Interactive suggestion pill

---

## 🎨 Customization

### **Add New Keywords**

Edit `src/services/ats/keywordSets.ts`:

```typescript
export const COMMON_EN_KEYWORDS = [
  // Add your keywords here
  'graphql',
  'postgresql',
  'redis',
  // ...
]
```

### **Adjust Severity Colors**

Edit `src/components/ats/ATSPill.tsx`:

```typescript
const severityColors = {
  critical: 'border-red-500 text-red-700',
  high: 'border-orange-500 text-orange-700',
  medium: 'border-yellow-500 text-yellow-700',
  low: 'border-blue-500 text-blue-700',
}
```

### **Add New Suggestion Type**

Edit `src/services/ats/analysis.service.ts`:

```typescript
function yourCustomSuggestions(cv: CVData, job: ParsedJob): ATSSuggestion[] {
  // Your logic here
  return [/* suggestions */]
}

// Then add to the main function:
export function analyzeCVAgainstJob(cv: CVData, job: ParsedJob) {
  const suggestions = [
    ...keywordSuggestions(missing),
    ...yourCustomSuggestions(cv, job), // ← Add here
    // ...
  ]
}
```

---

## 🐛 Troubleshooting

### **Issue**: CORS error when fetching job from URL
**Solution**: Use the "Paste Text" tab instead, or set up a server-side proxy in Step 31.

### **Issue**: TypeScript errors in editor
**Solution**: Run `npm install` to ensure all dependencies are installed. The project uses TypeScript strict mode.

### **Issue**: Pills not showing hover effect
**Solution**: Check that Tailwind CSS is properly configured and the `hover:` utility classes are not purged.

### **Issue**: i18n translations not loading
**Solution**: Ensure `public/locales/{lang}/cv.json` files exist and the i18n config in `src/config/i18n.ts` is correct.

---

## 📞 Support

For detailed documentation, see:
- **Developer Guide**: `src/docs/STEP-25-NOTES.md`
- **Success Report**: `STEP-25-SUCCESS.md`
- **Files Created**: `STEP-25-FILES-CREATED.md`

---

**Happy coding!** 🎉
