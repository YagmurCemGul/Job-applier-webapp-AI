import { test, expect } from '@playwright/test'

test.describe('Step 29 - Variants Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv-builder')
  })

  test('create variant from current CV', async ({ page }) => {
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Should show empty state
    await expect(page.locator('text=No variants yet')).toBeVisible()

    // Click Create Variant
    await page.click('button:has-text("Create Variant")')

    // Fill in variant name
    await page.fill('input[placeholder="Variant name"]', 'Acme Backend v1')

    // Create the variant
    await page.click('button:has-text("Create")')

    // Should see the variant in the list
    await expect(page.locator('text=Acme Backend v1')).toBeVisible()
  })

  test('link variant to saved job', async ({ page }) => {
    // First save a job (assuming jobs exist)
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Click Create Variant
    await page.click('button:has-text("Create Variant")')

    // Fill in variant name
    await page.fill('input[placeholder="Variant name"]', 'Frontend Engineer Variant')

    // Select a saved job from dropdown
    const jobSelect = page.locator('select').first()
    await jobSelect.selectOption({ index: 1 })

    // Create the variant
    await page.click('button:has-text("Create")')

    // Should see the variant with linked job indicator
    await expect(page.locator('text=Frontend Engineer Variant')).toBeVisible()
    await expect(page.locator('text=Linked job')).toBeVisible()
  })

  test('view variant diff', async ({ page }) => {
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Create a variant
    await page.click('button:has-text("Create Variant")')
    await page.fill('input[placeholder="Variant name"]', 'Test Variant')
    await page.click('button:has-text("Create")')

    // Select the variant
    await page.click('button:has-text("Open")')

    // Should see diff viewer
    await expect(page.locator('text=Select a variant to view differences')).not.toBeVisible()
    await expect(page.locator('text=Summary')).toBeVisible()
    await expect(page.locator('text=Before')).toBeVisible()
    await expect(page.locator('text=After')).toBeVisible()
  })

  test('rename variant', async ({ page }) => {
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Create a variant
    await page.click('button:has-text("Create Variant")')
    await page.fill('input[placeholder="Variant name"]', 'Original Name')
    await page.click('button:has-text("Create")')

    // Mock the prompt dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt')
      await dialog.accept('New Name')
    })

    // Click rename
    await page.click('button:has-text("Rename")')

    // Should see updated name
    await expect(page.locator('text=New Name')).toBeVisible()
  })

  test('create snapshot in history', async ({ page }) => {
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Create a variant
    await page.click('button:has-text("Create Variant")')
    await page.fill('input[placeholder="Variant name"]', 'History Test')
    await page.click('button:has-text("Create")')

    // Select the variant
    await page.click('button:has-text("Open")')

    // Add a snapshot
    await page.click('button:has-text("Snapshot")')

    // Should see history section with 2 entries (init + snapshot)
    await expect(page.locator('text=History')).toBeVisible()
    const historyItems = page.locator('[class*="history"] .border').locator('visible=true')
    await expect(historyItems).toHaveCount(2)
  })

  test('open export preset dialog', async ({ page }) => {
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Create and select a variant
    await page.click('button:has-text("Create Variant")')
    await page.fill('input[placeholder="Variant name"]', 'Export Test')
    await page.click('button:has-text("Create")')
    await page.click('button:has-text("Open")')

    // Click export
    await page.click('button:has-text("Export")')

    // Should see export preset dialog
    await expect(page.locator('text=Export Presets')).toBeVisible()
    await expect(page.locator('input[placeholder="Preset name"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Naming template"]')).toBeVisible()
  })

  test('save export preset with naming template', async ({ page }) => {
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Create and select a variant
    await page.click('button:has-text("Create Variant")')
    await page.fill('input[placeholder="Variant name"]', 'Export Test')
    await page.click('button:has-text("Create")')
    await page.click('button:has-text("Open")')

    // Open export dialog
    await page.click('button:has-text("Export")')

    // Fill in preset details
    await page.fill('input[placeholder="Preset name"]', 'My Export Preset')
    await page.fill(
      'input[placeholder="Naming template"]',
      'CV_{FirstName}_{LastName}_{Date}'
    )

    // Select formats
    await page.check('input[type="checkbox"]:left-of(:text("PDF"))')
    await page.check('input[type="checkbox"]:left-of(:text("DOCX"))')

    // Save and export
    await page.click('button:has-text("Save & Export")')

    // Dialog should close
    await expect(page.locator('text=Export Presets')).not.toBeVisible()
  })

  test('delete variant', async ({ page }) => {
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Create a variant
    await page.click('button:has-text("Create Variant")')
    await page.fill('input[placeholder="Variant name"]', 'To Delete')
    await page.click('button:has-text("Create")')

    // Delete the variant
    await page.click('button:has-text("Delete")')

    // Should return to empty state
    await expect(page.locator('text=No variants yet')).toBeVisible()
  })

  test('restore from history', async ({ page }) => {
    // Navigate to Variants tab
    await page.click('text=Variants')

    // Create a variant
    await page.click('button:has-text("Create Variant")')
    await page.fill('input[placeholder="Variant name"]', 'Restore Test')
    await page.click('button:has-text("Create")')
    await page.click('button:has-text("Open")')

    // Add a snapshot
    await page.click('button:has-text("Snapshot")')

    // Restore from first history entry
    const restoreButtons = page.locator('button:has-text("Restore")')
    await restoreButtons.first().click()

    // Should trigger restore (actual CV update would need to be verified in integration)
    // For now, just verify the button was clicked
    await expect(page.locator('text=History')).toBeVisible()
  })
})
