# Changelog

All notable changes to the JobPilot browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-08

### Added

#### Core Features
- **Manifest V3** support for Chrome, Edge, Brave
- **MV2-compatible shim** for Firefox
- **Secure bridge** with HMAC-SHA256 message signing
- **Origin allow-list** for web app communication
- **Auto-apply transport** with dry-run and submit modes
- **Page parsers** for job metadata extraction
- **Guided file attachment** with accessible overlays
- **Rate limiting** (token bucket per domain)
- **Compliance controls** (Legal Mode, per-site toggles)

#### Platform Support
- **Greenhouse** (boards.greenhouse.io)
  - Standard field mapping
  - Resume upload support
  - Custom question handling
- **Lever** (jobs.lever.co)
  - Multi-step form detection
  - URL field support
- **Workday** (*.workdayjobs.com)
  - Dynamic component handling
  - ARIA-based field matching
- **Indeed** (*.indeed.com)
  - Quick apply support
- **LinkedIn Jobs** (linkedin.com/jobs)
  - Easy Apply integration
- **Generic fallback** (any site)
  - Heuristic-based field matching
  - Label/placeholder detection

#### UI Components
- **Popup**
  - Recent runs history (last 10)
  - Status indicators (success/error/review)
  - Pause/resume toggle
  - Quick access to settings
- **Options Page**
  - App origin management
  - HMAC key configuration
  - Per-platform settings
  - Rate limit controls
  - Import/export settings
  - Bridge connection test

#### Shared Utilities
- **DOM Helper**
  - Smart element finding (label, ID, name, aria, placeholder)
  - Wait for element/idle
  - Visibility detection
  - Visual highlighting
- **AutoFiller**
  - Text/email/tel/url inputs
  - Select dropdowns (exact/partial match)
  - Radio buttons (label matching)
  - Checkboxes
  - Event dispatching (input, change, focus, blur)
- **Overlay System**
  - Accessible dialogs (ARIA, focus trap)
  - File attachment guidance
  - Dry-run notifications
  - Legal mode warnings
- **Page Parser**
  - Title, company, location extraction
  - Salary detection (multiple formats)
  - Remote/hybrid keywords
  - Description truncation

#### Internationalization
- **English (EN)** - Full support
- **Turkish (TR)** - Full support
- Locale switcher in options
- Content script localization

#### Testing
- **Unit tests** (Vitest)
  - Autofill logic
  - Page parsing
  - Security/HMAC
- **Integration tests** (JSDOM)
  - Content script DOM interaction
  - Platform-specific handlers
- **E2E tests** (Playwright)
  - Full apply flow
  - Overlay interactions

#### Build & Development
- **Vite** bundler with TypeScript
- **React 18** for UI components
- **ESLint** configuration
- **TypeScript** strict mode
- Watch mode for development
- Automated packaging script
- Source maps (dev only)

### Security
- HMAC signature verification
- Constant-time comparison
- Origin validation
- Minimal permissions
- No external requests
- Local-only storage

### Documentation
- Comprehensive README
- Installation guide
- Troubleshooting section
- Contributing guidelines
- Architecture overview
- API documentation

## [Unreleased]

### Planned
- [ ] Safari extension support
- [ ] Additional platforms (Jobvite, SmartRecruiters)
- [ ] OCR for application questions
- [ ] Form state persistence
- [ ] Application analytics
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Application templates

### Known Issues
- Shadow DOM with closed mode not fully supported
- Some Workday multi-page forms require manual navigation
- File upload requires user gesture (browser limitation)

---

## Release Notes

### v1.0.0 - Initial Release

This is the first production release of the JobPilot browser extension. It provides:

✅ **Secure auto-apply** with HMAC authentication  
✅ **5 major platforms** + generic fallback  
✅ **Compliance-first** design with legal controls  
✅ **Accessible UIs** (WCAG AA)  
✅ **Comprehensive testing** (unit, integration, e2e)  
✅ **i18n support** (EN/TR)  

**Installation**: See [INSTALL.md](./INSTALL.md)  
**Usage**: See [README.md](./README.md)  
**Issues**: Report on GitHub

---

[1.0.0]: https://github.com/jobpilot/extension/releases/tag/v1.0.0
