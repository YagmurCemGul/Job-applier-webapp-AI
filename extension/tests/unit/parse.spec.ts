/**
 * Unit tests for page parsing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PageParser } from '../../content/shared/parse';

describe('PageParser', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('parseGreenhouse', () => {
    it('should extract job details from Greenhouse page', () => {
      document.body.innerHTML = `
        <div class="app-title">Senior Software Engineer</div>
        <div class="company-name">TechCorp Inc.</div>
        <div class="location">San Francisco, CA</div>
        <div id="content">
          <p>We are looking for an experienced engineer...</p>
          <p>Salary: $120,000 - $180,000</p>
          <p>Remote work available</p>
        </div>
      `;

      const result = PageParser['parseGreenhouse']();

      expect(result.title).toBe('Senior Software Engineer');
      expect(result.company).toBe('TechCorp Inc.');
      expect(result.location).toBe('San Francisco, CA');
      expect(result.remote).toBe(true);
      expect(result.salary).toBeTruthy();
    });
  });

  describe('parseLever', () => {
    it('should extract job details from Lever page', () => {
      document.body.innerHTML = `
        <div class="posting-headline">
          <h2>Product Manager</h2>
        </div>
        <div class="posting-categories">
          <div class="location">New York, NY</div>
        </div>
        <div class="content">
          <div class="section-wrapper">
            Join our team as a Product Manager. Remote-friendly position.
          </div>
        </div>
      `;

      const result = PageParser['parseLever']();

      expect(result.title).toBe('Product Manager');
      expect(result.location).toBe('New York, NY');
      expect(result.remote).toBe(true);
    });
  });

  describe('parseWorkday', () => {
    it('should extract job details from Workday page', () => {
      document.body.innerHTML = `
        <h2 data-automation-id="jobPostingHeader">Data Scientist</h2>
        <div data-automation-id="jobPostingLocation">Seattle, WA</div>
        <div data-automation-id="jobPostingDescription">
          We need a data scientist with ML experience. Hybrid work model.
        </div>
      `;

      const result = PageParser['parseWorkday']();

      expect(result.title).toBe('Data Scientist');
      expect(result.location).toBe('Seattle, WA');
      expect(result.remote).toBe(true);
    });
  });

  describe('parseIndeed', () => {
    it('should extract job details from Indeed page', () => {
      document.body.innerHTML = `
        <div class="jobsearch-JobInfoHeader-title">Marketing Manager</div>
        <div data-company-name="true">Marketing Co</div>
        <div data-testid="job-location">Austin, TX</div>
        <div id="jobDescriptionText">
          Looking for a marketing professional. $80,000 - $100,000 per year.
        </div>
      `;

      const result = PageParser['parseIndeed']();

      expect(result.title).toBe('Marketing Manager');
      expect(result.company).toBe('Marketing Co');
      expect(result.location).toBe('Austin, TX');
      expect(result.salary).toContain('80,000');
    });
  });

  describe('parseLinkedIn', () => {
    it('should extract job details from LinkedIn page', () => {
      document.body.innerHTML = `
        <div class="job-details-jobs-unified-top-card__job-title">UX Designer</div>
        <div class="job-details-jobs-unified-top-card__company-name">Design Studio</div>
        <div class="job-details-jobs-unified-top-card__bullet">Remote</div>
        <div class="jobs-description__content">
          We're hiring a UX designer for our product team.
        </div>
      `;

      const result = PageParser['parseLinkedIn']();

      expect(result.title).toBe('UX Designer');
      expect(result.company).toBe('Design Studio');
      expect(result.remote).toBe(true);
    });
  });

  describe('detectRemote', () => {
    it('should detect remote keywords', () => {
      expect(PageParser['detectRemote']('This is a remote position')).toBe(true);
      expect(PageParser['detectRemote']('Work from home available')).toBe(true);
      expect(PageParser['detectRemote']('Hybrid work model')).toBe(true);
      expect(PageParser['detectRemote']('Uzaktan çalışma')).toBe(true);
      expect(PageParser['detectRemote']('Office only position')).toBe(false);
    });
  });

  describe('extractSalary', () => {
    it('should extract salary ranges', () => {
      expect(PageParser['extractSalary']('Salary: $50,000 - $70,000')).toBe('$50,000 - $70,000');
      expect(PageParser['extractSalary']('Pay: 60000 - 80000 USD')).toBeTruthy();
      expect(PageParser['extractSalary']('€40,000 - €60,000')).toBe('€40,000 - €60,000');
      expect(PageParser['extractSalary']('No salary information')).toBeUndefined();
    });
  });
});
