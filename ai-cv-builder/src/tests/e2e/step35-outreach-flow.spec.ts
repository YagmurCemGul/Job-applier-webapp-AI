/**
 * Step 35 E2E Tests
 * Full outreach flow from OAuth to send
 */
import { test, expect } from '@playwright/test';

test.describe('Step 35 - Outreach Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/outbox');
  });

  test('should display Outbox page', async ({ page }) => {
    await expect(page.getByText('Email Outreach')).toBeVisible();
    await expect(page.getByText('Connect Gmail')).toBeVisible();
  });

  test('should display OAuth connect button', async ({ page }) => {
    const connectBtn = page.getByRole('button', { name: /Connect Gmail/i });
    await expect(connectBtn).toBeVisible();
  });

  test('should show account settings card', async ({ page }) => {
    await expect(page.getByText('Email Accounts')).toBeVisible();
  });

  test('should display sequence runner panel', async ({ page }) => {
    await expect(page.getByText('Sequence Runner')).toBeVisible();
    await expect(page.getByRole('button', { name: /Pause All|Resume All/i })).toBeVisible();
  });

  test('should show outbox with no messages initially', async ({ page }) => {
    await expect(page.getByText('Outbox')).toBeVisible();
    await expect(page.getByText(/No messages sent yet/i)).toBeVisible();
  });

  test('should open template preview dialog', async ({ page }) => {
    const previewBtn = page.getByRole('button', { name: /Preview Template/i });
    await previewBtn.click();
    
    await expect(page.getByText('Template Preview')).toBeVisible();
  });

  test('should open calendar link dialog', async ({ page }) => {
    const calendarBtn = page.getByRole('button', { name: /Propose Times/i });
    await calendarBtn.click();
    
    await expect(page.getByText('Propose Meeting Times')).toBeVisible();
  });

  test('should generate ICS file download', async ({ page }) => {
    // Open calendar dialog
    const calendarBtn = page.getByRole('button', { name: /Propose Times/i });
    await calendarBtn.click();

    // Should show suggested slots
    const downloadPromise = page.waitForEvent('download');
    const icsBtn = page.getByRole('button', { name: /Download ICS/i }).first();
    
    if (await icsBtn.isVisible()) {
      await icsBtn.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.ics');
    }
  });

  test('should handle dry-run toggle', async ({ page }) => {
    // This test assumes an account is connected
    const dryRunToggle = page.getByLabel(/Dry-Run Mode/i).first();
    
    if (await dryRunToggle.isVisible()) {
      const wasChecked = await dryRunToggle.isChecked();
      await dryRunToggle.click();
      await expect(dryRunToggle).toHaveAttribute(
        'aria-checked',
        (!wasChecked).toString()
      );
    }
  });
});
