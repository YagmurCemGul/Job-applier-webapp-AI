# Privacy Policy

**Last Updated**: October 8, 2025

## Overview

JobPilot Extension ("the Extension") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.

## Data Collection

### What We Collect

The Extension collects and stores **only** the following data **locally on your device**:

1. **Settings**
   - Allowed app origins (URLs you configure)
   - HMAC shared key (for message authentication)
   - Platform preferences (enabled/disabled, dry-run, rate limits)
   - Language preference (EN/TR)
   - Legal mode consents

2. **Application History**
   - Last 100 application attempts
   - Timestamps
   - Job URLs
   - Success/error status
   - Platform names

### What We DO NOT Collect

- ❌ Personal information (name, email, phone, resume)
- ❌ Job application content
- ❌ Browsing history
- ❌ Authentication credentials
- ❌ Form data beyond current session
- ❌ Analytics or telemetry
- ❌ Usage statistics

## Data Storage

### Local Storage Only

All data is stored in:
- `chrome.storage.local` (Chrome/Edge)
- `browser.storage.local` (Firefox)

Data **never leaves your device** except:
- When you explicitly export settings (manual download)
- When communicating with **your configured app origins**

### Data Encryption

- HMAC keys stored in local storage (browser-encrypted)
- Settings not transmitted over network
- No cloud storage or remote backup

## Data Usage

### How We Use Data

1. **Settings**: To configure extension behavior and validate communications
2. **History**: To display recent activity in popup UI
3. **HMAC Key**: To verify message authenticity from web app
4. **Origins**: To validate allowed communication endpoints

### Third-Party Access

- ✅ **Zero third-party access**
- ✅ **No external APIs called**
- ✅ **No tracking or analytics services**
- ✅ **No advertising networks**

## Communication

### Web App Integration

The Extension communicates **only** with:
- Origins you explicitly configure in settings
- Using HMAC-signed messages
- Over secure HTTPS connections (recommended)

### Message Content

Messages contain:
- Job URLs (to navigate)
- Form field values (to auto-fill)
- Application results (success/error)
- Timestamps and request IDs

**Never transmitted**:
- Credentials
- Unrelated browsing data
- Personal information from other sites

## Permissions

### Why We Need Them

The Extension requests minimal permissions:

1. **`storage`** - Save settings and history locally
2. **`tabs`** - Open job pages and detect platform
3. **`scripting`** - Inject content scripts to fill forms
4. **`activeTab`** - Access current tab when triggered
5. **`alarms`** - Schedule background tasks
6. **`notifications`** - Display status updates
7. **`host_permissions`** - Access job board domains

### What We Don't Access

- ❌ All websites (`<all_urls>`) - only specific job platforms
- ❌ Clipboard - no copy/paste monitoring
- ❌ Geolocation - no location tracking
- ❌ Camera/microphone - no media access
- ❌ Downloads - no file system access beyond file selection

## User Rights

### Your Control

You have the right to:

1. **Access**: View all stored data in extension options
2. **Export**: Download settings as JSON file
3. **Delete**: Clear history or uninstall extension
4. **Modify**: Change settings at any time
5. **Revoke**: Disable extension or specific platforms

### Data Deletion

To delete all data:
1. Open extension options
2. Clear history (if desired)
3. Uninstall extension from browser
4. All local data is automatically removed

**Note**: Uninstalling permanently deletes all settings and history.

## Security

### How We Protect Data

1. **HMAC Authentication**: Cryptographic message verification
2. **Origin Validation**: Strict origin allow-list
3. **Constant-Time Comparison**: Prevent timing attacks
4. **No Logging**: Sensitive data never logged to console
5. **Minimal Permissions**: Least privilege principle
6. **HTTPS Recommended**: Secure communication only

### Security Best Practices

For maximum security:
- ✅ Use strong HMAC keys (32+ characters)
- ✅ Enable HTTPS for web app origins
- ✅ Regularly update extension
- ✅ Review allowed origins periodically
- ✅ Use dry-run mode for unfamiliar sites

## Compliance

### Legal Basis

The Extension operates under:
- **User Consent**: You install and configure extension
- **Legitimate Interest**: Automating job applications per your request
- **Transparency**: Clear disclosure of all data practices

### Regulations

We comply with:
- **GDPR** (EU General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **Browser Store Policies** (Chrome Web Store, Firefox Add-ons)

### Data Retention

- **Settings**: Stored until you change or uninstall
- **History**: Last 100 runs, automatically pruned
- **No Server Storage**: No retention on our servers (we have none)

## Children's Privacy

The Extension is **not directed at children under 13**. We do not knowingly collect data from children. If we learn of such collection, we will delete it immediately.

## Changes to Policy

We may update this policy to reflect:
- Feature additions
- Regulatory changes
- User feedback

**Notification**: Updates posted in extension and documentation. Continued use constitutes acceptance.

## Contact

### Privacy Questions

For privacy-related questions:
- **Email**: privacy@jobpilot.com
- **GitHub**: Open issue (for non-sensitive questions)

### Data Requests

To request data access, deletion, or correction:
1. All data is already accessible in extension options
2. Deletion via uninstall
3. No server-side data to request

## Transparency

### Open Source

The Extension is open source. You can:
- Review all code on GitHub
- Audit data collection practices
- Verify privacy claims
- Contribute improvements

### No Hidden Behavior

- ✅ **Source code available** for inspection
- ✅ **No obfuscation** or minification (in dev builds)
- ✅ **Clear data flow** documented in code
- ✅ **Testable** privacy claims

## Summary

**In Plain English:**

1. We store settings and history **only on your device**
2. We **never send data to our servers** (we don't have any)
3. We **only communicate with apps you configure**
4. You can **delete everything** by uninstalling
5. We **don't track, analyze, or monetize** your data

**You are in complete control** of your data at all times.

---

**Questions?** Read our [FAQ](./README.md#troubleshooting) or contact privacy@jobpilot.com
