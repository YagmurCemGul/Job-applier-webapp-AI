# 🚀 ADIM 10 QUICK START GUIDE

## CV Upload & Parsing System - Test Guide

### ✅ Prerequisites Check

Run verification script:
```bash
./verify-step10.sh
```

Expected output: **34/34 tests passed** ✅

---

## 🎯 QUICK TEST (2 minutes)

### 1. Start Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:5173`

### 2. Navigate to CV Builder
Open browser: `http://localhost:5173/cv-builder`

### 3. Test File Upload

#### Option A: Drag & Drop
1. Find any PDF, DOCX, or TXT file on your computer
2. Drag it into the upload area
3. Watch the parsing progress
4. See extracted text preview

#### Option B: Click to Browse
1. Click on the upload area
2. Select a file from file picker
3. Watch parsing progress
4. See extracted text preview

---

## 📋 COMPREHENSIVE TEST CHECKLIST

### ✓ Visual Tests

#### Upload Area (Step 1)
- [ ] Upload box is visible with dashed border
- [ ] Upload icon (📤) is displayed
- [ ] Text "Drag & drop your CV here" is visible
- [ ] Text "or click to browse" is visible
- [ ] Text "Supported formats: PDF, DOCX, DOC, TXT (Max 5MB)" is visible
- [ ] Hover effect changes border color
- [ ] Drag over changes background color

#### File Selected State
- [ ] File icon (📄) appears
- [ ] Filename is displayed
- [ ] File size is formatted (e.g., "1.2 MB")
- [ ] Remove button (X) is visible

#### Upload Progress
- [ ] Progress bar appears
- [ ] Percentage text updates (0% → 100%)
- [ ] "Parsing CV..." text is shown

#### Success State
- [ ] Green success alert appears
- [ ] CheckCircle icon (✅) is visible
- [ ] Message shows character count
- [ ] Message shows page count (for PDFs)
- [ ] Green toast notification appears

#### Error State
- [ ] Red error alert appears
- [ ] XCircle icon (❌) is visible
- [ ] Error message is descriptive
- [ ] Red toast notification appears
- [ ] "Retry" button appears

### ✓ Functional Tests

#### File Type Support

**PDF Test:**
```bash
# Use any PDF file or create test file
echo "Test CV Content" > test.txt
# Convert to PDF using system tools or use existing PDF
```
- [ ] Upload PDF file
- [ ] Text is extracted
- [ ] Page count is shown
- [ ] Success message appears

**DOCX Test:**
- [ ] Upload DOCX file
- [ ] Text is extracted
- [ ] Success message appears

**TXT Test:**
```bash
# Use the provided test file
cat test-cv-files/sample-cv.txt
```
- [ ] Upload TXT file
- [ ] All text is read correctly
- [ ] Success message appears

#### Validation Tests

**File Too Large:**
```bash
# Create a 6MB file (exceeds 5MB limit)
dd if=/dev/zero of=large-file.txt bs=1M count=6
```
- [ ] Upload large-file.txt
- [ ] Error: "File is too large. Maximum size is 5.0 MB."
- [ ] Red toast notification
- [ ] No parsing attempted

**Invalid File Type:**
```bash
# Create image file
echo "fake image" > test.jpg
```
- [ ] Upload test.jpg
- [ ] Error: "Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file."
- [ ] Red toast notification
- [ ] No parsing attempted

#### Preview Tests (Step 2)

- [ ] "Extracted Text" title is visible
- [ ] Metadata shows filename
- [ ] Metadata shows page count (for PDFs)
- [ ] Metadata shows character count
- [ ] Copy button (📋) is visible
- [ ] View toggle button (👁) is visible (if text > 500 chars)

**Copy to Clipboard:**
- [ ] Click copy button
- [ ] Button changes to checkmark (✓)
- [ ] Toast: "Copied! Text copied to clipboard"
- [ ] Button reverts to copy icon after 2 seconds
- [ ] Paste works (Ctrl+V) with full text

**Expand/Collapse:**
- [ ] Text > 500 chars shows "Show more..." link
- [ ] Click eye button or "Show more..."
- [ ] Full text appears
- [ ] ScrollArea expands (h-48 → h-96)
- [ ] Eye button changes to EyeOff
- [ ] Click again to collapse

**Scroll Area:**
- [ ] Long text is scrollable
- [ ] Scrollbar appears when needed
- [ ] Text formatting is preserved (whitespace)

#### Action Buttons

**Upload Different CV:**
- [ ] Button appears after successful parse
- [ ] Click button
- [ ] Returns to step 1 (upload area)
- [ ] All state is reset
- [ ] Can upload new file

**Continue to Edit:**
- [ ] Button appears in preview step
- [ ] Click button
- [ ] Moves to step 3
- [ ] Shows "CV Editor Coming Soon" placeholder

**Start Over (from step 3):**
- [ ] Button appears in step 3
- [ ] Click button
- [ ] Returns to step 1
- [ ] All state is reset

**Retry (on error):**
- [ ] Trigger error (e.g., corrupted file)
- [ ] "Retry" button appears
- [ ] Click button
- [ ] Re-attempts parsing

### ✓ Step Navigation

- [ ] Step 1 indicator is highlighted (upload)
- [ ] Step 2 indicator highlights after upload
- [ ] Step 3 indicator highlights after continue
- [ ] Inactive steps are muted (gray)
- [ ] Active step is primary color

### ✓ Edge Cases

**Multiple Files:**
- [ ] Try dropping 2+ files at once
- [ ] Only first file is accepted
- [ ] maxFiles: 1 is enforced

**File Removal:**
- [ ] Upload file
- [ ] Click X button
- [ ] File is removed
- [ ] Upload area reappears
- [ ] Progress resets
- [ ] Error state clears

**Corrupted PDF:**
- [ ] Try uploading broken PDF
- [ ] Error: "Failed to parse PDF file. The file may be corrupted or password-protected."
- [ ] Retry button appears

**Password-Protected PDF:**
- [ ] Upload protected PDF
- [ ] Error message about password protection
- [ ] Retry button appears

**Empty File:**
```bash
touch empty.txt
```
- [ ] Upload empty.txt
- [ ] Parsing succeeds
- [ ] Shows "0 characters" or empty text

**Very Long Filename:**
```bash
mv test.txt "this-is-a-very-long-filename-that-should-be-handled-properly-by-the-ui.txt"
```
- [ ] Upload file
- [ ] Filename doesn't break layout
- [ ] Truncation or wrapping works

---

## 🎨 UI/UX CHECKS

### Responsiveness
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] Upload area scales properly
- [ ] Buttons stack on mobile
- [ ] Text preview is scrollable

### Dark Mode
- [ ] Toggle dark mode
- [ ] Upload area border is visible
- [ ] Success alert is readable (green on dark)
- [ ] Error alert is readable (red on dark)
- [ ] Preview text is readable

### Accessibility
- [ ] Tab navigation works
- [ ] Space/Enter triggers file picker
- [ ] Focus states are visible
- [ ] Error messages are announced
- [ ] Success messages are announced

### Performance
- [ ] Upload 1KB file → instant
- [ ] Upload 100KB file → ~1s
- [ ] Upload 1MB file → ~2s
- [ ] Upload 5MB file → ~3-5s
- [ ] No UI freezing during parse
- [ ] Progress updates smoothly

---

## 📊 TEST SCENARIOS

### Scenario 1: Perfect PDF Upload
1. Start at CV Builder page
2. Drag sample-resume.pdf (2 pages, 50KB)
3. See progress: 0% → 10% → 20% → ... → 100%
4. See success: "CV parsed successfully! Found 2,453 characters. (2 pages)"
5. Preview shows first 500 characters
6. Click "Show more" → see full text
7. Click copy → text copied
8. Click "Continue to Edit" → see step 3

**Expected time:** 2-3 seconds

### Scenario 2: Invalid File Recovery
1. Try uploading test.jpg
2. See error: "Invalid file type..."
3. See red toast notification
4. Upload area still visible
5. Drop valid PDF
6. Parsing succeeds
7. Error state cleared

**Expected time:** 5 seconds

### Scenario 3: Large File Rejection
1. Upload 6MB file
2. Instant error: "File is too large..."
3. No parsing attempted
4. Red toast appears
5. Upload area ready for new file

**Expected time:** Instant (<100ms)

### Scenario 4: DOCX with Long Text
1. Upload resume.docx (5 pages, 500KB)
2. See parsing progress
3. Success with 5,000+ characters
4. Preview shows 500 chars
5. Click expand → see full text in scrollable area
6. Scroll to bottom
7. Copy to clipboard
8. Paste in notepad → full text preserved

**Expected time:** 3-4 seconds

### Scenario 5: TXT File Quick Test
1. Upload test-cv-files/sample-cv.txt
2. Instant parsing (no worker needed)
3. Full text preview
4. All formatting preserved (line breaks)
5. Copy works perfectly

**Expected time:** <1 second

---

## 🔧 DEVELOPER TESTS

### TypeScript Type Check
```bash
npx tsc --noEmit
```
**Expected:** No errors ✅

### Build Test
```bash
npm run build
```
**Expected:** Build succeeds ✅

### Import Test
```typescript
// Check imports work
import { fileService } from '@/services/file.service'
import { CVUpload } from '@/components/cv/CVUpload'
import { CVTextPreview } from '@/components/cv/CVTextPreview'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
```

### Service Test
```typescript
// In browser console
import { fileService } from './services/file.service'

// Test file size formatting
fileService.formatFileSize(1234567)
// Expected: "1.2 MB"

// Test file validation
const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
fileService.validateCVFile(file)
// Expected: { valid: true, file: File }
```

---

## 📸 EXPECTED UI SCREENSHOTS

### 1. Initial Upload Area
```
┌─────────────────────────────────────────────┐
│ Upload Your CV                              │
│ Upload your existing CV in PDF, DOCX, or... │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │              📤                       │ │
│  │                                       │ │
│  │     Drag & drop your CV here         │ │
│  │       or click to browse             │ │
│  │                                       │ │
│  │    Supported formats:                │ │
│  │    PDF, DOCX, DOC, TXT (Max 5MB)    │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 2. File Selected + Parsing
```
┌─────────────────────────────────────────────┐
│  📄 my-resume.pdf                   ❌      │
│     1.2 MB                                  │
└─────────────────────────────────────────────┘

Parsing CV... 65%
█████████████████░░░░░░░░
```

### 3. Success State
```
┌─────────────────────────────────────────────┐
│  📄 my-resume.pdf                   ❌      │
│     1.2 MB                                  │
└─────────────────────────────────────────────┘

✅ CV parsed successfully! Found 2,453 characters. (2 pages)

[ Upload Different CV ]
```

### 4. Text Preview
```
┌─────────────────────────────────────────────┐
│ Extracted Text                 📋 Copy  👁  │
│ From my-resume.pdf • 2 pages • 2,453 chars  │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ JOHN DOE                                │ │
│ │ Software Engineer                       │ │
│ │ john.doe@email.com | +1 234-567-8900   │ │
│ │                                         │ │
│ │ PROFESSIONAL SUMMARY                    │ │
│ │ Experienced Full-Stack Developer...     │ │
│ │                                         │ │
│ │ WORK EXPERIENCE                         │ │
│ │ Senior Software Engineer at...          │ │
│ │                                         │ │
│ │ [Show more...]                          │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

[ Upload Different CV ]  [ Continue to Edit → ]
```

---

## 🐛 TROUBLESHOOTING

### Issue: PDF not parsing
**Solution:**
1. Check PDF.js worker is loading (Network tab)
2. Check console for worker errors
3. Try different PDF file
4. Verify PDF is not password-protected

### Issue: DOCX parsing fails
**Solution:**
1. Check if file is actually .docx (not .doc)
2. Try opening in Word to verify not corrupted
3. Check console for mammoth.js errors
4. Try different DOCX file

### Issue: Upload button not working
**Solution:**
1. Check react-dropzone is installed
2. Check console for errors
3. Verify file input is present (inspect HTML)
4. Try clicking vs drag-drop

### Issue: Progress bar stuck at 90%
**Solution:**
1. Wait 5 more seconds (large file)
2. Check console for parsing errors
3. Check network tab for worker loading
4. Retry upload

### Issue: Toast not appearing
**Solution:**
1. Check ToastContainer is mounted
2. Check useToast hook is working
3. Check UI store addToast function
4. Verify toast component imports

---

## ✅ COMPLETION CRITERIA

ADIM 10 is considered complete when:

- [ ] All 34 verification tests pass
- [ ] Dev server starts without errors
- [ ] CV Builder page loads
- [ ] PDF upload works
- [ ] DOCX upload works
- [ ] TXT upload works
- [ ] File validation works
- [ ] Progress bar works
- [ ] Success/error states work
- [ ] Preview component works
- [ ] Copy to clipboard works
- [ ] Expand/collapse works
- [ ] Step navigation works
- [ ] Error boundary works
- [ ] TypeScript compiles
- [ ] No console errors
- [ ] All UI elements render correctly
- [ ] Responsive design works
- [ ] Dark mode works

---

## 🎉 SUCCESS INDICATORS

When everything works, you should see:

1. ✅ **Verification script:** 34/34 tests passed
2. ✅ **Dev server:** Running on http://localhost:5173
3. ✅ **CV Builder:** Page loads instantly
4. ✅ **Upload:** Drag & drop works smoothly
5. ✅ **Parsing:** Progress bar animates
6. ✅ **Success:** Green alert + toast
7. ✅ **Preview:** Extracted text displayed
8. ✅ **Copy:** Clipboard works
9. ✅ **Navigation:** Steps flow correctly
10. ✅ **No errors:** Clean console

**Result:** CV Upload & Parsing System is Production Ready! 🚀

---

## 📞 SUPPORT

If you encounter issues:

1. Run `./verify-step10.sh` to identify the problem
2. Check console for error messages
3. Verify all dependencies are installed
4. Check ADIM-10-TAMAMLANDI.md for detailed docs
5. Review file.service.ts for implementation details

---

**Last Updated:** 2025-10-07  
**Status:** Production Ready ✅  
**Next Step:** ADIM 11 - AI-Powered CV Parsing 🤖