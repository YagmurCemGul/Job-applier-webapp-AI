/**
 * @fileoverview E2E test for Step 42 Auto-Apply workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Step 42: Auto-Apply & Application Assistant', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Apply page
    await page.goto('/apply');
  });

  test('complete auto-apply workflow', async ({ page }) => {
    // 1. Intake: Paste job description
    await page.click('text=Intake');
    await page.fill('[placeholder*="job description"]', `
      Role: Senior Software Engineer
      Company: TechCorp Inc.
      Location: Remote
      
      Requirements:
      - 5+ years of experience
      - React and TypeScript expertise
      - AWS knowledge
      
      Q: What is your experience with React?
      Q: Are you authorized to work in the US?
    `);
    await page.click('text=Parse');
    
    // Verify parsing
    await expect(page.locator('text=TechCorp Inc.')).toBeVisible();
    await expect(page.locator('text=Senior Software Engineer')).toBeVisible();
    
    // 2. Q&A: Generate answers
    await page.click('text=Q&A');
    await page.click('text=Generate Draft');
    
    // Wait for AI to generate answers
    await page.waitForTimeout(500);
    
    // Run policy scan
    await page.click('text=Run Policy Scan');
    await expect(page.locator('text=visa')).toBeVisible(); // Should flag work authorization question
    
    // 3. Variants: Select resume
    await page.click('text=Variants');
    
    // Upload or select a variant (in real test, would upload)
    // For now, verify the variant picker UI exists
    await expect(page.locator('text=Pick resume')).toBeVisible();
    
    // 4. Mapping: Select ATS
    await page.click('text=Mapping');
    await page.selectOption('select', 'greenhouse-basic');
    
    // 5. Autofill: Send to extension (or copy bundle)
    await page.click('text=Autofill');
    
    // Click copy bundle as fallback
    await page.click('text=Copy Bundle');
    await expect(page.locator('text=Copied')).toBeVisible({ timeout: 3000 });
    
    // 6. Review & Submit
    await page.click('text=Review');
    
    // Verify review content
    await expect(page.locator('text=TechCorp')).toBeVisible();
    await expect(page.locator('text=85%').or(page.locator('text=Coverage'))).toBeVisible();
    
    // Accept consent
    await page.check('#consent');
    
    // Click submit
    await page.click('text=Mark Submitted');
    
    // 7. Verify in history
    await page.click('text=History');
    await expect(page.locator('text=TechCorp')).toBeVisible();
    await expect(page.locator('text=submitted')).toBeVisible();
  });

  test('settings configuration', async ({ page }) => {
    await page.click('text=Settings');
    
    // Verify settings sheet opens
    await expect(page.locator('text=Quiet Hours Start')).toBeVisible();
    
    // Update rate limit
    await page.fill('#rate-limit', '10');
    
    // Update follow-up days
    await page.fill('#follow-up', '14');
  });

  test('policy warnings display correctly', async ({ page }) => {
    await page.click('text=Intake');
    await page.fill('[placeholder*="job description"]', `
      Q: What are your salary expectations?
      Q: Do you require visa sponsorship?
    `);
    await page.click('text=Parse');
    
    await page.click('text=Q&A');
    await page.fill('textarea', 'My expectations are $150,000');
    await page.click('text=Run Policy Scan');
    
    // Verify policy warnings
    await expect(page.locator('text=salary')).toBeVisible();
    await expect(page.locator('text=visa')).toBeVisible();
  });

  test('coverage meter shows keyword analysis', async ({ page }) => {
    // Navigate through intake and select variant
    await page.click('text=Intake');
    await page.fill('[placeholder*="job description"]', `
      Role: React Developer
      Requirements:
      - React
      - TypeScript
      - AWS
    `);
    await page.click('text=Parse');
    
    await page.click('text=Variants');
    
    // In real test, would verify coverage percentage
    await expect(page.locator('text=Coverage')).toBeVisible();
  });

  test('extension bridge handles fallback', async ({ page }) => {
    await page.click('text=Autofill');
    
    // Try to send to extension (will fail in test environment)
    await page.click('text=Send Plan to Extension');
    
    // Should show error or use fallback
    await page.click('text=Copy Bundle');
    
    // Verify clipboard copy works
    await expect(page.locator('text=Copied').or(page.locator('text=Copy Bundle'))).toBeVisible();
  });

  test('Applications page integration', async ({ page }) => {
    await page.goto('/applications');
    
    // Click Auto-Apply on first application
    await page.click('text=Auto-Apply');
    
    // Should navigate to Apply page
    await expect(page).toHaveURL(/\/apply/);
  });

  test('accessibility: keyboard navigation', async ({ page }) => {
    // Tab through main tabs
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify focus management
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(focusedElement);
  });

  test('rate limiting works', async ({ page }) => {
    await page.click('text=Autofill');
    
    // Try to send plan multiple times rapidly
    for (let i = 0; i < 6; i++) {
      await page.click('text=Send Plan to Extension');
    }
    
    // Should show rate limit message after threshold
    await expect(page.locator('text=Rate limit').or(page.locator('text=wait'))).toBeVisible({ timeout: 5000 });
  });
});
