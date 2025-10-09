/**
 * @fileoverview E2E test for Step 44 Offer Negotiation & Comparison
 */

import { test, expect } from '@playwright/test';

test.describe('Step 44: Offer Negotiation & Comparison', () => {
  test('should complete full offer negotiation flow', async ({ page }) => {
    await page.goto('/offers');

    // Step 1: Add first offer
    await page.click('text=Offers');
    await page.fill('input[placeholder*="Company"]', 'TechCorp');
    await page.fill('textarea[placeholder*="offer text"]', 
      'Base salary: $150,000. Bonus: 15%. RSU: 10,000 shares vesting over 4 years with 12 month cliff.'
    );
    await page.click('text=Parse Offer');
    await page.waitForSelector('text=Parsed Offer Preview');
    await page.click('text=Save Offer');

    // Step 2: Add second offer
    await page.fill('input[placeholder*="Company"]', 'StartupXYZ');
    await page.fill('textarea[placeholder*="offer text"]', 
      'Base salary: $140,000. Bonus: 20%. RSU: 15,000 shares.'
    );
    await page.click('text=Parse Offer');
    await page.click('text=Save Offer');

    // Step 3: Compare offers
    await page.click('text=Compare');
    await page.check('label:has-text("TechCorp")');
    await page.check('label:has-text("StartupXYZ")');
    
    // Verify comparison table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('td:has-text("TechCorp")')).toBeVisible();
    await expect(page.locator('td:has-text("StartupXYZ")')).toBeVisible();

    // Step 4: Model equity scenarios
    await page.click('text=Scenarios');
    await page.fill('input[value="1000"]', '10000');
    await page.fill('input[value="50"]', '100');
    
    // Verify scenarios display
    await expect(page.locator('text=Base Scenario')).toBeVisible();
    await expect(page.locator('text=Low Scenario')).toBeVisible();
    await expect(page.locator('text=High Scenario')).toBeVisible();

    // Step 5: Generate talking points
    await page.click('text=Negotiate');
    await expect(page.locator('text=Talking Points')).toBeVisible();
    await expect(page.locator('text=Strategy Checklist')).toBeVisible();

    // Step 6: Create counter email
    await page.click('text=Email');
    await page.selectOption('select', 'baseRaise');
    await page.fill('input[placeholder*="Sarah"]', 'Sarah');
    await page.fill('input[placeholder*="Senior Engineer"]', 'Senior Engineer');
    await page.fill('input[type="number"]', '160000');
    
    // Verify email preview
    await expect(page.locator('text=Subject:')).toBeVisible();
    await expect(page.locator('text=Sarah')).toBeVisible();

    // Step 7: Schedule call (UI only, integration disabled)
    await page.click('text=Calls');
    await page.fill('input[placeholder*="Offer Discussion"]', 'Negotiation Call - TechCorp');
    
    // Step 8: Check analytics
    await page.click('text=Analytics');
    await expect(page.locator('text=Total Offers')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible(); // 2 offers added
  });

  test('should import and use benchmarks', async ({ page }) => {
    await page.goto('/offers');
    await page.click('text=Benchmarks');

    const csv = `role,level,region,currency,baseP50,baseP75,tcP50,tcP75,source,year
Software Engineer,Senior,US,USD,150000,180000,200000,250000,Levels.fyi,2024
Product Manager,Senior,US,USD,140000,170000,190000,230000,Glassdoor,2024`;

    await page.fill('textarea[placeholder*="role,level"]', csv);
    await page.click('text=Import Benchmarks');

    // Filter by role
    await page.fill('input[placeholder*="Software Engineer"]', 'Software');
    
    // Verify benchmark display
    await expect(page.locator('td:has-text("Software Engineer")')).toBeVisible();
    
    // Click to select benchmark
    await page.click('td:has-text("Software Engineer")');
    
    // Verify anchor/ask suggestions
    await expect(page.locator('text=Anchor:')).toBeVisible();
    await expect(page.locator('text=Ask:')).toBeVisible();
  });

  test('should handle equity modeling with volatility', async ({ page }) => {
    await page.goto('/offers');
    await page.click('text=Equity');

    // Set up equity parameters
    await page.fill('input[type="number"]', '5000'); // shares
    await page.fill('input[value="50"]', '75'); // price
    await page.fill('input[value="10"]', '15'); // growth
    
    // Verify valuation updates
    await expect(page.locator('text=Total Gross')).toBeVisible();
    await expect(page.locator('text=Low Band')).toBeVisible();
    await expect(page.locator('text=High Band')).toBeVisible();
    
    // Verify vesting schedule table
    await expect(page.locator('table th:has-text("Month")')).toBeVisible();
    await expect(page.locator('table th:has-text("Shares")')).toBeVisible();
  });
});
