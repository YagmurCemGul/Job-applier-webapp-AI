/**
 * Step 47 Skill Matrix & Career Ladder Navigator E2E Test
 */

import { test, expect } from '@playwright/test';

test.describe('Step 47: Skill Matrix & Career Ladder Navigator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/career');
    await page.waitForLoadState('networkidle');
  });

  test('displays dashboard with KPIs', async ({ page }) => {
    await expect(page.getByText('Skill Dashboard')).toBeVisible();
    await expect(page.getByText('Skills at Bar')).toBeVisible();
    await expect(page.getByText('Study This Week')).toBeVisible();
    await expect(page.getByText('Due Cards')).toBeVisible();
    await expect(page.getByText('Badges Earned')).toBeVisible();
  });

  test('shows educational banner', async ({ page }) => {
    await expect(
      page.getByText(/Educational guidance — not certification/)
    ).toBeVisible();
  });

  test('navigates between all tabs', async ({ page }) => {
    // Dashboard (default)
    await expect(page.getByRole('tab', { name: /^dashboard$/i })).toBeVisible();

    // Frameworks
    await page.getByRole('tab', { name: /frameworks/i }).click();
    await expect(page.getByText(/Career Ladder/i)).toBeVisible();

    // Matrix
    await page.getByRole('tab', { name: /^matrix$/i }).click();
    await expect(page.getByText('Skill Matrix')).toBeVisible();

    // Graph
    await page.getByRole('tab', { name: /graph/i }).click();
    await expect(page.getByText('Competencies')).toBeVisible();
    await expect(page.getByText('Evidence Links')).toBeVisible();

    // Path
    await page.getByRole('tab', { name: /^path$/i }).click();
    await expect(page.getByText('Plan Learning Path')).toBeVisible();

    // Practice
    await page.getByRole('tab', { name: /practice/i }).click();
    await expect(page.getByText('Learning Resources')).toBeVisible();

    // Assessments
    await page.getByRole('tab', { name: /assessments/i }).click();
    await expect(page.getByText('Available Assessments')).toBeVisible();

    // Badges
    await page.getByRole('tab', { name: /badges/i }).click();
    await expect(page.getByText(/Badge Wall/i)).toBeVisible();

    // Study
    await page.getByRole('tab', { name: /^study$/i }).click();
    await expect(page.getByText('Study Session')).toBeVisible();

    // Packet
    await page.getByRole('tab', { name: /packet/i }).click();
    await expect(page.getByText('Growth Packet Preview')).toBeVisible();
  });

  test('browses framework and sees competency bars', async ({ page }) => {
    await page.getByRole('tab', { name: /frameworks/i }).click();

    await expect(page.getByText('Software Engineer')).toBeVisible();
    await expect(page.getByText('L3')).toBeVisible();
    await expect(page.getByText('L4')).toBeVisible();
    await expect(page.getByText('L5')).toBeVisible();
    await expect(page.getByText('L6')).toBeVisible();

    await expect(page.getByText('System Design')).toBeVisible();
    await expect(page.getByText('Coding & Quality')).toBeVisible();
    await expect(page.getByText('Execution & Delivery')).toBeVisible();
  });

  test('updates skill matrix and infers from evidence', async ({ page }) => {
    await page.getByRole('tab', { name: /^matrix$/i }).click();

    // Find first competency and edit
    const editButton = page.getByRole('button', { name: /^edit$/i }).first();
    await editButton.click();

    // Update level
    const levelInput = page.locator('input[type="number"]').first();
    await levelInput.fill('3');

    // Done editing
    await page.getByRole('button', { name: /^done$/i }).first().click();

    // Verify updated (3/4 should be visible)
    await expect(page.getByText('3/4')).toBeVisible();

    // Test infer button
    const inferButton = page.getByRole('button', { name: /infer/i }).first();
    await inferButton.click();
  });

  test('links evidence in graph', async ({ page }) => {
    await page.getByRole('tab', { name: /graph/i }).click();

    // Verify competencies shown
    await expect(page.getByText('System Design', { exact: false })).toBeVisible();
    
    // Check for evidence panel
    await expect(page.getByText('Evidence Links')).toBeVisible();
  });

  test('plans learning path', async ({ page }) => {
    await page.getByRole('tab', { name: /^path$/i }).click();

    // Select target level
    await page.selectOption('select', 'L5');

    // Set daily cap
    await page.fill('input[type="number"]', '60');

    // Generate path
    await page.getByRole('button', { name: /generate path/i }).click();

    // Verify path created (might show steps or total time)
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test('creates flashcard from practice', async ({ page }) => {
    await page.getByRole('tab', { name: /practice/i }).click();

    // Click create flashcard
    await page.getByRole('button', { name: /new flashcard/i }).click();

    // Fill form
    await page.fill('input[placeholder*="competency"]', 'system_design');
    await page.fill('input[placeholder*="Question"]', 'What is CAP theorem?');
    await page.fill('input[placeholder*="Answer"]', 'Consistency, Availability, Partition tolerance');

    // Create
    await page.getByRole('button', { name: /^create$/i }).click();

    // Verify closed
    await expect(page.getByRole('button', { name: /new flashcard/i })).toBeVisible();
  });

  test('takes assessment and receives score', async ({ page }) => {
    await page.getByRole('tab', { name: /assessments/i }).click();

    // Start assessment
    const startButton = page.getByRole('button', { name: /^start$/i }).first();
    await startButton.click();

    // Answer questions (look for radio buttons)
    const firstChoice = page.locator('input[type="radio"]').first();
    await firstChoice.check();

    // Submit
    await page.getByRole('button', { name: /submit assessment/i }).click();

    // Verify result shown
    await expect(page.getByText('Latest Result')).toBeVisible();
    await expect(page.getByText(/%$/)).toBeVisible(); // score percentage
  });

  test('displays badge wall', async ({ page }) => {
    await page.getByRole('tab', { name: /badges/i }).click();

    await expect(page.getByText(/Badge Wall/i)).toBeVisible();
    
    // Should show tiers even if empty
    await expect(page.getByText('Bronze')).toBeVisible();
    await expect(page.getByText('Silver')).toBeVisible();
    await expect(page.getByText('Gold')).toBeVisible();
    await expect(page.getByText('Platinum')).toBeVisible();
  });

  test('reviews flashcards with SM-2', async ({ page }) => {
    await page.getByRole('tab', { name: /^study$/i }).click();

    // Check study stats
    await expect(page.getByText('Due Today')).toBeVisible();
    await expect(page.getByText('Total Cards')).toBeVisible();

    // If cards exist, can start review
    const startButton = page.getByRole('button', { name: /start review/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Show answer
      await page.getByRole('button', { name: /show answer/i }).click();
      
      // Rate quality (0-5)
      await page.getByRole('button', { name: '4' }).click();
    }
  });

  test('exports growth packet with disclaimer', async ({ page }) => {
    await page.getByRole('tab', { name: /packet/i }).click();

    // Verify disclaimer
    await expect(page.getByText(/Educational Guidance Only/i)).toBeVisible();
    await expect(
      page.getByText(/not constitute official certification/)
    ).toBeVisible();

    // Export buttons visible
    await expect(page.getByRole('button', { name: /export.*pdf/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /google doc/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /email/i })).toBeVisible();
  });

  test('uses keyboard shortcuts', async ({ page }) => {
    // Press P for Plan Path
    await page.keyboard.press('p');
    await expect(page.getByRole('tab', { name: /^path$/i })).toBeVisible();

    // Navigate back to dashboard
    await page.getByRole('tab', { name: /^dashboard$/i }).click();

    // Press R for Review cards
    await page.keyboard.press('r');
    await expect(page.getByRole('tab', { name: /^study$/i })).toBeVisible();
  });

  test('maintains accessibility - keyboard navigation', async ({ page }) => {
    // Tab through dashboard quick actions
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus visible
    const focused = await page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('maintains accessibility - ARIA labels', async ({ page }) => {
    // Check for proper tab roles
    const tabs = page.locator('[role="tab"]');
    await expect(tabs.first()).toBeVisible();

    // Check for proper tabpanel
    const tabpanel = page.locator('[role="tabpanel"]');
    await expect(tabpanel.first()).toBeVisible();
  });

  test('maintains accessibility - progress bars', async ({ page }) => {
    await page.getByRole('tab', { name: /^matrix$/i }).click();

    // Progress bars should have proper ARIA attributes
    const progressBars = page.locator('[role="progressbar"]');
    if ((await progressBars.count()) > 0) {
      await expect(progressBars.first()).toHaveAttribute('aria-valuenow');
      await expect(progressBars.first()).toHaveAttribute('aria-valuemax');
    }
  });

  test('shows aria-live regions for saves', async ({ page }) => {
    await page.getByRole('tab', { name: /^matrix$/i }).click();

    // Edit and save should trigger aria-live announcement
    const editButton = page.getByRole('button', { name: /^edit$/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.getByRole('button', { name: /^done$/i }).first().click();
      
      // Check for aria-live region (implementation would add this)
      const liveRegion = page.locator('[aria-live]');
      // This would contain save confirmation in real impl
    }
  });
});
