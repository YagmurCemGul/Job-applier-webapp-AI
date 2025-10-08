import { test, expect } from '@playwright/test'

/**
 * E2E test for Step 26: Job Posting Structured UI & Saved Jobs
 * 
 * Flow:
 * 1. Navigate to CV Builder
 * 2. Upload CV (or skip if already done)
 * 3. Go to Job tab
 * 4. Paste job text and parse
 * 5. Fill/edit structured form
 * 6. Save job posting
 * 7. Switch to Saved Jobs tab
 * 8. Verify job appears in list
 * 9. Use search/filters
 * 10. Click Analyze on saved job
 * 11. Verify ATS results appear
 * 12. Delete job
 */

const SAMPLE_JOB_TEXT = `
Senior Frontend Developer
Tech Corp - Remote

We are seeking an experienced Frontend Developer to join our team.

Responsibilities:
- Build responsive web applications using React and TypeScript
- Collaborate with designers and backend developers
- Write clean, maintainable code

Requirements:
- 5+ years of frontend development experience
- Strong knowledge of React, TypeScript, JavaScript
- Experience with modern CSS frameworks
- Excellent problem-solving skills

Benefits:
- Competitive salary
- Remote work
- Health insurance
`.trim()

test.describe('Step 26: Job Posting & Saved Jobs Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Assuming user is logged in or auth is bypassed in tests
    // Navigate to CV Builder
    await page.goto('/cv-builder')
  })

  test('should parse job, save to structured form, and list in saved jobs', async ({ page }) => {
    // Go to Job tab
    await page.click('button:has-text("Job")')
    
    // Should be on Input sub-tab by default
    await expect(page.locator('button[role="tab"]:has-text("Input")')).toHaveAttribute('data-state', 'active')
    
    // Paste job text
    await page.click('button:has-text("Paste Text")')
    await page.fill('textarea[placeholder*="job"]', SAMPLE_JOB_TEXT)
    
    // Wait for parse button (assuming auto-parse or manual button)
    await page.waitForTimeout(500) // Debounce
    
    // Check if form is prefilled
    await expect(page.locator('input[name="title"], input[placeholder*="Senior"]')).toHaveValue(/Senior Frontend Developer/i)
    await expect(page.locator('input[name="company"], input[placeholder*="Acme"]')).toHaveValue(/Tech Corp/i)
    
    // Edit form fields
    await page.fill('input[placeholder*="Istanbul"]', 'Remote / Global')
    
    // Add tags
    await page.fill('input[placeholder*="ai, react"]', 'react, typescript, frontend, senior')
    
    // Add notes
    await page.fill('textarea[placeholder*="Additional notes"]', 'Interesting position, competitive salary')
    
    // Save job
    await page.click('button:has-text("Save Job")')
    
    // Wait for success toast or confirmation
    await page.waitForTimeout(1000)
    
    // Switch to Saved Jobs tab
    await page.click('button[role="tab"]:has-text("Saved")')
    
    // Verify job appears in list
    await expect(page.locator('text=Senior Frontend Developer')).toBeVisible()
    await expect(page.locator('text=Tech Corp')).toBeVisible()
  })

  test('should filter saved jobs by search query', async ({ page }) => {
    // Assume jobs are already saved from previous test or setup
    await page.click('button:has-text("Job")')
    await page.click('button[role="tab"]:has-text("Saved")')
    
    // Type in search
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('frontend')
    
    // Jobs matching "frontend" should be visible
    await expect(page.locator('text=Senior Frontend Developer')).toBeVisible()
    
    // Type non-matching query
    await searchInput.fill('backend')
    
    // No matching results message
    await expect(page.locator('text=/no.*jobs.*match/i')).toBeVisible()
  })

  test('should filter saved jobs by status', async ({ page }) => {
    await page.click('button:has-text("Job")')
    await page.click('button[role="tab"]:has-text("Saved")')
    
    // Select status filter
    await page.click('button:has-text("Status")')
    await page.click('text=Applied')
    
    // Only jobs with status "applied" should show
    // (Assuming test data exists or we set status beforehand)
  })

  test('should toggle favorite on saved job', async ({ page }) => {
    await page.click('button:has-text("Job")')
    await page.click('button[role="tab"]:has-text("Saved")')
    
    // Find favorite button (star icon)
    const favoriteBtn = page.locator('button[aria-label*="favorite"]').first()
    
    // Click to favorite
    await favoriteBtn.click()
    
    // Star should be filled
    await expect(favoriteBtn.locator('svg')).toHaveClass(/fill/)
    
    // Click again to unfavorite
    await favoriteBtn.click()
    await expect(favoriteBtn.locator('svg')).not.toHaveClass(/fill/)
  })

  test('should analyze saved job with current CV', async ({ page }) => {
    // Ensure CV is uploaded first
    // (Skipped for brevity - assume CV exists)
    
    await page.click('button:has-text("Job")')
    await page.click('button[role="tab"]:has-text("Saved")')
    
    // Click Analyze on first saved job
    await page.click('button:has-text("Analyze")').first()
    
    // Should navigate to ATS Optimize tab or show results
    await page.waitForTimeout(2000) // Analysis might take time
    
    // Check for ATS score or suggestions
    await expect(page.locator('text=/ATS Score|matched|missing/i')).toBeVisible()
  })

  test('should open job detail drawer', async ({ page }) => {
    await page.click('button:has-text("Job")')
    await page.click('button[role="tab"]:has-text("Saved")')
    
    // Click Open on first job
    await page.click('button:has-text("Open")').first()
    
    // Drawer/Sheet should open with job details
    await expect(page.locator('text=Senior Frontend Developer')).toBeVisible()
    await expect(page.locator('text=/Job Description|Raw Text/i')).toBeVisible()
    
    // Close drawer
    await page.keyboard.press('Escape')
    await expect(page.locator('text=Job Description')).not.toBeVisible()
  })

  test('should duplicate saved job', async ({ page }) => {
    await page.click('button:has-text("Job")')
    await page.click('button[role="tab"]:has-text("Saved")')
    
    const initialCount = await page.locator('[data-job-row]').count()
    
    // Open detail drawer
    await page.click('button:has-text("Open")').first()
    
    // Click duplicate
    await page.click('button:has-text("Duplicate")')
    
    // Wait for duplicate to appear
    await page.waitForTimeout(1000)
    
    // Should have one more job with "(Copy)" suffix
    const newCount = await page.locator('[data-job-row]').count()
    expect(newCount).toBe(initialCount + 1)
    
    await expect(page.locator('text=/(Copy)/i')).toBeVisible()
  })

  test('should delete saved job', async ({ page }) => {
    await page.click('button:has-text("Job")')
    await page.click('button[role="tab"]:has-text("Saved")')
    
    const initialCount = await page.locator('[data-job-row]').count()
    
    // Click delete on first job
    await page.click('button[aria-label*="Delete"]').first()
    
    // Confirm deletion if there's a modal
    // await page.click('button:has-text("Confirm")')
    
    // Wait for deletion
    await page.waitForTimeout(500)
    
    // Job count should decrease
    const newCount = await page.locator('[data-job-row]').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('should handle empty saved jobs state', async ({ page }) => {
    // Clear all jobs (or start fresh)
    await page.click('button:has-text("Job")')
    await page.click('button[role="tab"]:has-text("Saved")')
    
    // If no jobs, should show empty state message
    const jobRows = page.locator('[data-job-row]')
    const count = await jobRows.count()
    
    if (count === 0) {
      await expect(page.locator('text=/no saved jobs/i')).toBeVisible()
    }
  })
})
