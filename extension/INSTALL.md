# Installation Guide

## Quick Start

### 1. Build the Extension

```bash
cd extension
npm install
npm run build
```

This will:
- Install dependencies
- Compile TypeScript to JavaScript
- Bundle React components
- Copy static files
- Create `dist-extension/` folder
- Package as `jobpilot-extension.zip`

### 2. Load in Browser

#### Chrome / Edge / Brave

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `dist-extension` folder
5. Extension should appear in toolbar

#### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on"**
3. Navigate to `dist-extension/`
4. Select `manifest.json`
5. Extension loads (temporary - reloads on browser restart)

**Note**: For permanent Firefox installation, you need to sign the extension through Mozilla Add-ons.

### 3. Initial Configuration

1. **Click extension icon** → "Settings" (or right-click → "Options")

2. **Add App Origin:**
   - Enter your JobPilot web app URL
   - Example: `https://app.jobpilot.com` or `http://localhost:3000`
   - Click "Add"

3. **Configure HMAC Key:**
   - Enter the shared secret key
   - Must match the key in your web app
   - Key is stored locally and encrypted

4. **Enable Platforms:**
   - For each platform you want to use:
     - ✅ Check "Enabled"
     - ✅ Check "Legal Mode" (required for auto-apply)
     - Set "Dry-Run Default" (recommended: ON)
     - Set "Rate Limit" (default: 10/min)

5. **Test Bridge:**
   - Click "Test Bridge" button
   - Should show "✓ Bridge test successful"
   - If error, check origin and HMAC key

### 4. Verify Installation

1. Open popup (click extension icon)
2. Should see "No recent activity" (empty state)
3. Go to a job page (e.g., Greenhouse job)
4. Extension icon should activate
5. Try page parsing or dry-run apply from web app

## Troubleshooting

### Build Errors

**Error: `Cannot find module`**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: `EACCES permission denied`**
```bash
sudo chown -R $(whoami) .
npm run build
```

### Extension Not Loading

**Chrome: "Manifest file is invalid"**
- Ensure `manifest.json` is in `dist-extension/`
- Check manifest version (should be 3)
- Run `npm run build` again

**Firefox: "Extension could not be loaded"**
- Firefox requires valid icons in manifest
- Check `public/icons/` contains PNG files
- Ensure manifest paths are correct

### Bridge Connection Issues

**"No allowed origins configured"**
- Go to Options → Allowed App Origins
- Add your web app URL
- Include protocol (http/https) and port if needed

**"Invalid HMAC signature"**
- HMAC key must match between app and extension
- Keys are case-sensitive
- Regenerate key if uncertain

**"Origin not in allow-list"**
- Check exact origin match (including port)
- `http://localhost:3000` ≠ `http://127.0.0.1:3000`
- Add all variations if needed

### Auto-Apply Not Working

**"Legal Mode is OFF"**
- Go to Options → Platform Settings
- Check "Legal Mode" for the platform
- Save settings

**"Submit button not found"**
- Page structure may differ
- Try "Dry-Run" mode first
- Check browser console for errors

**Form fields not filling**
- Extension uses heuristics
- Some custom forms may not be supported
- Use generic handler for unknown sites

## Development Mode

### Watch Mode (Auto-rebuild)

```bash
npm run dev
```

- Watches for file changes
- Auto-rebuilds extension
- Reload extension in browser after changes

### Testing

**Unit tests:**
```bash
npm test
```

**Integration tests:**
```bash
npm test -- tests/integration
```

**E2E tests:**
```bash
npm run test:e2e
```

**Coverage:**
```bash
npm test -- --coverage
```

### Debugging

**Background service worker:**
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker"
3. Console shows background logs

**Content scripts:**
1. Open job page
2. Right-click → "Inspect"
3. Console tab shows content script logs
4. Look for `[Greenhouse]`, `[Lever]`, etc. prefixes

**React DevTools:**
- Install React DevTools extension
- Inspect popup/options pages
- View component state and props

## Production Build

### Create Release

```bash
npm run build
```

Output:
- `dist-extension/` - unpacked extension
- `dist-extension/jobpilot-extension.zip` - packaged for distribution

### Chrome Web Store

1. **Prepare assets:**
   - Screenshots (1280x800 or 640x400)
   - Promotional images
   - Icon (128x128)
   - Privacy policy URL

2. **Create developer account:**
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay one-time $5 fee

3. **Upload:**
   - Click "New Item"
   - Upload `jobpilot-extension.zip`
   - Fill store listing
   - Submit for review

### Firefox Add-ons

1. **Sign extension:**
   - Visit [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
   - Upload ZIP
   - Choose "self-distribution" or "list on AMO"

2. **Get signed XPI:**
   - Download signed `.xpi` file
   - Distribute directly or via AMO

### Edge Add-ons

Similar to Chrome Web Store:
- [Edge Add-ons Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)
- Upload ZIP
- Submit for review

## Updating

### User Updates

**Chrome/Edge (from store):**
- Auto-updates every few hours
- Force: `chrome://extensions/` → "Update"

**Unpacked (development):**
1. `git pull` (or download new version)
2. `npm run build`
3. `chrome://extensions/` → Reload icon

**Firefox:**
- Temporary add-ons: reload on every browser restart
- Signed add-ons: auto-update if hosted on AMO

### Migration

When updating settings schema:
1. Extension auto-migrates old settings
2. Defaults applied for new fields
3. Export settings before major updates

## Uninstall

### Chrome/Edge
1. `chrome://extensions/`
2. Find "JobPilot"
3. Click "Remove"
4. Confirm deletion

### Firefox
1. `about:addons`
2. Find "JobPilot"
3. Click "..." → "Remove"

**Data removal:**
- Settings in `chrome.storage.local` are deleted
- No residual data remains

## Support

For installation issues:
1. Check browser console (F12)
2. Review this guide
3. Check [README.md](./README.md) troubleshooting section
4. Open issue in repository

---

**Need help?** See [README.md](./README.md) for detailed documentation.
