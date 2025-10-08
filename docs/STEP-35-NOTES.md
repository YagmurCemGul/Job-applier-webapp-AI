# Step 35 - Production Gmail & Calendar Integration

## Overview

Step 35 implements production-ready email outreach capabilities with Gmail and Google Calendar integrations, sequence automation, and AI-powered reply classification.

## Features

### 1. Gmail Integration

- **OAuth Authentication**: Google Identity Services (GIS) token client
- **Email Sending**: Full MIME support with attachments
- **Thread Management**: Fetch and display email threads
- **Tracking**: Open/click tracking with pixel and link wrapping
- **Rate Limiting**: Configurable daily limits with safe backoff
- **Error Handling**: Exponential retry with 6-hour backoff

### 2. Google Calendar Integration

- **Time Proposals**: Smart slot generation for meeting scheduling
- **ICS Generation**: RFC 5545 compliant calendar files
- **Event Creation**: Direct Google Calendar API integration
- **Timezone Support**: Automatic timezone detection

### 3. Sequence Runner

- **Automated Execution**: Background scheduler with configurable tick rate
- **Persistence**: State preserved across page reloads
- **Idempotency**: Safe retry logic prevents duplicate sends
- **Dry-Run Mode**: Test sequences without sending emails
- **History Tracking**: Complete audit trail of sequence execution

### 4. AI Reply Classifier

- **Intent Detection**: Categorizes replies (POSITIVE, NEUTRAL, NEGATIVE, SCHEDULING, OUT_OF_OFFICE)
- **Confidence Scoring**: Provides confidence level for classifications
- **Fallback Logic**: Rule-based classification when AI unavailable

## Setup

### Environment Variables

Add to `.env`:

```env
# Google OAuth Client ID (required)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Passphrase for token encryption (demo only - use server-side in production)
VITE_OAUTH_PASSPHRASE=your-secure-passphrase
```

### OAuth Client Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable Gmail API and Google Calendar API
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
6. Copy Client ID to environment variable

### Required Scopes

```
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/calendar.events
```

## Architecture

### Data Flow

```
User → OAuth Connect → Token Encrypted → Stored Locally
                                              ↓
Template + Variables → Rendered → Tracking Added → MIME Built
                                                         ↓
Sequence Runner → Schedule Check → Send via Gmail → Update Outbox
                                                         ↓
                                          Thread Created → Fetch & Display
```

### Stores

- **emailAccounts.store.ts**: OAuth-connected Gmail accounts
- **outbox.store.ts**: Sent and pending messages
- **sequenceRuns.store.ts**: Active sequence execution state
- **sequenceScheduler.store.ts**: Background scheduler configuration

### Services

#### Security
- **crypto.service.ts**: AES-GCM token encryption (demo - use server in production)

#### Integrations
- **google.oauth.service.ts**: GIS OAuth flow, token refresh
- **gmail.real.service.ts**: Gmail API send/thread operations
- **calendar.real.service.ts**: Calendar event creation, slot proposals
- **ics.service.ts**: ICS file generation

#### Outreach
- **templateRender.service.ts**: Variable substitution, HTML sanitization
- **tracking.service.ts**: Open pixel, click tracking
- **sequenceRunner.service.ts**: Automated sequence execution
- **replyClassifier.service.ts**: AI-powered reply analysis

## Security & Compliance

### Token Security

**Demo Implementation (Current)**:
- Tokens encrypted with AES-GCM using PBKDF2 key derivation
- Stored in localStorage (encrypted)
- Passphrase from environment variable

**Production Recommendations**:
- Store tokens server-side only
- Use secure session management
- Rotate encryption keys regularly
- Never log or expose tokens

### Privacy

- **User Consent**: Explicit OAuth consent required
- **Data Minimization**: Only requested scopes are used
- **PII Protection**: Email content never logged
- **Token Masking**: Tokens masked in UI displays

### Rate Limiting

- **Default Limit**: 90 emails/day (configurable per account)
- **Backoff Strategy**: 6-hour delay on failure
- **Dry-Run Mode**: Default for new accounts
- **Manual Override**: User must explicitly enable live sending

### Compliance Features

- Dry-run mode by default
- User-initiated sends only
- Clear status indicators
- Complete audit history
- Opt-in tracking

## Usage

### 1. Connect Gmail Account

```typescript
import { connectGoogleAccount } from '@/services/integrations/google.oauth.service';

await connectGoogleAccount({
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  passphrase: import.meta.env.VITE_OAUTH_PASSPHRASE,
  dryRun: true // Safe default
});
```

### 2. Create Email Template

```typescript
import { useEmailTemplates } from '@/stores/emailTemplates.store';

useEmailTemplates.getState().upsert({
  name: 'Follow-up',
  subject: 'Re: {{Position}} at {{Company}}',
  body: 'Hi {{RecruiterName}},\n\nFollowing up on my application...'
});
```

### 3. Start Sequence Run

```typescript
import { useSequenceRuns } from '@/stores/sequenceRuns.store';

useSequenceRuns.getState().upsert({
  id: 'run-1',
  sequenceId: 'seq-1',
  accountId: 'your-email@gmail.com',
  currentStepIndex: 0,
  status: 'running',
  variables: {
    RecruiterName: 'John Doe',
    Position: 'Senior Engineer',
    Company: 'Acme Corp'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  history: []
});
```

### 4. Start Scheduler

```typescript
import { startSequenceScheduler } from '@/services/outreach/sequenceRunner.service';

startSequenceScheduler();
```

## Testing

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage

- **Unit Tests**: Template rendering, MIME building, tracking, OAuth
- **Integration Tests**: Send → thread flow with mocked API
- **E2E Tests**: Full user flow from connect to send

## Troubleshooting

### OAuth Issues

**Error: "OAuth failed: no access token"**
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Check authorized origins in Google Console
- Ensure popup blocker is disabled

**Error: "Token refresh failed"**
- Re-authenticate by disconnecting and reconnecting account
- Check token hasn't been revoked in Google Account settings

### Gmail API Issues

**Error: "Gmail send failed: 403"**
- Verify Gmail API is enabled in Google Console
- Check OAuth scopes include `gmail.send`
- Ensure account has granted permissions

**Error: "Daily limit exceeded"**
- Reduce `dailyLimit` in account settings
- Spread sends over multiple days
- Consider using multiple accounts

### Sequence Runner Issues

**Sequences not executing**
- Check scheduler is running (Resume All button)
- Verify `nextSendAt` is in the past
- Check for errors in browser console

**Dry-run mode stuck**
- Toggle dry-run in Account Settings
- Messages will show as "scheduled" in dry-run mode
- Disable dry-run to enable real sending

## Limitations

### Current Implementation

- **Client-Side Only**: Tokens stored in browser (encrypted)
- **Single Device**: State not synced across devices
- **No Webhook Support**: Reply tracking requires manual checks
- **Limited Analytics**: Basic open/click tracking only

### Production Enhancements Needed

1. **Server-Side Token Management**
   - Store tokens in secure backend
   - Implement refresh token rotation
   - Add token revocation handling

2. **Advanced Analytics**
   - Real-time open/click tracking
   - Reply detection webhooks
   - Engagement scoring

3. **Scale Improvements**
   - Multi-account load balancing
   - Queue-based sending
   - Distributed scheduling

4. **Enterprise Features**
   - Team collaboration
   - Admin controls
   - Compliance reporting

## API Reference

### Gmail Service

```typescript
// Send email
const { id, threadId } = await gmailSend(bearer, outboxMessage);

// Fetch thread
const thread = await gmailGetThread(bearer, threadId);
```

### Calendar Service

```typescript
// Propose time slots
const proposal = proposeSlots({
  durationMin: 30,
  windowStartISO: startDate.toISOString(),
  windowEndISO: endDate.toISOString(),
  timeZone: 'America/New_York'
});

// Create calendar event
const event = await calendarCreate(bearer, {
  title: 'Interview',
  whenISO: slotISO,
  durationMin: 30,
  attendees: ['interviewer@company.com']
});
```

### Template Rendering

```typescript
const rendered = renderTemplate(
  { subject: 'Hello {{Name}}', body: 'Dear {{Name}}...' },
  { Name: 'John' }
);
// Returns: { subject: 'Hello John', html: '...', text: '...' }
```

### Tracking

```typescript
// Generate tracking pixel
const pixelUrl = makeOpenPixel(trackingId);

// Wrap links with click tracking
const trackedHtml = wrapLinksForClick(html, trackingId);
```

## Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [RFC 5545 (iCalendar)](https://tools.ietf.org/html/rfc5545)
- [RFC 822 (Email Format)](https://tools.ietf.org/html/rfc822)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables are set
3. Review OAuth setup in Google Console
4. Check Gmail API quotas and limits
5. Test with dry-run mode enabled

## Changelog

### v1.0.0 (Step 35)
- Initial production implementation
- Gmail OAuth with GIS
- Email sending with MIME support
- Thread fetching and display
- Calendar integration with ICS
- Sequence runner with persistence
- AI reply classifier
- Open/click tracking
- Comprehensive test suite
- Full documentation
