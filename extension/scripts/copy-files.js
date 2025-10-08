/**
 * Script to copy static files to dist-extension
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const files = [
  { src: 'manifest.json', dest: 'dist-extension/manifest.json' },
  { src: 'ui/popup.html', dest: 'dist-extension/ui/popup.html' },
  { src: 'ui/options.html', dest: 'dist-extension/ui/options.html' },
  { src: 'ui/styles.css', dest: 'dist-extension/ui/styles.css' },
];

// Ensure directories exist
mkdirSync('dist-extension/ui', { recursive: true });
mkdirSync('dist-extension/public/icons', { recursive: true });

// Copy files
files.forEach(({ src, dest }) => {
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`Copied ${src} → ${dest}`);
  } else {
    console.warn(`Warning: ${src} not found`);
  }
});

// Create placeholder icons if they don't exist
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach((size) => {
  const iconPath = `public/icons/${size}.png`;
  const destPath = `dist-extension/public/icons/${size}.png`;
  
  if (existsSync(iconPath)) {
    copyFileSync(iconPath, destPath);
    console.log(`Copied icon ${size}x${size}`);
  } else {
    console.warn(`Warning: Icon ${size}x${size} not found, create it manually`);
  }
});

console.log('✓ Files copied successfully');
