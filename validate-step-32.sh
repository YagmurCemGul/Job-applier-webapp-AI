#!/bin/bash

# Step 32 - Job Sources Ingestion & Discovery - Validation Script

echo "=========================================="
echo "Step 32 - Jobs System Validation"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project directory
cd "$(dirname "$0")/ai-cv-builder" || exit 1

echo "📁 Checking file structure..."
echo ""

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    return 0
  else
    echo -e "${RED}✗${NC} $1 (MISSING)"
    return 1
  fi
}

# Check types
echo "Types:"
check_file "src/types/jobs.types.ts"
check_file "src/types/searches.types.ts"
echo ""

# Check stores
echo "Stores:"
check_file "src/stores/jobs.store.ts"
check_file "src/stores/jobSearches.store.ts"
check_file "src/stores/jobScheduler.store.ts"
check_file "src/stores/jobSources.store.ts"
echo ""

# Check core services
echo "Core Services:"
check_file "src/services/jobs/compliance.service.ts"
check_file "src/services/jobs/http.service.ts"
check_file "src/services/jobs/normalize.service.ts"
check_file "src/services/jobs/dedupe.service.ts"
check_file "src/services/jobs/searchIndex.service.ts"
check_file "src/services/jobs/scheduler.service.ts"
check_file "src/services/jobs/alerts.service.ts"
check_file "src/services/jobs/upsert.service.ts"
echo ""

# Check adapters
echo "Adapters:"
check_file "src/services/jobs/adapters/runAll.ts"
check_file "src/services/jobs/adapters/rss.adapter.ts"
check_file "src/services/jobs/adapters/linkedin.api.adapter.ts"
check_file "src/services/jobs/adapters/indeed.api.adapter.ts"
check_file "src/services/jobs/adapters/glassdoor.api.adapter.ts"
check_file "src/services/jobs/adapters/linkedin.html.adapter.ts"
check_file "src/services/jobs/adapters/indeed.html.adapter.ts"
check_file "src/services/jobs/adapters/glassdoor.html.adapter.ts"
check_file "src/services/jobs/adapters/kariyernet.html.adapter.ts"
echo ""

# Check components
echo "Components:"
check_file "src/components/jobs/JobFinderPage.tsx"
check_file "src/components/jobs/JobFilters.tsx"
check_file "src/components/jobs/JobList.tsx"
check_file "src/components/jobs/JobCard.tsx"
check_file "src/components/jobs/JobDetailDrawer.tsx"
check_file "src/components/jobs/SaveSearchDialog.tsx"
check_file "src/components/jobs/SourceSettingsDialog.tsx"
check_file "src/components/jobs/FetchRunLog.tsx"
echo ""

# Check pages
echo "Pages:"
check_file "src/pages/JobListings.tsx"
echo ""

# Check i18n
echo "i18n:"
check_file "src/i18n/en/jobs.json"
check_file "src/i18n/tr/jobs.json"
echo ""

# Check tests
echo "Tests:"
check_file "src/tests/unit/normalize.service.spec.ts"
check_file "src/tests/unit/dedupe.service.spec.ts"
check_file "src/tests/unit/searchIndex.service.spec.ts"
check_file "src/tests/unit/compliance.service.spec.ts"
check_file "src/tests/unit/scheduler.service.spec.ts"
check_file "src/tests/unit/jobs.store.spec.ts"
check_file "src/tests/unit/jobSearches.store.spec.ts"
check_file "src/tests/integration/adapters.rss.spec.ts"
check_file "src/tests/integration/adapters.html.stubs.spec.ts"
check_file "src/tests/e2e/step32-jobs-flow.spec.ts"
echo ""

# Check documentation
echo "Documentation:"
check_file "src/docs/STEP-32-NOTES.md"
echo ""

echo "=========================================="
echo "Validation Summary"
echo "=========================================="
echo ""

# Count files
EXPECTED_FILES=48
ACTUAL_FILES=$(find src -type f \( -path "*/jobs/*" -o -path "*/searches.types.ts" -o -path "*/jobs.types.ts" -o -path "*/*jobs*.spec.ts" -o -path "*/STEP-32-NOTES.md" \) 2>/dev/null | wc -l)

echo "Expected files: $EXPECTED_FILES"
echo "Found files: $ACTUAL_FILES"
echo ""

if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} Dependencies installed"
else
  echo -e "${YELLOW}⚠${NC} Dependencies not installed - run: npm install"
fi

echo ""
echo "Next steps:"
echo "1. Run: npm install (if not done)"
echo "2. Run: npm run dev"
echo "3. Navigate to: /jobs"
echo "4. Run tests: npm test"
echo ""
echo "For detailed documentation, see:"
echo "  - src/docs/STEP-32-NOTES.md"
echo "  - /workspace/STEP-32-COMPLETION-REPORT.md"
echo ""
echo "=========================================="
