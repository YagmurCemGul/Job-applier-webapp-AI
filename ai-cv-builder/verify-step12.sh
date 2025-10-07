#!/bin/bash

echo "================================"
echo "ADIM 12 Verification Script"
echo "AI CV Optimization Integration"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASS=0
FAIL=0

# Test function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1 - Missing!"
        ((FAIL++))
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contains '$3'"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1 missing '$3'"
        ((FAIL++))
    fi
}

echo "1. Environment Files"
echo "-------------------"
check_file ".env"
check_file ".env.example"
check_content ".env.example" "VITE_ANTHROPIC_API_KEY" "API key config"
echo ""

echo "2. AI Service"
echo "-------------"
check_file "src/services/ai.service.ts"
check_content "src/services/ai.service.ts" "OptimizationRequest" "Request interface"
check_content "src/services/ai.service.ts" "OptimizationResult" "Result interface"
check_content "src/services/ai.service.ts" "OptimizationChange" "Change interface"
check_content "src/services/ai.service.ts" "claude-sonnet-4-20250514" "Claude model"
check_content "src/services/ai.service.ts" "getMockOptimization" "Mock data"
echo ""

echo "3. Optimization Store"
echo "--------------------"
check_file "src/store/optimizationStore.ts"
check_content "src/store/optimizationStore.ts" "useOptimizationStore" "Store hook"
check_content "src/store/optimizationStore.ts" "toggleChange" "Toggle function"
check_content "src/store/optimizationStore.ts" "revertChange" "Revert function"
check_content "src/store/optimizationStore.ts" "applyAllChanges" "Apply all function"
echo ""

echo "4. UI Components"
echo "----------------"
check_file "src/components/ui/tooltip.tsx"
check_file "src/components/optimization/ATSScore.tsx"
check_file "src/components/optimization/OptimizationChanges.tsx"
check_file "src/components/optimization/index.ts"
check_content "src/components/optimization/ATSScore.tsx" "TrendingUp" "ATS Score icons"
check_content "src/components/optimization/ATSScore.tsx" "getScoreColor" "Score color function"
check_content "src/components/optimization/OptimizationChanges.tsx" "toggleExpand" "Expand function"
check_content "src/components/optimization/OptimizationChanges.tsx" "getChangeTypeColor" "Badge color function"
echo ""

echo "5. CV Builder Integration"
echo "-------------------------"
check_file "src/pages/CVBuilder.tsx"
check_content "src/pages/CVBuilder.tsx" "ATSScore" "ATS Score component import"
check_content "src/pages/CVBuilder.tsx" "OptimizationChanges" "Changes component import"
check_content "src/pages/CVBuilder.tsx" "useOptimizationStore" "Store import"
check_content "src/pages/CVBuilder.tsx" "handleOptimize" "Optimize function"
check_content "src/pages/CVBuilder.tsx" "Sparkles" "Optimize button icon"
echo ""

echo "6. Service & Store Exports"
echo "--------------------------"
check_content "src/services/index.ts" "ai.service" "AI service export"
check_content "src/store/index.ts" "optimizationStore" "Optimization store export"
echo ""

echo "7. Dependencies"
echo "---------------"
if grep -q "@radix-ui/react-tooltip" "package.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} @radix-ui/react-tooltip installed"
    ((PASS++))
else
    echo -e "${RED}✗${NC} @radix-ui/react-tooltip not installed"
    ((FAIL++))
fi
echo ""

echo "8. Build Test"
echo "-------------"
echo -e "${YELLOW}Running build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Build failed"
    ((FAIL++))
fi
echo ""

echo "================================"
echo "Verification Complete"
echo "================================"
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ADIM 12 TAMAMLANDI!${NC}"
    echo ""
    echo "🎉 All checks passed! AI CV Optimization is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Add your Claude API key to .env file"
    echo "2. Run: npm run dev"
    echo "3. Test the optimization workflow"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review the errors above.${NC}"
    exit 1
fi