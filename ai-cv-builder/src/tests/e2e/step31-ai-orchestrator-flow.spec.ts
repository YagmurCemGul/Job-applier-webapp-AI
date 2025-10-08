/**
 * E2E test for AI Orchestration Layer (Step 31)
 */
import { test, expect } from '@playwright/test'

test.describe('AI Orchestration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should configure AI settings and generate cover letter', async ({ page }) => {
    // Navigate to AI Settings
    await page.click('text=Settings') // Assuming there's a settings nav item
    await page.click('text=AI Settings')

    // Configure a provider for cover letter generation
    await page.waitForSelector('[data-testid="ai-settings-panel"]', { state: 'visible' })
    
    // Select provider for cover letter task
    const coverLetterProviderSelect = page.locator('text=Cover Letter').locator('..').locator('select, [role="combobox"]').first()
    await coverLetterProviderSelect.click()
    await page.click('text=OpenAI')

    // Set model name
    const coverLetterModelInput = page.locator('text=Cover Letter').locator('..').locator('input[placeholder*="Model"]')
    await coverLetterModelInput.fill('gpt-4o-mini')

    // Enable cache and safety
    await page.check('text=Cache')
    await page.check('text=Safety')

    // Navigate to Cover Letter tab
    await page.click('text=Cover Letter')
    await page.waitForTimeout(500)

    // Fill in job posting
    const jobTextarea = page.locator('textarea[placeholder*="job"]').first()
    await jobTextarea.fill('We are looking for a Senior Software Engineer with React and TypeScript experience.')

    // Generate cover letter
    await page.click('button:has-text("Generate Cover Letter")')

    // Wait for generation to complete
    await page.waitForSelector('button:has-text("Generating")', { state: 'detached', timeout: 30000 })

    // Verify cover letter was generated
    const coverLetterContent = page.locator('[data-testid="cover-letter-preview"]')
    await expect(coverLetterContent).toBeVisible()
    await expect(coverLetterContent).not.toBeEmpty()
  })

  test('should suggest similar keywords in ATS analysis', async ({ page }) => {
    // Navigate to ATS tab
    await page.click('text=ATS Analysis')

    // Input job posting
    const jobTextarea = page.locator('textarea[placeholder*="job posting"]').first()
    await jobTextarea.fill(`
      Senior React Developer needed
      Requirements: React, TypeScript, Node.js, AWS
      Qualifications: 5+ years experience
    `)

    // Run ATS analysis
    await page.click('button:has-text("Analyze")')
    await page.waitForSelector('text=ATS Score', { timeout: 15000 })

    // Go to Keywords tab
    await page.click('text=Keywords')
    await page.waitForTimeout(500)

    // Click "Suggest Similar" button
    const suggestButton = page.locator('button:has-text("Suggest Similar")')
    await expect(suggestButton).toBeVisible()
    await suggestButton.click()

    // Wait for suggestions
    await page.waitForSelector('text=AI Suggested Keywords', { timeout: 30000 })

    // Verify suggestions are displayed
    const suggestedKeywords = page.locator('[data-testid="ai-suggested-keywords"]').first()
    await expect(suggestedKeywords).toBeVisible()

    // Try to add a suggested keyword
    const firstSuggestion = page.locator('[data-testid="ai-suggested-keywords"] >> button').first()
    if (await firstSuggestion.isVisible()) {
      await firstSuggestion.click()
      await page.click('text=Add to Skills')
      
      // Verify it was added
      await page.click('text=CV Editor')
      await page.click('text=Skills')
      // Should see the added skill
    }
  })

  test('should use AI test console', async ({ page }) => {
    // Navigate to AI Settings
    await page.click('text=Settings')
    await page.click('text=AI Settings')

    // Scroll to test console
    await page.locator('text=AI Test Console').scrollIntoViewIfNeeded()

    // Input test prompt
    const testInput = page.locator('textarea[placeholder*="Say hello"]')
    await testInput.fill('Write a one-sentence greeting.')

    // Run test
    await page.click('button:has-text("Run")')

    // Wait for result
    await page.waitForSelector('button:has-text("Run")', { state: 'visible', timeout: 30000 })

    // Verify output
    const output = page.locator('pre').last()
    await expect(output).not.toBeEmpty()
  })

  test('should toggle AI settings and persist', async ({ page }) => {
    // Navigate to AI Settings
    await page.click('text=Settings')
    await page.click('text=AI Settings')

    // Change temperature
    const tempInput = page.locator('input[type="number"]').filter({ hasText: /temperature/i })
    await tempInput.fill('0.8')

    // Disable safety
    const safetyCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /safety/i })
    await safetyCheckbox.uncheck()

    // Reload page
    await page.reload()
    await page.click('text=Settings')
    await page.click('text=AI Settings')

    // Verify settings persisted
    await expect(tempInput).toHaveValue('0.8')
    await expect(safetyCheckbox).not.toBeChecked()
  })

  test('should show cached indicator on repeated requests', async ({ page }) => {
    // Navigate to AI Settings test console
    await page.click('text=Settings')
    await page.click('text=AI Settings')

    // Enable cache
    const cacheCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /cache/i })
    await cacheCheckbox.check()

    // Run same prompt twice
    const testInput = page.locator('textarea[placeholder*="Say hello"]')
    await testInput.fill('Unique test prompt 12345')
    
    await page.click('button:has-text("Run")')
    await page.waitForSelector('button:has-text("Run")', { state: 'visible', timeout: 30000 })

    // Run again
    await page.click('button:has-text("Run")')
    await page.waitForSelector('button:has-text("Run")', { state: 'visible', timeout: 30000 })

    // Check for cached indicator
    const output = page.locator('pre').last()
    const outputText = await output.textContent()
    expect(outputText).toContain('(cached)')
  })
})
