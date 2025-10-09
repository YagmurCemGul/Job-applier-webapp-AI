# Step 40: Personal Brand & Portfolio Publisher — Technical Notes

## Overview

Step 40 transforms the Evidence Binder (Step 38), Docs (Step 30), AI (Step 31), Applications context (Step 33), and Quotes/Highlights (Step 39) into a complete **Personal Brand & Portfolio Publisher**. It enables users to create, customize, and deploy a professional portfolio site with case studies, blog, SEO optimization, social scheduling, and analytics.

## Architecture

### Core Components

1. **Types** (`src/types/site.types.ts`)
   - Comprehensive type definitions for portfolio, case studies, blog posts, themes, social posts, contact forms, and publishing targets
   - 10 theme presets with full customization options
   - Visibility states: draft, private, public

2. **Store** (`src/stores/site.store.ts`)
   - Zustand store with localStorage persistence
   - Manages site state, social posts, media library
   - Actions for CRUD operations on all content types

3. **Services** (`src/services/site/`)
   - **siteBuilder.service.ts**: Theme presets, validation, contrast checking
   - **caseStudy.service.ts**: Build case studies from Evidence Binder
   - **markdown.service.ts**: Safe Markdown → HTML conversion with XSS protection
   - **seo.service.ts**: Slugify, meta tags, sitemap generation, validation
   - **ogImage.service.ts**: Canvas-based OG image rendering (1200×630)
   - **publish.service.ts**: Static site export + hosting adapters
   - **analytics.service.ts**: Privacy-friendly tracking stubs + UTM builder
   - **contact.service.ts**: Gmail integration for contact form delivery
   - **socialScheduler.service.ts**: Calendar reminders for scheduled posts
   - **importers.service.ts**: Import from text/JSON

4. **UI Components** (`src/components/site/`)
   - 14 components covering all portfolio functionality
   - Fully accessible (WCAG AA), keyboard navigable, ARIA labels
   - Responsive design with Tailwind CSS

5. **Pages**
   - **Portfolio.tsx**: Main hub with 12 tabs for all features

## Key Features

### 1. Content Creation

**Profile Editor**
- Headline, bio, avatar, location, public email
- Social/professional links
- Skills tags
- Character counters for all fields

**Case Study Editor**
- Generate drafts from Evidence Binder (Step 38)
- Markdown editor with live preview
- Highlights, quotes, competency tags, links
- Visibility controls (draft/private/public)
- Import from text or JSON

**Blog Editor**
- Markdown authoring with preview
- Date, tags, cover images
- Share via Gmail after publishing

**Media Library**
- Client-side image upload (data URLs)
- Alt text editor for accessibility
- Copy URL to clipboard
- Used in case studies and blog posts

### 2. SEO & Optimization

**SEO Inspector**
- Content selector (all cases and posts)
- Validation: title ≤60 chars, description ≤160 chars, slug ≤80 chars
- Meta tag preview (Open Graph, Twitter cards)
- OG image generator (Canvas-based, 1200×630)
- Sitemap.xml download
- Robots.txt generation

**Best Practices**
- Slugs: lowercase, hyphens, no special chars
- HTML escaping prevents XSS
- Optional "noai" meta tag for AI training opt-out

### 3. Theming & Branding

**Theme Picker**
- 10 presets: minimal, studio, folio, grid, writer, executive, product, engineer, designer, consultant
- Custom colors (primary, accent) with hex input
- Font selection (heading, body)
- Layout variants: single column, two-column, grid
- Auto dark mode toggle
- Contrast checker (WCAG AA: 4.5:1 ratio)
- Live preview

### 4. Publishing & Deployment

**Static Export**
- Client-side ZIP generation using JSZip
- Includes:
  - index.html (profile, links to cases/blog)
  - cases/{slug}.html for each public case study
  - blog/{slug}.html for each public post
  - assets/styles.css (theme-based)
  - sitemap.xml
  - robots.txt
- Honors visibility filters (only public content)
- Theme styling applied

**Hosting Adapters (Stubs)**
- Vercel, Netlify, GitHub Pages deployment stubs
- Clear contracts for server-side implementation
- Never log authentication tokens
- Return deployment URL

**Domain Setup**
- DNS configuration guide for custom domains
- CNAME record instructions per hosting provider
- SSL/TLS verification link

### 5. Social Media Scheduler

**Features**
- Compose posts for LinkedIn, Twitter, Facebook, Instagram, Mastodon, Threads
- Schedule with datetime picker
- Generate post copy from case studies
- Calendar reminder integration (Step 35)
- Status tracking: draft → scheduled → posted/failed
- Filter by status

**Network Posting**
- Intentionally stubbed (manual posting)
- Prevents unauthorized access to user accounts
- Calendar reminders prompt user to post manually

### 6. Contact Form Builder

**Form Configuration**
- Custom fields: text, email, textarea
- Required/optional toggles
- Success message customization

**Spam Protection**
- **Honeypot**: hidden field to catch bots
- **Time-gate**: minimum seconds before submit enabled
- Client-side validation

**Delivery**
- Gmail integration (Step 35)
- HTML email with field values
- Error handling for failed sends

### 7. Analytics

**Privacy-First**
- Opt-in only (default: off)
- No cookies, no personal data
- Anonymized counters (stub implementation)

**UTM Builder**
- Custom parameters: source, medium, campaign
- Presets for LinkedIn, Twitter, email
- Copy tagged URLs to clipboard

### 8. Preview & Live Site

**PreviewPane**
- Live rendering from store state
- Responsive viewport switcher (desktop, tablet, mobile)
- Navigate between home, cases, blog posts
- Applies current theme

## Privacy & Compliance

### Analytics
- Default: disabled
- No cookies or tracking without opt-in
- Anonymized, aggregated data only
- Stub adapters marked for production services (Plausible, Fathom, Simple Analytics)

### Contact Form
- Submissions stored locally only
- Email delivery requires user action
- Spam protection (honeypot + time-gate)
- No data sent to third parties

### Publishing
- User-triggered, authenticated calls
- Tokens never logged
- Static export is fully client-side
- Legal notice before publishing

### AI Training Opt-Out
- Optional "noai, noimageai" meta tag
- User-controlled toggle
- Applied to all exported pages

## Integration Points

### Step 35 (Gmail & Calendar)
- Contact form delivery via Gmail API
- Social post reminders via Calendar API
- Requires encrypted OAuth tokens

### Step 38 (Evidence Binder)
- Generate case studies from onboarding plans
- Evidence items → highlights bullets
- Quantified impact data

### Step 39 (Reviews & Feedback)
- Add quotes from performance reviews to case studies
- Testimonials and feedback highlights

## Testing

### Unit Tests (6 files)
- `markdown.spec.ts`: HTML conversion, escaping, excerpts
- `seo.spec.ts`: Slugify, meta tags, sitemap, validation
- `ogImage.spec.ts`: Canvas rendering, data URL → Blob
- `publish.spec.ts`: ZIP export, content filtering, theme application
- `caseStudy.spec.ts`: Evidence import, quote addition, excerpt generation
- `contactMailer.spec.ts`: Spam protection, Gmail sending, error handling

### Integration Tests (3 files)
- `site_publish.spec.ts`: Create content → set public → export ZIP
- `social_schedule.spec.ts`: Compose post → schedule → Calendar reminder
- `contact_form_flow.spec.ts`: Build form → test submission → Gmail delivery

### E2E Test (1 file)
- `step40-portfolio-flow.spec.ts`: Complete user journey from profile setup to publishing

## Accessibility (WCAG AA)

- **Semantic HTML**: Proper heading hierarchy, landmarks
- **Keyboard Navigation**: All interactive elements accessible via Tab/Enter
- **ARIA Labels**: Screen reader support for all controls
- **Focus Management**: Visible focus indicators (ring-2)
- **Color Contrast**: Contrast checker warns if ratio < 4.5:1
- **Alt Text**: Required for all images in Media Library
- **Form Labels**: All inputs labeled, required fields marked

## Internationalization

- EN/TR translations in `i18n/en/site.json` and `i18n/tr/site.json`
- All UI strings use `t()` from react-i18next
- Slugs are ASCII-only for URL safety

## Performance

- **Lazy Loading**: Tabs load content on demand
- **Client-Side Rendering**: No server required for editing
- **Local Storage**: All data persisted locally
- **Optimistic Updates**: Immediate UI feedback
- **Code Splitting**: Components loaded as needed

## Security

- **XSS Prevention**: All Markdown and user input escaped
- **No Inline Scripts**: CSP-compatible
- **Safe Data URLs**: Images validated before upload
- **Token Security**: OAuth tokens encrypted, never logged
- **Spam Protection**: Honeypot + time-gate for contact forms

## Known Limitations & Stubs

1. **Hosting Adapters**: Vercel/Netlify/GitHub Pages are stubs; replace with actual APIs
2. **OG Image Rendering**: Canvas-based; production should use serverless functions with proper fonts
3. **Analytics**: Stub counters; integrate with Plausible, Fathom, or Simple Analytics
4. **Social Network Posting**: Intentionally stubbed; manual posting required
5. **Media Upload**: Client-side data URLs; production should use CDN (e.g., Cloudinary)

## Future Enhancements

- **RSS Feed**: Auto-generate RSS for blog posts
- **Search**: Client-side search with Fuse.js
- **Comments**: Integrate with Disqus or Utterances
- **Versioning**: Git-based version control for content
- **Collaboration**: Share drafts with reviewers
- **Templates**: Pre-built case study templates
- **AI Assist**: Generate post intros with LLM
- **Multi-Language**: Publish in multiple languages

## Migration & Backup

- All data stored in Zustand with localStorage persistence
- Export/import site state as JSON
- ZIP exports serve as static backups
- No server dependencies for local editing

## Deployment Checklist

Before deploying a portfolio:

1. ✅ Profile complete (headline, bio, links)
2. ✅ At least 1 public case study or blog post
3. ✅ SEO validated (titles, descriptions, slugs)
4. ✅ Theme chosen and contrast checked
5. ✅ Contact form configured (if needed)
6. ✅ Analytics opt-in decision made
7. ✅ Preview tested on all viewports
8. ✅ Export ZIP or deploy to hosting
9. ✅ Custom domain configured (optional)
10. ✅ SSL/TLS verified

## Commit Message

```
feat(portfolio): Personal Brand & Portfolio Publisher — case studies from evidence, blog with Markdown, SEO/OG, theming, static export + deploy adapters, social scheduler, analytics, and Gmail contact delivery

- Add types, store, 10 services for portfolio site builder
- Create 14 UI components (dashboard, editors, theme picker, preview, publish)
- Implement case study generation from Evidence Binder (Step 38)
- Add Markdown editor with safe HTML rendering and XSS prevention
- Build SEO inspector with meta tag generation, OG images (Canvas), sitemap
- Provide 10 theme presets with custom colors, fonts, contrast checker
- Implement static ZIP export with JSZip
- Add hosting adapters (Vercel/Netlify/GitHub Pages stubs)
- Create social scheduler with Calendar reminders (Step 35)
- Build contact form with Gmail delivery and spam protection (honeypot + time-gate)
- Add privacy-friendly analytics with opt-in and UTM builder
- Include media library with alt text editor
- Support draft/private/public visibility for all content
- Implement responsive preview with viewport switcher
- Add custom domain setup guide
- Provide EN/TR i18n
- Include 10 test files (6 unit, 3 integration, 1 e2e)
- Ensure WCAG AA accessibility, keyboard navigation, ARIA labels
- Document architecture, privacy, security, and deployment
```