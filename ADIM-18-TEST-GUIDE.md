# 🧪 ADIM 18 - TESTING GUIDE

## 🚀 Quick Start Testing

### 1. Start Development Server
```bash
cd /workspace/ai-cv-builder
npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:5173`

### 3. Go to CV Builder
Click on "CV Builder" or navigate to `/cv-builder`

### 4. Go to Edit Tab
Click on the "2. Edit" tab

---

## 📋 DETAILED TEST SCENARIOS

### 🎓 Education Form Testing

#### Test 1: Add Education
1. Click "Add Education" button
2. Fill in the form:
   - School: "Massachusetts Institute of Technology"
   - Degree: "Master of Science"
   - Field of Study: "Computer Science"
   - Start Date: Select a month (e.g., "2020-09")
   - End Date: Select a month (e.g., "2022-05")
   - Grade: "3.9 GPA"
   - Activities: "IEEE Student Member, AI Research Club"
   - Description: "Focus on Machine Learning and Distributed Systems"
3. Click "Add Education"
4. ✅ Verify entry appears in the list

#### Test 2: Currently Studying
1. Click "Add Education" again
2. Fill in basic info
3. Check "I currently study here" checkbox
4. ✅ Verify end date field is disabled
5. Add the education
6. ✅ Verify it shows "Present" instead of end date

#### Test 3: Edit Education
1. Click Edit icon on an education entry
2. Change some fields
3. Click "Update Education"
4. ✅ Verify changes are reflected

#### Test 4: Delete Education
1. Click Delete icon (red trash) on an education entry
2. ✅ Verify entry is removed immediately

#### Test 5: Validation
1. Click "Add Education"
2. Try to submit empty form
3. ✅ Verify red error messages appear under required fields

---

### 💪 Skills Form Testing

#### Test 1: Add Skill
1. Click "Add Skill" button
2. Fill in:
   - Skill Name: "React"
   - Category: "Framework"
   - Proficiency Level: "Advanced"
   - Years of Experience: 5
3. Click "Add Skill"
4. ✅ Verify skill appears with blue "Advanced" badge

#### Test 2: Category Grouping
1. Add multiple skills in different categories:
   - Technical: Python, JavaScript
   - Soft: Leadership, Communication
   - Tool: Docker, Git
2. ✅ Verify skills are grouped by category
3. ✅ Verify category headers appear

#### Test 3: Filter by Category
1. Add skills in multiple categories
2. Use the category dropdown filter
3. Select "Technical"
4. ✅ Verify only Technical skills show
5. Select "All Categories"
6. ✅ Verify all skills show again

#### Test 4: Level Colors
1. Add 4 skills with different levels:
   - Beginner: Gray badge
   - Intermediate: Yellow badge
   - Advanced: Blue badge
   - Expert: Green badge
2. ✅ Verify each has correct color

#### Test 5: Quick Add Popular Skills
1. Scroll to "Quick Add Popular Skills" section
2. Click on "JavaScript" button
3. ✅ Verify JavaScript is added with default settings
4. ✅ Verify button becomes disabled
5. Click on "Python"
6. ✅ Verify Python is added

#### Test 6: Hover Edit/Delete
1. Hover over a skill badge
2. ✅ Verify edit and delete icons appear in top-right
3. Click edit icon
4. ✅ Verify edit dialog opens with pre-filled values
5. Hover over skill again
6. Click delete icon
7. ✅ Verify skill is removed

---

### 📝 Summary Form Testing

#### Test 1: Auto-Save
1. Start typing in the summary textarea
2. Wait 1 second
3. Refresh the page
4. ✅ Verify your text is still there (auto-saved)

#### Test 2: Word Counter
1. Type text in summary
2. ✅ Verify word count updates in real-time
3. ✅ Verify character count updates in real-time

#### Test 3: Length Indicators
1. Type less than 50 words
2. ✅ Verify yellow "Add more details" badge appears
3. Type 50-150 words
4. ✅ Verify green "Good length" badge appears
5. Type more than 150 words
6. ✅ Verify orange "Consider shortening" badge appears

#### Test 4: Templates
1. Scroll to "Summary Templates" section
2. Click on first template
3. ✅ Verify template text populates the textarea
4. ✅ Verify word count updates
5. Click on another template
6. ✅ Verify text is replaced with new template

#### Test 5: AI Generation Button
1. Click "Generate with AI" button
2. ✅ Check browser console (F12)
3. ✅ Verify "Generate with AI clicked" message appears
(Note: Full AI generation will be implemented in future step)

---

### 🚀 Projects Form Testing

#### Test 1: Add Project
1. Click "Add Project" button
2. Fill in the form:
   - Project Name: "E-commerce Platform"
   - Your Role: "Lead Developer"
   - Description: "Built a scalable online shopping platform"
   - Technologies: "React, Node.js, MongoDB, AWS"
   - Project URL: "https://myproject.com"
   - GitHub URL: "https://github.com/user/project"
   - Start Date: "2023-01"
   - End Date: "2023-12"
   - Highlights: 
     ```
     Increased performance by 40%
     Implemented real-time features
     Led team of 5 developers
     ```
3. Click "Add Project"
4. ✅ Verify project card appears

#### Test 2: Technology Badges
1. Add a project with technologies: "React, TypeScript, Tailwind CSS"
2. ✅ Verify each technology appears as separate badge
3. ✅ Verify badges are displayed below description

#### Test 3: URL Validation
1. Click "Add Project"
2. Enter invalid URL in "Project URL": "not-a-url"
3. Try to submit
4. ✅ Verify "Invalid URL" error appears
5. Enter valid URL: "https://example.com"
6. ✅ Verify error disappears

#### Test 4: External Links
1. Add project with valid URL
2. ✅ Verify external link icon appears next to project name
3. Click the icon
4. ✅ Verify it opens in new tab

#### Test 5: Currently Working
1. Click "Add Project"
2. Fill basic info
3. Check "I'm currently working on this project"
4. ✅ Verify end date field is disabled
5. Add the project
6. ✅ Verify it shows "Present" in date range

#### Test 6: Highlights Parsing
1. Add project with highlights (one per line):
   ```
   First highlight
   Second highlight
   Third highlight
   ```
2. ✅ Verify highlights are parsed and stored correctly
(Note: Display might need to be added in preview)

#### Test 7: Edit Project
1. Click Edit icon on a project
2. ✅ Verify all fields are pre-filled
3. ✅ Verify technologies are joined with commas
4. ✅ Verify highlights are joined with newlines
5. Make changes
6. Click "Update Project"
7. ✅ Verify changes appear in card

#### Test 8: Delete Project
1. Click Delete icon on a project
2. ✅ Verify project is removed immediately

---

## 🔄 Data Persistence Testing

### Test 1: localStorage Persistence
1. Fill out ALL forms:
   - Personal Info
   - Summary
   - Experience
   - Education (add 2-3 entries)
   - Skills (add 5-10 skills)
   - Projects (add 2-3 projects)
2. Refresh the page (F5)
3. Go back to Edit tab
4. ✅ Verify ALL data is still there
5. ✅ Verify nothing is lost

### Test 2: Browser Console Check
1. Open browser console (F12)
2. Go to Application/Storage tab
3. Find localStorage
4. Look for `cv-data-storage` key
5. ✅ Verify it contains your CV data as JSON

### Test 3: Cross-Tab Sync
1. Open two tabs with the app
2. In Tab 1: Add an education entry
3. Switch to Tab 2
4. Refresh Tab 2
5. ✅ Verify the new entry appears

---

## 🎨 UI/UX Testing

### Test 1: Responsive Dialogs
1. Open each form dialog
2. Resize browser window
3. ✅ Verify dialogs stay centered
4. ✅ Verify content scrolls if needed
5. Test on mobile size (375px width)
6. ✅ Verify forms are usable

### Test 2: Empty States
1. Start fresh (clear localStorage if needed)
2. Go to Edit tab
3. ✅ Verify each form shows empty state message
4. ✅ Verify messages are helpful and clear

### Test 3: Error States
1. Try to submit forms with missing required fields
2. ✅ Verify error messages appear in red
3. ✅ Verify error messages are specific
4. ✅ Verify asterisks (*) mark required fields

### Test 4: Loading States
(If applicable)
1. Check for any loading indicators
2. ✅ Verify they appear during operations

### Test 5: Icons and Visual Feedback
1. Hover over buttons
2. ✅ Verify hover effects work
3. Click buttons
4. ✅ Verify click effects work
5. Check all icons load correctly
6. ✅ Verify lucide-react icons display

---

## 🔍 Integration Testing

### Test 1: Form Order
1. Go to Edit tab
2. ✅ Verify forms appear in order:
   1. Personal Info
   2. Summary
   3. Experience
   4. Education
   5. Skills
   6. Projects

### Test 2: ScrollArea
1. Fill all forms with data
2. ✅ Verify ScrollArea allows scrolling
3. ✅ Verify scroll is smooth
4. ✅ Verify scrollbar appears when needed

### Test 3: Navigation
1. Fill out forms
2. Click "Continue to Job Posting →"
3. ✅ Verify navigation works
4. Come back to Edit tab
5. ✅ Verify data is still there

### Test 4: Tab Switching
1. Enter data in Edit tab
2. Switch to other tabs (Upload, Template, etc.)
3. Come back to Edit tab
4. ✅ Verify data persists

---

## 🐛 Edge Cases Testing

### Test 1: Special Characters
1. Enter special characters in text fields:
   - Name with accents: "José García"
   - Degree with symbols: "B.Sc. (Hons)"
2. ✅ Verify they save and display correctly

### Test 2: Long Text
1. Enter very long text in description fields
2. ✅ Verify line-clamp works (shows "...")
3. Edit the entry
4. ✅ Verify full text is preserved

### Test 3: Dates Edge Cases
1. Try to select end date before start date
2. ✅ Verify validation (if implemented)
3. Test future dates
4. ✅ Verify they work

### Test 4: Duplicate Skills
1. Add a skill "JavaScript"
2. Try to add "JavaScript" again
3. ✅ Verify it's allowed (user choice)
OR
✅ Verify duplicate prevention (if implemented)

### Test 5: Form Cancel
1. Open any form dialog
2. Fill in some fields
3. Click "Cancel"
4. ✅ Verify dialog closes
5. Open form again
6. ✅ Verify form is empty (reset)

---

## ✅ VALIDATION CHECKLIST

### Education Form:
- [ ] Add works
- [ ] Edit works
- [ ] Delete works
- [ ] Currently studying checkbox works
- [ ] Date formatting correct
- [ ] Validation messages show
- [ ] Data persists

### Skills Form:
- [ ] Add works
- [ ] Edit works (via hover)
- [ ] Delete works (via hover)
- [ ] Categories group correctly
- [ ] Filter works
- [ ] Level colors correct
- [ ] Quick add works
- [ ] Data persists

### Summary Form:
- [ ] Auto-save works
- [ ] Word count updates
- [ ] Char count updates
- [ ] Length badges show
- [ ] Templates work
- [ ] Data persists

### Projects Form:
- [ ] Add works
- [ ] Edit works
- [ ] Delete works
- [ ] URL validation works
- [ ] Technologies parse correctly
- [ ] External links work
- [ ] Currently working checkbox works
- [ ] Data persists

### General:
- [ ] All forms in correct order
- [ ] ScrollArea works
- [ ] Navigation preserved
- [ ] No console errors
- [ ] localStorage working
- [ ] Responsive design works

---

## 🎯 EXPECTED RESULTS

After completing all tests, you should have:

1. ✅ **Education entries** showing school, degree, dates
2. ✅ **Skills** grouped by category with color-coded levels
3. ✅ **Summary** auto-saving with word counter
4. ✅ **Projects** with badges and external links
5. ✅ **All data** persisting in localStorage
6. ✅ **No console errors**
7. ✅ **Smooth user experience**

---

## 🆘 TROUBLESHOOTING

### Issue: Forms don't show
**Solution:** Make sure you're on the "Edit" tab

### Issue: Data doesn't persist
**Solution:** Check localStorage permissions in browser

### Issue: Dialogs don't open
**Solution:** Check console for errors, verify shadcn/ui Dialog component

### Issue: Validation doesn't work
**Solution:** Verify Zod is installed and schemas are correct

### Issue: Auto-save not working (Summary)
**Solution:** Check useEffect dependencies and watch() subscription

---

## 📊 TESTING SUMMARY

Total Test Cases: **50+**
- Education: 5 tests
- Skills: 6 tests
- Summary: 5 tests
- Projects: 8 tests
- Data Persistence: 3 tests
- UI/UX: 5 tests
- Integration: 4 tests
- Edge Cases: 5 tests
- Validation: 4 categories

**All tests should pass for ADIM 18 to be considered complete!** ✅
