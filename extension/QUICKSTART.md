# Quick Start Guide

Get the JobPilot Extension running in **5 minutes**.

## 1️⃣ Build Extension (2 min)

```bash
cd extension
npm install
npm run build
```

**Output**: `dist-extension/` folder with compiled extension

## 2️⃣ Load in Browser (1 min)

### Chrome/Edge/Brave

1. Open `chrome://extensions/`
2. Toggle "Developer mode" ON
3. Click "Load unpacked"
4. Select `dist-extension` folder
5. ✅ Extension appears in toolbar

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `dist-extension/manifest.json`
4. ✅ Extension loaded

## 3️⃣ Configure (2 min)

1. **Click extension icon** → "Settings"

2. **Add App Origin:**
   ```
   https://app.jobpilot.com
   (or http://localhost:3000 for dev)
   ```

3. **Set HMAC Key:**
   ```
   your-shared-secret-key-here
   (must match web app)
   ```

4. **Enable Platforms:**
   - ✅ Greenhouse → Legal Mode ON
   - ✅ Lever → Legal Mode ON
   - (Enable others as needed)

5. **Save Settings**

## 4️⃣ Test Connection

1. In Options, click **"Test Bridge"**
2. Should show: ✅ **"Bridge test successful"**
3. If error, check origin and HMAC key match web app

## 5️⃣ Try Auto-Apply

### Dry-Run (Recommended First)

1. Open a job page (e.g., Greenhouse job)
2. From web app, trigger auto-apply with `dryRun: true`
3. Extension opens tab, fills form
4. Shows banner: "Dry-Run: form has been prefilled for review"
5. Review filled fields
6. Submit manually if satisfied

### Full Auto-Apply

1. In Options, enable **Legal Mode** for platform
2. From web app, trigger with `dryRun: false`
3. Extension fills + submits automatically
4. Check popup for result

## Common Issues

### "Extension not installed"

**Fix**: Load extension in browser first

### "Origin not in allow-list"

**Fix**: Add exact origin in Options (include `http://` or `https://`)

### "Invalid HMAC signature"

**Fix**: HMAC key must match between extension and web app

### "Legal Mode is OFF"

**Fix**: Go to Options → Platform Settings → Check "Legal Mode"

### Form not filling

**Fix**: 
- Try dry-run mode first
- Check browser console for errors
- Platform may need custom selectors

## Development Tips

### Watch Mode

```bash
npm run dev
```

Auto-rebuilds on file changes. Reload extension after rebuild.

### Check Logs

**Background Worker:**
- `chrome://extensions/` → "Inspect views: service worker"

**Content Script:**
- Open job page → F12 → Console
- Look for `[Greenhouse]`, `[Lever]`, etc.

### Test Without Web App

```javascript
// Run in browser console
chrome.runtime.sendMessage({
  type: 'PING',
  meta: { ts: Date.now(), origin: 'http://localhost:3000' }
}).then(console.log);
```

## Next Steps

- ✅ Read [README.md](./README.md) for full documentation
- ✅ See [INSTALL.md](./INSTALL.md) for detailed setup
- ✅ Check [integration/README.md](./integration/README.md) for web app integration
- ✅ Review [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Support

- **Issues**: Check [README.md](./README.md) troubleshooting
- **Questions**: Open GitHub issue
- **Security**: Email security@jobpilot.com

---

**Ready to apply!** 🚀
