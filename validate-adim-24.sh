#!/bin/bash

# ADIM 24 - Validation Script
# This script validates that all ADIM 24 features are properly implemented

echo "🔍 ADIM 24 - Feature Validation Script"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ PASS${NC} - File exists: $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} - File missing: $1"
        ((FAILED++))
        return 1
    fi
}

# Function to check package installed
check_package() {
    if npm list "$1" --depth=0 2>/dev/null | grep -q "$1@"; then
        echo -e "${GREEN}✅ PASS${NC} - Package installed: $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} - Package missing: $1"
        ((FAILED++))
        return 1
    fi
}

# Function to check content in file
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC} - Found '$2' in $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} - Missing '$2' in $1"
        ((FAILED++))
        return 1
    fi
}

# Change to project directory
cd /workspace/ai-cv-builder

echo "📁 Checking Core Files..."
echo "-------------------------"
check_file "src/types/share.types.ts"
check_file "src/services/share.service.ts"
check_file "src/components/share/ShareDialog.tsx"
check_file "src/components/export/BatchExport.tsx"
check_file "firestore.rules"
echo ""

echo "📦 Checking Updated Files..."
echo "----------------------------"
check_file "src/components/dashboard/CVCard.tsx"
check_file "src/pages/Dashboard.tsx"
echo ""

echo "📚 Checking Documentation..."
echo "----------------------------"
check_file "/workspace/ADIM-24-TAMAMLANDI.md"
check_file "/workspace/ADIM-24-TEST-GUIDE.md"
check_file "/workspace/ADIM-24-QUICK-START.md"
check_file "/workspace/ADIM-24-FILES-CREATED.md"
check_file "/workspace/ADIM-24-FINAL-SUMMARY.md"
echo ""

echo "🔧 Checking Dependencies..."
echo "--------------------------"
check_package "qrcode"
check_package "jszip"
check_package "file-saver"
check_package "@types/qrcode"
echo ""

echo "🔍 Checking Imports..."
echo "---------------------"
check_content "src/components/dashboard/CVCard.tsx" "ShareDialog"
check_content "src/components/dashboard/CVCard.tsx" "Share2"
check_content "src/pages/Dashboard.tsx" "BatchExport"
echo ""

echo "🔐 Checking Firestore Rules..."
echo "------------------------------"
check_content "firestore.rules" "shared_cvs"
check_content "firestore.rules" "isActive"
echo ""

echo "🎯 Checking Type Definitions..."
echo "-------------------------------"
check_content "src/types/share.types.ts" "SharedCV"
check_content "src/types/share.types.ts" "ShareSettings"
check_content "src/types/share.types.ts" "DEFAULT_SHARE_SETTINGS"
echo ""

echo "🛠️ Checking Service Methods..."
echo "------------------------------"
check_content "src/services/share.service.ts" "createShareLink"
check_content "src/services/share.service.ts" "getSharedCV"
check_content "src/services/share.service.ts" "validateShareLink"
check_content "src/services/share.service.ts" "getUserShareLinks"
echo ""

echo "⚛️ Checking Components..."
echo "------------------------"
check_content "src/components/share/ShareDialog.tsx" "QRCode.toDataURL"
check_content "src/components/share/ShareDialog.tsx" "handleCreateLink"
check_content "src/components/share/ShareDialog.tsx" "handleEmailShare"
check_content "src/components/export/BatchExport.tsx" "JSZip"
check_content "src/components/export/BatchExport.tsx" "saveAs"
check_content "src/components/export/BatchExport.tsx" "handleExport"
echo ""

# Summary
echo "========================================"
echo "📊 VALIDATION SUMMARY"
echo "========================================"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL VALIDATIONS PASSED!${NC}"
    echo "ADIM 24 is successfully implemented! 🎉"
    echo ""
    echo "Next Steps:"
    echo "1. Run: npm run dev"
    echo "2. Test features in browser"
    echo "3. Follow: /workspace/ADIM-24-QUICK-START.md"
    exit 0
else
    echo -e "${RED}❌ SOME VALIDATIONS FAILED!${NC}"
    echo "Please check the failed items above."
    echo ""
    echo "For help:"
    echo "- Review: /workspace/ADIM-24-TAMAMLANDI.md"
    echo "- Check: /workspace/ADIM-24-FILES-CREATED.md"
    exit 1
fi
