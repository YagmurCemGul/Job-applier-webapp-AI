/**
 * @fileoverview E2E test for Step 37 — Offer & Negotiation flow
 * @module tests/e2e/step37-offer-negotiation-flow
 */

import { test, expect } from '@playwright/test';

test.describe('Step 37 — Offer & Negotiation Suite E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/offers');
  });

  test('complete offer flow: create → calculate → negotiate → export', async ({ page }) => {
    // Step 1: Create a new offer
    await page.click('button:has-text("Add Offer")');

    await page.fill('input[id="company"]', 'TechCorp');
    await page.fill('input[id="role"]', 'Senior Software Engineer');
    await page.fill('input[id="level"]', 'L5');
    await page.fill('input[id="base"]', '150000');
    await page.fill('input[id="bonus"]', '15');

    await page.click('button:has-text("Save")');

    // Verify offer appears in list
    await expect(page.locator('text=TechCorp')).toBeVisible();

    // Step 2: View offer details
    await page.click('text=TechCorp');

    // Should show detail view
    await expect(page.locator('h1:has-text("TechCorp")')).toBeVisible();

    // Step 3: Navigate to compensation tab
    await page.click('button[value="compensation"]');

    // Should show calculator
    await expect(page.locator('text=Total Comp Calculator')).toBeVisible();

    // Adjust tax rate
    const taxSlider = page.locator('input[type="range"]').first();
    await taxSlider.fill('35');

    // Should see updated calculations
    await expect(page.locator('text=After Tax')).toBeVisible();

    // Step 4: Add equity
    await page.click('button[value="equity"]');
    await page.click('button:has-text("Add Grant")');

    await page.selectOption('select:near(:text("Type"))', 'RSU');
    await page.fill('input:near(:text("Units"))', '1000');
    await page.fill('input:near(:text("Assumed Share Price"))', '100');

    await page.click('button:has-text("Save")');

    // Step 5: Generate negotiation plan
    await page.click('button[value="negotiation"]');

    await page.fill('textarea[id="market"]', 'Senior SWE in Bay Area makes $180-220k');
    await page.fill('textarea[id="priorities"]', 'Base salary, equity, remote flexibility');
    await page.fill('textarea[id="batna"]', 'Happy to stay at current role');

    await page.click('button:has-text("Generate Plan")');

    // Should show generated strategy (mock or real AI)
    await expect(
      page.locator('text=Strategy').or(page.locator('text=Negotiation Plan'))
    ).toBeVisible({ timeout: 10000 });

    // Step 6: Add deadline
    await page.click('button[value="deadlines"]');
    await page.click('button:has-text("Add Deadline")');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().slice(0, 16);

    await page.fill('input[id="dl-label"]', 'Accept by');
    await page.fill('input[type="datetime-local"]', dateString);

    await page.click('button:has-text("Add")');

    // Should show deadline
    await expect(page.locator('text=Accept by')).toBeVisible();

    // Step 7: Export to PDF
    await page.click('button[value="docs"]');
    await page.click('button:has-text("Export to PDF")');

    // Should trigger download or open in new tab
    await page.waitForTimeout(1000);

    // Step 8: Mark as accepted
    await page.selectOption('select:near(:text("Status"))', 'accepted');

    // Should update status
    await expect(page.locator('text=Accepted').first()).toBeVisible();
  });

  test('offer comparison flow', async ({ page }) => {
    // Create multiple offers first
    const offers = [
      { company: 'TechCorp', role: 'SWE', base: 150000 },
      { company: 'StartupCo', role: 'Staff SWE', base: 140000 },
      { company: 'BigTech', role: 'Senior SWE', base: 180000 }
    ];

    for (const offer of offers) {
      await page.click('button:has-text("Add Offer")');
      await page.fill('input[id="company"]', offer.company);
      await page.fill('input[id="role"]', offer.role);
      await page.fill('input[id="base"]', String(offer.base));
      await page.click('button:has-text("Save")');
    }

    // Enter comparison mode
    await page.click('button:has-text("Compare")');

    // Select offers
    for (const offer of offers) {
      await page.click(`button:has-text("Select"):near(:text("${offer.company}"))`);
    }

    // Compare
    await page.click('button:has-text("Compare Selected")');

    // Should show comparison matrix
    await expect(page.locator('text=Comparison Matrix')).toBeVisible();
    await expect(page.locator('text=TechCorp')).toBeVisible();
    await expect(page.locator('text=StartupCo')).toBeVisible();
    await expect(page.locator('text=BigTech')).toBeVisible();

    // Should show What-If panel
    await expect(page.locator('text=What-If')).toBeVisible();

    // Adjust horizon
    await page.selectOption('select:near(:text("Time Horizon"))', '4');

    // Should recalculate (verify by checking for updated values)
    await page.waitForTimeout(500);

    // Export comparison
    await page.click('button:has-text("Export PDF")');
  });

  test('import offer from text', async ({ page }) => {
    await page.click('button:has-text("Add Offer")');

    // Switch to import tab
    await page.click('button[value="import"]');

    const offerText = `
      Dear Candidate,
      
      We are pleased to offer you the position of Senior Engineer at TechCorp.
      
      Compensation:
      - Base salary: $160,000 USD
      - Annual bonus: 15%
      - Signing bonus: $25,000
      
      Benefits:
      - 25 days PTO
      
      Location: Remote
    `;

    await page.fill('textarea[id="import-text"]', offerText);
    await page.click('button:has-text("Parse")');

    // Switch back to manual tab to see parsed values
    await page.click('button[value="manual"]');

    // Should have auto-filled values
    await expect(page.locator('input[id="company"]')).toHaveValue(/TechCorp/);
    await expect(page.locator('input[id="base"]')).toHaveValue('160000');

    await page.click('button:has-text("Save")');

    // Should appear in list
    await expect(page.locator('text=TechCorp')).toBeVisible();
  });

  test('accessibility: keyboard navigation', async ({ page }) => {
    // Create an offer
    await page.click('button:has-text("Add Offer")');
    await page.fill('input[id="company"]', 'AccessCo');
    await page.fill('input[id="role"]', 'Engineer');
    await page.fill('input[id="base"]', '120000');
    await page.click('button:has-text("Save")');

    // Navigate using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Should open offer

    // Should show detail view
    await expect(page.locator('h1:has-text("AccessCo")')).toBeVisible();

    // Navigate tabs with keyboard
    await page.keyboard.press('Tab'); // Focus on first tab
    await page.keyboard.press('ArrowRight'); // Next tab
    await page.keyboard.press('Enter');

    // Should switch tabs
    await page.waitForTimeout(300);
  });
});
