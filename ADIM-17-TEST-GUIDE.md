# 🧪 ADIM 17 TEST GUIDE

## 🚀 Quick Start

```bash
cd ai-cv-builder
npm run dev
```

**URL:** http://localhost:5173

## 📋 TEST CHECKLIST

### 1️⃣ Personal Info Form Tests (5 min)

#### Basic Validation
- [ ] Leave first name empty → Click anywhere → See red error "First name is required"
- [ ] Leave last name empty → See error "Last name is required"
- [ ] Enter invalid email "test" → See "Invalid email address"
- [ ] Enter valid email "test@example.com" → Error disappears
- [ ] Enter invalid portfolio "not-a-url" → See "Invalid URL"
- [ ] Enter valid portfolio "https://example.com" → Error disappears

#### Country Code Dropdown
- [ ] Click phone country code dropdown
- [ ] See 8 countries (+1 US/Canada, +90 Turkey, etc.)
- [ ] Select "+90 Turkey"
- [ ] Verify it's selected

#### Social Links Prefixes
- [ ] LinkedIn field shows "linkedin.com/in/" prefix
- [ ] Type "johndoe" in LinkedIn
- [ ] GitHub field shows "github.com/" prefix
- [ ] Type "johndoe" in GitHub
- [ ] Portfolio allows full URL "https://johndoe.com"

#### Auto-save Test
- [ ] Open DevTools → Application → Local Storage
- [ ] Find key "cv-data-storage"
- [ ] Type "John" in first name
- [ ] Immediately check localStorage → See firstName: "John"
- [ ] Type "Doe" in last name
- [ ] Check localStorage → See lastName: "Doe"
- [ ] **Auto-save is working!** ✅

### 2️⃣ Experience Form Tests (10 min)

#### Add Experience Flow
- [ ] Click "Add Experience" button
- [ ] Modal dialog opens with title "Add Experience"
- [ ] See all fields empty

#### Field Testing
- [ ] Leave job title empty → Try to submit → See error
- [ ] Enter "Software Engineer" → Error disappears
- [ ] Select employment type "Full-time" from dropdown
- [ ] Leave company empty → See error
- [ ] Enter "Tech Corp" → Error disappears
- [ ] Enter location "San Francisco, CA"
- [ ] Select location type "Remote"
- [ ] Select start date "2023-01"
- [ ] Select end date "2024-06"

#### Currently Working Checkbox
- [ ] Check "I currently work here" checkbox
- [ ] End date field becomes disabled ✅
- [ ] Uncheck → End date enabled again

#### Description & Skills
- [ ] Leave description empty → See error
- [ ] Enter description "Led development of..."
- [ ] Enter skills "React, TypeScript, Node.js"
- [ ] Click "Add Experience" button
- [ ] Modal closes
- [ ] Experience appears in list below ✅

#### Experience List Display
- [ ] See job title "Software Engineer"
- [ ] See company "Tech Corp • Full-time"
- [ ] See dates "Jan 2023 - Present" (if currently working)
- [ ] See location "San Francisco, CA • Remote"
- [ ] See description (truncated with line-clamp-2)
- [ ] See Edit and Delete buttons

#### Edit Experience
- [ ] Click Edit button (pencil icon)
- [ ] Modal opens with title "Edit Experience"
- [ ] All fields pre-filled with existing data ✅
- [ ] Change job title to "Senior Software Engineer"
- [ ] Click "Update Experience"
- [ ] Modal closes
- [ ] Title updated in list ✅

#### Delete Experience
- [ ] Click Delete button (trash icon)
- [ ] Experience removed from list ✅
- [ ] Check localStorage → Experience removed

#### Add Multiple Experiences
- [ ] Add 2-3 more experiences
- [ ] All displayed in list
- [ ] Each has edit/delete buttons
- [ ] Dates formatted correctly

### 3️⃣ Integration Tests (5 min)

#### Tab Navigation
- [ ] Go to "Upload" tab
- [ ] Upload any PDF CV (or skip)
- [ ] Click "Continue to Edit →" button
- [ ] Edit tab opens with forms ✅
- [ ] Fill personal info
- [ ] Add experience
- [ ] Click "Continue to Job Posting →"
- [ ] Job tab opens
- [ ] Click back to Edit tab
- [ ] Data still there (persisted) ✅

#### Data Persistence
- [ ] Fill personal info completely
- [ ] Add 2 experiences
- [ ] Refresh page (F5)
- [ ] Go to Edit tab
- [ ] All data still there! ✅
- [ ] LocalStorage persistence working!

#### Responsive Design
- [ ] Resize browser to mobile width
- [ ] Forms stack vertically
- [ ] Dropdowns work
- [ ] Modal responsive
- [ ] All readable and usable

### 4️⃣ Edge Cases (5 min)

#### Validation Edge Cases
- [ ] Portfolio: Enter "http://example.com" → Valid
- [ ] Portfolio: Enter "example.com" → Invalid (needs https://)
- [ ] Email: Enter "test@test" → Valid email format
- [ ] Phone: Empty with country code → Error

#### Experience Edge Cases
- [ ] Add experience with very long description
- [ ] See it truncated in list with line-clamp
- [ ] Edit to see full text
- [ ] Skills: "React,TypeScript" (no spaces) → Should trim
- [ ] Skills: "React,  TypeScript  ,  Node.js" → Should trim all

#### Date Edge Cases
- [ ] Start date after end date → Should still save (validation TBD)
- [ ] Currently working with end date → End date ignored
- [ ] Very old date "2000-01" → Displays correctly

### 5️⃣ Performance Tests (2 min)

#### Auto-save Performance
- [ ] Type quickly in first name
- [ ] No lag or slowdown
- [ ] Auto-save doesn't block UI

#### Multiple Forms
- [ ] Scroll through forms
- [ ] Smooth scrolling in ScrollArea
- [ ] No performance issues

#### Large Data
- [ ] Add 5+ experiences
- [ ] List renders quickly
- [ ] Edit/delete still fast

## ✅ SUCCESS CRITERIA

All tests should pass:
- [x] Personal info form validates correctly
- [x] Email validation works
- [x] Phone country code dropdown works
- [x] Social links have correct prefixes
- [x] Auto-save works instantly
- [x] Experience modal opens/closes
- [x] Experience add works
- [x] Experience edit works
- [x] Experience delete works
- [x] "Currently working" disables end date
- [x] Validation errors show
- [x] Data persists in localStorage
- [x] Tab navigation works
- [x] Responsive design works

## 📸 SCREENSHOTS TO TAKE

### Must-Have Screenshots:
1. **Personal Info - Empty Form**
   - Shows all placeholders
   - Clean, modern UI

2. **Personal Info - Validation Errors**
   - Multiple red error messages
   - Empty required fields

3. **Personal Info - Filled Form**
   - All fields filled
   - Social links with prefixes
   - Country code selected

4. **Experience Modal - Add**
   - Clean modal dialog
   - All fields visible

5. **Experience Modal - Validation**
   - Required field errors

6. **Experience List**
   - 2-3 experiences
   - Edit/delete buttons
   - Formatted dates

7. **Experience Modal - Edit**
   - Pre-filled fields
   - "Edit Experience" title

8. **Edit Tab - Full View**
   - Both forms visible
   - ScrollArea working

9. **LocalStorage - DevTools**
   - cv-data-storage key
   - JSON data structure

10. **Auto-save in Action**
    - Type in field
    - Show localStorage updating

## 🐛 KNOWN ISSUES

### Expected (Not Bugs):
- TypeScript may show some warnings (doesn't affect runtime)
- First render might take a moment (normal for React)
- Linter warnings about implicit any (intentional for flexibility)

### If You See These (Actual Issues):
- ❌ Modal doesn't open → Check console for errors
- ❌ Auto-save doesn't work → Check localStorage permissions
- ❌ Validation not showing → Check Zod installation
- ❌ Forms not rendering → Check component imports

## 🔍 DEBUGGING TIPS

### If Personal Info doesn't save:
```javascript
// Open DevTools Console
localStorage.getItem('cv-data-storage')
// Should show JSON data
```

### If Experience modal doesn't open:
```javascript
// Check for errors in console
// Should see no errors
```

### If validation doesn't work:
```javascript
// Check Zod is installed
import { z } from 'zod'
// Should not error
```

## 📊 PERFORMANCE BENCHMARKS

Expected performance:
- ✅ Form render: < 100ms
- ✅ Auto-save delay: < 50ms
- ✅ Modal open: < 200ms
- ✅ Validation: Instant
- ✅ List render (10 items): < 100ms

## 🎯 COMPLETION CRITERIA

### You're done when:
1. All 12 checkboxes in validation checklist are ✅
2. All 5 test sections completed
3. 10 screenshots captured
4. No console errors
5. Data persists after refresh
6. Forms are responsive

## 🚨 QUICK FIX GUIDE

### Problem: Packages not found
```bash
cd ai-cv-builder
npm install react-hook-form @hookform/resolvers zod date-fns --legacy-peer-deps
```

### Problem: TypeScript errors
1. Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")
2. Restart dev server (Ctrl+C, then npm run dev)

### Problem: LocalStorage not working
1. Check browser settings allow localStorage
2. Clear localStorage and try again:
```javascript
localStorage.clear()
```

### Problem: Modal doesn't close
- Click outside modal
- Press Escape key
- Refresh page

## 📝 TEST REPORT TEMPLATE

```markdown
# ADIM 17 Test Report

Date: _______________
Tester: _______________

## Results
- [ ] Personal Info: ✅ / ❌
- [ ] Experience Add: ✅ / ❌
- [ ] Experience Edit: ✅ / ❌
- [ ] Experience Delete: ✅ / ❌
- [ ] Validation: ✅ / ❌
- [ ] Auto-save: ✅ / ❌
- [ ] Persistence: ✅ / ❌

## Issues Found
1. _______________
2. _______________

## Screenshots
- [ ] All 10 screenshots captured
- [ ] Uploaded to: _______________

## Overall Status
✅ PASS / ❌ FAIL

## Notes
_______________
```

---

## 🎉 READY TO TEST!

Start with section 1 (Personal Info) and work through each section.
Each test should take 2-5 minutes.
Total test time: ~30 minutes.

**Good luck! 🚀**
