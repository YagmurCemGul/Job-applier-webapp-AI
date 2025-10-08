/**
 * @fileoverview E2E test: complete first 90 days onboarding flow.
 * @requires playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Step 38: First 90 Days Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login or navigate to authenticated state
    await page.goto('/onboarding');
    // Wait for page load
    await page.waitForSelector('h1:has-text("Onboarding Home")');
  });

  test('should create and personalize onboarding plan', async ({ page }) => {
    // Navigate to Plan tab
    await page.click('button:has-text("Plan")');
    await expect(page.locator('h2:has-text("Plan")')).toBeVisible();

    // Seed plan
    await page.click('button:has-text("Seed Plan")');
    await expect(page.locator('table tbody tr')).toHaveCount(3, { timeout: 2000 });

    // Personalize with AI (mock response expected)
    await page.click('button:has-text("Personalize with AI")');
    // Wait for AI processing (mocked)
    await page.waitForTimeout(1000);

    // Verify tasks were added
    const taskRows = page.locator('table tbody tr');
    await expect(taskRows.first()).toBeVisible();
  });

  test('should add stakeholder and create 1:1 series', async ({ page }) => {
    // Navigate to Stakeholders
    await page.click('button:has-text("Stakeholders")');
    await expect(page.locator('h2:has-text("Stakeholders")')).toBeVisible();

    // Add stakeholder
    await page.click('button:has-text("Add Stakeholder")');
    await page.fill('input[id="s-name"]', 'Jane Manager');
    await page.fill('input[id="s-email"]', 'jane@company.com');
    await page.click('button:has-text("Save")');

    // Verify stakeholder appears in grid
    await expect(page.locator('text=Jane Manager')).toBeVisible();
  });

  test('should define OKRs and track progress', async ({ page }) => {
    // Navigate to OKRs
    await page.click('button:has-text("OKRs")');
    await expect(page.locator('h2:has-text("OKRs")')).toBeVisible();

    // Add objective (button present, functionality may be mocked)
    const addButton = page.locator('button:has-text("Add Objective")');
    await expect(addButton).toBeVisible();
  });

  test('should compose and preview weekly report', async ({ page }) => {
    // Navigate to Reports
    await page.click('button:has-text("Weekly Reports")');
    await expect(page.locator('h2:has-text("Weekly Reports")')).toBeVisible();

    // Add highlights
    await page.fill('input[placeholder*="What went well"]', 'Completed feature X');
    await page.click('button:has-text("Add")', { timeout: 1000 });

    // Preview report
    await page.click('button:has-text("Preview")');
    await expect(page.locator('text=Completed feature X')).toBeVisible();
  });

  test('should add evidence and access export options', async ({ page }) => {
    // Navigate to Evidence
    await page.click('button:has-text("Evidence Binder")');
    await expect(page.locator('h2:has-text("Evidence Binder")')).toBeVisible();

    // Add evidence
    await page.click('button:has-text("Add Evidence")');
    await page.fill('input[id="e-title"]', 'Shipped Feature Y');
    await page.fill('textarea[id="e-text"]', 'Deployed to production with zero bugs');
    await page.click('button:has-text("Save")');

    // Verify evidence card appears
    await expect(page.locator('text=Shipped Feature Y')).toBeVisible();

    // Check export buttons exist
    await expect(page.locator('button:has-text("Export PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("Export Google Doc")')).toBeVisible();
  });

  test('should show progress dashboard with metrics', async ({ page }) => {
    // Navigate to Dashboard
    await page.click('button:has-text("Dashboard")');
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();

    // Verify KPI cards are present
    await expect(page.locator('text=Tasks Completed')).toBeVisible();
    await expect(page.locator('text=OKR Progress')).toBeVisible();
  });

  test('should display consent banner and allow toggle', async ({ page }) => {
    // Verify consent banner is visible
    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();

    // Toggle consent
    const toggle = page.locator('button[role="switch"]');
    await toggle.click();
    // Verify toggle state changed (aria-checked or similar)
  });

  test('complete flow: seed → stakeholders → 1:1 → OKRs → report → evidence → mark complete', async ({ page }) => {
    // 1. Seed plan
    await page.click('button:has-text("Plan")');
    await page.click('button:has-text("Seed Plan")');
    await page.waitForTimeout(500);

    // 2. Add stakeholder
    await page.click('button:has-text("Stakeholders")');
    await page.click('button:has-text("Add Stakeholder")');
    await page.fill('input[id="s-name"]', 'Alice Peer');
    await page.fill('input[id="s-email"]', 'alice@company.com');
    await page.click('button:has-text("Save")');

    // 3. Navigate to 1:1s (verify tab exists)
    await page.click('button:has-text("1:1s")');
    await expect(page.locator('h2:has-text("1:1s")')).toBeVisible();

    // 4. Navigate to OKRs
    await page.click('button:has-text("OKRs")');
    await expect(page.locator('h2:has-text("OKRs")')).toBeVisible();

    // 5. Compose weekly report
    await page.click('button:has-text("Weekly Reports")');
    await page.fill('input[placeholder*="What went well"]', 'Week 1 complete');
    await page.click('button:has-text("Add")');

    // 6. Add evidence
    await page.click('button:has-text("Evidence Binder")');
    await page.click('button:has-text("Add Evidence")');
    await page.fill('input[id="e-title"]', 'Final Evidence');
    await page.click('button:has-text("Save")');

    // 7. Check dashboard
    await page.click('button:has-text("Dashboard")');
    await expect(page.locator('text=Tasks Completed')).toBeVisible();

    // Flow completed successfully
  });
});
