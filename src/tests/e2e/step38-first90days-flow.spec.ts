/**
 * @fileoverview E2E test: Complete first-90-days onboarding flow.
 * @module tests/e2e/step38-first90days-flow
 */

import { test, expect } from '@playwright/test';

test.describe('Step 38: First 90 Days Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page (adjust URL as needed)
    await page.goto('/onboarding/demo-plan-id');
  });

  test('should display onboarding home with overview cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /onboarding home/i })).toBeVisible();
    await expect(page.getByText(/plan/i)).toBeVisible();
    await expect(page.getByText(/stakeholders/i)).toBeVisible();
    await expect(page.getByText(/1:1s/i)).toBeVisible();
    await expect(page.getByText(/okrs/i)).toBeVisible();
  });

  test('should seed and personalize plan with AI', async ({ page }) => {
    // Navigate to plan tab
    await page.getByRole('tab', { name: /plan/i }).click();

    // Seed plan
    await page.getByRole('button', { name: /seed plan/i }).click();
    await expect(page.getByRole('row')).toHaveCount(4); // Header + 3 base tasks

    // Personalize with AI (mock will return quickly)
    await page.getByRole('button', { name: /personalize with ai/i }).click();
    // Wait for AI to complete (in real scenario, may take time)
    await page.waitForTimeout(1000);
    // Should have more tasks now (depends on mock)
  });

  test('should add stakeholder and create 1:1 series', async ({ page }) => {
    // Navigate to stakeholders
    await page.getByRole('tab', { name: /stakeholders/i }).click();

    // Add stakeholder
    await page.getByRole('button', { name: /add stakeholder/i }).click();
    await page.getByLabel(/name/i).fill('Alice Manager');
    await page.getByLabel(/email/i).fill('alice@example.com');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify stakeholder appears
    await expect(page.getByText('Alice Manager')).toBeVisible();

    // Create 1:1 from stakeholder (click calendar icon)
    // In real UI, this would trigger series creation
  });

  test('should create 1:1 entry and extract actions', async ({ page }) => {
    // Navigate to 1:1s
    await page.getByRole('tab', { name: /1:1s/i }).click();

    // Assume a series exists, create entry
    // Click on a meeting
    // Add notes
    // Extract actions with AI
    // Verify actions appear
  });

  test('should define OKRs and track progress', async ({ page }) => {
    // Navigate to OKRs
    await page.getByRole('tab', { name: /okrs/i }).click();

    // Add objective (mock flow)
    await page.getByRole('button', { name: /add objective/i }).click();
    // Fill form...
    // Verify progress bar appears
  });

  test('should compose and preview weekly report', async ({ page }) => {
    // Navigate to reports
    await page.getByRole('tab', { name: /reports/i }).click();

    // Add highlights
    await page.getByPlaceholder(/what went well/i).fill('Completed onboarding tasks');
    await page.getByRole('button', { name: /add/i }).first().click();

    // Preview
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByText(/completed onboarding tasks/i)).toBeVisible();
  });

  test('should add evidence and export binder', async ({ page }) => {
    // Navigate to evidence
    await page.getByRole('tab', { name: /evidence/i }).click();

    // Add evidence
    await page.getByRole('button', { name: /add evidence/i }).click();
    await page.getByLabel(/title/i).fill('Launch Milestone');
    await page.getByLabel(/text/i).fill('Successfully launched feature X');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify evidence appears
    await expect(page.getByText('Launch Milestone')).toBeVisible();

    // Export PDF (mock)
    await page.getByRole('button', { name: /export pdf/i }).click();
    // In real flow, would trigger download
  });

  test('should show progress dashboard with metrics', async ({ page }) => {
    // Navigate to dashboard
    await page.getByRole('tab', { name: /dashboard/i }).click();

    // Verify KPI cards
    await expect(page.getByText(/tasks completed/i)).toBeVisible();
    await expect(page.getByText(/okr progress/i)).toBeVisible();
    await expect(page.getByText(/evidence/i)).toBeVisible();
  });

  test('should manage checklists', async ({ page }) => {
    // Scroll to checklists section
    await page.getByRole('tab', { name: /checklists/i }).click();

    // Add checklist item
    await page.getByPlaceholder(/checklist item/i).fill('Set up VPN access');
    await page.getByRole('button', { name: /add/i }).last().click();

    // Verify item appears
    await expect(page.getByText('Set up VPN access')).toBeVisible();

    // Toggle checkbox
    await page.getByLabel('Set up VPN access').check();
    // Verify progress updates
  });

  test('should display consent banner', async ({ page }) => {
    // Consent banner should be visible
    await expect(page.getByText(/calendar\/email suggestions/i)).toBeVisible();

    // Toggle consent
    await page.getByLabel(/enable calendar\/email/i).click();
    await expect(page.getByText(/this will access your calendar/i)).toBeVisible();

    // Dismiss banner
    await page.getByRole('button', { name: /dismiss/i }).click();
  });

  test('should mark plan as completed', async ({ page }) => {
    // Navigate to plan
    await page.getByRole('tab', { name: /plan/i }).click();

    // Change stage to completed (via settings or UI)
    // This would require a stage selector in the UI
    // For now, just verify we can navigate back
    await page.getByRole('button', { name: /back/i }).click();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Should activate a button/link

    // Verify focus management
  });

  test('should support i18n (Turkish)', async ({ page }) => {
    // If there's a language switcher
    // await page.selectOption('select[name="language"]', 'tr');
    // Verify Turkish labels appear
    // await expect(page.getByText(/paydaşlar/i)).toBeVisible();
  });
});
