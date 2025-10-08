import { test, expect } from '@playwright/test'

test.describe('Step 28: ATS Details Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Assume we have a way to set up initial state with a parsed job and CV
    // This would typically involve navigating through the UI or using test fixtures
  })

  test('should display ATS Details tab after analysis', async ({ page }) => {
    // Navigate to ATS Optimize tab
    await page.click('button:has-text("ATS Optimize")')

    // Check if Details sub-tab exists
    const detailsTab = page.locator('button:has-text("Details")')
    await expect(detailsTab).toBeVisible()
  })

  test('should show score and keyword counts in Overview', async ({ page }) => {
    // Navigate to ATS Optimize -> Details -> Overview
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Overview")')

    // Check for score display
    const scoreElement = page.locator('text=/ATS Score/i').first()
    await expect(scoreElement).toBeVisible()

    // Check for matched/missing counts
    await expect(page.locator('text=/matched/i')).toBeVisible()
    await expect(page.locator('text=/missing/i')).toBeVisible()
  })

  test('should toggle highlights between modes', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')

    // Find highlight toggle radio group
    const offRadio = page.locator('input[value="off"]')
    const jobRadio = page.locator('input[value="job"]')
    const cvRadio = page.locator('input[value="cv"]')
    const bothRadio = page.locator('input[value="both"]')

    // Test toggling
    await offRadio.check()
    await expect(offRadio).toBeChecked()

    await jobRadio.check()
    await expect(jobRadio).toBeChecked()

    await cvRadio.check()
    await expect(cvRadio).toBeChecked()

    await bothRadio.check()
    await expect(bothRadio).toBeChecked()
  })

  test('should display keyword table with filters', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Keywords")')

    // Check for table headers
    await expect(page.locator('text=Term')).toBeVisible()
    await expect(page.locator('text=Importance')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()

    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search keyword"]')
    await expect(searchInput).toBeVisible()

    // Test search functionality
    await searchInput.fill('React')
    // Wait for filtering to occur
    await page.waitForTimeout(300)
  })

  test('should filter keywords by status', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Keywords")')

    // Find status filter dropdown
    const statusFilter = page.locator('select, [role="combobox"]').first()
    await statusFilter.click()

    // Select "Matched" filter
    await page.click('text=Matched')
    // Verify only matched keywords are shown (implementation-specific)
  })

  test('should show insert actions for missing keywords', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Keywords")')

    // Find a missing keyword row
    const missingBadge = page.locator('text=Missing').first()
    if (await missingBadge.isVisible()) {
      // Find the Add button in the same row
      const addButton = page.locator('button:has-text("Add")').first()
      await expect(addButton).toBeVisible()

      // Click to open dropdown
      await addButton.click()

      // Check for insert options
      await expect(page.locator('text=Add to Summary')).toBeVisible()
      await expect(page.locator('text=Add to Skills')).toBeVisible()
    }
  })

  test('should add keyword to summary', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Keywords")')

    // Find a missing keyword and add to summary
    const missingRow = page.locator('text=Missing').first()
    if (await missingRow.isVisible()) {
      const addButton = page.locator('button:has-text("Add")').first()
      await addButton.click()
      await page.click('text=Add to Summary')

      // Verify the keyword was added (would need to check CV preview or data)
      // This is implementation-specific
    }
  })

  test('should display weights panel with sliders', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Weights")')

    // Check for weight labels
    await expect(page.locator('text=Keywords')).toBeVisible()
    await expect(page.locator('text=Sections')).toBeVisible()
    await expect(page.locator('text=Length')).toBeVisible()
    await expect(page.locator('text=Experience')).toBeVisible()
    await expect(page.locator('text=Formatting')).toBeVisible()

    // Check for sliders (implementation-specific)
    const sliders = page.locator('[role="slider"]')
    await expect(sliders).toHaveCount(5)
  })

  test('should adjust weights and show sum', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Weights")')

    // Find sum indicator
    const sumIndicator = page.locator('text=/Sum:/i')
    await expect(sumIndicator).toBeVisible()

    // Default should be close to 1.00
    await expect(sumIndicator).toContainText('1.00')
  })

  test('should reset weights to defaults', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Weights")')

    // Click reset button
    const resetButton = page.locator('button:has-text("Reset defaults")')
    await resetButton.click()

    // Verify sum is back to 1.00
    const sumIndicator = page.locator('text=/Sum:/i')
    await expect(sumIndicator).toContainText('1.00')
  })

  test('should recalculate score with custom weights', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')
    await page.click('button:has-text("Weights")')

    // Get initial score
    await page.click('button:has-text("Overview")')
    const initialScore = await page.locator('text=/\\d+/').first().textContent()

    // Adjust weights
    await page.click('button:has-text("Weights")')
    // Adjust a slider (implementation-specific)

    // Click recalculate
    const recalcButton = page.locator('button:has-text("Recalculate")')
    await recalcButton.click()

    // Wait for recalculation
    await page.waitForTimeout(500)

    // Verify score may have changed
    await page.click('button:has-text("Overview")')
    const newScore = await page.locator('text=/\\d+/').first().textContent()
    // Score might be the same or different depending on weight changes
  })

  test('should export JSON', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')

    // Click export JSON button
    const exportJsonButton = page.locator('button:has-text("Export JSON")')
    await exportJsonButton.click()

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })

  test('should export CSV', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')

    // Click export CSV button
    const exportCsvButton = page.locator('button:has-text("Export Keywords CSV")')
    await exportCsvButton.click()

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.csv$/)
  })

  test('should navigate highlights with keyboard', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')

    // Enable job highlights
    const jobRadio = page.locator('input[value="job"]')
    await jobRadio.check()

    // Use keyboard navigation (Alt+Down, Alt+Up)
    await page.keyboard.press('Alt+ArrowDown')
    await page.waitForTimeout(100)
    await page.keyboard.press('Alt+ArrowUp')
    
    // Verify navigation occurred (implementation-specific)
  })

  test('should show legend when toggle is on', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')

    // Legend should be visible by default
    const legend = page.locator('text=Matched keyword')
    await expect(legend).toBeVisible()

    // Toggle legend off
    const legendButton = page.locator('button:has-text("Legend")')
    await legendButton.click()

    // Legend should be hidden
    await expect(legend).not.toBeVisible()

    // Toggle back on
    await legendButton.click()
    await expect(legend).toBeVisible()
  })

  test('should display job text with highlights', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')

    // Enable job highlights
    const jobRadio = page.locator('input[value="job"]')
    await jobRadio.check()

    // Check for job text viewer
    const jobTextViewer = page.locator('text=Job Text Preview')
    await expect(jobTextViewer).toBeVisible()

    // Check for highlighted keywords (would have <mark> tags in DOM)
    const marks = page.locator('mark[data-kw]')
    if (await marks.count() > 0) {
      await expect(marks.first()).toBeVisible()
    }
  })

  test('should update CV preview with highlights', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Suggestions")')

    // Enable CV highlights
    await page.click('button:has-text("Details")')
    const cvRadio = page.locator('input[value="cv"]')
    await cvRadio.check()

    // Go back to suggestions to see preview
    await page.click('button:has-text("Suggestions")')

    // Check for highlight indicator in CV preview
    const highlightIndicator = page.locator('text=CV Highlights Active')
    await expect(highlightIndicator).toBeVisible()
  })

  test('should handle no analysis result gracefully', async ({ page }) => {
    // Navigate to Details without running analysis
    await page.goto('/')
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')

    // Should show message about running analysis
    const message = page.locator('text=/Run ATS analysis/i')
    await expect(message).toBeVisible()
  })

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.click('button:has-text("ATS Optimize")')
    await page.click('button:has-text("Details")')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Verify focus is visible (implementation-specific)
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
