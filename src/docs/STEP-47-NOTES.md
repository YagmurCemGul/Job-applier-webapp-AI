# STEP 47 — Skill Matrix & Career Ladder Navigator

## Overview

A comprehensive skill development and career planning system that runs continuously alongside Onboarding (Step 45) and Performance & Promotion (Step 46). Provides role frameworks, competency tracking, AI-planned learning paths, assessments with explainable scoring, badges, spaced repetition for retention, and growth packet exports.

## Architecture

### Types (`src/types/skills.types.ts`)
- **LevelKey**: L3-L7 career levels
- **SkillKind**: technical, product, people, process, domain
- **ResourceKind**: course, doc, video, lab, repo, quiz, flashcard
- **AssessmentKind**: quiz, code, case
- **BadgeTier**: bronze, silver, gold, platinum

Core entities:
- `RoleFramework`: role + ladder + competencies
- `Competency`: skill with level bars and rubric mapping (Step 46)
- `SkillInventoryRow`: self-assessment with confidence
- `SkillEvidenceLink`: competency ↔ goal/evidence graph
- `LearningPath`: AI-planned steps from current → target level
- `Assessment` & `Attempt`: quizzes/rubrics with transparent scoring
- `Badge`: milestone achievements
- `Flashcard`: SM-2 spaced repetition
- `GrowthPacketExport`: PDF/Google Doc export

### Store (`src/stores/skills.store.ts`)
Zustand with localStorage persistence:
- frameworks, inventory, evidence, resources, paths
- assessments, attempts, badges, cards, exports
- `byCompetency(key)`: aggregated view for a competency

### Services

#### Frameworks & Inventory
- `frameworks.service.ts`: seed default IC/Manager ladders
- `inventory.service.ts`: infer from evidence/goals, upsert rows
- `skillGraph.service.ts`: link competency → evidence, track delta

#### Learning & Assessment
- `pathPlanner.service.ts`: greedy planner (difficulty ascending, daily cap)
- `assessments.service.ts`: start attempts, submit with quiz+rubric
- `scoring.service.ts`: explainable feedback (60% quiz, 40% rubric)
- `badges.service.ts`: award bronze/silver/gold based on attempts & inventory

#### Retention & Export
- `spacedRep.service.ts`: SM-2 scheduler, due cards, EF/interval updates
- `exportPacket.service.ts`: HTML → PDF/Google Doc with disclaimer
- `calendarSkills.service.ts`: schedule study sessions (Step 35 Calendar)

### Components (`src/components/skills/`)

1. **SkillDashboard**: KPIs (skills at bar, study minutes, due cards, badges), quick actions
2. **RoleFrameworks**: view ladders, competency bars, link to rubrics (Step 46)
3. **SkillMatrix**: editable grid, infer from evidence, keyboard nav
4. **SkillGraph**: competencies ↔ evidence ↔ goals, progress deltas
5. **PathPlanner**: target level + daily cap → generate path → schedule/email
6. **PracticeCenter**: resource browser, create flashcards, add to queue
7. **AssessmentCenter**: quiz UI, rubric entry, explainable feedback, badge triggers
8. **BadgeWall**: badges by tier, filters, next-step hints
9. **StudyPlanner**: SM-2 review, 0–5 quality rating, streak counter
10. **GrowthPacketActions**: disclaimer banner, export PDF/GDoc, email to self

### Page (`src/pages/Career.tsx`)
Tabs: Dashboard, Frameworks, Matrix, Graph, Path, Practice, Assessments, Badges, Study, Packet

## Privacy & Compliance

- **Educational, not certification**: Scores and badges are guidance only
- **Privacy-first**: Local by default; explicit export/email actions
- **Fairness**: Transparent rubrics, no demographic descriptors, content-focused
- **A11y**: Keyboard nav (P=Plan Path, R=Review cards), aria-live for saves, WCAG AA contrast

## Integrations

- **Step 45 (Onboarding)**: links to goals via `SkillEvidenceLink.goalId`
- **Step 46 (Performance)**: maps competencies to rubrics (e.g., system_design → structure), feeds improved per-rubric inputs to Promotion Readiness
- **Step 38/40/43**: evidence from artifacts (`evidenceRefId`)
- **Step 35 (Calendar)**: schedule study sessions via `calendarSkills.service`
- **Step 30 (Docs)**: export Growth Packet to Google Doc

## Key Algorithms

### Inference (inventory.service.ts)
```ts
inferInventoryFromEvidence(competencyKey) {
  delta = sum(evidence.delta)
  goalBoost = 0.25 per goal with progress > 0
  confidenceBump = +5 if rubric feedback exists
  return { selfLevel: min(4, max(0, ...)), confidencePct: min(100, ...) }
}
```

### Path Planning (pathPlanner.service.ts)
```ts
planPath(target, dailyCap) {
  for each competency {
    if current < target bar {
      pick resources by difficulty ascending
      add steps until need met or minutes > dailyCap
    }
  }
  return { steps, totalMinutes }
}
```

### Assessment Scoring (assessments.service.ts)
```ts
scorePct = (quizPct * 0.6) + (rubricPct * 0.4)
```

### SM-2 Spaced Repetition (spacedRep.service.ts)
```ts
reviewCard(cardId, quality: 0..5) {
  if quality >= 3 {
    ef = max(1.3, ef + (0.1 - (5-quality)*(0.08 + (5-quality)*0.02)))
    reps += 1
    interval = reps===1 ? 1 : reps===2 ? 6 : round(interval * ef)
  } else {
    reps = 0, interval = 1
  }
  dueISO = now + interval days
}
```

### Badge Award (badges.service.ts)
```ts
evaluateBadges(competencyKey) {
  tier = inventory.selfLevel >= 3 ? 'gold'
       : passingAttempts >= 2 ? 'silver'
       : passingAttempts >= 1 ? 'bronze'
       : undefined
}
```

## Testing

### Unit Tests (8 specs)
- `frameworks_seed.spec.ts`: seeds ladder, idempotent
- `inventory_infer.spec.ts`: evidence deltas → level/confidence
- `graph_linking.spec.ts`: competency → evidence, progress aggregation
- `path_planner.spec.ts`: difficulty ascending, daily cap, total minutes
- `assessment_scoring.spec.ts`: quiz+rubric weighted 60/40, feedback HTML
- `sm2_scheduler.spec.ts`: EF/interval changes, due date advances, reset on fail
- `badges_award.spec.ts`: bronze/silver/gold thresholds
- `export_packet.spec.ts`: HTML includes inventory/path/badges, pdf/gdoc branches

### Integration Tests (4 specs)
- `inventory_to_path_flow.spec.ts`: infer → plan → save → schedule (mock)
- `practice_to_assessment_loop.spec.ts`: flashcards → review → assess → badge
- `study_calendar_email.spec.ts`: schedule sessions (mock), email plan (mock)
- `growth_packet_and_promo_feedback.spec.ts`: export → feed to Step 46 → verify higher readiness

### E2E Test
- `step47-skill-matrix.spec.ts`: browse framework → update matrix → link evidence → plan path → practice/assess → earn badges → review cards → export packet

## i18n

**English (`en/skills.json`)**
- dashboard, frameworks, matrix, graph, path, practice, assessments, badges, study, packet
- planPath, scheduleStudy, reviewCards, exportPacket
- educational: "Educational guidance — not certification."

**Turkish (`tr/skills.json`)**
- Yetenek Paneli, Rol Çerçeveleri, Yetenek Matrisi, etc.
- educational: "Eğitsel yönlendirme — sertifika değildir."

## Extensibility

- **Import frameworks**: CSV/JSON upload for custom ladders
- **External resources**: plug LMS providers (Coursera, Udemy) via API
- **Embeddings**: recommend resources via semantic search
- **Promo integration**: auto-populate promotion packet with skills evidence
- **Team view**: manager dashboards for org skill gaps (future)

## Acceptance Criteria

✅ Default framework seeds with L3–L6 ladder and 5 competencies  
✅ Inventory inferred from evidence/goals, editable manually  
✅ Graph links competencies → goals/evidence with delta aggregation  
✅ Path Planner generates steps respecting difficulty & daily cap  
✅ Practice creates flashcards, Assessments score with quiz+rubric  
✅ Badges awarded (bronze/silver/gold), displayed on Badge Wall  
✅ SM-2 spaced repetition schedules due cards, updates EF/interval  
✅ Growth Packet exports to PDF/Google Doc with disclaimer  
✅ Calendar scheduling mocked for study sessions  
✅ Step 46 Promotion Readiness consumes improved metrics  
✅ Tests pass (unit, integration, e2e)  
✅ WCAG AA, keyboard nav, aria-live announcements  
✅ No console errors  

## Usage Flow

1. **Setup**: Seed framework (auto on mount) → view in Frameworks tab
2. **Track Skills**: Link evidence in Graph → infer inventory in Matrix → adjust manually
3. **Plan Path**: Choose target level → set daily cap → generate path → schedule study
4. **Practice**: Browse resources → create flashcards → review with SM-2
5. **Assess**: Take quizzes/code challenges → receive explainable score → earn badges
6. **Export**: Review Growth Packet → export PDF/GDoc → email to self
7. **Promotion**: Improved per-rubric inputs feed Step 46 → higher readiness score

## Commit Message

```
feat(skills): Skill Matrix & Career Ladder Navigator — frameworks, inventory, skill↔goal↔evidence graph, AI learning paths, assessments with explainable scoring, badges, SM-2 spaced repetition, calendar/email scheduling, and growth packet export
```
