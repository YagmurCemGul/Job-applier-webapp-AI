# JobPilot Browser Extension

Production-ready Manifest V3 browser extension that provides secure auto-apply transport, page parsing, and guided file attachment for the JobPilot CV Builder web application.

## Features

- ✅ **Secure Bridge**: HMAC-signed messages with origin allow-list
- ✅ **Multi-Platform Support**: Greenhouse, Lever, Workday, Indeed, LinkedIn + generic fallback
- ✅ **Intelligent Autofill**: Label-to-control mapping, heuristics, Shadow DOM support
- ✅ **Guided File Attach**: A11y-friendly overlay for user-gesture file selection
- ✅ **Page Parsers**: Extract job metadata for quick import to web app
- ✅ **Compliance Gates**: Legal Mode, Dry-Run default, rate limiting
- ✅ **Detailed Logging**: All actions logged and mirrored to web app
- ✅ **Options & Popup UIs**: Full control over settings and run history

## Installation

### Chrome/Edge (Unpacked)

1. Build the extension:
   ```bash
   cd extension
   npm install
   npm run build
   ```

2. Open Chrome/Edge and navigate to `chrome://extensions`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the `extension/dist` directory

6. Note the extension ID for configuration

### Firefox (Temporary)

1. Build the extension (same as above)

2. Navigate to `about:debugging#/runtime/this-firefox`

3. Click "Load Temporary Add-on"

4. Select any file in `extension/dist`

5. Extension will be active until browser restart

### Production Install (Packed)

1. Package the extension:
   ```bash
   npm run package
   ```

2. This creates `jobpilot-extension.zip`

3. Submit to Chrome Web Store / Firefox Add-ons

## Configuration

### 1. Add App Origins

1. Click the extension icon → "Options"

2. Under "App Origins", click "Add Origin"

3. Enter your web app origin (e.g., `https://app.jobpilot.com` or `http://localhost:5173` for development)

4. Click "Save Settings"

### 2. Set HMAC Key

1. In Options, find "HMAC Key" field

2. Enter the shared secret key (same as configured in your web app)

3. This key is used to sign and verify all messages

4. Click "Save Settings"

### 3. Enable Platforms

1. In Options, scroll to "Platform Settings"

2. For each platform you want to use:
   - Click "Toggle Enabled" to enable/disable
   - Click "Enable Legal" to confirm you have rights to submit (required)
   - Click "Toggle Dry-Run" to set default behavior (recommended: ON)

3. Click "Save Settings"

## Usage

### Auto-Apply from Web App

1. In the web app (Steps 17-33), navigate to a job

2. Click "Quick Apply"

3. Fill out the application dialog

4. Check "Legal Mode" opt-in

5. Click "Submit"

6. Extension will:
   - Validate request (security check)
   - Check rate limit
   - Open job page in new tab
   - Fill form fields
   - Show guided overlay for file attachment
   - Submit (or stage for review if Dry-Run)
   - Return results to web app

### Quick Import Job

1. Navigate to a job posting page

2. Click the extension icon

3. Click "Parse this page" (if available)

4. Job metadata will be extracted and sent to web app

5. Web app will import into Jobs Finder (Step 32)

### View Run History

1. Click the extension icon

2. See last 10 runs with status, domain, timestamp

3. Click "Clear History" to reset

4. Click "Pause" to temporarily disable auto-apply

## Platform Support

### Greenhouse

- ✅ Standard fields: first_name, last_name, email, phone
- ✅ Custom questions by label text
- ✅ File upload: resume/cv
- ✅ Multi-step forms
- 🎯 Reliability: High

### Lever

- ✅ Standard fields by label
- ✅ File upload
- 🎯 Reliability: High

### Workday

- ⚠️  Dynamic React components (limited support)
- ✅ Generic label matching
- ❌ Multi-step navigation (manual review required)
- 🎯 Reliability: Medium

### Indeed

- ⚠️  Varying form structures
- ✅ Generic label matching
- ❌ Easy Apply API (closed platform)
- 🎯 Reliability: Medium (manual review recommended)

### LinkedIn

- ⚠️  Requires authentication
- ⚠️  Complex multi-step forms
- ❌ API restrictions
- 🎯 Reliability: Low (manual review required)

### Generic Fallback

- ✅ Pure heuristics using labels, names, placeholders
- ✅ Works on any job board
- ⚠️  Accuracy depends on form structure
- 🎯 Reliability: Variable

## Security

### Origin Allow-List

- Only app origins in the allow-list can send messages
- Prevents unauthorized access from malicious sites
- Configure in Options

### HMAC Signature

- All messages from web app must include valid HMAC signature
- Computed as `HMAC_SHA256(message_body, shared_key)`
- Extension verifies signature before processing
- Invalid signatures are rejected and logged

### Rate Limiting

- Token bucket algorithm per platform
- Default: 10 applications/minute
- Prevents accidental spam
- Configurable per platform

### Minimal Permissions

- Only requests access to whitelisted job domains
- No broad `<all_urls>` permission
- Storage limited to local settings
- No remote code execution

### Legal Compliance

- "Legal Mode" must be enabled per platform
- User confirms they have rights to submit
- Default Dry-Run prevents accidental submissions
- All actions logged for audit trail

## Troubleshooting

### Extension not responding

1. Check if extension is enabled (chrome://extensions)
2. Check if app origin is in allow-list
3. Verify HMAC key matches web app
4. Check console for errors (F12 → Console)

### Forms not filling

1. Ensure platform is enabled in Options
2. Check if Legal Mode is ON
3. Try Dry-Run first to see what would be filled
4. Inspect page structure (F12 → Elements)
5. Report selector issues on GitHub

### Files not attaching

1. Browser security prevents programmatic file setting
2. Extension shows guided overlay
3. User must click file input and select file manually
4. Future: Native file download + auto-attach guide

### Rate limit exceeded

1. Wait 1 minute for token bucket to refill
2. Adjust rate limit in Options if needed
3. Use Dry-Run mode to test without consuming tokens

### Submit button not found

1. Page may use custom submit flow
2. Try manual submission after autofill
3. Report button selector issue

## Development

### Project Structure

```
extension/
├── manifest.json           # Extension manifest (MV3)
├── background/             # Service worker
│   ├── service.ts         # Entry point
│   ├── router.ts          # Request routing
│   ├── security.ts        # HMAC verification
│   ├── rateLimit.ts       # Token bucket
│   └── hmac.ts            # HMAC utilities
├── content/               # Content scripts
│   ├── shared/           # Utilities
│   │   ├── dom.ts        # DOM helpers
│   │   ├── autofill.ts   # Form filling
│   │   ├── overlay.ts    # File attach guide
│   │   ├── parse.ts      # Page parsing
│   │   └── i18n.ts       # Translations
│   ├── greenhouse.ts     # Greenhouse handler
│   ├── lever.ts          # Lever handler
│   ├── workday.ts        # Workday handler
│   ├── indeed.ts         # Indeed handler
│   ├── linkedin.ts       # LinkedIn handler
│   └── generic.ts        # Generic fallback
├── ui/                   # Popup & Options
│   ├── popup.tsx
│   ├── options.tsx
│   └── styles.css
├── storage/              # Settings persistence
│   ├── schema.ts
│   └── settings.ts
├── messaging/            # Protocol definitions
│   ├── protocol.ts
│   └── bridge.ts
└── tests/                # Unit, integration, e2e
    ├── unit/
    ├── integration/
    └── e2e/
```

### Building

```bash
npm install
npm run build
```

Output: `dist/` directory ready for loading as unpacked

### Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests (requires Playwright)
npm run test:e2e
```

### Packaging

```bash
npm run package
```

Output: `jobpilot-extension.zip` ready for distribution

## Privacy Policy

- Extension does not collect or transmit any personal data
- All processing happens locally in the browser
- Settings stored in browser's local storage only
- No external servers contacted (except configured app origin)
- No tracking, analytics, or telemetry
- Open source: audit the code yourself

## Compliance Notice

This extension is a **tool** to assist with job applications. Users are responsible for ensuring they have the legal right to submit applications on each platform. The "Legal Mode" toggle serves as a reminder and acknowledgment of this responsibility.

**Platform Terms of Service**: Always review and comply with each platform's Terms of Service. Some platforms prohibit automated submissions. Use responsibly.

**Data Accuracy**: Users are responsible for verifying the accuracy of all submitted information. Always review applications before final submission.

## Support

- **GitHub Issues**: https://github.com/yourusername/jobpilot-extension/issues
- **Documentation**: https://docs.jobpilot.com
- **Web App**: https://app.jobpilot.com

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0 (2025-10-06)

- Initial release
- MV3 support for Chrome/Edge
- 5 platform handlers + generic fallback
- Secure HMAC bridge
- Guided file attachment
- Options & Popup UIs
- EN/TR i18n
- Complete test suite
