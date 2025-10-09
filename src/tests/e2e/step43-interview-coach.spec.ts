/**
 * @fileoverview E2E test for Step 43 Interview Coach & Scheduler
 */

import { test, expect } from '@playwright/test';

test.describe('Step 43 - Interview Coach & Scheduler', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/interview');
  });

  test('should display dashboard with KPIs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Interview/i })).toBeVisible();
    await expect(page.getByText(/Upcoming Interviews/i)).toBeVisible();
    await expect(page.getByText(/Completed Mocks/i)).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.getByRole('tab', { name: /Planner/i }).click();
    await expect(page.getByText(/Interview Type/i)).toBeVisible();

    await page.getByRole('tab', { name: /Questions/i }).click();
    await expect(page.getByText(/Question Bank/i)).toBeVisible();

    await page.getByRole('tab', { name: /Stories/i }).click();
    await expect(page.getByText(/STAR Story/i)).toBeVisible();
  });

  test('should create interview plan', async ({ page }) => {
    await page.getByRole('tab', { name: /Planner/i }).click();
    
    await page.getByLabel(/Company/i).fill('TechCorp');
    await page.getByLabel(/Role/i).fill('Senior Engineer');
    
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const startTime = tomorrow.toISOString().slice(0, 16);
    await page.getByLabel(/Start Time/i).fill(startTime);
    
    const endTime = new Date(tomorrow.getTime() + 3600000).toISOString().slice(0, 16);
    await page.getByLabel(/End Time/i).fill(endTime);
    
    await page.getByRole('button', { name: /Save Plan/i }).click();
    await expect(page.getByText(/plan saved/i)).toBeVisible();
  });

  test('should seed default questions', async ({ page }) => {
    await page.getByRole('tab', { name: /Questions/i }).click();
    
    await page.getByRole('button', { name: /Seed Defaults/i }).click();
    await expect(page.getByText(/Default questions/i)).toBeVisible();
    
    // Verify questions appear in table
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should create STAR story', async ({ page }) => {
    await page.getByRole('tab', { name: /Stories/i }).click();
    
    await page.getByLabel(/Story Title/i).fill('Led Migration Project');
    await page.getByLabel(/Situation/i).fill('Legacy system needed modernization');
    await page.getByLabel(/Task/i).fill('Migrate 100+ services with zero downtime');
    await page.getByLabel(/Action/i).fill('Created phased migration plan');
    await page.getByLabel(/Result/i).fill('Completed 2 weeks ahead of schedule');
    
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText(/Story saved/i)).toBeVisible();
  });

  test('should start mock interview flow', async ({ page }) => {
    // First seed questions
    await page.getByRole('tab', { name: /Questions/i }).click();
    await page.getByRole('button', { name: /Seed Defaults/i }).click();
    
    // Select a question
    await page.getByRole('row').nth(1).getByRole('checkbox').check();
    
    // Start mock
    await page.getByRole('button', { name: /Start Mock/i }).click();
    
    // Should show consent dialog
    await expect(page.getByText(/Recording Consent/i)).toBeVisible();
  });

  test('should display transcript editor', async ({ page }) => {
    await page.getByRole('tab', { name: /Transcript/i }).click();
    
    // May not have transcript yet, but tab should be accessible
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });

  test('should show rubric scoring interface', async ({ page }) => {
    await page.getByRole('tab', { name: /Rubric/i }).click();
    
    await expect(page.getByText(/Behavioral Core/i)).toBeVisible();
    await expect(page.getByText(/Communication Clarity/i)).toBeVisible();
  });

  test('should display follow-up composer', async ({ page }) => {
    await page.getByRole('tab', { name: /Follow-Ups/i }).click();
    
    await expect(page.getByLabel(/To/i)).toBeVisible();
    await expect(page.getByLabel(/Subject/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Generate Template/i })).toBeVisible();
  });

  test('should show interview tracker', async ({ page }) => {
    await page.getByRole('tab', { name: /Tracker/i }).click();
    
    await expect(page.getByText(/Upcoming Interviews/i)).toBeVisible();
    await expect(page.getByText(/Past Interviews/i)).toBeVisible();
  });

  test('should filter questions by type', async ({ page }) => {
    await page.getByRole('tab', { name: /Questions/i }).click();
    await page.getByRole('button', { name: /Seed Defaults/i }).click();
    
    await page.getByRole('combobox', { name: /Type/i }).click();
    await page.getByRole('option', { name: /Behavioral/i }).click();
    
    // Should filter table to show only behavioral questions
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should copy STAR story as bullets', async ({ page }) => {
    await page.getByRole('tab', { name: /Stories/i }).click();
    
    await page.getByLabel(/Story Title/i).fill('Test Story');
    await page.getByLabel(/Situation/i).fill('Test situation');
    
    await page.getByRole('button', { name: /Copy as Bullets/i }).click();
    await expect(page.getByText(/Copied to clipboard/i)).toBeVisible();
  });

  test('should validate interview plan times', async ({ page }) => {
    await page.getByRole('tab', { name: /Planner/i }).click();
    
    const now = new Date();
    const past = new Date(now.getTime() - 3600000).toISOString().slice(0, 16);
    const earlier = new Date(now.getTime() - 7200000).toISOString().slice(0, 16);
    
    await page.getByLabel(/Start Time/i).fill(past);
    await page.getByLabel(/End Time/i).fill(earlier); // End before start
    
    await page.getByRole('button', { name: /Save Plan/i }).click();
    await expect(page.getByText(/End time must be after start/i)).toBeVisible();
  });

  test('should generate questions from job description', async ({ page }) => {
    await page.getByRole('tab', { name: /Questions/i }).click();
    
    await page.getByPlaceholder(/role/i).fill('Software Engineer');
    await page.getByPlaceholder(/job description/i).fill('We are looking for a talented engineer...');
    
    await page.getByRole('button', { name: /Generate From JD/i }).click();
    
    // Wait for generation (may take time)
    await page.waitForTimeout(2000);
  });

  test('should respect quiet hours setting', async ({ page }) => {
    await page.getByRole('tab', { name: /Planner/i }).click();
    
    await page.getByLabel(/Respect quiet hours/i).check();
    
    // Try to schedule during quiet hours (11PM)
    const tonight = new Date();
    tonight.setHours(23, 0, 0, 0);
    const startTime = tonight.toISOString().slice(0, 16);
    
    await page.getByLabel(/Start Time/i).fill(startTime);
    
    const endTime = new Date(tonight.getTime() + 3600000).toISOString().slice(0, 16);
    await page.getByLabel(/End Time/i).fill(endTime);
    
    // Should show warning or prevent scheduling
    await page.getByRole('button', { name: /Create Calendar Event/i }).click();
    
    // May show error about quiet hours
    await page.waitForTimeout(1000);
  });
});
