import { describe, it, expect, beforeEach } from 'vitest'
import { fillText, fillSelect, fillRadio, normalizeText } from '../../content/shared/autofill'

describe('autofill', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should fill text input', () => {
    const input = document.createElement('input')
    input.type = 'text'
    input.name = 'firstName'
    document.body.appendChild(input)

    const result = fillText(input, 'John')
    expect(result.ok).toBe(true)
    expect(result.filled).toBe(true)
    expect(input.value).toBe('John')
  })

  it('should not overwrite existing value without force', () => {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = 'Existing'
    document.body.appendChild(input)

    const result = fillText(input, 'New', false)
    expect(result.filled).toBe(false)
    expect(input.value).toBe('Existing')
  })

  it('should fill select by option text', () => {
    const select = document.createElement('select')
    select.name = 'country'
    const opt1 = document.createElement('option')
    opt1.value = 'us'
    opt1.text = 'United States'
    const opt2 = document.createElement('option')
    opt2.value = 'uk'
    opt2.text = 'United Kingdom'
    select.appendChild(opt1)
    select.appendChild(opt2)
    document.body.appendChild(select)

    const result = fillSelect(select, 'United Kingdom')
    expect(result.ok).toBe(true)
    expect(result.filled).toBe(true)
    expect(select.value).toBe('uk')
  })

  it('should fill radio by label text', () => {
    const radio1 = document.createElement('input')
    radio1.type = 'radio'
    radio1.name = 'gender'
    radio1.value = 'male'
    const label1 = document.createElement('label')
    label1.textContent = 'Male'
    label1.appendChild(radio1)

    const radio2 = document.createElement('input')
    radio2.type = 'radio'
    radio2.name = 'gender'
    radio2.value = 'female'
    const label2 = document.createElement('label')
    label2.textContent = 'Female'
    label2.appendChild(radio2)

    document.body.appendChild(label1)
    document.body.appendChild(label2)

    const result = fillRadio('gender', 'Female')
    expect(result.ok).toBe(true)
    expect(result.filled).toBe(true)
    expect(radio2.checked).toBe(true)
  })

  it('should normalize text', () => {
    expect(normalizeText('  Hello  World  ')).toBe('hello world')
    expect(normalizeText('E-mail')).toBe('email')
  })
})
