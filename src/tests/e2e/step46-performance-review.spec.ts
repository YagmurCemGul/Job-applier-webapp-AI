/**
 * Step 46 Performance Review E2E Test
 */

import { test, expect } from '@playwright/test';

test.describe('Step 46: Performance Review & Promotion Readiness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/performance');
    await page.waitForLoadState('networkidle');
  });

  test('displays dashboard with KPIs', async ({ page }) => {
    await expect(page.getByText('Performance Dashboard')).toBeVisible();
    await expect(page.getByText('Feedback Received')).toBeVisible();
    await expect(page.getByText('Evidence Linked')).toBeVisible();
    await expect(page.getByText('Avg Rubric Score')).toBeVisible();
    await expect(page.getByText('Promotion Readiness')).toBeVisible();
  });

  test('shows privacy banner', async ({ page }) => {
    await expect(
      page.getByText(/Private by default — share\/export explicitly/)
    ).toBeVisible();
  });

  test('navigates between tabs', async ({ page }) => {
    // Dashboard tab
    await expect(page.getByRole('tab', { name: /dashboard/i })).toHaveAttribute(
      'data-state',
      'active'
    );

    // Navigate to Feedback tab
    await page.getByRole('tab', { name: /feedback/i }).click();
    await expect(page.getByRole('tab', { name: /feedback/i })).toHaveAttribute(
      'data-state',
      'active'
    );

    // Navigate to Evidence tab
    await page.getByRole('tab', { name: /evidence/i }).click();
    await expect(page.getByText('Goal ↔ Evidence Links')).toBeVisible();

    // Navigate to Cycle tab
    await page.getByRole('tab', { name: /cycle/i }).click();
    await expect(page.getByText('Review Cycles')).toBeVisible();

    // Navigate to Calibration tab
    await page.getByRole('tab', { name: /calibration/i }).click();
    await expect(page.getByText('Calibration')).toBeVisible();

    // Navigate to Simulator tab
    await page.getByRole('tab', { name: /simulator/i }).click();
    await expect(page.getByText('Rating Simulator')).toBeVisible();

    // Navigate to Promotion tab
    await page.getByRole('tab', { name: /promotion/i }).click();
    await expect(page.getByText('Promotion Readiness')).toBeVisible();

    // Navigate to Narrative tab
    await page.getByRole('tab', { name: /narrative/i }).click();
    await expect(page.getByText('Narrative Writer')).toBeVisible();

    // Navigate to Packet tab
    await page.getByRole('tab', { name: /packet/i }).click();
    await expect(page.getByText(/Review Packet/i)).toBeVisible();
  });

  test('creates review cycle', async ({ page }) => {
    await page.getByRole('tab', { name: /cycle/i }).click();
    await page.getByRole('button', { name: /create cycle/i }).click();

    await page.selectOption('select#kind', 'mid_year');
    await page.fill('input#title', 'H1 2025 Review');
    await page.fill('input#startDate', '2025-05-01');
    await page.fill('input#dueDate', '2025-06-30');

    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page.getByText('H1 2025 Review')).toBeVisible();
    await expect(page.getByText('mid_year')).toBeVisible();
  });

  test('links evidence to goal', async ({ page }) => {
    await page.getByRole('tab', { name: /evidence/i }).click();
    await page.getByRole('button', { name: /link evidence/i }).click();

    await page.fill('input#goalId', 'goal-perf-test');
    await page.fill('input#refId', 'artifact-123');
    await page.fill('input#title', 'Reduced latency by 30%');
    await page.fill('input#metricDelta', '30');

    await page.getByRole('button', { name: /^link$/i }).click();

    await expect(page.getByText('Reduced latency by 30%')).toBeVisible();
    await expect(page.getByText(/\+30/)).toBeVisible();
  });

  test('uses keyboard shortcuts', async ({ page }) => {
    // Press R for Request 360
    await page.keyboard.press('r');
    await expect(page.getByRole('tab', { name: /feedback/i })).toHaveAttribute(
      'data-state',
      'active'
    );

    // Navigate back to dashboard
    await page.getByRole('tab', { name: /dashboard/i }).click();

    // Press G for Link Evidence
    await page.keyboard.press('g');
    await expect(page.getByRole('tab', { name: /evidence/i })).toHaveAttribute(
      'data-state',
      'active'
    );

    // Navigate back to dashboard
    await page.getByRole('tab', { name: /dashboard/i }).click();

    // Press N for Narrative
    await page.keyboard.press('n');
    await expect(page.getByRole('tab', { name: /narrative/i })).toHaveAttribute(
      'data-state',
      'active'
    );
  });

  test('simulates rating with adjustments', async ({ page }) => {
    await page.getByRole('tab', { name: /simulator/i }).click();

    // Adjust impact slider
    const impactSlider = page.locator('input#impact[type="range"]');
    await impactSlider.fill('3.5');

    // Adjust evidence boost
    const boostSlider = page.locator('input#evidenceBoost[type="range"]');
    await boostSlider.fill('20');

    // Run simulation
    await page.getByRole('button', { name: /simulate/i }).click();

    // Verify result displayed
    await expect(page.getByText(/Overall:/)).toBeVisible();
    await expect(page.getByText(/Simulation Result/i)).toBeVisible();
  });

  test('displays disclaimer on packet export', async ({ page }) => {
    await page.getByRole('tab', { name: /packet/i }).click();

    await expect(page.getByText(/Disclaimer/i)).toBeVisible();
    await expect(
      page.getByText(/This packet is for planning purposes only/)
    ).toBeVisible();
  });

  test('shows bias guard indicator in narrative', async ({ page }) => {
    await page.getByRole('tab', { name: /narrative/i }).click();

    await expect(page.getByText(/Bias Guard Active/i)).toBeVisible();
  });

  test('exports feedback responses as CSV', async ({ page }) => {
    await page.getByRole('tab', { name: /feedback/i }).click();

    // Check if export button exists (even if no data)
    const exportButton = page.getByRole('button', { name: /export csv/i });
    await expect(exportButton).toBeVisible();
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
});
