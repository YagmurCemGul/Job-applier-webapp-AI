# STEP 47 — File Tree

## Complete File Structure

```
src/
  types/
    skills.types.ts                                    # Types & interfaces

  stores/
    skills.store.ts                                    # Zustand store with persistence

  services/
    skills/
      frameworks.service.ts                            # Seed role frameworks
      inventory.service.ts                             # Infer & manage inventory
      skillGraph.service.ts                            # Link competency→evidence
      pathPlanner.service.ts                           # Generate learning paths
      assessments.service.ts                           # Start/submit attempts
      scoring.service.ts                               # Explainable feedback
      badges.service.ts                                # Award badges
      spacedRep.service.ts                             # SM-2 scheduler
      exportPacket.service.ts                          # Export PDF/GDoc
    integrations/
      calendarSkills.service.ts                        # Schedule study sessions

  components/
    skills/
      SkillDashboard.tsx                               # KPIs & quick actions
      RoleFrameworks.tsx                               # View ladders
      SkillMatrix.tsx                                  # Editable grid
      SkillGraph.tsx                                   # Competency↔evidence viz
      PathPlanner.tsx                                  # Generate paths
      PracticeCenter.tsx                               # Resource browser
      AssessmentCenter.tsx                             # Take assessments
      BadgeWall.tsx                                    # Display badges
      StudyPlanner.tsx                                 # SM-2 review
      GrowthPacketActions.tsx                          # Export actions

  pages/
    Career.tsx                                         # Main page with 10 tabs

  i18n/
    en/
      skills.json                                      # English translations
    tr/
      skills.json                                      # Turkish translations

  tests/
    unit/
      frameworks_seed.spec.ts                          # Framework seeding tests
      inventory_infer.spec.ts                          # Inventory inference tests
      graph_linking.spec.ts                            # Graph linking tests
      path_planner.spec.ts                             # Path planning tests
      assessment_scoring.spec.ts                       # Scoring tests
      sm2_scheduler.spec.ts                            # SM-2 scheduler tests
      badges_award.spec.ts                             # Badge award tests
      export_packet.spec.ts                            # Export tests
    integration/
      inventory_to_path_flow.spec.ts                   # Infer→plan→schedule flow
      practice_to_assessment_loop.spec.ts              # Practice→assess→badge loop
      study_calendar_email.spec.ts                     # Calendar & email integration
      growth_packet_and_promo_feedback.spec.ts         # Export & Step 46 integration
    e2e/
      step47-skill-matrix.spec.ts                      # Full E2E user journey

  docs/
    STEP-47-NOTES.md                                   # Implementation documentation

root/
  STEP-47-COMPLETION-SUMMARY.md                        # Completion summary
  STEP-47-FILE-TREE.md                                 # This file
```

## File Count Summary

| Category | Count | Files |
|----------|-------|-------|
| **Types** | 1 | `skills.types.ts` |
| **Stores** | 1 | `skills.store.ts` |
| **Services** | 10 | 9 skill services + 1 integration service |
| **Components** | 10 | All skill-related components |
| **Pages** | 1 | `Career.tsx` |
| **i18n** | 2 | English + Turkish |
| **Unit Tests** | 8 | Framework, inventory, graph, path, assessment, SM-2, badges, export |
| **Integration Tests** | 4 | Inventory flow, practice loop, calendar/email, growth packet |
| **E2E Tests** | 1 | Full skill matrix journey |
| **Documentation** | 1 | `STEP-47-NOTES.md` |
| **Root Docs** | 2 | Completion summary + file tree |
| **TOTAL** | **41** | **All files created** |

## Lines of Code Estimate

| Category | Files | Est. LOC |
|----------|-------|----------|
| Types | 1 | ~180 |
| Stores | 1 | ~100 |
| Services | 10 | ~1,400 |
| Components | 10 | ~4,500 |
| Pages | 1 | ~100 |
| i18n | 2 | ~200 |
| Unit Tests | 8 | ~2,000 |
| Integration Tests | 4 | ~1,500 |
| E2E Tests | 1 | ~300 |
| Documentation | 3 | ~1,000 |
| **TOTAL** | **41** | **~11,280 LOC** |

## Key Dependencies

### External
- `zustand` — State management
- `zustand/middleware` — Persistence
- `react-i18next` — Internationalization
- `lucide-react` — Icons
- `@/components/ui/*` — shadcn/ui components

### Internal (Steps Integration)
- Step 45 (Onboarding) → `goalProgress()` from `evidenceGraph.service`
- Step 46 (Performance) → `usePerf` store, rubric mapping
- Step 38/40/43 → Evidence artifacts via `evidenceRefId`
- Step 35 (Calendar/Gmail) → `getBearer()`, `calendarCreate()`, timezone utils
- Step 30 (Docs) → `exportHTMLToGoogleDoc()`

## Next Steps for Integration

1. **Add route** to Career page in app router (if exists)
2. **Test in browser** at `/career` route
3. **Seed framework** on first load (auto-triggered)
4. **Link evidence** from existing Step 38/40/43 artifacts
5. **Plan path** and schedule study sessions
6. **Export Growth Packet** and verify PDF/GDoc generation
7. **Feed to Step 46** Promotion Readiness for improved metrics

## Commit

```bash
git add src/types/skills.types.ts \
        src/stores/skills.store.ts \
        src/services/skills/*.ts \
        src/services/integrations/calendarSkills.service.ts \
        src/components/skills/*.tsx \
        src/pages/Career.tsx \
        src/i18n/en/skills.json \
        src/i18n/tr/skills.json \
        src/tests/unit/*seed*.spec.ts \
        src/tests/unit/*infer*.spec.ts \
        src/tests/unit/*graph*.spec.ts \
        src/tests/unit/*path*.spec.ts \
        src/tests/unit/*assessment*.spec.ts \
        src/tests/unit/*sm2*.spec.ts \
        src/tests/unit/*badges*.spec.ts \
        src/tests/unit/*export*.spec.ts \
        src/tests/integration/*inventory*.spec.ts \
        src/tests/integration/*practice*.spec.ts \
        src/tests/integration/*study*.spec.ts \
        src/tests/integration/*growth*.spec.ts \
        src/tests/e2e/step47-skill-matrix.spec.ts \
        src/docs/STEP-47-NOTES.md \
        STEP-47-COMPLETION-SUMMARY.md \
        STEP-47-FILE-TREE.md

git commit -m "feat(skills): Skill Matrix & Career Ladder Navigator — frameworks, inventory, skill↔goal↔evidence graph, AI learning paths, assessments with explainable scoring, badges, SM-2 spaced repetition, calendar/email scheduling, and growth packet export"
```
