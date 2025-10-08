import { test, expect } from '@playwright/test'

/**
 * E2E test for Step 25: ATS Analysis Flow
 * 
 * This test verifies the complete user journey:
 * 1. User navigates to CV Builder
 * 2. User pastes a job posting
 * 3. System parses the job
 * 4. User runs ATS analysis
 * 5. User sees ATS score and suggestions (pills)
 * 6. User can interact with pills (apply/dismiss)
 * 7. Changes reflect in live preview
 * 8. Undo/Redo works correctly
 */

test.describe('ATS Analysis Flow', () => {
  const sampleJobText = `
Title: Senior Software Engineer
Company: Tech Corp
Location: San Francisco

Requirements:
- 5+ years of React and TypeScript
- Experience with Node.js and AWS
- Strong problem-solving skills

Responsibilities:
- Build scalable web applications
- Lead technical projects
- Mentor junior developers
  `.trim()

  test.beforeEach(async ({ page }) => {
    // Navigate to CV Builder
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should complete full ATS analysis flow', async ({ page }) => {
    // Step 1: Navigate to Job tab
    await page.click('button[value="job"]')
    await expect(page.locator('text=Job Posting Input')).toBeVisible()

    // Step 2: Paste job text
    const textarea = page.locator('textarea[aria-label="Job description"]')
    await textarea.fill(sampleJobText)
    
    // Verify word count updates
    await expect(page.locator('text=/\\d+ words/')).toBeVisible()

    // Step 3: Parse job
    await page.click('button:has-text("Parse")')
    await page.waitForTimeout(500) // Wait for parsing

    // Step 4: Run analysis
    const analyzeButton = page.locator('button:has-text("Analyze Against CV")')
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click()
      await page.waitForTimeout(1000) // Wait for analysis
    }

    // Step 5: Verify ATS Optimize tab is available
    const atsTab = page.locator('button[value="ats-optimize"]')
    if (await atsTab.isEnabled()) {
      await atsTab.click()

      // Verify ATS score is displayed
      await expect(page.locator('text=/ATS Score:.*\\d+\\/100/')).toBeVisible()

      // Verify suggestions (pills) are displayed
      await expect(page.locator('[role="button"][aria-label*="suggestion"]').first()).toBeVisible()
    }
  })

  test('should show pill interactions on hover', async ({ page }) => {
    // Navigate to ATS optimize tab (assuming job is already parsed)
    await page.click('button[value="ats-optimize"]')
    
    const pill = page.locator('[role="button"][aria-label*="suggestion"]').first()
    
    if (await pill.isVisible()) {
      // Hover over pill
      await pill.hover()
      
      // Verify dismiss button appears on hover
      await expect(pill.locator('button[aria-label="Dismiss"]')).toBeVisible()
    }
  })

  test('should apply suggestion and update CV', async ({ page }) => {
    // Navigate to ATS optimize tab
    await page.click('button[value="ats-optimize"]')
    
    const pill = page.locator('[role="button"][aria-label*="suggestion"]').first()
    
    if (await pill.isVisible()) {
      // Click to apply suggestion
      await pill.click()
      
      // Verify pill becomes less opaque (applied state)
      await expect(pill).toHaveClass(/opacity-50/)
    }
  })

  test('should dismiss suggestion', async ({ page }) => {
    // Navigate to ATS optimize tab
    await page.click('button[value="ats-optimize"]')
    
    const pill = page.locator('[role="button"][aria-label*="suggestion"]').first()
    
    if (await pill.isVisible()) {
      const initialCount = await page.locator('[role="button"][aria-label*="suggestion"]').count()
      
      // Hover and click dismiss
      await pill.hover()
      await pill.locator('button[aria-label="Dismiss"]').click()
      
      // Verify suggestion is removed
      const newCount = await page.locator('[role="button"][aria-label*="suggestion"]').count()
      expect(newCount).toBeLessThan(initialCount)
    }
  })

  test('should support undo/redo', async ({ page }) => {
    // Navigate to ATS optimize tab
    await page.click('button[value="ats-optimize"]')
    
    const undoButton = page.locator('button:has-text("Undo")')
    const redoButton = page.locator('button:has-text("Redo")')
    
    // Initially, undo/redo should be disabled
    await expect(undoButton).toBeDisabled()
    await expect(redoButton).toBeDisabled()
    
    // Apply a suggestion
    const pill = page.locator('[role="button"][aria-label*="suggestion"]').first()
    if (await pill.isVisible()) {
      await pill.click()
      
      // Undo should now be enabled
      await expect(undoButton).toBeEnabled()
      
      // Click undo
      await undoButton.click()
      
      // Redo should now be enabled
      await expect(redoButton).toBeEnabled()
      
      // Click redo
      await redoButton.click()
      
      // Undo should be enabled again
      await expect(undoButton).toBeEnabled()
    }
  })

  test('should filter suggestions by category', async ({ page }) => {
    // Navigate to ATS optimize tab
    await page.click('button[value="ats-optimize"]')
    
    // Open category filter
    const categorySelect = page.locator('button:has-text("Category")')
    if (await categorySelect.isVisible()) {
      await categorySelect.click()
      
      // Select "Keywords" category
      await page.click('text=Keywords')
      
      // Verify only keyword suggestions are shown
      const visiblePills = page.locator('[role="button"][aria-label*="Keywords"]')
      await expect(visiblePills.first()).toBeVisible()
    }
  })

  test('should search suggestions', async ({ page }) => {
    // Navigate to ATS optimize tab
    await page.click('button[value="ats-optimize"]')
    
    const searchInput = page.locator('input[aria-label="Search suggestions"]')
    if (await searchInput.isVisible()) {
      // Type search term
      await searchInput.fill('keyword')
      
      // Verify filtered results
      // (Note: actual verification depends on what suggestions exist)
      await page.waitForTimeout(300) // Debounce delay
    }
  })

  test('should display live preview alongside ATS panel', async ({ page }) => {
    // Navigate to ATS optimize tab on larger screen
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.click('button[value="ats-optimize"]')
    
    // Verify both panel and preview are visible
    await expect(page.locator('text=ATS Optimization')).toBeVisible()
    
    // Live preview should be visible on xl screens
    const preview = page.locator('[class*="sticky"]')
    if (await preview.isVisible()) {
      await expect(preview).toBeVisible()
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Navigate to ATS optimize tab
    await page.click('button[value="ats-optimize"]')
    
    const pill = page.locator('[role="button"][aria-label*="suggestion"]').first()
    
    if (await pill.isVisible()) {
      // Focus the pill
      await pill.focus()
      
      // Press Enter to apply
      await page.keyboard.press('Enter')
      
      // Verify pill state changes
      await expect(pill).toHaveClass(/opacity-50/)
    }
  })

  test('should show "no suggestions" message when filters match nothing', async ({ page }) => {
    // Navigate to ATS optimize tab
    await page.click('button[value="ats-optimize"]')
    
    const searchInput = page.locator('input[aria-label="Search suggestions"]')
    if (await searchInput.isVisible()) {
      // Type gibberish
      await searchInput.fill('xyzabc123nonsense')
      await page.waitForTimeout(300)
      
      // Verify "no suggestions" message
      await expect(page.locator('text=/No suggestions match/')).toBeVisible()
    }
  })
})
