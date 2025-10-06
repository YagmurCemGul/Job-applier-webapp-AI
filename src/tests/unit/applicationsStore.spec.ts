import { describe, it, expect, beforeEach } from 'vitest'
import { useApplicationsStore } from '@/store/applicationsStore'
import type { AppEvent, AppStage } from '@/types/applications.types'

describe('applicationsStore', () => {
  beforeEach(() => {
    useApplicationsStore.setState({ items: [], activeId: undefined })
  })

  it('should create application', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://example.com/job',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    })

    expect(id).toBeDefined()
    const items = useApplicationsStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].company).toBe('Acme')
  })

  it('should set stage', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://example.com/job',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    })

    useApplicationsStore.getState().setStage(id, 'interview')
    const app = useApplicationsStore.getState().items[0]
    expect(app.stage).toBe('interview')
  })

  it('should update application', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://example.com/job',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    })

    useApplicationsStore.getState().update(id, { notes: 'Test note' })
    const app = useApplicationsStore.getState().items[0]
    expect(app.notes).toBe('Test note')
  })

  it('should add event', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://example.com/job',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    })

    const event: AppEvent = {
      id: 'ev1',
      type: 'interview',
      title: 'First Interview',
      when: new Date().toISOString()
    }

    useApplicationsStore.getState().addEvent(id, event)
    const app = useApplicationsStore.getState().items[0]
    expect(app.events).toHaveLength(1)
    expect(app.events[0].title).toBe('First Interview')
  })

  it('should add log', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://example.com/job',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    })

    useApplicationsStore.getState().addLog(id, {
      id: 'log1',
      at: new Date().toISOString(),
      level: 'info',
      message: 'Test log'
    })

    const app = useApplicationsStore.getState().items[0]
    expect(app.logs).toHaveLength(1)
    expect(app.logs[0].message).toBe('Test log')
  })

  it('should attach files', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://example.com/job',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    })

    useApplicationsStore
      .getState()
      .attachFiles(id, [{ id: 'f1', name: 'cv.pdf', type: 'cv' }])

    const app = useApplicationsStore.getState().items[0]
    expect(app.files).toHaveLength(1)
    expect(app.files[0].name).toBe('cv.pdf')
  })

  it('should select application', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://example.com/job',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    })

    useApplicationsStore.getState().select(id)
    expect(useApplicationsStore.getState().activeId).toBe(id)
  })
})
