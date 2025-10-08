/**
 * Form autofill utilities
 */

import { DOMHelper } from './dom';

export type FieldValue = string | boolean | string[];

export type FieldMapping = {
  label?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value: FieldValue;
  force?: boolean;
};

export class AutoFiller {
  private logs: string[] = [];

  /**
   * Fill a text input or textarea
   */
  fillText(element: HTMLInputElement | HTMLTextAreaElement, value: string, force = false): boolean {
    try {
      // Don't overwrite existing non-empty values unless forced
      if (!force && element.value && element.value.trim() !== '') {
        this.log(`Skipping ${element.name || element.id}: already has value`);
        return false;
      }

      // Set value
      element.value = value;

      // Dispatch events
      DOMHelper.dispatchEvents(element, value);

      this.log(`Filled ${element.name || element.id} with: ${value}`);
      return true;
    } catch (error) {
      this.log(`Error filling text field: ${error}`);
      return false;
    }
  }

  /**
   * Fill a select dropdown
   */
  fillSelect(element: HTMLSelectElement, value: string, force = false): boolean {
    try {
      if (!force && element.value && element.value !== '') {
        this.log(`Skipping select ${element.name || element.id}: already has value`);
        return false;
      }

      // Try exact match first
      const normalizedValue = DOMHelper.normalizeText(value);
      const options = Array.from(element.options);

      // Exact value match
      let matchedOption = options.find((opt) => opt.value === value);

      // Text match (case-insensitive)
      if (!matchedOption) {
        matchedOption = options.find(
          (opt) => DOMHelper.normalizeText(opt.textContent || '') === normalizedValue
        );
      }

      // Partial text match
      if (!matchedOption) {
        matchedOption = options.find((opt) =>
          DOMHelper.normalizeText(opt.textContent || '').includes(normalizedValue)
        );
      }

      if (matchedOption) {
        element.value = matchedOption.value;
        DOMHelper.dispatchEvents(element, matchedOption.value);
        this.log(`Selected option "${matchedOption.textContent}" in ${element.name || element.id}`);
        return true;
      }

      this.log(`No matching option found for "${value}" in select ${element.name || element.id}`);
      return false;
    } catch (error) {
      this.log(`Error filling select: ${error}`);
      return false;
    }
  }

  /**
   * Fill radio buttons
   */
  fillRadio(name: string, value: string, root: Document | Element = document): boolean {
    try {
      const radios = Array.from(root.querySelectorAll(`input[type="radio"][name="${name}"]`)) as HTMLInputElement[];

      if (radios.length === 0) {
        this.log(`No radio buttons found with name: ${name}`);
        return false;
      }

      const normalizedValue = DOMHelper.normalizeText(value);

      // Try value match
      let matchedRadio = radios.find((radio) => radio.value === value);

      // Try label text match
      if (!matchedRadio) {
        for (const radio of radios) {
          const label = this.getRadioLabel(radio);
          if (label && DOMHelper.normalizeText(label).includes(normalizedValue)) {
            matchedRadio = radio;
            break;
          }
        }
      }

      if (matchedRadio) {
        matchedRadio.checked = true;
        DOMHelper.dispatchEvents(matchedRadio, value);
        this.log(`Selected radio "${value}" for ${name}`);
        return true;
      }

      this.log(`No matching radio found for "${value}" in group ${name}`);
      return false;
    } catch (error) {
      this.log(`Error filling radio: ${error}`);
      return false;
    }
  }

  /**
   * Fill checkbox
   */
  fillCheckbox(element: HTMLInputElement, checked: boolean, force = false): boolean {
    try {
      if (!force && element.checked === checked) {
        this.log(`Checkbox ${element.name || element.id} already in desired state`);
        return false;
      }

      element.checked = checked;
      DOMHelper.dispatchEvents(element, checked);

      this.log(`Set checkbox ${element.name || element.id} to ${checked}`);
      return true;
    } catch (error) {
      this.log(`Error filling checkbox: ${error}`);
      return false;
    }
  }

  /**
   * Fill field by mapping
   */
  async fillField(mapping: FieldMapping, root: Document | Element = document): Promise<boolean> {
    const element = DOMHelper.findInput({
      id: mapping.id,
      name: mapping.name,
      label: mapping.label,
      placeholder: mapping.placeholder,
      root,
    });

    if (!element) {
      this.log(`Field not found: ${JSON.stringify(mapping)}`);
      return false;
    }

    // Scroll and highlight
    DOMHelper.scrollIntoView(element);

    const tagName = element.tagName.toLowerCase();
    const type = (element as HTMLInputElement).type?.toLowerCase();

    if (tagName === 'input') {
      const input = element as HTMLInputElement;
      if (type === 'radio') {
        return this.fillRadio(input.name, String(mapping.value), root);
      } else if (type === 'checkbox') {
        return this.fillCheckbox(input, Boolean(mapping.value), mapping.force);
      } else if (type === 'text' || type === 'email' || type === 'tel' || type === 'url') {
        return this.fillText(input, String(mapping.value), mapping.force);
      }
    } else if (tagName === 'textarea') {
      return this.fillText(element as HTMLTextAreaElement, String(mapping.value), mapping.force);
    } else if (tagName === 'select') {
      return this.fillSelect(element as HTMLSelectElement, String(mapping.value), mapping.force);
    }

    this.log(`Unsupported element type: ${tagName} ${type}`);
    return false;
  }

  /**
   * Fill multiple fields
   */
  async fillFields(mappings: FieldMapping[], root: Document | Element = document): Promise<number> {
    let filled = 0;

    for (const mapping of mappings) {
      const success = await this.fillField(mapping, root);
      if (success) filled++;

      // Small delay between fills for stability
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return filled;
  }

  /**
   * Get label text for radio button
   */
  private getRadioLabel(radio: HTMLInputElement): string | null {
    // Check for label[for]
    const id = radio.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent;
    }

    // Check parent label
    const parentLabel = radio.closest('label');
    if (parentLabel) return parentLabel.textContent;

    // Check next sibling
    const nextSibling = radio.nextSibling;
    if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
      return nextSibling.textContent;
    }

    return null;
  }

  /**
   * Get logs
   */
  getLogs(): string[] {
    return this.logs;
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Add log entry
   */
  private log(message: string): void {
    this.logs.push(message);
    console.log(`[AutoFiller] ${message}`);
  }
}
