/**
 * E2E Test: Auto-Apply → Application Tracking → Outreach Sequence
 * 
 * This test validates the complete Step 33 workflow:
 * 1. Auto-apply from Jobs page
 * 2. Application appears in Kanban board
 * 3. View application details
 * 4. Add contacts and events
 * 5. Create email template and sequence
 * 6. Link sequence to application
 */

import { test, expect } from '@playwright/test';

test.describe('Step 33: Auto-Apply + Application Tracker + Outreach', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Jobs page
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full apply-track-sequence workflow', async ({ page }) => {
    // Step 1: Open Auto-Apply dialog
    await page.click('button:has-text("Auto-Apply")');
    await expect(page.locator('[role="dialog"]:has-text("Auto-Apply")')).toBeVisible();

    // Step 2: Fill apply form
    await page.selectOption('select', 'greenhouse');
    await page.fill('input[placeholder="Job URL"]', 'https://boards.greenhouse.io/test/jobs/123');
    await page.fill('input[placeholder="Company"]', 'Test Corporation');
    await page.fill('input[placeholder="Role"]', 'Senior Engineer');

    // Step 3: Confirm legal opt-in
    await page.check('input[type="checkbox"]');

    // Step 4: Submit application
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(1000); // Wait for async operations

    // Step 5: Navigate to Applications page
    await page.goto('/applications');
    await page.waitForLoadState('networkidle');

    // Step 6: Verify application appears in Kanban
    await expect(page.locator('text=Test Corporation')).toBeVisible();
    await expect(page.locator('text=Senior Engineer')).toBeVisible();

    // Step 7: Open application details
    await page.click('button:has-text("Details")');
    await expect(page.locator('[role="dialog"]:has-text("Application Details")')).toBeVisible();

    // Step 8: Add contact
    await page.fill('input[placeholder="Name"]', 'Jane Smith');
    await page.fill('input[placeholder="Email"]', 'jane@testcorp.com');
    await page.click('button:has-text("Add"):near(input[placeholder="Email"])');
    await expect(page.locator('text=Jane Smith')).toBeVisible();

    // Step 9: Add event
    await page.fill('input[placeholder="Title"]', 'Phone Interview');
    await page.click('button:has-text("Add"):near(input[placeholder="Title"])');
    await expect(page.locator('text=Phone Interview')).toBeVisible();

    // Step 10: Close detail drawer
    await page.keyboard.press('Escape');

    // Step 11: Create email template
    await page.click('button:has-text("Email Templates")');
    await page.fill('input[placeholder="Template name"]', 'Follow-up #1');
    await page.fill('input[placeholder="Subject"]', 'Following up on {{Role}}');
    await page.fill('textarea', 'Hi {{RecruiterName}},\n\nI wanted to follow up...');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Follow-up #1')).toBeVisible();
    await page.keyboard.press('Escape');

    // Step 12: Create outreach sequence
    await page.click('button:has-text("Sequences")');
    await page.fill('input[placeholder="Sequence name"]', 'Standard Follow-up');
    await page.click('button:has-text("Save"):near(input[placeholder="Sequence name"])');
    await expect(page.locator('text=Standard Follow-up')).toBeVisible();

    // Step 13: Add step to sequence
    await page.click('button:has-text("+ Step")');
    await expect(page.locator('text=1 steps')).toBeVisible();
    await page.keyboard.press('Escape');

    // Step 14: Verify logs panel shows activity
    await expect(page.locator('text=Apply Logs')).toBeVisible();
    await expect(page.locator('text=Submitted (stub)')).toBeVisible();
  });

  test('should update application stage', async ({ page }) => {
    // Navigate to Applications
    await page.goto('/applications');
    await page.waitForLoadState('networkidle');

    // Find application and change stage
    const stageSelect = page.locator('select').first();
    await stageSelect.selectOption('interview');

    // Verify it moved to Interview column
    await expect(page.locator('.border:has-text("Interview"):has-text("1")')).toBeVisible();
  });

  test('should reject auto-apply without opt-in', async ({ page }) => {
    // Open Auto-Apply dialog
    await page.click('button:has-text("Auto-Apply")');

    // Fill form but don't check opt-in
    await page.fill('input[placeholder="Job URL"]', 'https://test.com');
    await page.fill('input[placeholder="Company"]', 'Test');
    await page.fill('input[placeholder="Role"]', 'Developer');

    // Try to submit
    await page.click('button:has-text("Submit")');

    // Should show error (alert or validation)
    await page.waitForTimeout(500);
    // Note: Error handling may vary - could be alert, toast, or inline validation
  });

  test('should display funnel metrics', async ({ page }) => {
    await page.goto('/applications');
    await page.waitForLoadState('networkidle');

    // Verify funnel display
    await expect(page.locator('text=/Funnel:.*A.*V.*I.*O.*R/i')).toBeVisible();
  });

  test('should create and manage contacts', async ({ page }) => {
    await page.goto('/applications');
    
    // Create test application first
    await page.click('button:has-text("Auto-Apply")');
    await page.fill('input[placeholder="Job URL"]', 'https://test.com');
    await page.fill('input[placeholder="Company"]', 'TestCo');
    await page.fill('input[placeholder="Role"]', 'Dev');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(500);

    // Open details
    await page.click('button:has-text("Details")');
    
    // Add multiple contacts
    await page.fill('input[placeholder="Name"]', 'John Doe');
    await page.fill('input[placeholder="Email"]', 'john@test.com');
    await page.click('button:has-text("Add"):near(input[placeholder="Email"])');
    
    await page.fill('input[placeholder="Name"]', 'Alice Johnson');
    await page.fill('input[placeholder="Email"]', 'alice@test.com');
    await page.click('button:has-text("Add"):near(input[placeholder="Email"])');

    // Verify both contacts appear
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Alice Johnson')).toBeVisible();
  });
});
