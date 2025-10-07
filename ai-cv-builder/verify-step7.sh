#!/bin/bash

echo "==================================="
echo "ADIM 7 Verification Script"
echo "==================================="
echo ""

# Check if files exist
echo "Checking files..."
files=(
  "src/services/storage.service.ts"
  "src/components/common/ImageCropper.tsx"
  "src/components/common/ImageUpload.tsx"
  "src/components/common/UploadProgress.tsx"
  "src/components/profile/AvatarUpload.tsx"
  "src/components/ui/dialog.tsx"
  "src/components/ui/slider.tsx"
  "src/components/ui/progress.tsx"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (NOT FOUND)"
    all_exist=false
  fi
done

echo ""
echo "Checking package.json dependencies..."
if grep -q "react-image-crop" package.json; then
  echo "✅ react-image-crop installed"
else
  echo "❌ react-image-crop NOT installed"
  all_exist=false
fi

if grep -q "react-dropzone" package.json; then
  echo "✅ react-dropzone installed"
else
  echo "❌ react-dropzone NOT installed"
  all_exist=false
fi

echo ""
echo "Checking imports..."
if grep -q "storage.service" src/services/index.ts; then
  echo "✅ storage.service exported from services/index.ts"
else
  echo "❌ storage.service NOT exported"
  all_exist=false
fi

if grep -q "ImageUpload" src/components/common/index.ts; then
  echo "✅ ImageUpload exported from common/index.ts"
else
  echo "❌ ImageUpload NOT exported"
  all_exist=false
fi

if grep -q "AvatarUpload" src/pages/Profile.tsx; then
  echo "✅ AvatarUpload imported in Profile.tsx"
else
  echo "❌ AvatarUpload NOT imported in Profile.tsx"
  all_exist=false
fi

echo ""
echo "Checking CSS..."
if grep -q "ReactCrop" src/index.css; then
  echo "✅ React Image Crop styles added"
else
  echo "❌ React Image Crop styles NOT added"
  all_exist=false
fi

echo ""
echo "==================================="
if [ "$all_exist" = true ]; then
  echo "✅ ALL CHECKS PASSED!"
  echo "==================================="
  exit 0
else
  echo "❌ SOME CHECKS FAILED"
  echo "==================================="
  exit 1
fi
