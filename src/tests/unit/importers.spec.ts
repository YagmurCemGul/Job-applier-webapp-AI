/**
 * @fileoverview Unit tests for offer importers service
 * @module tests/unit/importers
 */

import { describe, it, expect } from 'vitest';
import { parseOfferFromText } from '@/services/offer/importers.service';

describe('importers.service', () => {
  describe('parseOfferFromText', () => {
    it('should parse company name', () => {
      const text = 'We are excited to offer you a position at TechCorp Inc.';
      const result = parseOfferFromText(text);

      expect(result.company).toBe('TechCorp Inc.');
    });

    it('should parse base salary', () => {
      const text = 'Your base salary will be $120,000 annually.';
      const result = parseOfferFromText(text);

      expect(result.baseAnnual).toBe(120000);
    });

    it('should parse bonus percentage', () => {
      const text = 'You are eligible for a 15% annual bonus.';
      const result = parseOfferFromText(text);

      expect(result.bonusTargetPct).toBe(15);
    });

    it('should parse currency', () => {
      const text = 'Salary: 100,000 EUR';
      const result = parseOfferFromText(text);

      expect(result.currency).toBe('EUR');
    });

    it('should parse signing bonus', () => {
      const text = 'You will receive a signing bonus of $25,000.';
      const result = parseOfferFromText(text);

      expect(result.benefits?.signingBonus).toBe(25000);
    });

    it('should parse equity target value', () => {
      const text = 'RSU grant valued at $150,000.';
      const result = parseOfferFromText(text);

      expect(result.equity).toBeDefined();
      expect(result.equity?.[0]?.targetValue).toBe(150000);
    });

    it('should parse PTO days', () => {
      const text = 'You will receive 25 days of PTO annually.';
      const result = parseOfferFromText(text);

      expect(result.benefits?.ptoDays).toBe(25);
    });

    it('should parse location', () => {
      const text = 'This role is based in San Francisco, CA.';
      const result = parseOfferFromText(text);

      expect(result.location).toContain('San Francisco');
    });

    it('should detect remote policy', () => {
      const text1 = 'This is a fully remote position.';
      const result1 = parseOfferFromText(text1);
      expect(result1.remote).toBe('remote');

      const text2 = 'This is a hybrid role.';
      const result2 = parseOfferFromText(text2);
      expect(result2.remote).toBe('hybrid');

      const text3 = 'This is an on-site position.';
      const result3 = parseOfferFromText(text3);
      expect(result3.remote).toBe('on_site');
    });

    it('should parse complex offer letter', () => {
      const text = `
        Dear Candidate,
        
        We are pleased to offer you the position of Senior Software Engineer at TechCorp Inc.
        
        Compensation:
        - Base salary: $150,000 USD
        - Annual bonus: 10%
        - Signing bonus: $20,000
        - RSU grant: $100,000 (4-year vesting)
        
        Benefits:
        - 20 days PTO
        - Full health coverage
        
        Location: San Francisco, CA (hybrid)
      `;

      const result = parseOfferFromText(text);

      expect(result.company).toContain('TechCorp');
      expect(result.baseAnnual).toBe(150000);
      expect(result.bonusTargetPct).toBe(10);
      expect(result.currency).toBe('USD');
      expect(result.benefits?.signingBonus).toBe(20000);
      expect(result.equity?.[0]?.targetValue).toBe(100000);
      expect(result.benefits?.ptoDays).toBe(20);
      expect(result.remote).toBe('hybrid');
    });

    it('should handle missing data gracefully', () => {
      const text = 'Just some random text without offer details.';
      const result = parseOfferFromText(text);

      // Should return partial object without errors
      expect(result).toBeDefined();
    });
  });
});
