/**
 * Page parsing utilities for job details extraction
 */

export type ParsedJob = {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  salary?: string;
  remote?: boolean;
  url: string;
  platform?: string;
};

export class PageParser {
  /**
   * Extract job metadata from current page
   */
  static parse(platform?: string): ParsedJob {
    const url = window.location.href;
    const parser = this.getParserForPlatform(platform);

    return {
      url,
      platform,
      ...parser(),
    };
  }

  /**
   * Get platform-specific parser
   */
  private static getParserForPlatform(platform?: string): () => Partial<ParsedJob> {
    switch (platform) {
      case 'greenhouse':
        return this.parseGreenhouse;
      case 'lever':
        return this.parseLever;
      case 'workday':
        return this.parseWorkday;
      case 'indeed':
        return this.parseIndeed;
      case 'linkedin':
        return this.parseLinkedIn;
      default:
        return this.parseGeneric;
    }
  }

  /**
   * Parse Greenhouse job page
   */
  private static parseGreenhouse(): Partial<ParsedJob> {
    const title = document.querySelector('.app-title')?.textContent?.trim();
    const company = document.querySelector('.company-name')?.textContent?.trim();
    const location = document.querySelector('.location')?.textContent?.trim();
    const description = document.querySelector('#content')?.textContent?.trim();

    return {
      title,
      company,
      location,
      description: description ? this.truncateDescription(description) : undefined,
      remote: this.detectRemote(description || ''),
      salary: this.extractSalary(description || ''),
    };
  }

  /**
   * Parse Lever job page
   */
  private static parseLever(): Partial<ParsedJob> {
    const title = document.querySelector('.posting-headline h2')?.textContent?.trim();
    const company = document.querySelector('.main-header-logo img')?.getAttribute('alt');
    const location = document.querySelector('.posting-categories .location')?.textContent?.trim();
    const description = document.querySelector('.content .section-wrapper')?.textContent?.trim();

    return {
      title,
      company,
      location,
      description: description ? this.truncateDescription(description) : undefined,
      remote: this.detectRemote(description || location || ''),
      salary: this.extractSalary(description || ''),
    };
  }

  /**
   * Parse Workday job page
   */
  private static parseWorkday(): Partial<ParsedJob> {
    const title = document.querySelector('h2[data-automation-id="jobPostingHeader"]')?.textContent?.trim();
    const location = document.querySelector('[data-automation-id="jobPostingLocation"]')?.textContent?.trim();
    const description = document.querySelector('[data-automation-id="jobPostingDescription"]')?.textContent?.trim();

    return {
      title,
      location,
      description: description ? this.truncateDescription(description) : undefined,
      remote: this.detectRemote(description || location || ''),
      salary: this.extractSalary(description || ''),
    };
  }

  /**
   * Parse Indeed job page
   */
  private static parseIndeed(): Partial<ParsedJob> {
    const title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim();
    const company = document.querySelector('[data-company-name="true"]')?.textContent?.trim();
    const location = document.querySelector('[data-testid="job-location"]')?.textContent?.trim();
    const description = document.querySelector('#jobDescriptionText')?.textContent?.trim();

    return {
      title,
      company,
      location,
      description: description ? this.truncateDescription(description) : undefined,
      remote: this.detectRemote(description || location || ''),
      salary: this.extractSalary(description || ''),
    };
  }

  /**
   * Parse LinkedIn job page
   */
  private static parseLinkedIn(): Partial<ParsedJob> {
    const title = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim();
    const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim();
    const location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim();
    const description = document.querySelector('.jobs-description__content')?.textContent?.trim();

    return {
      title,
      company,
      location,
      description: description ? this.truncateDescription(description) : undefined,
      remote: this.detectRemote(description || location || ''),
      salary: this.extractSalary(description || ''),
    };
  }

  /**
   * Generic parsing using heuristics
   */
  private static parseGeneric(): Partial<ParsedJob> {
    // Try common selectors
    const title =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('[class*="title" i]')?.textContent?.trim();

    const company = document.querySelector('[class*="company" i]')?.textContent?.trim();
    const location = document.querySelector('[class*="location" i]')?.textContent?.trim();

    const description =
      document.querySelector('[class*="description" i]')?.textContent?.trim() ||
      document.querySelector('main')?.textContent?.trim() ||
      document.body.textContent?.trim();

    return {
      title,
      company,
      location,
      description: description ? this.truncateDescription(description) : undefined,
      remote: this.detectRemote(description || ''),
      salary: this.extractSalary(description || ''),
    };
  }

  /**
   * Detect if job is remote/hybrid
   */
  private static detectRemote(text: string): boolean {
    const remoteKeywords = [
      'remote',
      'work from home',
      'wfh',
      'hybrid',
      'distributed',
      'anywhere',
      'uzaktan',
      'hibrit',
    ];

    const lowerText = text.toLowerCase();
    return remoteKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Extract salary information
   */
  private static extractSalary(text: string): string | undefined {
    // Match common salary patterns
    const patterns = [
      /\$[\d,]+\s*-\s*\$[\d,]+/gi, // $50,000 - $70,000
      /[\d,]+\s*-\s*[\d,]+\s*(?:USD|EUR|TRY|TL)/gi, // 50000 - 70000 USD
      /€[\d,]+\s*-\s*€[\d,]+/gi, // €50,000 - €70,000
      /₺[\d,]+\s*-\s*₺[\d,]+/gi, // ₺50,000 - ₺70,000
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  /**
   * Truncate description to reasonable length
   */
  private static truncateDescription(text: string, maxLength = 2000): string {
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) {
      return trimmed;
    }

    return trimmed.substring(0, maxLength) + '...';
  }
}
