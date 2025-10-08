#!/bin/bash

echo "🔍 ADIM 23 Verification Script"
echo "================================"
echo ""

# Check if files exist
echo "📁 Checking files..."
files=(
  "src/types/settings.types.ts"
  "src/stores/settings.store.ts"
  "src/pages/Settings.tsx"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - MISSING!"
    all_exist=false
  fi
done

echo ""

# Check if zustand is installed
echo "📦 Checking dependencies..."
if npm list zustand >/dev/null 2>&1; then
  echo "✅ zustand is installed"
else
  echo "❌ zustand is NOT installed!"
  echo "   Run: npm install zustand --legacy-peer-deps"
  all_exist=false
fi

echo ""

# Check documentation files
echo "📚 Checking documentation..."
docs=(
  "ADIM-23-TAMAMLANDI.md"
  "ADIM-23-TEST-GUIDE.md"
  "ADIM-23-QUICK-START.md"
  "ADIM-23-VISUAL-SUMMARY.md"
  "ADIM-23-FILES-CREATED.txt"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "✅ $doc"
  else
    echo "⚠️  $doc - Not found (optional)"
  fi
done

echo ""

# Check routes
echo "🛣️  Checking routes..."
if grep -q "Settings" src/router/index.tsx 2>/dev/null; then
  echo "✅ Settings route is configured"
else
  echo "⚠️  Settings route might not be configured"
fi

if grep -q "Profile" src/router/index.tsx 2>/dev/null; then
  echo "✅ Profile route is configured"
else
  echo "⚠️  Profile route might not be configured"
fi

echo ""

# Summary
echo "📊 Summary"
echo "=========="
if [ "$all_exist" = true ]; then
  echo "✅ All core files are in place!"
  echo ""
  echo "🚀 Next steps:"
  echo "1. Add Firestore security rules (see ADIM-23-TAMAMLANDI.md)"
  echo "2. Run: npm run dev"
  echo "3. Navigate to /settings"
  echo "4. Test all features"
  echo ""
  echo "📖 Documentation: See ADIM-23-QUICK-START.md"
else
  echo "❌ Some files are missing. Please check above."
fi

echo ""
echo "✨ ADIM 23 Verification Complete!"
