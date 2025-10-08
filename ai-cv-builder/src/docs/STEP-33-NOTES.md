# Step 33: Auto-Apply Engine, Application Tracker & Outreach Sequences

## Overview

Step 33 delivers a comprehensive **Auto-Apply + Application Tracking** system with integrated outreach sequences for automated follow-ups. This system enables users to:

- **Auto-apply** to jobs with legal compliance and rate limiting
- **Track applications** through a visual Kanban pipeline
- **Manage contacts** and schedule events (interviews, calls)
- **Automate outreach** with email sequences and templates
- **Monitor progress** with funnel analytics and detailed logs

---

## Architecture

### 1. Core Components

#### Auto-Apply Engine (`services/apply/`)
- **`apply.engine.ts`**: Main orchestrator that coordinates the entire auto-apply workflow
- **`compliance.service.ts`**: Ensures legal opt-in before submission
- **`throttle.service.ts`**: Rate limiting (20 req/min default) per platform
- **`messageBus.service.ts`**: Browser extension communication protocol (future)
- **`resumePicker.service.ts`**: Exports CV variants and cover letters to PDFs

#### Platform Mappers (`services/apply/forms/`)
Each mapper converts application data to platform-specific format:
- **Greenhouse** (`greenhouse.mapper.ts`)
- **Lever** (`lever.mapper.ts`)
- **Workday** (`workday.mapper.ts`) - includes locale support
- **Indeed** (`indeed.mapper.ts`)
- **LinkedIn** (`linkedin.mapper.ts`)

All mappers output a normalized `ApplyPayload` structure.

#### Integrations (`services/integrations/`)
- **`gmail.service.ts`**: Email sending (OAuth-ready stub)
  - Production: `/api/gmail/send` when `VITE_GMAIL_ENABLED=1`
  - Dev: Local simulation with console logging
- **`calendar.service.ts`**: Event creation (OAuth-ready stub)
  - Production: `/api/calendar/events` when `VITE_CALENDAR_ENABLED=1`
  - Dev: Returns stub event ID

---

## Data Flow

### Auto-Apply Workflow

```
User fills Apply Dialog
    ↓
Compliance Check (opt-in required)
    ↓
Rate Limiting (per platform)
    ↓
Platform Mapper (to normalized payload)
    ↓
Create Application Record
    ↓
Send to Message Bus (for extension)
    ↓
Stub Submission (500ms delay)
    ↓
Update timestamps & logs
    ↓
Show in Kanban board
```

### Application Tracking

```
Applications Store (Zustand + localStorage)
    ↓
Kanban Board (6 columns: Applied → Viewed → Interview → Offer → Rejected → On-Hold)
    ↓
Application Card (role, company, score, actions)
    ↓
Detail Drawer (contacts, events, logs, files)
```

### Outreach Sequences

```
Email Template (with {{variables}})
    ↓
Sequence Builder (multi-step, offset days, send time)
    ↓
Link to Application
    ↓
Gmail Service sends email (stub or real)
    ↓
Track in application logs
```

---

## Key Features

### 1. Compliance & Safety
- **Explicit opt-in required** for each auto-apply submission
- **Throttling** prevents abuse (configurable per platform)
- **Audit logs** for every action (info/warn/error levels)
- **No auto-commit** to external systems without user consent

### 2. Application Tracker
- **Kanban board** with 6 stages (drag-drop ready)
- **Match scores** from Step 32 Jobs integration
- **Contacts management** (recruiters, hiring managers)
- **Events tracking** (interviews, calls) with calendar integration
- **File attachments** (CV, cover letter, other docs)
- **Notes** for each application

### 3. Outreach Automation
- **Email templates** with variable substitution:
  - `{{Company}}`, `{{Role}}`, `{{YourName}}`, `{{RecruiterName}}`
- **Sequences** with multiple steps, delays, and scheduled send times
- **Gmail/Calendar stubs** ready for OAuth production setup

### 4. Analytics
- **Funnel metrics**: Applied → Viewed → Interview → Offer
- **Conversion rates** (stub for future enhancement)
- **Logs panel** with filtering and export (future)

---

## Stores (Zustand)

### `applications.store.ts`
- **State**: `items: Application[]`, `activeId?: string`
- **Actions**: `create`, `setStage`, `update`, `addEvent`, `addLog`, `attachFiles`, `select`
- **Persistence**: localStorage (auto-sync)

### `emailTemplates.store.ts`
- **State**: `items: EmailTemplate[]`
- **Actions**: `upsert`, `remove`, `getById`
- **Persistence**: localStorage

### `outreach.store.ts`
- **State**: `sequences: OutreachSequence[]`
- **Actions**: `upsert`, `remove`, `getById`
- **Persistence**: localStorage

### `contacts.store.ts`
- **State**: `items: ContactRef[]`
- **Actions**: `upsert`, `remove`
- **Persistence**: localStorage

---

## UI Components

### Main Pages
- **`Applications.tsx`**: Entry point with Kanban board and logs panel
- **`ApplicationsPage.tsx`**: Container with action buttons and dialogs

### Dialogs & Modals
- **`ApplyDialog.tsx`**: Quick apply with platform selection and opt-in
- **`SequenceBuilderDialog.tsx`**: Create/manage outreach sequences
- **`EmailTemplateDialog.tsx`**: Template editor with preview
- **`ApplicationDetailDrawer.tsx`**: Full application view with contacts/events

### Board Components
- **`KanbanBoard.tsx`**: Grid layout with 6 columns
- **`KanbanColumn.tsx`**: Single stage column with count
- **`ApplicationCard.tsx`**: Compact card with actions
- **`ContactEditor.tsx`**: Add/edit contacts
- **`EventEditor.tsx`**: Schedule interviews/calls
- **`ApplyLogsPanel.tsx`**: System-wide log viewer

---

## Integration with Previous Steps

### Step 27 (Parsed CV)
- Resume picker uses parsed CV data to generate variants

### Step 29 (Variants)
- `resumePicker.service.ts` exports selected variant to PDF

### Step 30 (Cover Letters)
- Cover letter selection and PDF export for applications

### Step 31 (AI Orchestrator)
- AI can suggest tailored variants and cover letters per job

### Step 32 (Jobs)
- Match scores displayed on application cards
- Quick Apply button in job listings (to be added)

---

## Browser Extension Integration (Future)

### Message Bus Protocol
The `messageBus.service.ts` defines a `window.postMessage` protocol:

```typescript
type BusMessage =
  | { type: 'APPLY_START'; payload: ApplyPayload }
  | { type: 'APPLY_RESULT'; payload: { ok: boolean; message?: string } }
```

**Extension Flow**:
1. Web app sends `APPLY_START` with normalized payload
2. Content script receives message
3. Script fills platform-specific form fields
4. Script submits form
5. Script sends `APPLY_RESULT` back to web app
6. Web app updates application status and logs

**Security**: Extension should validate origin and require explicit user permissions.

---

## Testing

### Unit Tests
- **Mappers**: Verify correct payload structure for each platform
- **Stores**: CRUD operations, persistence, limits (200 logs max)
- **Engine**: Compliance checks, throttling, log creation
- **Resume Picker**: File export with mocked services

### E2E Tests
- Full workflow: Apply → Track → Add contacts/events → Create sequence
- Stage transitions in Kanban
- Compliance rejection without opt-in
- Funnel metrics display

**Run Tests**:
```bash
npm run test:unit         # Vitest unit tests
npm run test:e2e          # Playwright E2E tests
```

---

## Configuration

### Environment Variables
```bash
# Gmail Integration (optional)
VITE_GMAIL_ENABLED=1

# Calendar Integration (optional)
VITE_CALENDAR_ENABLED=1
```

### Throttle Settings
Edit `throttle.service.ts` to adjust rate limits:
```typescript
await applyThrottle(platform, cap=20, refillMs=1000)
```

---

## Future Enhancements

1. **Real Form Submission**
   - Browser extension with content scripts
   - Platform-specific DOM selectors
   - CAPTCHA handling

2. **Advanced Analytics**
   - Time-in-stage tracking
   - Success rate by platform/company
   - Export to CSV/PDF

3. **AI Integration**
   - Auto-suggest best variant + cover letter per job
   - Sentiment analysis of email responses
   - Interview prep based on job requirements

4. **OAuth Setup**
   - Google Workspace integration (Gmail, Calendar)
   - Outlook/Exchange support
   - LinkedIn messaging automation

5. **Team Features**
   - Shared application pipeline
   - Recruiter collaboration
   - Role-based permissions

---

## Compliance Checklist

- [x] Explicit user opt-in required for each submission
- [x] Rate limiting to prevent abuse
- [x] Audit logs for all actions
- [x] No auto-commits without consent
- [x] Privacy: All data stored locally (localStorage)
- [x] GDPR-ready: User can delete all data
- [ ] Terms of Service acknowledgment (to be added)
- [ ] Platform-specific T&C compliance (manual review required)

---

## Troubleshooting

### Issue: Auto-apply fails silently
- **Check**: Browser console for errors
- **Verify**: Opt-in checkbox is checked
- **Logs**: Review Apply Logs panel for error messages

### Issue: Contacts/Events not saving
- **Check**: localStorage quota (10MB limit)
- **Clear**: Old applications to free space
- **Export**: Data before clearing

### Issue: Email sequences not sending
- **Dev Mode**: Check console for stub logs
- **Production**: Verify `VITE_GMAIL_ENABLED=1` and backend endpoint

### Issue: Kanban board not updating
- **Refresh**: Browser to sync localStorage state
- **Check**: Network tab for failed requests
- **Restart**: Clear browser cache if persistent

---

## Known Limitations

1. **Stub Submission**: Auto-apply currently simulates submission (500ms delay). Real form filling requires browser extension.
2. **Email Sending**: Gmail service is a stub until backend OAuth flow is implemented.
3. **Calendar Events**: Google Calendar integration is stubbed for local development.
4. **File Storage**: PDFs stored as data URLs (can be large for many applications).
5. **Drag & Drop**: Kanban drag-drop not yet implemented (manual stage select only).

---

## Maintenance

### Adding a New Platform Mapper
1. Create `src/services/apply/forms/[platform].mapper.ts`
2. Implement mapper function returning `ApplyPayload`
3. Add to `MAPPERS` object in `apply.engine.ts`
4. Update `PlatformKey` type in `apply.types.ts`
5. Add option to `ApplyDialog.tsx` select menu
6. Write unit tests in `tests/unit/[platform].mapper.spec.ts`

### Updating Email Templates
Templates use Mustache-style variables. Supported variables:
- `{{Company}}` - From application record
- `{{Role}}` - From application record
- `{{YourName}}` - From user profile (to be integrated)
- `{{RecruiterName}}` - From contact record

Add new variables by updating `EmailTemplate` type and template renderer (to be implemented).

---

## Performance Considerations

- **localStorage**: Max 10MB per domain. Archive old applications periodically.
- **Log Limits**: Auto-trim to 200 entries per application to prevent bloat.
- **PDF Generation**: Large variants/CLs can slow export. Consider compression.
- **Throttling**: Adjust `cap` and `refillMs` based on platform rate limits.

---

## Security Notes

- **API Keys**: Never store in client code. Use backend proxy for OAuth.
- **CSRF**: Validate origin for message bus events.
- **XSS**: Sanitize email template variables before rendering.
- **Rate Limits**: Respect platform ToS to avoid IP bans.

---

## Support

For issues or questions:
- Check this documentation first
- Review unit/e2e test examples
- Inspect browser console and network logs
- File issue with steps to reproduce

---

**Last Updated**: 2025-10-08  
**Version**: 1.0.0  
**Author**: AI CV Builder Team
