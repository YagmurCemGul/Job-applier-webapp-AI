/**
 * Cover Letter End-to-End Flow Test - Step 30
 * Tests the complete cover letter workflow
 */

import { test, expect } from '@playwright/test'

test.describe('Cover Letter Studio - Step 30', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    // Navigate to CV Builder
    await page.click('text=Get Started')
    await page.waitForURL('**/cv-builder')
  })

  test('should generate and edit cover letter', async ({ page }) => {
    // Navigate to Cover Letter tab
    await page.click('[value="cover-letter"]')

    // Check if toolbar is visible
    await expect(page.locator('text=Generate')).toBeVisible()

    // Select template
    await page.click('[aria-label="Template"]')
    await page.click('text=Classic Professional')

    // Set tone
    await page.click('[aria-label="Tone"]')
    await page.click('text=Formal')

    // Set length
    await page.click('[aria-label="Length"]')
    await page.click('text=Medium')

    // Generate cover letter
    await page.click('text=Generate')

    // Wait for generation
    await page.waitForTimeout(2000)

    // Verify editor appears
    const editor = page.locator('[contenteditable="true"]')
    await expect(editor).toBeVisible()

    // Verify preview appears
    await expect(page.locator('text=Preview')).toBeVisible()
  })

  test('should insert ATS keywords', async ({ page }) => {
    await page.click('[value="cover-letter"]')

    // Wait for keyword assist section
    const keywordSection = page.locator('text=Keyword Assist')
    await expect(keywordSection).toBeVisible()

    // Check if keywords are available (if ATS has run)
    const keywords = page.locator('[class*="badge"]')
    const count = await keywords.count()

    if (count > 0) {
      // Click first keyword
      await keywords.first().click()
    }
  })

  test('should save and export cover letter', async ({ page }) => {
    await page.click('[value="cover-letter"]')
    await page.click('text=Generate')
    await page.waitForTimeout(2000)

    // Open export dialog
    await page.click('text=Export…')

    // Check export options
    await expect(page.locator('text=Export Cover Letter')).toBeVisible()
    await expect(page.locator('text=PDF')).toBeVisible()
    await expect(page.locator('text=DOCX')).toBeVisible()

    // Close dialog
    await page.click('text=Close')
  })

  test('should manage prompt library', async ({ page }) => {
    await page.click('[value="cover-letter"]')

    // Open prompt library
    await page.click('text=Prompt Library')

    // Check dialog
    await expect(page.locator('text=Prompt Library')).toBeVisible()

    // Add folder
    await page.fill('input[placeholder="New folder name"]', 'Test Folder')
    await page.click('text=Add Folder')

    // Add prompt
    await page.fill('input[placeholder="Prompt name"]', 'Leadership Focus')
    await page.fill(
      'textarea[placeholder="Prompt body…"]',
      'Emphasize leadership and team management experience'
    )
    await page.click('button:has-text("Save Prompt")')

    // Verify prompt appears
    await expect(page.locator('text=Leadership Focus')).toBeVisible()
  })

  test('should view history and restore versions', async ({ page }) => {
    await page.click('[value="cover-letter"]')
    await page.click('text=Generate')
    await page.waitForTimeout(2000)

    // Edit content
    const editor = page.locator('[contenteditable="true"]')
    await editor.click()
    await editor.fill('<p>Modified content</p>')
    await editor.blur()

    // Check history
    const history = page.locator('text=History')
    await expect(history).toBeVisible()

    // Check if restore buttons appear
    const restoreButtons = page.locator('button:has-text("Restore")')
    const count = await restoreButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should copy cover letter as text', async ({ page }) => {
    await page.click('[value="cover-letter"]')
    await page.click('text=Generate')
    await page.waitForTimeout(2000)

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])

    // Click copy button
    await page.click('text=Copy as Text')

    // Verify clipboard has content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText.length).toBeGreaterThan(0)
  })

  test('should search saved cover letters', async ({ page }) => {
    await page.click('[value="cover-letter"]')

    // Create a cover letter first
    await page.click('text=Generate')
    await page.waitForTimeout(2000)

    // Search in saved list
    const searchInput = page.locator('input[placeholder*="Search cover letters"]')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('test')
  })

  test('should switch languages', async ({ page }) => {
    await page.click('[value="cover-letter"]')

    // Select Turkish
    await page.click('[aria-label="Language"]')
    await page.click('text=TR')

    // Generate in Turkish
    await page.click('text=Generate')
    await page.waitForTimeout(2000)

    // Verify Turkish content
    const editor = page.locator('[contenteditable="true"]')
    const content = await editor.textContent()
    // Turkish greetings/closings should appear
    expect(content).toMatch(/Sayın|Saygılarımla/i)
  })
})
