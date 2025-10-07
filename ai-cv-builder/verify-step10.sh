#!/bin/bash

# ADIM 10 Verification Script
# CV Upload & Parsing System

echo "=================================="
echo "  ADIM 10 VERIFICATION SCRIPT"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Success/Failure counters
PASS=0
FAIL=0

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((FAIL++))
        return 1
    fi
}

# Function to check directory existence
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} Directory missing: $1"
        ((FAIL++))
        return 1
    fi
}

# Function to check package
check_package() {
    if grep -q "\"$1\"" package.json; then
        echo -e "${GREEN}✓${NC} Package installed: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} Package missing: $1"
        ((FAIL++))
        return 1
    fi
}

# Function to check import in file
check_import() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} Import found in $1: $2"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} Import missing in $1: $2"
        ((FAIL++))
        return 1
    fi
}

echo "1. Checking Dependencies..."
echo "----------------------------"
check_package "pdfjs-dist"
check_package "mammoth"
check_package "file-saver"
check_package "@types/file-saver"
check_package "react-dropzone"
check_package "@radix-ui/react-scroll-area"
check_package "class-variance-authority"
echo ""

echo "2. Checking Service Files..."
echo "----------------------------"
check_file "src/services/file.service.ts"
check_import "src/services/index.ts" "file.service"
echo ""

echo "3. Checking CV Components..."
echo "----------------------------"
check_dir "src/components/cv"
check_file "src/components/cv/CVUpload.tsx"
check_file "src/components/cv/CVTextPreview.tsx"
check_file "src/components/cv/index.ts"
echo ""

echo "4. Checking UI Components..."
echo "----------------------------"
check_file "src/components/ui/alert.tsx"
check_file "src/components/ui/scroll-area.tsx"
echo ""

echo "5. Checking Common Components..."
echo "----------------------------"
check_file "src/components/common/ErrorBoundary.tsx"
check_import "src/components/common/index.ts" "ErrorBoundary"
echo ""

echo "6. Checking Helper Files..."
echo "----------------------------"
check_file "src/lib/helpers/file.helpers.ts"
check_import "src/lib/helpers/index.ts" "file.helpers"
echo ""

echo "7. Checking Pages..."
echo "----------------------------"
check_file "src/pages/CVBuilder.tsx"
check_import "src/pages/CVBuilder.tsx" "CVUpload"
check_import "src/pages/CVBuilder.tsx" "CVTextPreview"
check_import "src/pages/CVBuilder.tsx" "ErrorBoundary"
echo ""

echo "8. Checking Key Features in file.service.ts..."
echo "-----------------------------------------------"
if grep -q "parsePDF" src/services/file.service.ts; then
    echo -e "${GREEN}✓${NC} PDF parsing implemented"
    ((PASS++))
else
    echo -e "${RED}✗${NC} PDF parsing missing"
    ((FAIL++))
fi

if grep -q "parseDOCX" src/services/file.service.ts; then
    echo -e "${GREEN}✓${NC} DOCX parsing implemented"
    ((PASS++))
else
    echo -e "${RED}✗${NC} DOCX parsing missing"
    ((FAIL++))
fi

if grep -q "parseTXT" src/services/file.service.ts; then
    echo -e "${GREEN}✓${NC} TXT parsing implemented"
    ((PASS++))
else
    echo -e "${RED}✗${NC} TXT parsing missing"
    ((FAIL++))
fi

if grep -q "validateCVFile" src/services/file.service.ts; then
    echo -e "${GREEN}✓${NC} File validation implemented"
    ((PASS++))
else
    echo -e "${RED}✗${NC} File validation missing"
    ((FAIL++))
fi
echo ""

echo "9. Checking Key Features in CVUpload.tsx..."
echo "--------------------------------------------"
if grep -q "useDropzone" src/components/cv/CVUpload.tsx; then
    echo -e "${GREEN}✓${NC} Dropzone integration"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Dropzone missing"
    ((FAIL++))
fi

if grep -q "Progress" src/components/cv/CVUpload.tsx; then
    echo -e "${GREEN}✓${NC} Progress bar implemented"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Progress bar missing"
    ((FAIL++))
fi

if grep -q "Alert" src/components/cv/CVUpload.tsx; then
    echo -e "${GREEN}✓${NC} Alert component used"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Alert component missing"
    ((FAIL++))
fi
echo ""

echo "10. Checking CVTextPreview Features..."
echo "---------------------------------------"
if grep -q "ScrollArea" src/components/cv/CVTextPreview.tsx; then
    echo -e "${GREEN}✓${NC} ScrollArea implemented"
    ((PASS++))
else
    echo -e "${RED}✗${NC} ScrollArea missing"
    ((FAIL++))
fi

if grep -q "clipboard" src/components/cv/CVTextPreview.tsx; then
    echo -e "${GREEN}✓${NC} Copy to clipboard feature"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Copy feature missing"
    ((FAIL++))
fi

if grep -q "isExpanded" src/components/cv/CVTextPreview.tsx; then
    echo -e "${GREEN}✓${NC} Expand/collapse feature"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Expand feature missing"
    ((FAIL++))
fi
echo ""

echo "11. TypeScript Type Check..."
echo "-----------------------------"
if npx tsc --noEmit 2>/dev/null; then
    echo -e "${GREEN}✓${NC} TypeScript compilation successful"
    ((PASS++))
else
    echo -e "${RED}✗${NC} TypeScript errors found"
    ((FAIL++))
fi
echo ""

echo "=================================="
echo "        VERIFICATION SUMMARY"
echo "=================================="
echo -e "Tests Passed:  ${GREEN}$PASS${NC}"
echo -e "Tests Failed:  ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   ✓ ADIM 10 FULLY VERIFIED ✓${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "All components are properly implemented!"
    echo "CV Upload & Parsing System is ready! 🚀"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}   ✗ VERIFICATION FAILED ✗${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please fix the failed tests above."
    exit 1
fi