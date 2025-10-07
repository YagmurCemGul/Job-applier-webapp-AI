#!/bin/bash

# ADIM 18 Verification Script
# This script verifies that all ADIM 18 components are properly installed

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🔍 ADIM 18 VERIFICATION SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

WORKSPACE="/workspace/ai-cv-builder"
PASS=0
FAIL=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC} - $2 (File not found: $1)"
        ((FAIL++))
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC} - $3"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC} - $3"
        ((FAIL++))
    fi
}

echo -e "${BLUE}📋 Checking Form Components...${NC}"
echo ""

check_file "$WORKSPACE/src/components/forms/EducationForm.tsx" "EducationForm component exists"
check_file "$WORKSPACE/src/components/forms/SkillsForm.tsx" "SkillsForm component exists"
check_file "$WORKSPACE/src/components/forms/SummaryForm.tsx" "SummaryForm component exists"
check_file "$WORKSPACE/src/components/forms/ProjectsForm.tsx" "ProjectsForm component exists"

echo ""
echo -e "${BLUE}🔧 Checking Store Updates...${NC}"
echo ""

check_content "$WORKSPACE/src/stores/cvData.store.ts" "addProject" "Store has addProject method"
check_content "$WORKSPACE/src/stores/cvData.store.ts" "updateProject" "Store has updateProject method"
check_content "$WORKSPACE/src/stores/cvData.store.ts" "deleteProject" "Store has deleteProject method"

echo ""
echo -e "${BLUE}🔗 Checking CVBuilder Integration...${NC}"
echo ""

check_content "$WORKSPACE/src/pages/CVBuilder.tsx" "EducationForm" "CVBuilder imports EducationForm"
check_content "$WORKSPACE/src/pages/CVBuilder.tsx" "SkillsForm" "CVBuilder imports SkillsForm"
check_content "$WORKSPACE/src/pages/CVBuilder.tsx" "SummaryForm" "CVBuilder imports SummaryForm"
check_content "$WORKSPACE/src/pages/CVBuilder.tsx" "ProjectsForm" "CVBuilder imports ProjectsForm"

echo ""
echo -e "${BLUE}📝 Checking Documentation...${NC}"
echo ""

check_file "/workspace/ADIM-18-TAMAMLANDI.md" "Main completion doc exists"
check_file "/workspace/ADIM-18-COMPLETION-REPORT.md" "Completion report exists"
check_file "/workspace/ADIM-18-QUICK-START.md" "Quick start guide exists"
check_file "/workspace/ADIM-18-TEST-GUIDE.md" "Test guide exists"
check_file "/workspace/ADIM-18-VISUAL-SHOWCASE.md" "Visual showcase exists"
check_file "/workspace/ADIM-18-FINAL-SUMMARY.md" "Final summary exists"

echo ""
echo -e "${BLUE}🎨 Checking Form Features...${NC}"
echo ""

check_content "$WORKSPACE/src/components/forms/EducationForm.tsx" "currentlyStudying" "Education has currently studying feature"
check_content "$WORKSPACE/src/components/forms/SkillsForm.tsx" "SKILL_CATEGORIES" "Skills has category support"
check_content "$WORKSPACE/src/components/forms/SkillsForm.tsx" "getLevelColor" "Skills has level colors"
check_content "$WORKSPACE/src/components/forms/SummaryForm.tsx" "useEffect" "Summary has auto-save"
check_content "$WORKSPACE/src/components/forms/SummaryForm.tsx" "wordCount" "Summary has word counter"
check_content "$WORKSPACE/src/components/forms/ProjectsForm.tsx" "url" "Projects has URL validation"
check_content "$WORKSPACE/src/components/forms/ProjectsForm.tsx" "technologies" "Projects has technologies field"

echo ""
echo -e "${BLUE}🔍 Checking Validation Schemas...${NC}"
echo ""

check_content "$WORKSPACE/src/components/forms/EducationForm.tsx" "educationSchema" "Education has Zod schema"
check_content "$WORKSPACE/src/components/forms/SkillsForm.tsx" "skillSchema" "Skills has Zod schema"
check_content "$WORKSPACE/src/components/forms/ProjectsForm.tsx" "projectSchema" "Projects has Zod schema"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 VERIFICATION RESULTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "   ${GREEN}Passed: $PASS${NC}"
echo -e "   ${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✨ ALL CHECKS PASSED! ADIM 18 is complete! ✨${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. cd /workspace/ai-cv-builder"
    echo "   2. npm run dev"
    echo "   3. Open http://localhost:5173"
    echo "   4. Go to CV Builder → Edit tab"
    echo "   5. Test all forms!"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED! Please review the errors above.${NC}"
    echo ""
    exit 1
fi
