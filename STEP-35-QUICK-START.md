# Step 35 - Quick Start Guide

## 🚀 Getting Started with Email Outreach

### Prerequisites

1. **Google Cloud Project** with:
   - Gmail API enabled
   - Google Calendar API enabled
   - OAuth 2.0 Client ID configured

2. **Environment Variables** set:
   ```bash
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   VITE_OAUTH_PASSPHRASE=your-secure-passphrase
   ```

### Step 1: OAuth Setup (One-time)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable APIs:
   - Gmail API
   - Google Calendar API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://yourdomain.com`
5. Copy Client ID to `.env`

### Step 2: Install & Run

```bash
cd ai-cv-builder
npm install
npm run dev
```

### Step 3: Connect Gmail

1. Navigate to `/outbox` (or click "Outbox" in sidebar)
2. Click "Connect Gmail"
3. Authenticate with Google
4. ✅ Account appears (dry-run mode enabled by default)

### Step 4: Create Template

1. Go to Applications page
2. Open "Email Templates" section
3. Create new template:
   ```
   Subject: Re: {{Position}} at {{Company}}
   
   Body:
   Hi {{RecruiterName}},
   
   Following up on my application for {{Position}}.
   I'm very interested in joining {{Company}}...
   ```

### Step 5: Create Sequence

1. In Applications, create outreach sequence:
   - Step 1: Initial contact (day 0)
   - Step 2: Follow-up (day 3)
   - Step 3: Final check-in (day 7)

### Step 6: Start Sequence Run

1. Select an application
2. Click "Start Outreach"
3. Fill in variables:
   - `RecruiterName`: John Doe
   - `RecruiterEmail`: john@company.com
   - `Position`: Senior Engineer
   - `Company`: Acme Corp
4. Click "Start"

### Step 7: Monitor in Outbox

1. Go to Outbox page
2. See sequence runner panel (shows active runs)
3. View messages in outbox (status: scheduled in dry-run)
4. Check "Next send" time

### Step 8: Enable Live Sending (when ready)

1. In Outbox → Account Settings
2. Toggle "Dry-Run Mode" OFF for your account
3. ⚠️ **Warning**: Real emails will now be sent!
4. Sequences will execute and send actual emails

## 📧 Sending Your First Email

### Quick Test (Dry-Run)

1. Create simple template
2. Start sequence with 1 step
3. Check Outbox - status will be "scheduled"
4. Message appears in outbox but not sent

### Real Send

1. Disable dry-run mode
2. Create/start sequence
3. Watch Sequence Runner panel
4. Email sends when "Next send" time arrives
5. Status changes to "sent"
6. ThreadId appears - click to view

## 🗓️ Proposing Meeting Times

1. In Outbox, click "Propose Times"
2. Set meeting title and duration
3. View suggested slots (next 2 days, business hours)
4. Click "Download ICS" on desired slot
5. Attach ICS to email or share link

## 🔍 Viewing Email Threads

1. In Outbox, find sent message
2. Click "View Thread"
3. See full conversation
4. Reply classification (if AI enabled)

## 🎯 Integration with Jobs/Applications

### From Jobs Page
1. Find job listing
2. Click "Email Recruiter"
3. Template pre-fills with job details
4. Start outreach sequence

### From Applications Page
1. Select application
2. Open outreach section
3. Create/start sequence
4. History logs to application timeline

## ⚙️ Configuration

### Adjust Scheduler Tick Rate
```typescript
// In sequenceScheduler.store.ts
tickSec: 30 // Check every 30 seconds (default)
```

### Set Daily Send Limit
```typescript
// Per account in Account Settings
dailyLimit: 90 // Max emails per day
```

### Customize Backoff on Failure
```typescript
// In sequenceRunner.service.ts
const backoffTime = new Date(Date.now() + 6 * 3600 * 1000) // 6 hours
```

## 🧪 Testing

### Test Template Rendering
```bash
npm run test -- templateRender.spec.ts
```

### Test Gmail MIME Building
```bash
npm run test -- gmail.real.service.spec.ts
```

### Test Full Flow (E2E)
```bash
npm run test:e2e -- step35-outreach-flow.spec.ts
```

## 🐛 Troubleshooting

### OAuth popup blocked
- Disable popup blocker for localhost
- Try incognito/private window

### "Token refresh failed"
- Re-connect Gmail account
- Check OAuth consent screen setup

### Sequences not running
- Check scheduler is running (Resume All)
- Verify nextSendAt is in past
- Check browser console for errors

### Gmail send fails
- Verify Gmail API is enabled
- Check scopes include `gmail.send`
- Ensure not over daily limit

## 📚 Learn More

- [Full Documentation](./docs/STEP-35-NOTES.md)
- [Completion Report](./STEP-35-COMPLETION-REPORT.md)
- [Gmail API Docs](https://developers.google.com/gmail/api)
- [Calendar API Docs](https://developers.google.com/calendar/api)

## 🎉 You're Ready!

Your email outreach system is now fully operational. Start connecting with recruiters and tracking your job search communications professionally!

---

**Questions?** Check the [troubleshooting guide](./docs/STEP-35-NOTES.md#troubleshooting) or review test files for usage examples.
