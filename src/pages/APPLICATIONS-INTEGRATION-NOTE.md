# Applications Page Integration

This note describes how to integrate the Onboarding suite with the Applications page.

## Integration Steps

When an application reaches "Accepted" status, add the following actions:

### 1. Start Onboarding Button

```tsx
import { useOnboarding } from '@/stores/onboarding.store';
import { defaultMilestones, seedTasks } from '@/services/onboarding/planBuilder.service';
import { useNavigate } from 'react-router-dom';
import type { OnboardingPlan } from '@/types/onboarding.types';

// In your Applications component
const { upsert } = useOnboarding();
const navigate = useNavigate();

const handleStartOnboarding = (application: Application) => {
  const plan: OnboardingPlan = {
    id: crypto.randomUUID(),
    applicationId: application.id,
    role: application.position,
    company: application.company,
    startDateISO: application.startDate, // if available
    stage: 'draft',
    lang: 'en', // or get from i18n
    milestones: defaultMilestones(),
    tasks: seedTasks(application.position),
    checklists: [],
    stakeholders: [],
    evidence: [],
    retentionDays: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  upsert(plan);
  navigate(`/onboarding/${plan.id}`);
};

// In render:
{application.status === 'accepted' && (
  <Button onClick={() => handleStartOnboarding(application)}>
    {t('onboarding.start')}
  </Button>
)}
```

### 2. Open Existing Plan Button

```tsx
// Check if plan exists for this application
const { plans } = useOnboarding();
const existingPlan = plans.find(p => p.applicationId === application.id);

{existingPlan && (
  <Button 
    variant="outline" 
    onClick={() => navigate(`/onboarding/${existingPlan.id}`)}
  >
    {t('onboarding.openPlan')}
  </Button>
)}
```

### 3. Routing

Add the following route to your app's router:

```tsx
import { Onboarding } from '@/pages/Onboarding';

// In your route configuration:
<Route path="/onboarding/:planId" element={<Onboarding />} />
```

## Features Available

- **Plan Builder**: 30/60/90 day planning with AI personalization
- **Stakeholder Map**: Influence/interest matrix with 1:1 scheduling
- **1:1 Agendas**: Meeting notes with AI action extraction
- **OKRs**: Objectives and key results tracking
- **Weekly Reports**: Compose and send updates via Gmail
- **Evidence Binder**: Collect wins and export to PDF/Docs
- **Progress Dashboard**: KPIs and milestone tracking
- **Checklists**: IT/HR/policies/equipment setup

## Data Flow

1. Application (Step 33) → Onboarding Plan (Step 38)
2. Onboarding Plan ← Gmail/Calendar (Step 35) for 1:1s and reports
3. Evidence → PDF/Docs export (Step 30)
4. AI features → Orchestrator (Step 31) for personalization and action extraction

## Privacy & Consent

- ConsentMiningBanner appears on first visit
- Calendar/email suggestions require explicit opt-in
- Only user's own data is accessed
- Retention periods enforced (30/60/90/180/365 days)
