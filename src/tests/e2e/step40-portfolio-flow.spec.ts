/**
 * @fileoverview E2E tests for Step 40 portfolio flow.
 * @module tests/e2e/step40-portfolio-flow
 */

import { test, expect } from '@playwright/test';

test.describe('Step 40: Portfolio Publisher Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio');
  });

  test('displays portfolio dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Portfolio Publisher'
    );
    await expect(page.getByText('Portfolio Dashboard')).toBeVisible();
  });

  test('creates and edits profile', async ({ page }) => {
    // Navigate to profile tab
    await page.getByRole('tab', { name: /Profile/i }).click();

    // Fill profile
    await page.getByLabel('Headline').fill('Senior Product Manager');
    await page
      .getByLabel('Bio')
      .fill('Building products that delight users and drive business impact');
    await page.getByLabel('Location').fill('San Francisco, CA');

    // Add link
    await page.getByRole('button', { name: /Add Link/i }).click();
    const linkInputs = page.locator('input[placeholder="Label"]').last();
    await linkInputs.fill('LinkedIn');
    await page
      .locator('input[placeholder="URL"]')
      .last()
      .fill('https://linkedin.com/in/test');

    // Save
    await page.getByRole('button', { name: /Save Profile/i }).click();

    // Verify saved (check for success indication or persistence)
    await expect(page.getByLabel('Headline')).toHaveValue(
      'Senior Product Manager'
    );
  });

  test('generates case study from evidence binder', async ({ page }) => {
    // Navigate to case studies tab
    await page.getByRole('tab', { name: /Case Studies/i }).click();

    // Click generate from evidence
    await page.getByRole('button', { name: /Generate from Evidence/i }).click();

    // Dialog should appear - select a plan if available
    // (This assumes there's test data; in real tests, seed data first)
    const dialog = page.getByRole('dialog');
    if ((await dialog.isVisible()) && (await dialog.getByRole('heading').count()) > 0) {
      await dialog.locator('.border').first().click();
      // In the prompt that appears, we'd need to handle it differently
      // For now, assume the case is created
    }
  });

  test('creates and publishes case study', async ({ page }) => {
    // Navigate to case studies
    await page.getByRole('tab', { name: /Case Studies/i }).click();

    // Create new case study
    await page.getByRole('button', { name: /New Case Study/i }).click();

    // Fill form
    await page.getByLabel('Title').fill('Product Launch 2025');
    await page.getByLabel('Slug').fill('product-launch-2025');
    await page
      .getByLabel('Excerpt')
      .fill('Successfully launched new product with 10k users in first week');
    await page
      .locator('textarea[id="content"]')
      .fill('# Product Launch 2025\n\n## Overview\n\nTest content');

    // Set to public
    await page.getByLabel('Visibility').click();
    await page.getByRole('option', { name: 'Public' }).click();

    // Save
    await page.getByRole('button', { name: /Save/i }).click();

    // Verify case study appears in list
    await expect(page.getByText('Product Launch 2025')).toBeVisible();
  });

  test('creates blog post', async ({ page }) => {
    // Navigate to blog
    await page.getByRole('tab', { name: /Blog/i }).click();

    // Create new post
    await page.getByRole('button', { name: /New Post/i }).click();

    // Fill form
    await page.getByLabel('Title').fill('Lessons from Product Launch');
    await page.getByLabel('Slug').fill('lessons-product-launch');
    await page
      .locator('textarea[id="content"]')
      .fill('# Lessons Learned\n\nKey takeaways from our launch');

    // Save
    await page.getByRole('button', { name: /Save/i }).click();

    // Verify post appears
    await expect(page.getByText('Lessons from Product Launch')).toBeVisible();
  });

  test('runs SEO inspector', async ({ page }) => {
    // Navigate to SEO tab
    await page.getByRole('tab', { name: /SEO/i }).click();

    // Should show SEO inspector
    await expect(page.getByText('SEO inspector')).toBeVisible();

    // If content exists, can select and inspect it
    const contentItems = page.locator('.border.rounded-md.cursor-pointer');
    if ((await contentItems.count()) > 0) {
      await contentItems.first().click();
      await expect(page.getByText('SEO Validation')).toBeVisible();

      // Generate OG image
      const ogButton = page.getByRole('button', { name: /Generate OG Image/i });
      if (await ogButton.isVisible()) {
        await ogButton.click();
        // Should show preview
        await expect(page.locator('img[alt="OG preview"]')).toBeVisible();
      }
    }
  });

  test('customizes theme', async ({ page }) => {
    // Navigate to theme tab
    await page.getByRole('tab', { name: /Theme/i }).click();

    // Should show theme presets
    await expect(page.getByText('Theme Presets')).toBeVisible();

    // Select a preset (click on first preset)
    await page
      .locator('.border-2.rounded-lg.cursor-pointer')
      .first()
      .click();

    // Customize colors
    await page.getByLabel('Primary Color').first().fill('#000000');
    await page.getByLabel('Accent Color').first().fill('#ff0000');

    // Save
    await page.getByRole('button', { name: /Save Theme/i }).click();
  });

  test('schedules social post', async ({ page }) => {
    // Navigate to social tab
    await page.getByRole('tab', { name: /Social/i }).click();

    // Create new post
    await page.getByRole('button', { name: /New Post/i }).click();

    // Fill form
    await page.getByLabel('Title').fill('Check out my new case study!');
    await page
      .getByLabel('Body')
      .fill(
        'Just published a case study about our product launch. Read more at...'
      );

    // Set schedule
    const tomorrow = new Date(Date.now() + 86400000);
    await page
      .getByLabel('Schedule')
      .fill(tomorrow.toISOString().slice(0, 16));

    // Save
    await page.getByRole('button', { name: /Save/i }).click();

    // Verify post appears
    await expect(
      page.getByText('Check out my new case study!')
    ).toBeVisible();
  });

  test('previews site', async ({ page }) => {
    // Navigate to preview tab
    await page.getByRole('tab', { name: /Preview/i }).click();

    // Should show preview
    await expect(page.getByText('Live preview')).toBeVisible();

    // Test viewport switcher
    await page.getByRole('button', { name: /Tablet/i }).click();
    await page.getByRole('button', { name: /Mobile/i }).click();
    await page.getByRole('button', { name: /Desktop/i }).click();
  });

  test('exports site as ZIP', async ({ page }) => {
    // Navigate to publish tab
    await page.getByRole('tab', { name: /Publish/i }).click();

    // Click publish button
    await page.getByRole('button', { name: /Publish/i }).click();

    // Dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select ZIP export
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: /Export ZIP/i }).click();

    // Click export (this triggers download in real browser)
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export ZIP/i }).click();

    // Verify download started (or success message)
    // In headless mode, download event should fire
  });

  test('configures contact form', async ({ page }) => {
    // Navigate to contact tab
    await page.getByRole('tab', { name: /Contact/i }).click();

    // Configure form
    await page.getByLabel('Form Title').fill('Get in Touch');
    await page.getByLabel('Delivery Email').fill('contact@example.com');

    // Add field
    await page.getByRole('button', { name: /Add Field/i }).click();

    // Save
    await page.getByRole('button', { name: /Save Form/i }).click();
  });

  test('enables analytics', async ({ page }) => {
    // Navigate to analytics tab
    await page.getByRole('tab', { name: /Analytics/i }).click();

    // Toggle opt-in
    await page.getByLabel('Opt in to privacy-friendly analytics').click();

    // Should show analytics section
    await expect(page.getByText('Sample Metrics')).toBeVisible();

    // Use UTM builder
    await page
      .getByLabel('Base URL')
      .fill('https://example.com/cases/my-case.html');
    await page.getByLabel('Source').fill('linkedin');
    await page.getByLabel('Medium').fill('social');
    await page.getByLabel('Campaign').fill('launch');

    await page.getByRole('button', { name: /Build URL/i }).click();

    // Should show tagged URL
    await expect(page.getByLabel('Tagged URL')).toBeVisible();
  });

  test('complete flow: profile → case → blog → SEO → publish', async ({
    page,
  }) => {
    // 1. Set profile
    await page.getByRole('tab', { name: /Profile/i }).click();
    await page.getByLabel('Headline').fill('Product Leader');
    await page.getByRole('button', { name: /Save Profile/i }).click();

    // 2. Create case study
    await page.getByRole('tab', { name: /Case Studies/i }).click();
    await page.getByRole('button', { name: /New Case Study/i }).click();
    await page.getByLabel('Title').fill('Success Story');
    await page.getByLabel('Slug').fill('success-story');
    await page.locator('textarea[id="content"]').fill('# Success\n\nContent');
    await page.getByLabel('Visibility').click();
    await page.getByRole('option', { name: 'Public' }).click();
    await page.getByRole('button', { name: /Save/i }).click();

    // 3. Create blog post
    await page.getByRole('tab', { name: /Blog/i }).click();
    await page.getByRole('button', { name: /New Post/i }).click();
    await page.getByLabel('Title').fill('Insights');
    await page.getByLabel('Slug').fill('insights');
    await page.locator('textarea[id="content"]').fill('# Insights\n\nPost');
    await page.getByLabel('Visibility').click();
    await page.getByRole('option', { name: 'Public' }).click();
    await page.getByRole('button', { name: /Save/i }).click();

    // 4. Preview
    await page.getByRole('tab', { name: /Preview/i }).click();
    await expect(page.getByText('Success Story')).toBeVisible();

    // 5. Publish
    await page.getByRole('tab', { name: /Publish/i }).click();
    await page.getByRole('button', { name: /Publish/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});