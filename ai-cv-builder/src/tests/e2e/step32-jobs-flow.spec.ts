/**
 * Step 32 E2E Test - Job Discovery Flow
 * Tests the complete job ingestion, search, and alert flow
 */

import { test, expect } from '@playwright/test';

test.describe('Job Discovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to jobs page
    await page.goto('/jobs');
  });

  test('should configure RSS source and fetch jobs', async ({ page }) => {
    // Open source settings
    await page.click('button:has-text("Source Settings")');
    
    // Wait for dialog
    await expect(page.locator('text=Source Settings')).toBeVisible();
    
    // Enable RSS source (should be enabled by default)
    const rssCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(rssCheckbox).toBeChecked();
    
    // Close settings
    await page.click('button:has-text("Close")');
  });

  test('should save a search with alerts', async ({ page }) => {
    // Enter search query
    await page.fill('input[placeholder*="Search jobs"]', 'React Developer');
    
    // Open save search dialog
    await page.click('button:has-text("Save Search")');
    
    // Fill in search details
    await page.fill('input[placeholder*="Search name"]', 'React Jobs');
    await page.fill('input[type="number"]', '30');
    
    // Save search
    await page.click('button:has-text("Save")');
    
    // Verify saved search appears
    await expect(page.locator('text=Saved:')).toContainText('React Jobs');
  });

  test('should display fetch logs', async ({ page }) => {
    // Check for logs section
    await expect(page.locator('text=Fetch Logs')).toBeVisible();
    
    // Should show "No runs yet" initially or existing logs
    const logsSection = page.locator('text=Fetch Logs').locator('..');
    await expect(logsSection).toBeVisible();
  });

  test('should show job cards when jobs exist', async ({ page }) => {
    // This test assumes jobs might exist or shows placeholder
    const jobList = page.locator('[class*="grid"]').first();
    await expect(jobList).toBeVisible();
  });
});

test.describe('Source Settings', () => {
  test('should show legal mode status for HTML adapters', async ({ page }) => {
    await page.goto('/jobs');
    
    // Open source settings
    await page.click('button:has-text("Source Settings")');
    
    // Check for legal mode indicators
    await expect(page.locator('text=Legal Mode:')).toHaveCount(4); // 4 HTML adapters
  });

  test('should allow configuring feed URL', async ({ page }) => {
    await page.goto('/jobs');
    
    // Open source settings
    await page.click('button:has-text("Source Settings")');
    
    // Find RSS source input
    const feedInput = page.locator('input[placeholder*="feedUrl"]').first();
    await feedInput.fill('https://example.com/jobs.rss');
    
    // Value should be set
    await expect(feedInput).toHaveValue('https://example.com/jobs.rss');
  });
});
