# Step 29 - Resume Variants Implementation Notes

## Overview
Step 29 introduces a complete Resume Variants system allowing users to create tailored CV versions for different job applications, with diff viewing, version history, and export presets.

## Architecture

### Type Definitions
- **`variants.types.ts`**: Core variant types including `CVVariant`, `VariantMeta`, `VariantDiff`, `DiffBlock`
- **`export.types.ts`**: Export-related types including `ExportPreset`, `ExportFormat`, `RenderContext`

### Services

#### Diff Service (`diff.service.ts`)
- Computes structured diffs between CV versions
- Implements word-level LCS (Longest Common Subsequence) algorithm for inline diffs
- Handles text sections (summary, skills, contact) and array sections (experience, education)
- **Trade-off**: Uses deterministic word-based diff instead of semantic diff for performance and reliability

#### Naming Service (`naming.service.ts`)
- Token-based filename generation
- Supported tokens: `{FirstName}`, `{MiddleName}`, `{LastName}`, `{Role}`, `{Company}`, `{Date}`, `{JobId}`, `{VariantName}`, `{Locale}`
- Sanitizes illegal filename characters
- Easy to extend with additional tokens (e.g., `{ATSScore}`, `{Year}`)

#### Snapshot Service (`snapshot.service.ts`)
- Captures ATS analysis state at variant creation time
- Stores score and keyword match counts
- Gracefully handles missing ATS data

#### Batch Export Service (`batchExport.service.ts`)
- Orchestrates multi-format exports
- Builds render context from variant and preset
- Integrates with existing export services (PDF/DOCX/Google Docs)
- Currently implements sequential export; can be parallelized if needed

### Stores

#### Variants Store (`variants.store.ts`)
- Manages variant lifecycle: create, rename, select, delete
- Maintains version history with snapshots
- Provides diff computation against base CV
- Persists to localStorage with Zustand persist middleware
- **Base CV Identity**: Uses stable `baseCvId` to enable future support for multiple base CVs

#### Export Presets Store (`exportPresets.store.ts`)
- CRUD operations for export presets
- Persists preset configurations
- Simple store with minimal business logic

### Components

#### VariantsTab
Main container organizing toolbar, list, diff viewer, and history

#### VariantToolbar
Actions: Create Variant, Export

#### VariantCreateDialog
- Create variant from current CV
- Optional link to saved job
- Captures ATS snapshot at creation

#### VariantList & VariantRow
- Display all variants
- Actions: Open, Rename, Snapshot, Delete
- Shows linked job and ATS score

#### VariantDiffViewer
- Side-by-side diff view
- Sections: Summary, Skills, Experience, Education, Contact
- Inline word-level diff with color coding
- Accessible color usage (not sole indicator)

#### VariantHistory
- Shows version snapshots
- Restore functionality
- Timestamp and notes display

#### ExportPresetDialog
- Configure naming template
- Select formats (PDF/DOCX/Google Docs)
- Set locale
- Save and export in one action

## Integration Points

### With Step 26 (Saved Jobs)
- Variants can link to saved jobs via `linkedJobId`
- Job company name used in export filename context

### With ATS Analysis
- Snapshots ATS score at variant creation
- Provides historical ATS performance tracking

### With Export Services
- Batch export delegates to existing PDF/DOCX/Google Docs services
- Consistent naming across all formats

## Data Flow

1. **Variant Creation**
   - User creates variant → stores current CV snapshot
   - Optionally links to saved job
   - Captures ATS score if available
   - Creates initial history entry

2. **Diff Viewing**
   - User selects variant → computes diff against base CV
   - LCS algorithm generates inline word-level changes
   - Renders side-by-side comparison

3. **Export**
   - User configures preset → saves template and formats
   - Builds render context from variant + job + preset
   - Batch exports to selected formats with consistent naming

4. **History & Restore**
   - User creates snapshot → stores current CV state
   - User restores → updates base CV with historical version

## Performance Considerations

- **Diff Computation**: O(n*m) LCS algorithm, acceptable for CV-sized text
- **Persistence**: Uses Zustand persist, partializes state to reduce storage
- **History Growth**: No automatic cleanup; can implement max history size if needed

## Accessibility

- Dialog ARIA labels and titles
- Color not sole indicator (uses strikethrough for removed, background for added/modified)
- Keyboard navigation support
- Focus management in dialogs

## Future Enhancements

1. **Advanced Diff**
   - Semantic diff instead of word-based
   - Section-level reordering detection

2. **Naming Tokens**
   - `{ATSScore}` - Include ATS score in filename
   - `{Year}` - Current year
   - Custom user-defined tokens

3. **Batch Operations**
   - Export multiple variants at once
   - Bulk delete/rename

4. **Cloud Sync**
   - Sync variants to Firestore
   - Share variants with team

5. **Export Integration**
   - Parallel export for better performance
   - Custom cover letter per variant
   - Email integration

6. **History Optimization**
   - Compress old snapshots
   - Implement snapshot limit (e.g., keep last 10)
   - Delta-based storage instead of full snapshots

## Testing

### Unit Tests
- `diff.service.spec.ts`: Text diff correctness, LCS algorithm
- `naming.service.spec.ts`: Token replacement, sanitization
- `snapshot.service.spec.ts`: ATS capture logic
- `variants.store.spec.ts`: Store operations, history
- `exportPresets.store.spec.ts`: Preset CRUD

### E2E Tests
- `step29-variants-flow.spec.ts`: Complete user flow from creation to export

## Known Limitations

1. **Export Services**: Batch export currently logs to console; actual PDF/DOCX/Google Docs integration needs implementation
2. **History Size**: No automatic cleanup of old snapshots
3. **Diff Algorithm**: Word-based LCS may not capture semantic changes optimally
4. **Restore Scope**: Currently only updates summary/personal info; full section restore needs enhancement

## Migration Notes

- No breaking changes to existing CV editing or ATS analysis
- New stores use separate localStorage keys
- Backward compatible with Step 17-28 implementations
