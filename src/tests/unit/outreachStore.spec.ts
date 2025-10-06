import { describe, it, expect, beforeEach } from 'vitest'
import { useOutreachStore } from '@/store/outreachStore'

describe('outreachStore', () => {
  beforeEach(() => {
    useOutreachStore.setState({ sequences: [] })
  })

  it('should upsert sequence', () => {
    const id = useOutreachStore.getState().upsert({
      name: 'Follow-Up',
      steps: [],
      active: true
    })

    expect(id).toBeDefined()
    const sequences = useOutreachStore.getState().sequences
    expect(sequences).toHaveLength(1)
    expect(sequences[0].name).toBe('Follow-Up')
  })

  it('should update existing sequence', () => {
    const id = useOutreachStore.getState().upsert({
      name: 'Sequence 1',
      steps: [],
      active: true
    })

    useOutreachStore.getState().upsert({
      id,
      name: 'Updated Sequence',
      steps: [{ id: 's1', offsetDays: 3, templateId: 't1', sendTime: '09:00' }],
      active: false
    })

    const sequences = useOutreachStore.getState().sequences
    expect(sequences).toHaveLength(1)
    expect(sequences[0].name).toBe('Updated Sequence')
    expect(sequences[0].steps).toHaveLength(1)
  })

  it('should remove sequence', () => {
    const id = useOutreachStore.getState().upsert({
      name: 'Test',
      steps: [],
      active: true
    })

    useOutreachStore.getState().remove(id)
    expect(useOutreachStore.getState().sequences).toHaveLength(0)
  })

  it('should get sequence by id', () => {
    const id = useOutreachStore.getState().upsert({
      name: 'Find Me',
      steps: [],
      active: true
    })

    const seq = useOutreachStore.getState().getById(id)
    expect(seq).toBeDefined()
    expect(seq?.name).toBe('Find Me')
  })
})
