/**
 * Unit tests for autofill functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutoFiller } from '../../content/shared/autofill';
import { DOMHelper } from '../../content/shared/dom';

describe('AutoFiller', () => {
  let autofiller: AutoFiller;

  beforeEach(() => {
    autofiller = new AutoFiller();
    document.body.innerHTML = '';
  });

  describe('fillText', () => {
    it('should fill text input with value', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'email';
      document.body.appendChild(input);

      const result = autofiller.fillText(input, 'test@example.com');

      expect(result).toBe(true);
      expect(input.value).toBe('test@example.com');
    });

    it('should not overwrite existing value unless forced', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'existing@example.com';
      document.body.appendChild(input);

      const result = autofiller.fillText(input, 'new@example.com', false);

      expect(result).toBe(false);
      expect(input.value).toBe('existing@example.com');
    });

    it('should overwrite when forced', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'existing@example.com';
      document.body.appendChild(input);

      const result = autofiller.fillText(input, 'new@example.com', true);

      expect(result).toBe(true);
      expect(input.value).toBe('new@example.com');
    });
  });

  describe('fillSelect', () => {
    it('should select option by text match', () => {
      const select = document.createElement('select');
      select.name = 'country';

      const option1 = document.createElement('option');
      option1.value = 'us';
      option1.textContent = 'United States';

      const option2 = document.createElement('option');
      option2.value = 'uk';
      option2.textContent = 'United Kingdom';

      select.appendChild(option1);
      select.appendChild(option2);
      document.body.appendChild(select);

      const result = autofiller.fillSelect(select, 'United Kingdom');

      expect(result).toBe(true);
      expect(select.value).toBe('uk');
    });

    it('should select option by partial text match', () => {
      const select = document.createElement('select');

      const option1 = document.createElement('option');
      option1.value = 'remote';
      option1.textContent = 'Remote - Work from anywhere';

      select.appendChild(option1);
      document.body.appendChild(select);

      const result = autofiller.fillSelect(select, 'remote');

      expect(result).toBe(true);
      expect(select.value).toBe('remote');
    });
  });

  describe('fillRadio', () => {
    it('should select radio by label text', () => {
      const label1 = document.createElement('label');
      const radio1 = document.createElement('input');
      radio1.type = 'radio';
      radio1.name = 'experience';
      radio1.value = 'junior';
      label1.appendChild(radio1);
      label1.appendChild(document.createTextNode('Junior (0-2 years)'));

      const label2 = document.createElement('label');
      const radio2 = document.createElement('input');
      radio2.type = 'radio';
      radio2.name = 'experience';
      radio2.value = 'senior';
      label2.appendChild(radio2);
      label2.appendChild(document.createTextNode('Senior (5+ years)'));

      document.body.appendChild(label1);
      document.body.appendChild(label2);

      const result = autofiller.fillRadio('experience', 'senior');

      expect(result).toBe(true);
      expect(radio2.checked).toBe(true);
      expect(radio1.checked).toBe(false);
    });
  });

  describe('fillCheckbox', () => {
    it('should check checkbox', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'terms';
      document.body.appendChild(checkbox);

      const result = autofiller.fillCheckbox(checkbox, true);

      expect(result).toBe(true);
      expect(checkbox.checked).toBe(true);
    });

    it('should uncheck checkbox', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      document.body.appendChild(checkbox);

      const result = autofiller.fillCheckbox(checkbox, false);

      expect(result).toBe(true);
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('fillField', () => {
    it('should fill field by label', async () => {
      const label = document.createElement('label');
      label.setAttribute('for', 'email-input');
      label.textContent = 'Email Address';

      const input = document.createElement('input');
      input.id = 'email-input';
      input.type = 'text';

      document.body.appendChild(label);
      document.body.appendChild(input);

      const result = await autofiller.fillField({
        label: 'Email Address',
        value: 'test@example.com',
      });

      expect(result).toBe(true);
      expect(input.value).toBe('test@example.com');
    });

    it('should fill field by name', async () => {
      const input = document.createElement('input');
      input.name = 'phone';
      input.type = 'tel';
      document.body.appendChild(input);

      const result = await autofiller.fillField({
        name: 'phone',
        value: '+1234567890',
      });

      expect(result).toBe(true);
      expect(input.value).toBe('+1234567890');
    });
  });
});
