/**
 * Integration tests for Greenhouse content script
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Greenhouse Content Script Integration', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window;

  beforeEach(() => {
    // Create a fixture Greenhouse page
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Software Engineer - TechCorp</title></head>
        <body>
          <div class="app-title">Software Engineer</div>
          <div class="company-name">TechCorp Inc.</div>
          <div class="location">San Francisco, CA</div>
          
          <form id="application-form">
            <label for="first_name">First Name</label>
            <input type="text" id="first_name" name="first_name" />
            
            <label for="last_name">Last Name</label>
            <input type="text" id="last_name" name="last_name" />
            
            <label for="email">Email</label>
            <input type="email" id="email" name="email" />
            
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" />
            
            <label>LinkedIn Profile</label>
            <input type="url" name="linkedin" />
            
            <label>Resume</label>
            <input type="file" name="resume" />
            
            <button type="submit">Submit Application</button>
          </form>
        </body>
      </html>
    `;

    dom = new JSDOM(html, { url: 'https://boards.greenhouse.io/techcorp/jobs/123' });
    document = dom.window.document;
    window = dom.window as unknown as Window;

    // Setup global document
    global.document = document;
    global.window = window;
  });

  it('should parse Greenhouse job page correctly', () => {
    const title = document.querySelector('.app-title')?.textContent;
    const company = document.querySelector('.company-name')?.textContent;
    const location = document.querySelector('.location')?.textContent;

    expect(title).toBe('Software Engineer');
    expect(company).toBe('TechCorp Inc.');
    expect(location).toBe('San Francisco, CA');
  });

  it('should find form fields by id', () => {
    const firstName = document.querySelector('#first_name') as HTMLInputElement;
    const lastName = document.querySelector('#last_name') as HTMLInputElement;
    const email = document.querySelector('#email') as HTMLInputElement;

    expect(firstName).toBeTruthy();
    expect(lastName).toBeTruthy();
    expect(email).toBeTruthy();
  });

  it('should find file input for resume', () => {
    const resumeInput = document.querySelector('input[type="file"][name="resume"]') as HTMLInputElement;

    expect(resumeInput).toBeTruthy();
    expect(resumeInput.type).toBe('file');
  });

  it('should find submit button', () => {
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(submitBtn).toBeTruthy();
    expect(submitBtn.textContent).toBe('Submit Application');
  });

  it('should fill form fields', () => {
    const firstName = document.querySelector('#first_name') as HTMLInputElement;
    const lastName = document.querySelector('#last_name') as HTMLInputElement;
    const email = document.querySelector('#email') as HTMLInputElement;

    firstName.value = 'John';
    lastName.value = 'Doe';
    email.value = 'john.doe@example.com';

    expect(firstName.value).toBe('John');
    expect(lastName.value).toBe('Doe');
    expect(email.value).toBe('john.doe@example.com');
  });

  it('should dispatch input events', () => {
    const email = document.querySelector('#email') as HTMLInputElement;
    let inputFired = false;
    let changeFired = false;

    email.addEventListener('input', () => {
      inputFired = true;
    });

    email.addEventListener('change', () => {
      changeFired = true;
    });

    email.value = 'test@example.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    email.dispatchEvent(new Event('change', { bubbles: true }));

    expect(inputFired).toBe(true);
    expect(changeFired).toBe(true);
  });
});
