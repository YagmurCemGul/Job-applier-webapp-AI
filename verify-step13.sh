#!/bin/bash

echo "========================================="
echo "STEP 13 VERIFICATION - CV PREVIEW & EXPORT"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
passed=0
failed=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((failed++))
        return 1
    fi
}

# Function to check if string exists in file
check_content() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} Found '$2' in $1"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} Missing '$2' in $1"
        ((failed++))
        return 1
    fi
}

# Function to check npm package
check_package() {
    if grep -q "\"$1\"" "ai-cv-builder/package.json"; then
        echo -e "${GREEN}✓${NC} Package installed: $1"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} Package missing: $1"
        ((failed++))
        return 1
    fi
}

echo "1. Checking Required Packages..."
echo "================================"
check_package "jspdf"
check_package "html2canvas"
check_package "docx"
check_package "file-saver"
echo ""

echo "2. Checking Export Service..."
echo "============================="
check_file "ai-cv-builder/src/services/export.service.ts"
check_content "ai-cv-builder/src/services/export.service.ts" "exportAsPDF"
check_content "ai-cv-builder/src/services/export.service.ts" "exportAsDOCX"
check_content "ai-cv-builder/src/services/export.service.ts" "exportAsTXT"
check_content "ai-cv-builder/src/services/export.service.ts" "exportToGoogleDocs"
check_content "ai-cv-builder/src/services/export.service.ts" "generateFileName"
echo ""

echo "3. Checking CV Preview Component..."
echo "==================================="
check_file "ai-cv-builder/src/components/cv/CVPreviewFull.tsx"
check_content "ai-cv-builder/src/components/cv/CVPreviewFull.tsx" "CVPreviewFull"
check_content "ai-cv-builder/src/components/cv/CVPreviewFull.tsx" "formatContent"
check_content "ai-cv-builder/src/components/cv/CVPreviewFull.tsx" "atsScore"
echo ""

echo "4. Checking Export Options Component..."
echo "======================================="
check_file "ai-cv-builder/src/components/export/ExportOptions.tsx"
check_file "ai-cv-builder/src/components/export/index.ts"
check_content "ai-cv-builder/src/components/export/ExportOptions.tsx" "ExportOptions"
check_content "ai-cv-builder/src/components/export/ExportOptions.tsx" "handleExport"
check_content "ai-cv-builder/src/components/export/ExportOptions.tsx" "handleGoogleDocs"
echo ""

echo "5. Checking CVBuilder Integration..."
echo "===================================="
check_content "ai-cv-builder/src/pages/CVBuilder.tsx" "CVPreviewFull"
check_content "ai-cv-builder/src/pages/CVBuilder.tsx" "ExportOptions"
check_content "ai-cv-builder/src/pages/CVBuilder.tsx" "window.print"
echo ""

echo "6. Checking Print Styles..."
echo "============================"
check_content "ai-cv-builder/src/index.css" "@media print"
check_content "ai-cv-builder/src/index.css" "print-color-adjust"
echo ""

echo "7. Checking Export Formats..."
echo "============================="
check_content "ai-cv-builder/src/services/export.service.ts" "type ExportFormat = 'pdf' | 'docx' | 'txt'"
check_content "ai-cv-builder/src/components/export/ExportOptions.tsx" "format: 'pdf'"
check_content "ai-cv-builder/src/components/export/ExportOptions.tsx" "format: 'docx'"
check_content "ai-cv-builder/src/components/export/ExportOptions.tsx" "format: 'txt'"
echo ""

echo "8. Checking Component Exports..."
echo "================================"
check_content "ai-cv-builder/src/components/cv/index.ts" "CVPreviewFull"
check_content "ai-cv-builder/src/components/export/index.ts" "ExportOptions"
echo ""

echo "========================================="
echo "VERIFICATION SUMMARY"
echo "========================================="
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "STEP 13 Implementation Complete! ✅"
    echo ""
    echo "Features Implemented:"
    echo "  ✓ Export Service (PDF, DOCX, TXT)"
    echo "  ✓ CV Preview Component"
    echo "  ✓ Export Options UI"
    echo "  ✓ Google Docs Integration"
    echo "  ✓ Print Functionality"
    echo "  ✓ Professional File Naming"
    echo ""
    echo "Next Steps:"
    echo "  1. Start dev server: cd ai-cv-builder && npm run dev"
    echo "  2. Test PDF export"
    echo "  3. Test DOCX export"
    echo "  4. Test TXT export"
    echo "  5. Test Google Docs export"
    echo "  6. Test Print functionality"
    exit 0
else
    echo -e "${RED}✗ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please review the failed checks above."
    exit 1
fi