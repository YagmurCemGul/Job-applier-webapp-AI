# JobPilot Browser Extension

Production-ready Chrome/Edge (Manifest V3) browser extension for secure auto-apply transport, page parsing, and guided file attachment.

## Features

- **🔒 Secure Bridge**: HMAC-signed communication with web app
- **🤖 Auto-Apply**: Automated form filling with dry-run mode
- **📄 Page Parsing**: Extract job metadata from supported platforms
- **📎 Guided File Attach**: User-friendly file upload assistance
- **⚖️ Compliance-First**: Legal mode, rate limiting, per-site controls
- **🌍 i18n**: English and Turkish support
- **♿ Accessible**: WCAG AA compliant overlays

## Supported Platforms

- ✅ **Greenhouse** (boards.greenhouse.io)
- ✅ **Lever** (jobs.lever.co)
- ✅ **Workday** (*.workdayjobs.com)
- ✅ **Indeed** (*.indeed.com)
- ✅ **LinkedIn Jobs** (linkedin.com/jobs)
- ✅ **Generic** (fallback for other sites)

## Installation

### Development (Unpacked)

1. **Build the extension:**
   ```bash
   cd extension
   npm install
   npm run build
   ```

2. **Load in Chrome/Edge:**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist-extension` folder

3. **Load in Firefox:**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from `dist-extension`

### Configuration

1. **Open Extension Options:**
   - Click extension icon → "Settings"
   - Or right-click icon → "Options"

2. **Add Allowed Origins:**
   - Add your JobPilot web app URL (e.g., `https://app.jobpilot.com`)
   - Multiple origins supported for dev/staging/prod

3. **Configure HMAC Key:**
   - Enter the shared secret key (must match your web app)
   - Key is stored locally and never transmitted

4. **Enable Platforms:**
   - Toggle "Legal Mode" ON for each platform you want to use
   - Configure dry-run defaults and rate limits

## Usage

### Auto-Apply from Web App

The web app (Step 33) sends signed `APPLY_START` messages:

```typescript
const message: ApplyStartMsg = {
  type: 'APPLY_START',
  payload: {
    jobUrl: 'https://boards.greenhouse.io/company/jobs/123',
    platform: 'greenhouse',
    files: [{ name: 'resume.pdf', url: 'blob:...', type: 'cv' }],
    answers: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    },
    dryRun: true,
    locale: 'en',
  },
  meta: {
    requestId: 'uuid-1234',
    ts: Date.now(),
    origin: 'https://app.jobpilot.com',
    sign: 'hmac-signature',
  },
};

const response = await chrome.runtime.sendMessage(message);
// response: ApplyResultMsg
```

### Quick Import (Page Parser)

From any job page, the extension can extract metadata:

```typescript
const job = PageParser.parse('greenhouse');
// { title, company, location, description, salary, remote, url, platform }
```

### Dry-Run vs Submit

- **Dry-Run (default)**: Fills form fields, shows banner, **does not submit**
- **Submit Mode**: Fills fields + clicks submit button (requires Legal Mode ON)

## Architecture

### Background Service Worker

- **Router**: Maps URLs to platform handlers
- **Security**: Validates origin + HMAC signatures
- **Rate Limiter**: Token bucket per domain
- **Ports**: Manages tab/content script communication

### Content Scripts

Platform-specific handlers inject into job pages:

- `greenhouse.ts`: Greenhouse-specific selectors
- `lever.ts`: Lever multi-step forms
- `workday.ts`: Workday dynamic components
- `indeed.ts`, `linkedin.ts`: Platform selectors
- `generic.ts`: Heuristic-based fallback

### Shared Utilities

- **DOM**: Element finding, waiting, events
- **Autofill**: Text/select/radio/checkbox filling
- **Overlay**: Accessible guided overlays
- **Parse**: Job metadata extraction

### UI Components

- **Popup**: Quick status, recent runs, pause toggle
- **Options**: Settings, platform config, bridge test

## Security

### HMAC Verification

All messages from the web app must include a valid HMAC signature:

```typescript
const signature = HMAC_SHA256(JSON.stringify(messageBody), sharedKey);
```

The extension verifies signatures using constant-time comparison.

### Origin Allow-List

Only messages from configured origins are accepted. Origins must exactly match (protocol + host + port).

### Minimal Permissions

- `storage`: Settings persistence
- `tabs`, `scripting`: Content script injection
- `activeTab`: Current tab access only
- `alarms`, `notifications`: Background scheduling
- `host_permissions`: Only for supported job sites

## Compliance & Safety

### Legal Mode

**Required** for each platform before auto-apply is allowed. Users must explicitly opt-in.

### Rate Limiting

Default: 10 applications per minute per domain. Configurable in settings.

### Dry-Run by Default

New users default to dry-run mode to prevent accidental submissions.

### Visibility

- Overlays announce actions (ARIA live regions)
- Banners indicate dry-run vs submit mode
- Logs detail every step

## Testing

### Unit Tests

```bash
npm test
```

Tests autofill logic, parsing, security, HMAC.

### Integration Tests

```bash
npm test -- tests/integration
```

Tests content scripts with DOM fixtures.

### E2E Tests

```bash
npm run test:e2e
```

Playwright tests simulating full apply flow.

## Troubleshooting

### "Origin not in allow-list"

- Add your web app origin in Options → Allowed App Origins
- Ensure exact match including protocol and port

### "Legal Mode is OFF"

- Go to Options → Platform Settings
- Check "Legal Mode" for the platform

### "Submit button not found"

- Page structure may have changed
- Try dry-run mode and submit manually
- Report issue with page URL

### "Rate limit exceeded"

- Wait 60 seconds or increase limit in Options
- Default: 10 applications/minute per domain

### File Attachment Not Working

- Browser requires user gesture to select files
- Extension shows overlay to guide user
- Click highlighted file input when prompted

## Development

### Project Structure

```
extension/
├── manifest.json
├── package.json
├── vite.config.ts
├── background/         # Service worker
│   ├── service.ts
│   ├── router.ts
│   ├── security.ts
│   ├── rateLimit.ts
│   ├── ports.ts
│   └── hmac.ts
├── content/            # Content scripts
│   ├── shared/         # Utilities
│   │   ├── dom.ts
│   │   ├── autofill.ts
│   │   ├── overlay.ts
│   │   ├── parse.ts
│   │   └── i18n.ts
│   ├── greenhouse.ts
│   ├── lever.ts
│   ├── workday.ts
│   ├── indeed.ts
│   ├── linkedin.ts
│   └── generic.ts
├── ui/                 # React UIs
│   ├── popup.tsx
│   ├── options.tsx
│   └── styles.css
├── messaging/          # Protocol
│   ├── protocol.ts
│   └── bridge.ts
├── storage/            # Settings
│   ├── schema.ts
│   └── settings.ts
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Build Process

1. **TypeScript → JavaScript**: Vite compiles TS/TSX
2. **Copy Static Files**: HTML, CSS, manifest, icons
3. **Bundle**: Rollup creates optimized bundles
4. **Package**: ZIP artifact for distribution

### Watch Mode

```bash
npm run dev
```

Auto-rebuilds on file changes.

## Privacy & Data

- **No Analytics**: Extension does not track usage
- **No External Requests**: Only communicates with configured app origins
- **Local Storage Only**: Settings stored in `chrome.storage.local`
- **No Account Required**: Extension operates independently

## Limitations

### File Uploads

Browsers prevent programmatic file input due to security. The extension:
1. Shows overlay instructing user to click file input
2. User manually selects file from disk
3. Extension guides but does not inject files

### Multi-Step Forms

Some platforms (Lever, Workday) have multi-page applications:
- Extension fills current page
- May require manual navigation or dry-run + review

### Dynamic Pages

Single-page apps (React/Angular) with dynamic DOM:
- Extension waits for idle state
- May need longer timeouts for slow sites

### Shadow DOM

Limited support for Web Components with closed Shadow DOM.

## License

Part of the JobPilot project. See main repository for license.

## Support

For issues, feature requests, or questions:
1. Check troubleshooting section
2. Review browser console for errors
3. Open issue in main JobPilot repository

---

**Version**: 1.0.0  
**Manifest**: V3 (Chrome/Edge), V2-compatible shim (Firefox)  
**Last Updated**: 2025-10-08
