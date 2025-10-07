# 🧪 ADIM 20 Test Guide

## Test Scenarios

### 1. Save CV Test

**Scenario:** Save a new CV
1. Navigate to CV Builder
2. Fill in CV information (personal info, experience, etc.)
3. Click "Save CV" button in header
4. Enter CV name: "Software Engineer - Google"
5. Enter description: "My CV for Google application"
6. Enter tags: "tech, remote, senior"
7. Click "Save CV"

**Expected Results:**
- ✅ Success message shown
- ✅ Dialog shows checkmark animation
- ✅ Dialog auto-closes after 1.5s
- ✅ CV appears in Dashboard
- ✅ Version shows v1

---

### 2. Update Saved CV Test

**Scenario:** Update an existing saved CV
1. Open a saved CV in CV Builder
2. Modify some information
3. Click "Save CV"
4. Update name or description
5. Click "Update CV"

**Expected Results:**
- ✅ Dialog title shows "Update CV"
- ✅ Previous name and description pre-filled
- ✅ Version increments (v1 → v2)
- ✅ Last modified date updates
- ✅ Success message shown

---

### 3. Dashboard Statistics Test

**Scenario:** View dashboard statistics
1. Save 3-4 different CVs
2. Set ATS scores for some CVs
3. Navigate to Dashboard

**Expected Results:**
- ✅ Total CVs count is correct
- ✅ Average ATS Score calculated correctly
- ✅ Last Modified shows latest date
- ✅ Applications count shows (currently 0)

---

### 4. CV Card Display Test

**Scenario:** View CV cards in dashboard
1. Navigate to Dashboard
2. Observe CV cards

**Expected Results:**
- ✅ CV name displayed prominently
- ✅ Description shown (if exists)
- ✅ ATS score badge with correct color:
  - Green for >= 80
  - Yellow for >= 60
  - Red for < 60
- ✅ Version number shown
- ✅ Last modified date formatted
- ✅ Tags displayed as badges
- ✅ Primary badge shown for primary CV

---

### 5. Search Functionality Test

**Scenario:** Search for CVs
1. Navigate to Dashboard with multiple CVs
2. Type in search box

**Test Cases:**
- Search by name: "Google" → shows CVs with "Google" in name
- Search by tag: "tech" → shows CVs with "tech" tag
- Search by description → shows matching CVs
- Search with no results → shows "No CVs Found" message

**Expected Results:**
- ✅ Real-time filtering works
- ✅ Search is case-insensitive
- ✅ Empty state shown when no matches
- ✅ Count updates correctly

---

### 6. Sort Functionality Test

**Scenario:** Sort CVs by different criteria
1. Navigate to Dashboard
2. Use sort dropdown

**Test Cases:**
- Sort by "Most Recent" → newest first
- Sort by "Name (A-Z)" → alphabetical
- Sort by "ATS Score" → highest first

**Expected Results:**
- ✅ CVs reorder immediately
- ✅ Correct sort order applied
- ✅ Selection persists

---

### 7. Edit CV Test

**Scenario:** Edit a saved CV
1. Click "Edit" on CV card
2. Observe navigation

**Expected Results:**
- ✅ CV data loads in CV Builder
- ✅ Navigate to edit tab
- ✅ All fields populated correctly
- ✅ Can modify and save again

---

### 8. Duplicate CV Test

**Scenario:** Duplicate a CV
1. Click dropdown menu on CV card
2. Click "Duplicate"

**Expected Results:**
- ✅ New CV appears in list
- ✅ Name has "(Copy)" suffix
- ✅ All data copied except ID
- ✅ Version resets to 1
- ✅ isPrimary is false
- ✅ Timestamps are new

---

### 9. Delete CV Test

**Scenario:** Delete a CV
1. Click dropdown menu on CV card
2. Click "Delete"
3. Observe confirmation dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ CV name shown in dialog
- ✅ "Cancel" dismisses dialog
- ✅ "Delete" removes CV
- ✅ CV disappears from list
- ✅ Statistics update
- ✅ localStorage updated

---

### 10. Set as Primary Test

**Scenario:** Set a CV as primary
1. Have multiple CVs
2. Click dropdown on non-primary CV
3. Click "Set as Primary"

**Expected Results:**
- ✅ Previous primary loses badge
- ✅ Selected CV gets primary badge
- ✅ Only one primary at a time
- ✅ Change persists after refresh

---

### 11. Download CV Test

**Scenario:** Download a CV
1. Click "Download" on CV card
2. Observe navigation

**Expected Results:**
- ✅ CV loads into store
- ✅ Navigate to CV Builder optimize tab
- ✅ Export options available
- ✅ Can export to PDF/DOCX

---

### 12. Create New CV Test

**Scenario:** Create new CV from dashboard
1. Click "Create New CV" button
2. Observe navigation

**Expected Results:**
- ✅ Navigate to CV Builder
- ✅ Empty CV form shown
- ✅ Can fill and save

---

### 13. Empty State Test

**Scenario:** View dashboard with no CVs
1. Delete all CVs
2. Navigate to Dashboard

**Expected Results:**
- ✅ Empty state card shown
- ✅ Icon displayed
- ✅ Helpful message shown
- ✅ "Create Your First CV" button visible
- ✅ Statistics show 0s

---

### 14. Tags Display Test

**Scenario:** View CVs with tags
1. Save CV with tags: "tech, remote, senior"
2. View in Dashboard

**Expected Results:**
- ✅ Each tag shown as badge
- ✅ Tags properly separated
- ✅ Outline variant used
- ✅ Tags searchable

---

### 15. Version Tracking Test

**Scenario:** Track CV versions
1. Save new CV (v1)
2. Update CV (v2)
3. Update again (v3)
4. View version in card

**Expected Results:**
- ✅ Version increments correctly
- ✅ Version shown in card
- ✅ Version shown in save dialog
- ✅ Last modified updates each time

---

### 16. Persistence Test

**Scenario:** Test localStorage persistence
1. Save multiple CVs
2. Refresh page
3. Close and reopen browser

**Expected Results:**
- ✅ All CVs persist
- ✅ Statistics correct
- ✅ Primary CV maintained
- ✅ Dates preserved correctly

---

### 17. Form Validation Test

**Scenario:** Test SaveCVDialog validation
1. Open Save CV dialog
2. Try to save without name
3. Try with very long name (>100 chars)
4. Try with very long description (>500 chars)

**Expected Results:**
- ✅ Error shown for empty name
- ✅ Error shown for name too long
- ✅ Error shown for description too long
- ✅ Cannot submit with errors
- ✅ Error messages clear on fix

---

### 18. Responsive Design Test

**Scenario:** Test on different screen sizes
1. Open Dashboard
2. Resize browser

**Test Sizes:**
- Desktop (>1024px): 3 columns
- Tablet (768-1024px): 2 columns
- Mobile (<768px): 1 column

**Expected Results:**
- ✅ Grid adjusts to screen size
- ✅ Cards remain readable
- ✅ Statistics cards stack properly
- ✅ Search bar responsive
- ✅ Dialog fits on mobile

---

### 19. Multiple CVs Test

**Scenario:** Test with many CVs
1. Create 10+ CVs
2. Navigate Dashboard
3. Test all features

**Expected Results:**
- ✅ All CVs display correctly
- ✅ Search works efficiently
- ✅ Sort works with many items
- ✅ No performance issues
- ✅ Scroll works smoothly

---

### 20. Statistics Calculation Test

**Scenario:** Verify statistics accuracy
1. Save 3 CVs with ATS scores: 75, 85, 90
2. Check dashboard statistics

**Expected Results:**
- ✅ Total CVs: 3
- ✅ Avg ATS Score: 83 (rounded)
- ✅ Badge shows "Great" if >= 80
- ✅ Last Modified: most recent date
- ✅ Updates on CV changes

---

## Quick Test Checklist

Run through this checklist for a quick validation:

- [ ] Save new CV works
- [ ] Update existing CV works
- [ ] Dashboard shows statistics
- [ ] CV cards display correctly
- [ ] Search filters CVs
- [ ] Sort changes order
- [ ] Edit loads CV
- [ ] Duplicate creates copy
- [ ] Delete removes CV
- [ ] Set as primary works
- [ ] Download navigates correctly
- [ ] Create new CV button works
- [ ] Empty state shows
- [ ] Tags display
- [ ] Versions increment
- [ ] Persistence works
- [ ] Form validation works
- [ ] Responsive on mobile
- [ ] Statistics calculate correctly

---

## Bug Report Template

If you find issues, report them using this template:

```markdown
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: 
- Screen size: 
- Date/Time: 
```

---

## Performance Checklist

- [ ] Dashboard loads quickly with 10+ CVs
- [ ] Search is instant
- [ ] Sort is immediate
- [ ] No lag on card interactions
- [ ] Dialogs open smoothly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] localStorage updates efficiently

---

## Accessibility Checklist

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Dialog can be closed with Esc
- [ ] Screen reader friendly
- [ ] Color contrast sufficient
- [ ] Error messages clear
- [ ] Labels associated with inputs

---

## 🎯 Success Criteria

All tests should pass for ADIM 20 to be considered complete:

1. ✅ All functionality works as specified
2. ✅ No critical bugs
3. ✅ Performance is acceptable
4. ✅ Responsive design works
5. ✅ Data persists correctly
6. ✅ User feedback is clear
7. ✅ Validation prevents errors

---

**Last Updated:** ADIM 20 Completion
**Status:** ✅ Ready for Testing
