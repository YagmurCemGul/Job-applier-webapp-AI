/**
 * Script to package extension as ZIP
 */

import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

const output = createWriteStream(resolve('dist-extension/jobpilot-extension.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✓ Extension packaged: ${archive.pointer()} bytes`);
  console.log('  → dist-extension/jobpilot-extension.zip');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add all files from dist-extension except the zip itself
archive.directory('dist-extension/', false, (entry) => {
  if (entry.name.endsWith('.zip')) {
    return false;
  }
  return entry;
});

archive.finalize();
