# Step 29 - Resume Variants Quick Start Guide

## 🚀 Quick Start

### 1. Navigate to Variants Tab
```
CV Builder → Variants Tab (GitBranch icon)
```

### 2. Create Your First Variant
```
Click "Create Variant" → Enter name → (Optional) Link job → Create
```

### 3. View Differences
```
Click "Open" on a variant → See side-by-side diff
```

### 4. Export with Custom Naming
```
Select variant → Click "Export…" → Configure template → Save & Export
```

## 📖 Key Features

### Variant Management
- **Create**: From current CV or linked to saved job
- **Rename**: Update variant names
- **Delete**: Remove unwanted variants
- **Snapshot**: Create version checkpoints
- **Restore**: Revert to previous versions

### Diff Viewer
- **Side-by-side**: Before/After comparison
- **Sections**: Summary, Skills, Experience, Education, Contact
- **Inline**: Word-level changes with color coding
- **Accessible**: Strikethrough + background colors

### Export Presets
```
Template: CV_{FirstName}_{LastName}_{Role}_{Company}_{Date}_{VariantName}
Result:   CV_John_Doe_Backend_Acme_2024-01-15_BackendVariant.pdf
```

## 🎯 Naming Template Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `{FirstName}` | First name from CV | John |
| `{MiddleName}` | Middle name | Q |
| `{LastName}` | Last name | Doe |
| `{Role}` | Guessed from summary | Backend |
| `{Company}` | From linked job | Acme |
| `{Date}` | Current date (YYYY-MM-DD) | 2024-01-15 |
| `{JobId}` | Linked job ID | job123 |
| `{VariantName}` | Variant name | BackendV1 |
| `{Locale}` | Selected locale | en |

## 📋 Common Workflows

### Workflow 1: Job-Specific Variant
1. Save a job posting (Job tab)
2. Go to Variants tab
3. Create variant linked to that job
4. Edit CV to match job requirements
5. Create snapshot before major changes
6. Export with job-specific naming

### Workflow 2: Version Control
1. Create baseline variant
2. Make experimental changes
3. Create snapshot
4. If changes work: keep them
5. If changes don't work: restore from history

### Workflow 3: Multi-Format Export
1. Create variant
2. Finalize content
3. Open Export dialog
4. Select multiple formats (PDF + DOCX + Google Docs)
5. Configure naming template
6. Export all formats at once

## 🔧 Technical Details

### Storage
- **Store**: Zustand with localStorage persistence
- **Key**: `variants-state` and `export-presets`
- **Size**: Each variant stores full CV snapshot

### Diff Algorithm
- **Method**: LCS (Longest Common Subsequence)
- **Level**: Word-based
- **Performance**: O(n*m), fast for CV-sized text

### History
- **Storage**: Array of CV snapshots
- **Limit**: None (manual cleanup recommended)
- **Restore**: Replaces base CV with historical version

## 🧪 Testing

### Run Unit Tests
```bash
npm test -- diff.service.spec.ts
npm test -- naming.service.spec.ts
npm test -- variants.store.spec.ts
npm test -- exportPresets.store.spec.ts
```

### Run E2E Tests
```bash
npm run test:e2e -- step29-variants-flow.spec.ts
```

## 🌍 i18n

### Switch Language
Settings → Language → EN/TR

### Available Translations
- All variant UI strings
- Diff viewer labels
- Export dialog text
- Error messages
- Action buttons

## 🎨 UI Components

### VariantsTab
Main container with 2-column layout:
- **Left**: Toolbar, List, History
- **Right**: Diff Viewer

### VariantToolbar
Actions: Create, Export

### VariantList
All variants with inline actions

### VariantDiffViewer
Side-by-side comparison with inline changes

### VariantHistory
Timeline with restore buttons

### ExportPresetDialog
Template + format configuration

## 💡 Tips & Tricks

### Tip 1: Descriptive Names
```
❌ "Variant 1"
✅ "Acme Backend Engineer Q1 2024"
```

### Tip 2: Snapshot Before Major Changes
```
Edit experience → Snapshot → Add skills → Snapshot
```

### Tip 3: Template Best Practices
```
❌ CV_{FirstName}
✅ CV_{FirstName}_{LastName}_{Role}_{Company}_{Date}
```

### Tip 4: Link Jobs Early
Create variant with job link → ATS score captured → Easy reference

### Tip 5: Use Locale in Filename
```
Template: CV_{FirstName}_{LastName}_{Locale}
Result:   CV_John_Doe_en.pdf or CV_John_Doe_tr.pdf
```

## 🐛 Troubleshooting

### Issue: Diff shows everything as modified
**Solution**: Ensure base CV is saved before creating variant

### Issue: Export doesn't generate files
**Solution**: Export service integration pending; check console logs

### Issue: History too large
**Solution**: Manually delete old snapshots; keep last 5-10

### Issue: Variant not showing linked job
**Solution**: Ensure job is saved before creating variant

## 📚 Related Documentation

- **STEP-29-NOTES.md**: Architecture and implementation details
- **STEP-29-IMPLEMENTATION.md**: Complete feature list
- **Step 26 Docs**: Saved Jobs integration
- **Step 27 Docs**: ATS Analysis integration

## 🎯 Next Steps

After implementing Step 29:
1. Test all variant operations
2. Create a few sample variants
3. Test export with different templates
4. Verify i18n in both EN and TR
5. Run full test suite
6. Integrate with actual export services (PDF/DOCX/Google Docs)

## 📞 Support

For issues or questions:
- Check STEP-29-NOTES.md for technical details
- Review test files for usage examples
- See STEP-29-IMPLEMENTATION.md for complete feature list
