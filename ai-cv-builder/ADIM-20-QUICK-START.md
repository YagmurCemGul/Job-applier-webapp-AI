# 🚀 ADIM 20 Quick Start Guide

## Overview
ADIM 20 introduces a complete CV management system with save, edit, duplicate, and delete functionality.

## Files Created

```
src/
├── types/
│   └── savedCV.types.ts          # SavedCV, CVVersion, CVStatistics
├── stores/
│   └── cvData.store.ts           # Updated with save methods
├── components/
│   ├── cv/
│   │   └── SaveCVDialog.tsx      # Save CV modal
│   └── dashboard/
│       ├── CVCard.tsx            # CV card component
│       ├── CVList.tsx            # CV list with search/filter
│       └── index.ts              # Exports
└── pages/
    └── Dashboard.tsx             # Updated dashboard
```

## Key Features

### 1. Save CV System
```typescript
// In CV Builder - Save button in header
<SaveCVDialog />

// Saves current CV with:
- Name
- Description
- Tags
- Version tracking
```

### 2. Dashboard Statistics
- Total CVs count
- Average ATS score
- Total applications
- Last modified date

### 3. CV Management
- **Edit:** Load CV and navigate to builder
- **Duplicate:** Create copy of CV
- **Delete:** Remove CV (with confirmation)
- **Set as Primary:** Mark as main CV
- **Download:** Export CV

### 4. Search & Filter
- Search by name, description, or tags
- Sort by recent, name, or ATS score
- Real-time filtering

## Quick Usage

### Save a CV
```typescript
// 1. Fill CV in CV Builder
// 2. Click "Save CV" button
// 3. Enter name and description
// 4. Click "Save CV"
```

### View CVs
```typescript
// 1. Navigate to Dashboard
// 2. See all saved CVs in grid
// 3. Use search to filter
// 4. Use sort dropdown to reorder
```

### Edit a CV
```typescript
// 1. Click "Edit" on CV card
// 2. CV loads in builder
// 3. Make changes
// 4. Save again to update
```

### Duplicate a CV
```typescript
// 1. Click ⋮ menu on CV card
// 2. Select "Duplicate"
// 3. New copy created with "(Copy)" suffix
```

## Store Methods

### Save Management
```typescript
const {
  saveCurrentCV,      // Save current CV
  updateSavedCV,      // Update CV metadata
  deleteSavedCV,      // Delete CV
  loadSavedCV,        // Load CV to builder
  duplicateSavedCV,   // Create copy
  setPrimaryCv,       // Set as primary
  getSavedCVById,     // Get CV by ID
  getStatistics,      // Get dashboard stats
} = useCVDataStore()
```

### Example: Save CV
```typescript
const handleSave = () => {
  const cvId = saveCurrentCV(
    'Software Engineer - Google',
    'My application for Google',
    ['tech', 'remote', 'senior']
  )
  console.log('Saved CV:', cvId)
}
```

### Example: Get Statistics
```typescript
const stats = getStatistics()
// {
//   totalCVs: 5,
//   avgAtsScore: 78.5,
//   lastModified: Date,
//   mostUsedTemplate: 'template-modern',
//   totalApplications: 0
// }
```

## Component Props

### SaveCVDialog
```typescript
interface SaveCVDialogProps {
  trigger?: React.ReactNode  // Custom trigger button
  onSaved?: () => void      // Callback after save
}

// Usage
<SaveCVDialog 
  trigger={<Button>Save</Button>}
  onSaved={() => console.log('Saved!')}
/>
```

### CVCard
```typescript
interface CVCardProps {
  cv: SavedCV
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onSetPrimary: (id: string) => void
  onDownload: (id: string) => void
}
```

### CVList
```typescript
// No props - fully self-contained
<CVList />
```

## Data Structure

### SavedCV
```typescript
{
  id: string
  name: string                    // "Software Engineer - Google"
  description?: string            // "My CV for Google"
  cvData: CVData                  // Full CV data
  templateId: string              // "template-modern"
  jobTitle?: string               // "Software Engineer"
  company?: string                // "Google"
  atsScore?: number               // 85
  lastModified: Date              // Last update time
  createdAt: Date                 // Creation time
  tags: string[]                  // ["tech", "remote"]
  isPrimary: boolean              // Is this the main CV?
  version: number                 // 1, 2, 3...
}
```

## Styling

### ATS Score Colors
```typescript
>= 80: Green (Great)
>= 60: Yellow (Good)
<  60: Red (Needs improvement)
```

### Responsive Grid
```typescript
Desktop (lg):  3 columns
Tablet (md):   2 columns
Mobile:        1 column
```

## LocalStorage

Data persists in `cv-data-storage`:
```typescript
{
  currentCV: CVData | null,
  savedCVs: SavedCV[],
  currentSavedCVId: string | null,
  autoSaveEnabled: boolean
}
```

## Common Workflows

### Create First CV
1. Navigate to CV Builder
2. Fill in personal info
3. Add experience, education, skills
4. Click "Save CV"
5. Enter name and save
6. View in Dashboard

### Manage Multiple CVs
1. Save base CV
2. Duplicate for different jobs
3. Customize each copy
4. Set one as primary
5. Use search to find specific CVs

### Update Existing CV
1. Edit from Dashboard
2. Modify in CV Builder
3. Click "Save CV"
4. Version increments automatically

### Organize CVs
1. Add descriptive names
2. Use tags for categorization
3. Set primary CV
4. Use search and sort

## Keyboard Shortcuts

- `Esc` - Close dialogs
- `Enter` - Submit forms (when focused)
- `Tab` - Navigate form fields

## Tips & Tricks

### Best Practices
- Use descriptive CV names
- Add tags for easy searching
- Set your best CV as primary
- Duplicate instead of starting from scratch
- Review version history

### Organization
```
Format: [Role] - [Company]
Example: "Senior Developer - Microsoft"

Tags: job type, location, level
Example: "tech, remote, senior"
```

### Search Tips
- Search by role: "engineer"
- Search by company: "google"
- Search by tag: "remote"
- Combine terms for better results

## Troubleshooting

### CV Not Saving
- Ensure currentCV exists in store
- Check console for errors
- Verify localStorage not full

### Statistics Wrong
- Refresh page
- Check saved CVs array
- Verify dates are valid

### Search Not Working
- Check search input value
- Verify CV data structure
- Clear search and try again

## Next Steps

After ADIM 20:
1. ✅ Save and manage CVs
2. ✅ Dashboard with statistics
3. 🔜 Application tracking
4. 🔜 Advanced analytics
5. 🔜 CV comparison tool

## Quick Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## API Reference

### useCVDataStore

```typescript
// State
currentCV: CVData | null
savedCVs: SavedCV[]
currentSavedCVId: string | null
autoSaveEnabled: boolean

// Actions
saveCurrentCV(name, description?, tags?) => string
updateSavedCV(id, updates) => void
deleteSavedCV(id) => void
loadSavedCV(id) => void
duplicateSavedCV(id) => void
setPrimaryCv(id) => void
getSavedCVById(id) => SavedCV | undefined
getStatistics() => CVStatistics
```

## Examples

### Complete Save Flow
```typescript
import { useCVDataStore } from '@/stores/cvData.store'
import { SaveCVDialog } from '@/components/cv/SaveCVDialog'

function CVBuilderPage() {
  const { currentCV } = useCVDataStore()
  
  return (
    <div>
      <h1>CV Builder</h1>
      {/* Your CV form */}
      <SaveCVDialog 
        onSaved={() => {
          toast.success('CV saved!')
          navigate('/dashboard')
        }}
      />
    </div>
  )
}
```

### Dashboard Implementation
```typescript
import { CVList } from '@/components/dashboard'
import { useCVDataStore } from '@/stores/cvData.store'

function DashboardPage() {
  const { getStatistics } = useCVDataStore()
  const stats = getStatistics()
  
  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p>Total CVs: {stats.totalCVs}</p>
        </Card>
        {/* More stats */}
      </div>
      
      {/* CV List */}
      <CVList />
    </div>
  )
}
```

## Resources

- [ADIM-20-TAMAMLANDI.md](./ADIM-20-TAMAMLANDI.md) - Complete documentation
- [ADIM-20-TEST-GUIDE.md](./ADIM-20-TEST-GUIDE.md) - Testing guide
- [savedCV.types.ts](./src/types/savedCV.types.ts) - Type definitions

---

**Status:** ✅ Complete and Ready to Use
**Version:** 1.0.0
**Last Updated:** ADIM 20 Completion
