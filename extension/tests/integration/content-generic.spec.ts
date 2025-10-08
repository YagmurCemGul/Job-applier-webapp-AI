/**
 * Integration tests for Generic content script
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { DOMHelper } from '../../content/shared/dom';

describe('Generic Content Script Integration', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <form id="job-application">
            <label>Full Name
              <input type="text" placeholder="Enter your name" />
            </label>
            
            <label>Email Address
              <input type="email" placeholder="your@email.com" />
            </label>
            
            <label for="phone-input">Phone Number</label>
            <input type="tel" id="phone-input" />
            
            <div>
              <label>Experience Level</label>
              <label>
                <input type="radio" name="experience" value="junior" />
                Junior (0-2 years)
              </label>
              <label>
                <input type="radio" name="experience" value="mid" />
                Mid (3-5 years)
              </label>
              <label>
                <input type="radio" name="experience" value="senior" />
                Senior (5+ years)
              </label>
            </div>
            
            <button type="submit">Apply Now</button>
          </form>
        </body>
      </html>
    `;

    dom = new JSDOM(html);
    document = dom.window.document;
    global.document = document;
    global.window = dom.window as unknown as Window;
  });

  it('should find input by label text', () => {
    const nameInput = DOMHelper.findByLabel('Full Name');
    expect(nameInput).toBeTruthy();
    expect((nameInput as HTMLInputElement).type).toBe('text');
  });

  it('should find input by placeholder', () => {
    const emailInput = document.querySelector('[placeholder="your@email.com"]') as HTMLInputElement;
    expect(emailInput).toBeTruthy();
    expect(emailInput.type).toBe('email');
  });

  it('should find input by label[for] association', () => {
    const phoneInput = DOMHelper.findByLabel('Phone Number');
    expect(phoneInput).toBeTruthy();
    expect((phoneInput as HTMLInputElement).id).toBe('phone-input');
  });

  it('should find radio buttons by label text', () => {
    const radios = document.querySelectorAll('input[type="radio"][name="experience"]');
    expect(radios.length).toBe(3);

    const seniorRadio = Array.from(radios).find((radio) => {
      const label = radio.closest('label');
      return label?.textContent?.includes('Senior');
    });

    expect(seniorRadio).toBeTruthy();
    expect((seniorRadio as HTMLInputElement).value).toBe('senior');
  });

  it('should find submit button by text', () => {
    const submitBtn = DOMHelper.findSubmitButton();
    expect(submitBtn).toBeTruthy();
    expect(submitBtn?.textContent).toBe('Apply Now');
  });

  it('should normalize text for comparison', () => {
    const text1 = '  Full   Name  ';
    const text2 = 'full name';

    const normalized1 = DOMHelper.normalizeText(text1);
    const normalized2 = DOMHelper.normalizeText(text2);

    expect(normalized1).toBe(normalized2);
    expect(normalized1).toBe('full name');
  });
});
