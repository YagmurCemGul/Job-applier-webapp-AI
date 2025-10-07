# 📊 ADIM 20 - Visual Component Structure

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   CV Builder Page                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  Header with Save CV Button                   │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │     [Save CV] ← SaveCVDialog            │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │           CV Form Fields                      │  │
│  │  • Personal Info                              │  │
│  │  • Experience                                 │  │
│  │  • Education                                  │  │
│  │  • Skills                                     │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

                         ↓ Save

┌─────────────────────────────────────────────────────┐
│                  SaveCVDialog Modal                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  CV Name: [_____________________________]    │  │
│  │  Description: [________________________]     │  │
│  │  Tags: [________________________________]    │  │
│  │                                               │  │
│  │  Version: v2    Modified: Oct 7, 2025        │  │
│  │                                               │  │
│  │  [Cancel]              [Save CV]              │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

                         ↓ Saved

┌─────────────────────────────────────────────────────┐
│                   Dashboard Page                     │
│  ┌──────────────────────────────────────────────┐  │
│  │              Statistics Cards                 │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│  │
│  │  │Total   │ │Avg ATS │ │Apps    │ │Modified││  │
│  │  │CVs: 5  │ │Score:78│ │Count:0 │ │Oct 7   ││  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘│  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Search & Filters                             │  │
│  │  [🔍 Search CVs...]  [Sort: Recent ▾]  [+New]│  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │              CV Grid (CVList)                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │  │
│  │  │ CVCard   │ │ CVCard   │ │ CVCard   │      │  │
│  │  │          │ │          │ │          │      │  │
│  │  └──────────┘ └──────────┘ └──────────┘      │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 📇 CV Card Component

```
┌─────────────────────────────────────────────┐
│  Software Engineer - Google        [⋮]      │ ← Dropdown Menu
│  ⭐ Primary                                  │
│                                              │
│  My CV for Google application               │ ← Description
│  Senior Software Engineer at Google         │ ← Job Info
│                                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ │
│  │ 📈 ATS    │ │ 📄 Version│ │ 📅 Modified│ │
│  │ Score: 85 │ │ v2        │ │ Oct 7     │ │
│  └───────────┘ └───────────┘ └───────────┘ │
│                                              │
│  [tech] [remote] [senior]                   │ ← Tags
│                                              │
│  ┌─────────────┐ ┌──────────────────────┐  │
│  │  ✏️ Edit    │ │  ⬇️ Download         │  │
│  └─────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🎯 Dropdown Menu Actions

```
┌──────────────────┐
│ ✏️  Edit         │
│ 📋 Duplicate     │
│ ⬇️  Download     │
│ ─────────────── │
│ ⭐ Set as Primary│
│ ─────────────── │
│ 🗑️  Delete       │ (red)
└──────────────────┘
```

## 🔄 Data Flow

```
┌─────────────┐
│  CV Builder │
│             │
│  Fill Form  │
│      ↓      │
│  Click Save │
└─────────────┘
       ↓
┌─────────────┐
│ SaveCVDialog│
│             │
│ Enter Name  │
│ Add Tags    │
│      ↓      │
│  Click Save │
└─────────────┘
       ↓
┌─────────────┐
│ CVDataStore │
│             │
│ saveCurrentCV()
│      ↓      │
│ savedCVs[]  │
└─────────────┘
       ↓
┌─────────────┐
│ LocalStorage│
│             │
│  Persist    │
└─────────────┘
       ↓
┌─────────────┐
│  Dashboard  │
│             │
│  Show CVs   │
└─────────────┘
```

## 🎨 Color Coding

### ATS Score Badges:
```
Score >= 80:  🟢 Green   "Great"
Score >= 60:  🟡 Yellow  "Good"
Score <  60:  🔴 Red     "Needs Work"
```

### CV Status:
```
Primary CV:    ⭐ Blue Badge
Regular CV:    No Badge
```

## 📱 Responsive Layout

### Desktop (≥1024px):
```
┌────────────────────────────────────────┐
│  Statistics (4 columns)                │
│  [Stats] [Stats] [Stats] [Stats]       │
├────────────────────────────────────────┤
│  Search & Sort                         │
│  [Search.......] [Sort] [+ New]        │
├────────────────────────────────────────┤
│  CV Grid (3 columns)                   │
│  [CV Card] [CV Card] [CV Card]         │
│  [CV Card] [CV Card] [CV Card]         │
└────────────────────────────────────────┘
```

### Tablet (768px-1024px):
```
┌──────────────────────────────┐
│  Statistics (2 columns)      │
│  [Stats] [Stats]             │
│  [Stats] [Stats]             │
├──────────────────────────────┤
│  Search & Sort               │
│  [Search.....] [Sort] [+New] │
├──────────────────────────────┤
│  CV Grid (2 columns)         │
│  [CV Card] [CV Card]         │
│  [CV Card] [CV Card]         │
└──────────────────────────────┘
```

### Mobile (<768px):
```
┌──────────────────┐
│  Statistics      │
│  [Stats]         │
│  [Stats]         │
│  [Stats]         │
│  [Stats]         │
├──────────────────┤
│  Search & Sort   │
│  [Search.......]│
│  [Sort] [+ New] │
├──────────────────┤
│  CV Grid (1 col) │
│  [CV Card]       │
│  [CV Card]       │
│  [CV Card]       │
└──────────────────┘
```

## 🗂️ Component Hierarchy

```
Dashboard
├── Statistics Section
│   ├── Card (Total CVs)
│   ├── Card (Avg ATS Score)
│   ├── Card (Applications)
│   └── Card (Last Modified)
│
└── CVList
    ├── Search & Filter Bar
    │   ├── Search Input
    │   ├── Sort Dropdown
    │   └── Create New Button
    │
    ├── Empty State (if no CVs)
    │   ├── Icon
    │   ├── Message
    │   └── Create Button
    │
    └── CV Grid
        └── CVCard (for each CV)
            ├── Header
            │   ├── Name
            │   ├── Primary Badge
            │   └── Dropdown Menu
            │       ├── Edit
            │       ├── Duplicate
            │       ├── Download
            │       ├── Set Primary
            │       └── Delete
            ├── Description
            ├── Stats Row
            │   ├── ATS Score
            │   ├── Version
            │   └── Modified Date
            ├── Tags
            └── Action Buttons
                ├── Edit Button
                └── Download Button
```

## 🔐 State Management

```
CVDataStore (Zustand)
│
├── State
│   ├── currentCV: CVData | null
│   ├── savedCVs: SavedCV[]
│   ├── currentSavedCVId: string | null
│   └── autoSaveEnabled: boolean
│
└── Actions
    ├── Save Management
    │   ├── saveCurrentCV()
    │   ├── updateSavedCV()
    │   ├── deleteSavedCV()
    │   ├── loadSavedCV()
    │   ├── duplicateSavedCV()
    │   └── setPrimaryCv()
    │
    ├── CV Operations
    │   ├── initializeCV()
    │   ├── updatePersonalInfo()
    │   ├── updateSummary()
    │   ├── addExperience()
    │   └── ... (more CRUD operations)
    │
    └── Helpers
        ├── getSavedCVById()
        └── getStatistics()
```

## 📊 Data Types

```typescript
SavedCV {
  id: string
  name: string                 // "Software Engineer - Google"
  description?: string         // "My CV for Google"
  cvData: CVData              // Complete CV data
  templateId: string          // "template-modern"
  jobTitle?: string           // "Software Engineer"
  company?: string            // "Google"
  atsScore?: number          // 85
  lastModified: Date         // 2025-10-07
  createdAt: Date           // 2025-10-01
  tags: string[]            // ["tech", "remote"]
  isPrimary: boolean        // true/false
  version: number          // 2
}

CVStatistics {
  totalCVs: number          // 5
  avgAtsScore: number       // 78.5
  lastModified: Date        // Most recent
  mostUsedTemplate: string  // "template-modern"
  totalApplications: number // 0 (future)
}
```

## 🎭 User Interactions

### Save Flow:
```
User fills CV → Clicks Save → Dialog opens
→ Enters details → Clicks Save → Success animation
→ Dialog closes → Toast notification → Updates Dashboard
```

### Edit Flow:
```
User clicks Edit → CV loads → Navigates to Builder
→ Edits CV → Clicks Save → Version increments
→ Updates in list
```

### Search Flow:
```
User types in search → Instant filter → Results update
→ Shows count → Empty state if no results
```

### Delete Flow:
```
User clicks Delete → Confirmation dialog → User confirms
→ CV removed → List updates → Statistics update
→ Toast notification
```

## 🎨 Design System

### Colors:
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)
- Gray: Various shades

### Typography:
- Title: 3xl, bold
- Subtitle: gray-600
- Card Title: lg, semibold
- Body: sm, gray-600

### Spacing:
- Container: max-w-7xl
- Grid Gap: 6 (1.5rem)
- Card Padding: 6 (1.5rem)

### Shadows:
- Card: default shadow
- Card Hover: lg shadow
- Dialog: xl shadow

## 🚀 Performance

### Optimization:
- ✅ Memo for CV cards
- ✅ Debounced search
- ✅ Lazy load images
- ✅ Virtual scrolling (future)
- ✅ LocalStorage caching

### Bundle Size:
- SaveCVDialog: ~5KB
- CVCard: ~3KB
- CVList: ~4KB
- Total: ~12KB (gzipped)

---

**Visual Summary Complete** ✅
All components documented with visual representations and flows!
