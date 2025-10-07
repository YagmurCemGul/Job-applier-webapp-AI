# 🧪 Quick Test Guide - CV Upload System

## ⚡ 2-Minute Quick Test

### 1. Verify Installation ✅
```bash
./verify-step10.sh
```
**Expected:** 34/34 tests passed

### 2. Start Server 🚀
```bash
npm run dev
```
**Expected:** Server starts at http://localhost:5173

### 3. Test Upload 📤

**Navigate to:** http://localhost:5173/cv-builder

**Test Case 1: TXT Upload (Fastest)**
```bash
# Use provided test file
cat test-cv-files/sample-cv.txt
```
1. Drag `sample-cv.txt` to upload area
2. See instant parsing
3. Check extracted text preview
4. ✅ Success!

**Test Case 2: Invalid File (Should Fail)**
```bash
# Try to upload this README
```
1. Try uploading `TEST-CV-UPLOAD.md`
2. See error: "Invalid file type"
3. ✅ Error handling works!

**Test Case 3: PDF Upload (If Available)**
1. Upload any PDF resume
2. See progress: 0% → 100%
3. Check page count in metadata
4. ✅ Multi-page support works!

---

## ✅ Success Indicators

You should see:
- ✅ Upload area with dashed border
- ✅ Drag & drop works
- ✅ Progress bar animates smoothly
- ✅ Green success alert
- ✅ Extracted text in preview
- ✅ Character count & metadata
- ✅ Copy button works
- ✅ Step navigation (1 → 2 → 3)

---

## 🔴 If Something Fails

1. **Check verification:**
   ```bash
   ./verify-step10.sh
   ```

2. **Check console for errors:**
   - Open browser DevTools (F12)
   - Look for red errors in Console

3. **Common fixes:**
   ```bash
   # Reinstall dependencies
   npm install
   
   # Clear cache
   rm -rf node_modules package-lock.json
   npm install
   
   # Restart dev server
   npm run dev
   ```

---

## 📋 Full Test Checklist

### Visual Tests
- [ ] Upload area visible
- [ ] Icons display correctly
- [ ] Buttons styled properly
- [ ] Progress bar animates
- [ ] Alerts show correct colors
- [ ] Preview text is readable

### Functional Tests
- [ ] Drag & drop works
- [ ] Click to browse works
- [ ] File validation works
- [ ] PDF parsing works
- [ ] DOCX parsing works
- [ ] TXT parsing works
- [ ] Copy to clipboard works
- [ ] Expand/collapse works
- [ ] Step navigation works

### Error Handling
- [ ] Large file rejected (>5MB)
- [ ] Invalid type rejected
- [ ] Retry button works
- [ ] Error messages clear

---

## 📊 Expected Results

### Upload Area (Initial)
```
┌─────────────────────────────┐
│         📤                  │
│  Drag & drop your CV here  │
│    or click to browse       │
│                             │
│  Supported: PDF, DOCX, TXT  │
│  Max size: 5MB              │
└─────────────────────────────┘
```

### Success State
```
┌─────────────────────────────┐
│ 📄 sample-cv.txt       ❌  │
│    5.2 KB                   │
└─────────────────────────────┘

✅ CV parsed successfully!
   Found 2,150 characters.

[Upload Different CV]
```

### Preview
```
┌─────────────────────────────┐
│ Extracted Text    📋 Copy 👁│
│ From sample-cv.txt          │
│ 2,150 characters            │
│                             │
│ ┌─────────────────────────┐ │
│ │ JOHN DOE                │ │
│ │ Software Engineer       │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

[Upload Different CV] [Continue →]
```

---

## 🎯 Performance Benchmarks

| File Type | Size | Expected Time |
|-----------|------|---------------|
| TXT | 100KB | <0.5s |
| PDF | 1MB | ~2s |
| DOCX | 500KB | ~1.5s |
| Validation | Any | <0.1s |

---

## 🐛 Troubleshooting

### "PDF parsing failed"
- Check if PDF is password-protected
- Try a different PDF
- Check browser console for worker errors

### "Worker not found"
- Check internet connection (CDN worker)
- Check console for network errors

### "Upload button not clickable"
- Check if disabled state is active
- Refresh page
- Clear browser cache

### "No text extracted"
- File might be scanned image (no selectable text)
- Try OCR-enabled PDF or different file

---

## 🚀 Ready for Production

When all tests pass:
- ✅ 34/34 verification tests
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ All file types work
- ✅ Error handling works
- ✅ UI/UX is smooth

**You're ready for ADIM 11!** 🎉

---

**Quick Links:**
- Full docs: `ADIM-10-TAMAMLANDI.md`
- Quick start: `ADIM-10-QUICK-START.md`
- Test summary: `ADIM-10-TEST-SUMMARY.md`
- Visual guide: `ADIM-10-IMPLEMENTATION-VISUAL.md`