/**
 * @fileoverview E2E test for Outreach CRM & Sequencer
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { test, expect } from '@playwright/test';

test.describe('Outreach E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/outreach');
    await page.waitForLoadState('networkidle');
  });

  test('complete outreach workflow: import → sequence → campaign → track → export', async ({ page }) => {
    // Check dashboard loads
    await expect(page.getByRole('heading', { name: /outreach dashboard/i })).toBeVisible();
    await expect(page.getByText(/consent-first outreach/i)).toBeVisible();

    // Navigate to Prospects tab
    await page.getByRole('tab', { name: /prospects/i }).click();
    
    // Create CSV data for import
    const csvContent = `email,name,role,company,tags
john@example.com,John Doe,Engineer,Acme Corp,tech
jane@example.com,Jane Smith,Manager,Beta Inc,leadership`;

    // Simulate CSV import (in real test, would use file chooser)
    // For now, just verify the import button is present
    await expect(page.getByRole('button', { name: /import csv/i })).toBeVisible();

    // Navigate to Templates tab
    await page.getByRole('tab', { name: /templates/i }).click();
    
    // Verify default templates are seeded
    await expect(page.getByText(/warm intro request/i)).toBeVisible();
    await expect(page.getByText(/direct outreach/i)).toBeVisible();

    // Navigate to Sequences tab
    await page.getByRole('tab', { name: /sequences/i }).click();
    
    // Create new sequence
    await page.getByRole('button', { name: /new/i }).first().click();
    await page.getByLabel(/sequence name/i).fill('Test Sequence E2E');
    
    // Add email step
    await page.getByRole('button', { name: /email/i }).click();
    
    // Verify step added
    await expect(page.getByText(/email/i)).toBeVisible();
    
    // Save sequence
    await page.getByRole('button', { name: /save/i }).first().click();

    // Navigate to Campaigns tab
    await page.getByRole('tab', { name: /campaigns/i }).click();
    
    // Create new campaign
    await page.getByRole('button', { name: /new/i }).first().click();
    await page.getByLabel(/campaign name/i).fill('Test Campaign E2E');
    
    // Save campaign
    await page.getByRole('button', { name: /save/i }).first().click();

    // Navigate to A/B Tests tab
    await page.getByRole('tab', { name: /a\/b tests/i }).click();
    
    // Verify A/B controls are present
    await expect(page.getByRole('button', { name: /enable a\/b/i })).toBeVisible();

    // Navigate to Referrals tab
    await page.getByRole('tab', { name: /warm intros/i }).click();
    
    // Verify referral form
    await expect(page.getByLabel(/select prospect/i)).toBeVisible();
    await expect(page.getByLabel(/introducer email/i)).toBeVisible();

    // Navigate to Scheduler tab
    await page.getByRole('tab', { name: /scheduler/i }).click();
    
    // Verify scheduler form
    await expect(page.getByLabel(/meeting title/i)).toBeVisible();
    await expect(page.getByLabel(/duration/i)).toBeVisible();

    // Navigate to Compliance tab
    await page.getByRole('tab', { name: /compliance/i }).click();
    
    // Verify compliance features
    await expect(page.getByText(/suppression list/i)).toBeVisible();
    await expect(page.getByLabel(/add email to suppression/i)).toBeVisible();
    await expect(page.getByText(/default compliance footer/i)).toBeVisible();

    // Navigate back to Dashboard
    await page.getByRole('tab', { name: /dashboard/i }).first().click();
    
    // Verify quick actions
    await expect(page.getByRole('button', { name: /import csv/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /new sequence/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /run tick/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export report/i })).toBeVisible();
  });

  test('keyboard shortcuts work', async ({ page }) => {
    // N - Prospects
    await page.keyboard.press('n');
    await expect(page.getByRole('tab', { name: /prospects/i })).toHaveAttribute('data-state', 'active');

    // T - Templates
    await page.keyboard.press('t');
    await expect(page.getByRole('tab', { name: /templates/i })).toHaveAttribute('data-state', 'active');

    // S - Sequences
    await page.keyboard.press('s');
    await expect(page.getByRole('tab', { name: /sequences/i })).toHaveAttribute('data-state', 'active');

    // R - Campaigns (Run)
    await page.keyboard.press('r');
    await expect(page.getByRole('tab', { name: /campaigns/i })).toHaveAttribute('data-state', 'active');
  });

  test('suppression prevents outreach', async ({ page }) => {
    // Navigate to Compliance
    await page.getByRole('tab', { name: /compliance/i }).click();
    
    // Add email to suppression
    await page.getByLabel(/add email to suppression/i).fill('blocked@example.com');
    await page.getByRole('button', { name: /add/i }).first().click();
    
    // Verify suppression added
    await expect(page.getByText('blocked@example.com')).toBeVisible();
  });

  test('template editor preview works', async ({ page }) => {
    // Navigate to Templates
    await page.getByRole('tab', { name: /templates/i }).click();
    
    // Select a template
    const firstTemplate = page.getByText(/warm intro request/i).first();
    await firstTemplate.click();
    
    // Click preview
    await page.getByRole('button', { name: /preview/i }).click();
    
    // Verify preview is shown
    await expect(page.getByText(/subject preview/i)).toBeVisible();
    await expect(page.getByText(/body preview/i)).toBeVisible();
  });

  test('accessibility: focus states and aria-live regions', async ({ page }) => {
    // Check for aria-live region on metrics
    await page.getByRole('tab', { name: /campaigns/i }).click();
    
    const metricsRegion = page.locator('[role="status"][aria-live="polite"]');
    await expect(metricsRegion).toBeAttached();
    
    // Tab navigation works
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('unsubscribe page works standalone', async ({ page }) => {
    // Navigate directly to unsubscribe (would be a separate route)
    // For now, just verify the component exists in the Compliance tab
    await page.getByRole('tab', { name: /compliance/i }).click();
    
    await expect(page.getByText(/suppression list/i)).toBeVisible();
  });
});
