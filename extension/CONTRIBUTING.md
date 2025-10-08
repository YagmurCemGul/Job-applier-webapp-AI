# Contributing to JobPilot Extension

Thank you for your interest in contributing! This document provides guidelines for contributing to the browser extension.

## Development Setup

1. **Clone and install:**
   ```bash
   git clone <repository>
   cd extension
   npm install
   ```

2. **Build and load:**
   ```bash
   npm run build
   # Load dist-extension/ in browser as unpacked extension
   ```

3. **Watch mode:**
   ```bash
   npm run dev
   # Auto-rebuilds on file changes
   ```

## Code Style

### TypeScript

- Use strict TypeScript
- Prefer `interface` over `type` for object shapes
- Export types from dedicated files
- Document complex logic with comments

### React

- Functional components with hooks
- Use TypeScript for props
- Keep components small and focused
- Prefer composition over inheritance

### Naming

- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types: `PascalCase`

### Formatting

```bash
npm run lint
npm run type-check
```

## Adding a New Platform

To add support for a new job platform:

1. **Create content script:**
   ```typescript
   // content/newplatform.ts
   import { DOMHelper } from './shared/dom';
   import { AutoFiller } from './shared/autofill';
   // ... implement handler
   ```

2. **Add to manifest:**
   ```json
   {
     "matches": ["https://jobs.newplatform.com/*"],
     "js": ["content/newplatform.js"]
   }
   ```

3. **Update schema:**
   ```typescript
   // storage/schema.ts
   export type DomainKey = '...' | 'newplatform';
   ```

4. **Add parser:**
   ```typescript
   // content/shared/parse.ts
   private static parseNewPlatform(): Partial<ParsedJob> {
     // Extract job metadata
   }
   ```

5. **Write tests:**
   ```typescript
   // tests/integration/content-newplatform.spec.ts
   ```

6. **Update documentation:**
   - Add to README.md supported platforms
   - Document any special considerations

## Testing

### Unit Tests

Test individual functions and utilities:

```typescript
// tests/unit/myutil.spec.ts
import { describe, it, expect } from 'vitest';

describe('MyUtil', () => {
  it('should do something', () => {
    expect(myUtil()).toBe(expected);
  });
});
```

### Integration Tests

Test content scripts with DOM:

```typescript
// tests/integration/content-platform.spec.ts
import { JSDOM } from 'jsdom';

describe('Platform Handler', () => {
  beforeEach(() => {
    const dom = new JSDOM(fixtureHTML);
    global.document = dom.window.document;
  });
  
  it('should fill form', () => {
    // Test form filling logic
  });
});
```

### E2E Tests

Test full flow with Playwright:

```typescript
// tests/e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test('should complete flow', async ({ page }) => {
  // Test end-to-end scenario
});
```

Run tests:
```bash
npm test              # Unit + integration
npm run test:e2e      # E2E tests
npm test -- --coverage # With coverage
```

## Debugging

### Background Service Worker

1. `chrome://extensions/` → "Inspect views: service worker"
2. Console shows background logs
3. Use `console.log` liberally

### Content Scripts

1. Open job page
2. Right-click → "Inspect"
3. Console tab shows content script logs
4. Logs prefixed with `[Platform]`

### React Components

1. Install React DevTools
2. Inspect popup/options page
3. View component tree and state

## Pull Request Process

1. **Create branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes:**
   - Write code
   - Add tests
   - Update docs

3. **Test thoroughly:**
   ```bash
   npm test
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Commit with clear message:**
   ```bash
   git commit -m "feat(platform): add support for NewPlatform"
   ```

   Use conventional commits:
   - `feat:` - new feature
   - `fix:` - bug fix
   - `docs:` - documentation
   - `test:` - tests
   - `refactor:` - code refactoring
   - `chore:` - maintenance

5. **Push and create PR:**
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

6. **PR checklist:**
   - [ ] Tests pass
   - [ ] Linting passes
   - [ ] Types check
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated (if applicable)
   - [ ] No console errors in extension

## Code Review

Reviewers will check:

- Code quality and style
- Test coverage
- Security implications
- Performance impact
- Accessibility compliance
- Documentation completeness

## Security

### Reporting Issues

**Do NOT open public issues for security vulnerabilities.**

Email security concerns to: security@jobpilot.com

### Security Considerations

- Never log sensitive data (HMAC keys, user data)
- Validate all inputs from web app
- Use constant-time comparison for signatures
- Minimize permissions
- Escape user content in overlays
- Follow CSP guidelines

## Performance

- Avoid heavy DOM operations in loops
- Use `requestIdleCallback` for non-critical work
- Debounce event handlers
- Lazy-load content scripts when possible
- Profile with Chrome DevTools

## Accessibility

- Use semantic HTML
- Provide ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain WCAG AA contrast ratios
- Focus management in overlays

## Documentation

Update relevant docs:

- **README.md** - features, usage, troubleshooting
- **INSTALL.md** - installation steps
- **Code comments** - complex logic
- **Type definitions** - public APIs

## Questions?

- Check existing issues and PRs
- Read documentation thoroughly
- Ask in discussions

Thank you for contributing! 🎉
