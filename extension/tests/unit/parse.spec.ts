import { describe, it, expect, beforeEach } from 'vitest'
import { parsePage } from '../../content/shared/parse'

describe('parse', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should extract title from h1', () => {
    const h1 = document.createElement('h1')
    h1.textContent = 'Software Engineer'
    document.body.appendChild(h1)

    const job = parsePage('test')
    expect(job.title).toBe('Software Engineer')
  })

  it('should detect remote from text', () => {
    document.body.innerHTML = '<p>This is a remote position</p>'

    const job = parsePage('test')
    expect(job.remote).toBe(true)
  })

  it('should extract company from class', () => {
    const div = document.createElement('div')
    div.className = 'company-name'
    div.textContent = 'Acme Corp'
    document.body.appendChild(div)

    const job = parsePage('test')
    expect(job.company).toBe('Acme Corp')
  })
})
