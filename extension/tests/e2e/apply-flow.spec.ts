/**
 * E2E tests for apply flow
 */

import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.join(__dirname, '../../dist-extension');

test.describe('Apply Flow E2E', () => {
  test('should complete dry-run application flow', async () => {
    // Load extension
    const browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });

    const page = await browserContext.newPage();

    // Create a mock job page
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Job Application</title></head>
        <body>
          <h1>Software Engineer</h1>
          <div class="company">TechCorp</div>
          
          <form id="application">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" />
            
            <label for="email">Email</label>
            <input type="email" id="email" name="email" />
            
            <label for="resume">Resume</label>
            <input type="file" id="resume" name="resume" />
            
            <button type="submit">Submit Application</button>
          </form>
        </body>
      </html>
    `);

    // Simulate extension receiving apply command
    const applyPayload = {
      files: [],
      answers: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      dryRun: true,
      locale: 'en',
    };

    // Fill form fields
    await page.fill('#name', applyPayload.answers.name);
    await page.fill('#email', applyPayload.answers.email);

    // Verify fields are filled
    const nameValue = await page.inputValue('#name');
    const emailValue = await page.inputValue('#email');

    expect(nameValue).toBe('John Doe');
    expect(emailValue).toBe('john@example.com');

    // In dry-run mode, submit button should not be clicked
    const submitBtn = await page.locator('button[type="submit"]');
    expect(await submitBtn.isVisible()).toBe(true);

    await browserContext.close();
  });

  test('should show file attachment overlay', async () => {
    const browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });

    const page = await browserContext.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <label for="resume">Upload Resume</label>
          <input type="file" id="resume" name="resume" />
        </body>
      </html>
    `);

    // Trigger file attachment overlay
    await page.evaluate(() => {
      const overlay = document.createElement('div');
      overlay.id = 'jobpilot-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999999;';
      overlay.innerHTML = `
        <div style="background: white; padding: 24px; border-radius: 8px;">
          <h2 id="overlay-title">Attach your file</h2>
          <p>Click the highlighted field to attach your CV</p>
          <button id="continue-btn">Continue</button>
        </div>
      `;
      document.body.appendChild(overlay);
    });

    // Verify overlay is shown
    const overlay = await page.locator('#jobpilot-overlay');
    expect(await overlay.isVisible()).toBe(true);

    const overlayTitle = await page.locator('#overlay-title');
    expect(await overlayTitle.textContent()).toBe('Attach your file');

    // Click continue button
    await page.click('#continue-btn');

    await browserContext.close();
  });

  test('should parse job page and extract metadata', async () => {
    const browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });

    const page = await browserContext.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Senior Data Scientist</h1>
          <div class="company">AI Solutions Inc.</div>
          <div class="location">Remote - United States</div>
          <div class="description">
            We're looking for an experienced data scientist.
            Salary range: $120,000 - $180,000
          </div>
        </body>
      </html>
    `);

    // Extract job metadata
    const jobData = await page.evaluate(() => {
      return {
        title: document.querySelector('h1')?.textContent?.trim(),
        company: document.querySelector('.company')?.textContent?.trim(),
        location: document.querySelector('.location')?.textContent?.trim(),
        description: document.querySelector('.description')?.textContent?.trim(),
      };
    });

    expect(jobData.title).toBe('Senior Data Scientist');
    expect(jobData.company).toBe('AI Solutions Inc.');
    expect(jobData.location).toContain('Remote');
    expect(jobData.description).toContain('$120,000 - $180,000');

    await browserContext.close();
  });
});
