# Step 45 — Onboarding & 30/60/90 Day Success System

## Overview

The Onboarding & 30/60/90 Success System activates after an offer is accepted (Step 44) and provides:

- **Pre-start checklist** for IT, HR, equipment, and policy setup
- **30/60/90 plan** with SMART goals, metrics, and dependencies
- **Stakeholder mapping** with power/interest matrix
- **Cadence scheduling** for manager 1:1s, mentor syncs, and buddy check-ins
- **Weekly status reports** with AI suggestions, Gmail integration, and Google Docs export
- **Risk logging** with probability/impact scoring
- **Learning plan** seeded by role with courses, docs, repos, and mentors
- **Resources vault** for onboarding links and documentation

## What's Included

### 1. Planning & Goals

#### SMART Goals
- **Title, Description, Metric, Target, Due Date**
- Validation ensures goals have measurable outcomes
- Organized by milestone (30/60/90 days)
- Priority levels (P0, P1, P2)
- Status tracking (not_started, in_progress, blocked, done)
- Tags for categorization

#### Plan Drafting
- AI-powered generation from offer details, interview notes, and past highlights
- Automatic goal distribution across milestones
- Dependencies tracking (tools, access, people)

### 2. Pre-Start Checklist

Default items include:
- Employment documents
- Background check
- Payroll setup
- Equipment requests
- Email and 2FA setup
- Handbook review
- Roadmap familiarization
- Travel/remote confirmation

Features:
- Custom item creation
- Due dates and notes
- Bulk toggle
- CSV export

### 3. Stakeholder Mapping

**Power/Interest Matrix:**
- **Manage Closely** (High Power + High Interest)
- **Keep Satisfied** (High Power + Low Interest)
- **Keep Informed** (Low Power + High Interest)
- **Monitor** (Low Power + Low Interest)

Each stakeholder includes:
- Name, email, role, org
- Power and interest ratings (1-5)
- Meeting cadence preferences
- Contextual notes

### 4. Cadence Scheduling

Automatic generation of:
- **Manager 1:1** (weekly)
- **Mentor Sync** (biweekly)
- **Buddy Check-in** (weekly)
- **Team Ceremony** (weekly)

Features:
- Timezone support
- Quiet hours respect (22:00–07:00 local)
- Calendar integration (Google Calendar)
- Recurrence patterns
- Attendee management

### 5. Weekly Reports

**Sections:**
- Accomplishments (from completed goals)
- Risks (blockers and concerns)
- Asks (requests for help/resources)
- Next Week (upcoming priorities)

**Distribution:**
- Gmail integration for sending
- Google Docs export
- HTML preview
- AI-powered composition from selected goals

### 6. Risk & Learning

#### Risk Log
- Probability × Impact scoring (1-25)
- Auto-classification (low/medium/high)
- Mitigation plans
- Owner assignment
- Status tracking (open/watch/mitigating/closed)
- CSV export

#### Learning Plan
- Role-based seeding (engineers, PMs, etc.)
- Multiple resource types (course, doc, repo, person, video)
- URL tracking
- Status progression (planned → in_progress → done)
- Due dates

### 7. Resources Vault

Centralized repository for:
- Company handbook
- Team runbooks
- Security docs
- Architecture diagrams
- Dashboard links

Features:
- Tagging system
- Search functionality
- External link support

## Privacy & Consent

- **Local-first storage**: All data persists in browser localStorage
- **Explicit consent**: Calendar and email actions require user confirmation
- **No automatic sends**: All communications are user-initiated
- **Data retention**: Users control data lifecycle

## Accessibility (WCAG AA)

- **Keyboard navigation**: All components support Tab, Enter, Escape
- **Focus indicators**: Visible focus rings on all interactive elements
- **ARIA labels**: Screen reader support for all actions
- **Color contrast**: ≥4.5:1 for normal text, ≥3:1 for large text
- **aria-live regions**: Save/sync status announcements

## Quiet Hours

- Default: 22:00–07:00 local time (configurable)
- Calendar events automatically shifted to working hours
- Warnings displayed when scheduling near boundaries
- Respects Step 41 networking conventions

## Integration Points

### Step 33 — Applications Timeline
- Start onboarding from accepted offers
- Link plan to application ID

### Step 38 — Evidence/OKRs/1:1s
- Pull evidence for accomplishments
- Link goals to OKRs
- Agenda items from 1:1s

### Step 39 — Self-Review
- Use highlights for plan generation
- Quote accomplishments in reports

### Step 40 — Portfolio
- Reference portfolio projects in goals
- Showcase onboarding deliverables

### Step 41 — Pipeline/Networking
- Update pipeline stage to "Onboarding"
- Stakeholder contacts from network

### Step 43 — Interview Coach
- Interview notes inform plan
- Timezone utilities for scheduling

### Step 44 — Offer & Negotiation
- Trigger on offer acceptance
- Pull company/role details
- Link start date

## File Structure

```
src/
  types/onboarding.types.ts          # SMART goals, plans, cadences, risks, learning
  stores/
    onboarding.store.ts              # Plan, checklist, cadences, reports, risks, learning
    stakeholders.store.ts            # Stakeholder matrix
  services/onboarding/
    planDraft.service.ts             # AI-powered plan generation
    smartGoal.service.ts             # SMART validation & formatting
    checklist.service.ts             # Default checklist
    stakeholders.service.ts          # Power/interest quadrants
    cadences.service.ts              # Meeting scheduling with quiet hours
    weeklyReport.service.ts          # Report composition & Gmail send
    risk.service.ts                  # Probability/impact scoring
    learning.service.ts              # Role-based seeding
    exportPacket.service.ts          # PDF/Google Doc export
  services/integrations/
    calendarOnboarding.service.ts    # Calendar API wrapper
  components/onboarding/
    OnboardingDashboard.tsx          # KPIs & quick actions
    PreStartChecklist.tsx            # Checklist management
    PlanEditor.tsx                   # SMART goals editor
    StakeholderMapNew.tsx            # Matrix view & add form
    CadenceScheduler.tsx             # Meeting setup
    ProgressTracker.tsx              # Goal completion charts
    WeeklyReportComposerNew.tsx      # Report creation
    RiskLog.tsx                      # Risk tracking
    LearningPlan.tsx                 # Learning resources
    ResourcesVault.tsx               # Links & docs
  pages/
    Applications.tsx                 # "Start Onboarding" action
    Onboarding.tsx                   # Main onboarding suite
  tests/
    unit/                            # 8 unit test files
    integration/                     # 3 integration test files
    e2e/                             # 1 e2e test file
```

## Testing

### Unit Tests (8 files)
- `smart_goal.spec.ts`: SMART validation, bullet formatting
- `plan_draft.spec.ts`: AI generation, goal distribution
- `stakeholders_matrix.spec.ts`: Quadrant classification
- `cadences_quiet_hours.spec.ts`: Scheduling, quiet hour shifts
- `weekly_report.spec.ts`: HTML composition, sections
- `risk_score.spec.ts`: Probability/impact math
- `learning_plan.spec.ts`: Role-based seeding
- `export_packet.spec.ts`: PDF/Doc generation

### Integration Tests (3 files)
- `accept_to_plan_flow.spec.ts`: Offer → Plan → Checklist → Store
- `cadences_and_reminders.spec.ts`: Build → Calendar → Store
- `weekly_email_and_doc.spec.ts`: Compose → Email → Doc

### E2E Test (1 file)
- `step45-onboarding-success.spec.ts`: Complete user flow with Playwright

## Extensibility

### Custom Templates
Add company/role-specific templates:
```typescript
// In planDraft.service.ts
const templates = {
  'Google_Engineer': { goals: [...], deps: [...] },
  'Amazon_PM': { goals: [...], deps: [...] }
};
```

### Integration Adapters
- **Notion**: Sync plan to Notion workspace
- **Slack**: Post weekly reports to team channel
- **JIRA**: Create tickets from dependencies
- **Confluence**: Export plan to wiki

### Custom Cadences
Extend `CadenceKind`:
```typescript
export type CadenceKind = 
  | 'manager_1_1' | 'mentor' | 'buddy' 
  | 'team_ceremony' | 'cross_func' | 'skip_level'
  | 'custom';
```

## Non-HR Disclaimer

⚠️ **Educational Planning — Not Official HR Policy**

This tool provides *suggestions* for onboarding planning. Always:
- Verify plans with your manager and HR
- Follow official company onboarding procedures
- Respect organizational hierarchies
- Align goals with team OKRs

## Troubleshooting

### Calendar Events Not Creating
- Check Google OAuth credentials
- Verify calendar API enabled
- Confirm bearer token refresh

### AI Suggestions Empty
- Ensure highlights/interview notes exist
- Check aiComplete mock in tests
- Verify API key configuration

### Quiet Hours Not Applying
- Confirm timezone format (IANA, e.g., "America/New_York")
- Check withinQuietHours calculation
- Verify default hours (22:00–07:00)

## Future Enhancements

1. **Multi-company plans**: Support multiple onboarding plans
2. **Team templates**: Share plans across organization
3. **Progress analytics**: Visualize completion trends
4. **Peer comparisons**: Anonymized benchmarks
5. **Mobile app**: On-the-go checklist and reports
6. **AI coaching**: Proactive suggestions based on blockers
7. **Integration marketplace**: Pre-built connectors for popular tools

## Related Documentation

- [Step 33 — Applications Timeline](./STEP-33-NOTES.md)
- [Step 38 — Evidence & OKRs](./STEP-38-NOTES.md)
- [Step 39 — Self-Review](./STEP-39-NOTES.md)
- [Step 40 — Portfolio](./STEP-40-NOTES.md)
- [Step 41 — Pipeline](./STEP-41-NOTES.md)
- [Step 43 — Interview Coach](./STEP-43-NOTES.md)
- [Step 44 — Offer & Negotiation](./STEP-44-NOTES.md)

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-09  
**Maintainer**: AI Career Assistant Team
