# ADIM 12 - Quick Start Guide

## 🚀 Getting Started in 3 Minutes

### Prerequisites
- Node.js installed
- Project dependencies installed (`npm install`)

---

## 📋 Quick Setup

### Option 1: Development Mode (No API Key Needed)

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
# Navigate to: http://localhost:5173

# 3. Test the workflow
# - Go to CV Builder page
# - Upload any CV file
# - Paste any job posting
# - Click "Optimize with AI"
# - Mock data will appear instantly!
```

**That's it!** The app will use mock data for testing.

---

### Option 2: Production Mode (With Claude API)

```bash
# 1. Get Claude API Key
# Sign up at: https://console.anthropic.com/

# 2. Add to .env file
echo "VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here" > .env

# 3. Start dev server
npm run dev

# 4. Test with real AI
# Same workflow as above, but with real Claude API responses
```

---

## 🎯 Testing the Features

### 1. Upload CV
```
✓ Drag & drop or click to browse
✓ Supports: PDF, DOCX, TXT
✓ See preview on the right
✓ Click "Continue to Job Posting →"
```

### 2. Paste Job Posting
```
✓ Paste job description in text area
✓ See analysis on the right (title, company, skills)
✓ Click "✨ Optimize with AI"
```

### 3. View Optimization
```
✓ ATS Score displayed (0-100)
✓ Green/Yellow/Red color coding
✓ Matching skills in green pills
✓ Missing skills in orange pills
✓ List of changes with badges
```

### 4. Interact with Changes
```
✓ Click info button (ⓘ) to expand details
✓ Click X to revert a change (button turns red on hover)
✓ Click ✓ to reapply a change (button turns green on hover)
✓ Watch CV preview update in real-time
```

### 5. Download
```
✓ Click "Download CV" button
✓ Get optimized-cv.txt file
```

---

## 🎨 What You'll See

### Mock Data Results (Development Mode)

When you click "Optimize with AI" without an API key:

**ATS Score**: 85 (Excellent)  
**Matching Skills**: React, TypeScript, Node.js, JavaScript, Git, Agile  
**Missing Skills**: Docker, Kubernetes, AWS, CI/CD  

**Changes**:
1. ✏️ Modified: Professional Summary  
2. ✏️ Modified: Skills  
3. ➕ Added: Experience quantification  
4. ✏️ Modified: Education  

**Suggestions**:
- Add quantifiable achievements with metrics
- Include Docker and Kubernetes experience if available
- Mention AWS or cloud platform experience
- Add CI/CD pipeline experience

---

## 🔍 Verification

### Run Automated Tests
```bash
# Check all components are installed
./verify-step12.sh

# Expected output:
# ✅ ADIM 12 TAMAMLANDI!
# Passed: 32
# Failed: 0
```

### Manual Checks
```bash
# Build test
npm run build
# Should complete without errors

# Lint test (if available)
npm run lint

# Type check
npm run type-check
```

---

## 🎬 Video Tutorial Flow

1. **Start App** (0:00-0:10)
   - `npm run dev`
   - Open browser

2. **Upload CV** (0:10-0:30)
   - Click CV Builder
   - Drag & drop CV
   - See preview
   - Click continue

3. **Add Job Posting** (0:30-0:50)
   - Paste job description
   - View analysis
   - Click Optimize

4. **View Results** (0:50-1:30)
   - ATS score animation
   - Skills pills
   - Changes list
   - Expand change details

5. **Interact** (1:30-2:00)
   - Revert change (X button)
   - Reapply change (✓ button)
   - Watch preview update
   - Read suggestions

6. **Download** (2:00-2:10)
   - Click download
   - File saved

**Total Time**: ~2 minutes

---

## 📸 Screenshot Checklist

Take screenshots of:

1. **ATS Score Component**
   - [ ] Score: 85/100 in large green text
   - [ ] Progress bar at 85%
   - [ ] "Excellent" label
   - [ ] Green skills pills
   - [ ] Orange missing skills pills
   - [ ] Blue tip box at bottom

2. **Optimization Changes**
   - [ ] "4/4 applied" counter
   - [ ] Blue "modified" badge
   - [ ] Green "added" badge
   - [ ] Collapsed change view
   - [ ] Expanded change view with:
     - Red box (Original)
     - Green box (Optimized)
     - Blue box (Reason)

3. **Interaction**
   - [ ] Hover on X button (red)
   - [ ] Hover on ✓ button (green)
   - [ ] Reverted change (grayed out)
   - [ ] Tooltip on info button

4. **Full Workflow**
   - [ ] Step 1: CV upload
   - [ ] Step 2: Job posting
   - [ ] Step 3: Optimization results
   - [ ] All three panels visible

---

## 🐛 Troubleshooting

### Issue: Build fails
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Tooltip package error
```bash
# Solution: Install with legacy peer deps
npm install @radix-ui/react-tooltip --legacy-peer-deps
```

### Issue: Import errors
```bash
# Solution: Check exports
cat src/services/index.ts | grep ai.service
cat src/store/index.ts | grep optimizationStore
```

### Issue: API key not working
```bash
# Check .env file
cat .env | grep VITE_ANTHROPIC_API_KEY

# Make sure it starts with sk-ant-api03-
# Make sure .env is not in .gitignore (it is, so don't commit it!)
```

---

## 📚 Documentation

### Full Documentation
- `ADIM-12-TAMAMLANDI.md` - Complete implementation summary
- `ADIM-12-FEATURE-SUMMARY.md` - Visual guide and features
- `verify-step12.sh` - Automated verification script

### Code Documentation
- `src/services/ai.service.ts` - AI service with inline comments
- `src/store/optimizationStore.ts` - Store with inline comments
- `src/components/optimization/` - Component documentation

---

## 🎯 Success Indicators

You know it's working when you see:

✅ **No console errors**  
✅ **Build completes successfully**  
✅ **ATS score displays with color**  
✅ **Skills pills render**  
✅ **Changes list populates**  
✅ **Hover effects work**  
✅ **CV preview updates**  
✅ **Download works**  

---

## 🚦 Next Steps

After confirming everything works:

1. ✅ Take screenshots for documentation
2. ✅ Test with real API key (optional)
3. ✅ Test with different CV formats
4. ✅ Test with various job postings
5. ✅ Share with team for feedback
6. ✅ Move to ADIM 13 (if applicable)

---

## 💡 Pro Tips

### Tip 1: Fast Testing
```bash
# Keep dev server running
npm run dev

# In another terminal, make changes
# Browser auto-refreshes!
```

### Tip 2: Mock Data Customization
Edit `src/services/ai.service.ts`:
```typescript
private getMockOptimization(request: OptimizationRequest): OptimizationResult {
  return {
    atsScore: 90, // Change score
    changes: [
      // Add your own changes
    ],
    // ...customize as needed
  }
}
```

### Tip 3: Debug Mode
Open browser console to see:
- API requests
- State updates
- Error messages

### Tip 4: Component Isolation
Test components individually:
```typescript
// In a test file or Storybook
<ATSScore 
  score={85} 
  matchingSkills={['React', 'TypeScript']} 
  missingSkills={['Docker']} 
/>
```

---

## 📞 Support

### Common Questions

**Q: Do I need a Claude API key?**  
A: No! Mock mode works without it.

**Q: How much does the API cost?**  
A: Claude Sonnet 4 pricing on Anthropic's website. Each optimization costs a few cents.

**Q: Can I use GPT instead?**  
A: Yes, but you'd need to modify the AI service to use OpenAI's API.

**Q: Will this work offline?**  
A: Mock mode works offline. API mode needs internet.

**Q: Can I save optimizations?**  
A: Not yet, but you can download the CV. State persists during session.

---

## 🎉 You're Ready!

Everything is set up and ready to go. Start testing and enjoy the AI-powered CV optimization! 🚀

For detailed information, check:
- `ADIM-12-TAMAMLANDI.md` - Complete summary
- `ADIM-12-FEATURE-SUMMARY.md` - Visual guide

**Happy Optimizing!** ✨