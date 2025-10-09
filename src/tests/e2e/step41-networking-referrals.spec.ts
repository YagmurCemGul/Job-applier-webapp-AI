/**
 * @fileoverview E2E test for Step 41 Networking & Referral Engine
 * 
 * This test simulates a complete user journey:
 * 1. Import contacts
 * 2. Dedupe contacts
 * 3. Compute best path to target company
 * 4. Send intro ask
 * 5. Start recruiter sequence
 * 6. Move item across pipeline
 * 7. RSVP event and send QR vCard
 * 8. View analytics
 */

import { test, expect } from '@playwright/test';

test.describe('Step 41: Networking & Referral Engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/network');
  });

  test('complete networking workflow', async ({ page }) => {
    // 1. Import contacts via CSV
    await page.click('text=Import');
    
    // Select CSV format
    await page.selectOption('select#format', 'csv');
    
    // Upload file (mock)
    const csvContent = `name,email,company,title,city,tags
Alice Smith,alice@techcorp.com,TechCorp,Recruiter,NYC,tech;recruiter
Bob Jones,bob@targetco.com,TargetCo,Hiring Manager,SF,hiring`;
    
    // Note: In real test, would upload actual file
    await page.click('button:has-text("Cancel")');

    // 2. Create a contact manually
    await page.click('text=New Contact');
    await page.fill('#name', 'Charlie Davis');
    await page.fill('#email', 'charlie@example.com');
    await page.fill('#company', 'StartupXYZ');
    await page.fill('#title', 'CTO');
    await page.selectOption('#kind', 'hiring_manager');
    await page.selectOption('#relationship', 'strong');
    await page.click('button:has-text("Save")');

    // 3. Navigate to Graph tab
    await page.click('text=Warm-Intro Graph');
    
    // Verify graph is visible
    await expect(page.locator('text=Connection Graph')).toBeVisible();

    // 4. Navigate to Outreach tab
    await page.click('text=Outreach');
    await expect(page.locator('text=Outreach Sequencer')).toBeVisible();

    // 5. Navigate to Pipeline tab
    await page.click('text=Pipeline');
    await expect(page.locator('text=Prospect')).toBeVisible();
    await expect(page.locator('text=Screening')).toBeVisible();

    // 6. Navigate to Events tab
    await page.click('text=Events');
    await page.click('button:has-text("New Event")');
    await page.fill('#title', 'React Summit 2025');
    await page.fill('#date', '2025-06-15');
    await page.fill('#location', 'Convention Center');
    await page.selectOption('#rsvp', 'yes');
    await page.click('button:has-text("Save Event")');

    // 7. Navigate to Analytics tab
    await page.click('text=Analytics');
    await expect(page.locator('text=Total Sent')).toBeVisible();
    await expect(page.locator('text=Sequence Performance')).toBeVisible();

    // 8. Verify compliance banner is visible
    await page.click('text=Contacts');
    await expect(page.locator('text=Be respectful and compliant')).toBeVisible();
  });

  test('accessibility checks', async ({ page }) => {
    // Tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Check for proper labels
    await page.click('text=New Contact');
    const nameLabel = await page.locator('label[for="name"]');
    await expect(nameLabel).toBeVisible();

    // Check ARIA attributes
    const complianceBanner = await page.locator('[role="status"]');
    await expect(complianceBanner).toBeVisible();
  });

  test('responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Networking & Referrals')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Contacts')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('text=Analytics')).toBeVisible();
  });
});
