# Web App Integration

This directory contains the integration code for connecting your JobPilot web app (Steps 17-33) with the browser extension.

## Setup

### 1. Install Extension

Users must install the browser extension first. See [../INSTALL.md](../INSTALL.md).

### 2. Configure Extension

Users configure in extension Options:
1. Add app origin (e.g., `https://app.jobpilot.com`)
2. Enter shared HMAC key
3. Enable desired platforms

### 3. Integrate in Web App

#### Import Bridge

```typescript
// In your Auto-Apply component (Step 33)
import { ExtensionBridge } from '@/lib/extension-bridge';

// Initialize with HMAC key from environment
const bridge = new ExtensionBridge({
  hmacKey: process.env.NEXT_PUBLIC_EXTENSION_HMAC_KEY!,
});
```

#### Send Auto-Apply Request

```typescript
// In your auto-apply handler
async function handleAutoApply(job: Job, profile: Profile) {
  try {
    // Prepare files (convert to blob URLs)
    const files = [
      {
        name: 'resume.pdf',
        url: await generateBlobUrl(profile.cvFile),
        type: 'cv' as const,
      },
      {
        name: 'cover_letter.pdf',
        url: await generateBlobUrl(coverLetterPdf),
        type: 'coverLetter' as const,
      },
    ];

    // Prepare answers from profile
    const answers = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      linkedIn: profile.linkedIn,
      github: profile.github,
      // ... other fields
    };

    // Send to extension
    const result = await bridge.sendApplyRequest({
      jobUrl: job.url,
      platform: job.platform, // 'greenhouse' | 'lever' | etc.
      files,
      answers,
      dryRun: settings.dryRunDefault,
      locale: i18n.language,
    });

    if (result.payload.ok) {
      // Success!
      await updateApplication({
        status: result.payload.submitted ? 'applied' : 'draft',
        appliedAt: result.payload.submitted ? new Date() : undefined,
        logs: result.payload.hints,
      });
    } else {
      // Error
      throw new Error(result.payload.message);
    }
  } catch (error) {
    // Handle error (extension not installed, etc.)
    console.error('Auto-apply failed:', error);
  }
}
```

#### Quick Import Job

```typescript
// In your Job Finder (Step 32)
async function handleQuickImport() {
  try {
    const jobData = await bridge.importCurrentJob();

    // Create job from parsed data
    await createJob({
      title: jobData.payload.title,
      company: jobData.payload.company,
      location: jobData.payload.location,
      description: jobData.payload.description,
      url: jobData.payload.url,
      platform: jobData.payload.platform,
      salary: jobData.payload.salary,
      remote: jobData.payload.remote,
    });

    toast.success('Job imported successfully!');
  } catch (error) {
    toast.error('Failed to import job');
  }
}
```

#### Check Extension Status

```typescript
// In your app initialization
useEffect(() => {
  async function checkExtension() {
    const installed = await bridge.isExtensionInstalled();
    
    if (!installed) {
      // Show prompt to install extension
      setShowExtensionPrompt(true);
    } else {
      // Test connection
      const connected = await bridge.ping();
      
      if (!connected) {
        // Show configuration prompt
        setShowExtensionConfigPrompt(true);
      }
    }
  }

  checkExtension();
}, []);
```

## React Hook (Optional)

Use the provided hook for easier integration:

```typescript
import { useExtensionBridge } from '@/lib/extension-bridge';

function AutoApplyPanel() {
  const { sendApplyRequest, isExtensionInstalled } = useExtensionBridge(
    process.env.NEXT_PUBLIC_EXTENSION_HMAC_KEY!
  );

  const handleApply = async () => {
    const result = await sendApplyRequest({
      jobUrl: job.url,
      platform: job.platform,
      // ... other params
    });

    // Handle result
  };

  return <button onClick={handleApply}>Auto Apply</button>;
}
```

## Environment Variables

Add to your `.env`:

```bash
# Shared HMAC key for extension communication
# Must match the key users enter in extension settings
NEXT_PUBLIC_EXTENSION_HMAC_KEY=your-secret-key-here-min-32-chars
```

**Important**: Use a strong, random key. Generate with:

```bash
openssl rand -hex 32
```

## Message Flow

1. **Web App → Extension**:
   ```
   ApplyStartMsg (signed) → Extension validates → Opens tab → Runs apply
   ```

2. **Extension → Web App**:
   ```
   ApplyResultMsg → Web app receives → Updates application status
   ```

3. **Extension → Web App (Import)**:
   ```
   User clicks parse → Extension parses page → ImportJobMsg → Web app creates job
   ```

## Error Handling

Common errors and solutions:

### Extension Not Installed

```typescript
try {
  await bridge.sendApplyRequest(...)
} catch (error) {
  if (error.message.includes('Extension error')) {
    // Show install prompt
    showExtensionInstallPrompt();
  }
}
```

### Origin Not Allowed

User needs to add your app origin in extension settings.

### Invalid HMAC

Keys don't match. User needs to update extension key.

### Rate Limited

Extension rate limit exceeded. Show retry message.

## Security Notes

1. **HMAC Key**: Never commit to repository. Use environment variables.
2. **Origin Validation**: Extension validates origin before processing.
3. **User Consent**: Extension requires explicit Legal Mode opt-in.
4. **No Auto-Install**: Users must manually install and configure extension.

## TypeScript Support

Copy types from extension:

```typescript
// lib/types/extension.ts
export type DomainKey = 'greenhouse' | 'lever' | 'workday' | 'indeed' | 'linkedin' | 'generic';

export interface ApplyPayload {
  jobUrl: string;
  platform: DomainKey;
  files: Array<{ name: string; url: string; type: 'cv' | 'coverLetter' }>;
  answers?: Record<string, string | boolean | string[]>;
  dryRun?: boolean;
  locale?: 'en' | 'tr';
}

export interface ApplyResult {
  ok: boolean;
  message?: string;
  url?: string;
  submitted?: boolean;
  reviewNeeded?: boolean;
  hints?: string[];
}
```

## Testing Integration

1. **Install extension** (unpacked in dev)
2. **Configure** with localhost origin and test key
3. **Run web app** on configured origin
4. **Test auto-apply** with dry-run mode
5. **Verify logs** in extension popup

## Deployment Checklist

- [ ] Generate production HMAC key
- [ ] Set environment variable in hosting platform
- [ ] Update extension documentation with production origin
- [ ] Test connection in production
- [ ] Monitor error rates
- [ ] Provide user support for setup

---

**Questions?** See [../README.md](../README.md) for extension documentation.
