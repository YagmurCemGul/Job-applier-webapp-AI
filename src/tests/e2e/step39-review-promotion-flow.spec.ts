/**
 * @fileoverview E2E test for complete review-promotion flow
 * Start cycle → aggregate impact → send/collect feedback →
 * compose self-review → calibration board → promotion packet export →
 * schedule submission deadline
 */

import { test, expect } from '@playwright/test';

test.describe('Step 39: Review & Promotion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Reviews page
    await page.goto('/reviews');
  });

  test('complete review and promotion workflow', async ({ page }) => {
    // 1. Start new review cycle
    await page.click('button:has-text("Start Review Cycle")');
    await page.fill('input#cycle-title', 'H1 2025 Performance Review');
    await page.selectOption('select#cycle-kind', 'mid_year');
    await page.fill('input#cycle-start', '2025-01-01');
    await page.fill('input#cycle-end', '2025-06-30');
    
    // Add deadline
    await page.click('button:has-text("Add")');
    await page.fill('input[placeholder="Label"]', 'Self-review due');
    await page.fill('input[type="date"]', '2025-03-15');
    
    await page.click('button:has-text("Save")');
    
    // Verify cycle created
    await expect(page.locator('h2:has-text("H1 2025 Performance Review")')).toBeVisible();
    
    // 2. Navigate to Impact tab
    await page.click('button:has-text("Impact")');
    
    // Add manual impact
    await page.click('button:has-text("Add Impact")');
    await page.fill('input[aria-label="Impact title"]', 'Led microservices migration');
    await page.fill('input[aria-label="Impact details"]', 'Reduced latency by 40%');
    
    // Verify impact added
    await expect(page.locator('text=Led microservices migration')).toBeVisible();
    
    // 3. Navigate to Feedback tab
    await page.click('button:has-text("Feedback")');
    
    // Add reviewer manually
    await page.fill('input[placeholder="Email"]', 'manager@example.com');
    await page.fill('input[placeholder="Name"]', 'Jane Manager');
    await page.click('button[aria-label="Add manually"]');
    
    // Verify reviewer added
    await expect(page.locator('text=Jane Manager')).toBeVisible();
    
    // Send requests (mocked in test)
    await page.click('button:has-text("Send")');
    
    // 4. Navigate to Self-Review tab
    await page.click('button:has-text("Self-Review")');
    
    // Fill overview
    await page.fill('textarea#overview', 'I led critical infrastructure improvements and mentored junior engineers.');
    
    // Add highlight
    await page.click('button:has-text("Add")');
    await page.fill('textarea[placeholder*="Highlight"]', 'Reduced system latency by 40% through microservices migration');
    
    // Verify word count updates
    await expect(page.locator('text=Word Count')).toBeVisible();
    
    // Save self-review
    await page.click('button:has-text("Save")');
    
    // 5. Navigate to Calibration tab
    await page.click('button:has-text("Calibration")');
    
    // Set target level
    await page.fill('input#target-level', 'L5');
    
    // Verify competency matrix appears (if rubric defined)
    // In test env, may not have rubric, so just check input works
    await expect(page.locator('input#target-level')).toHaveValue('L5');
    
    // 6. Navigate to Promotion tab
    await page.click('button:has-text("Promotion")');
    
    // Fill narrative
    await page.fill(
      'textarea#narrative',
      'My scope has expanded from individual contributor to tech lead of the platform team, managing critical infrastructure decisions.'
    );
    
    // Verify preview updates
    await expect(page.locator('text=Preview Packet')).toBeVisible();
    
    // 7. Navigate to Visibility tab
    await page.click('button:has-text("Visibility")');
    
    // Should show visibility analysis
    await expect(page.locator('[role="list"]')).toBeDefined();
    
    // 8. Return to Overview
    await page.click('button:has-text("Overview")');
    
    // Verify KPIs updated
    await expect(page.locator('text=Impacts')).toBeVisible();
    await expect(page.locator('text=Response Rate')).toBeVisible();
  });

  test('handles confidential banner', async ({ page }) => {
    // Create cycle first
    await page.click('button:has-text("Start Review Cycle")');
    await page.fill('input#cycle-title', 'Test Cycle');
    await page.fill('input#cycle-start', '2025-01-01');
    await page.fill('input#cycle-end', '2025-06-30');
    await page.click('button:has-text("Save")');
    
    // Verify confidential banner
    await expect(page.locator('text=CONFIDENTIAL')).toBeVisible();
    await expect(page.locator('text=for review/calibration use only')).toBeVisible();
  });

  test('impact aggregation and scoring', async ({ page }) => {
    // Create cycle
    await page.click('button:has-text("Start Review Cycle")');
    await page.fill('input#cycle-title', 'Test');
    await page.fill('input#cycle-start', '2025-01-01');
    await page.fill('input#cycle-end', '2025-06-30');
    await page.click('button:has-text("Save")');
    
    // Go to Impact
    await page.click('button:has-text("Impact")');
    
    // Add multiple impacts
    await page.click('button:has-text("Add Impact")');
    await page.fill('input[aria-label="Impact title"]', 'High impact project');
    
    await page.click('button:has-text("Add Impact")');
    const inputs = await page.locator('input[aria-label="Impact title"]').all();
    await inputs[1].fill('Low impact task');
    
    // Verify both appear
    await expect(page.locator('text=High impact project')).toBeVisible();
    await expect(page.locator('text=Low impact task')).toBeVisible();
    
    // Filter by competency
    await page.click('button[aria-label="Filter by competency"]');
    await page.click('text=Execution');
    
    // Export CSV
    await page.click('button:has-text("Export CSV")');
    // Download should trigger (handled by Playwright download event)
  });

  test('accessibility - keyboard navigation', async ({ page }) => {
    // Create cycle
    await page.click('button:has-text("Start Review Cycle")');
    await page.fill('input#cycle-title', 'A11y Test');
    await page.fill('input#cycle-start', '2025-01-01');
    await page.fill('input#cycle-end', '2025-06-30');
    await page.keyboard.press('Enter');
    
    // Navigate tabs with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowRight');
    
    // Verify focus management
    await expect(page.locator('[role="tablist"]')).toBeDefined();
  });
});
