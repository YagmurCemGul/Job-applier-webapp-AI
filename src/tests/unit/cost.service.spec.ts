import { describe, it, expect } from 'vitest'
import { costMeter } from '@/services/ai/cost.service'
import type { AIModelRef, AIRequest, AIResponse } from '@/types/ai.types'

describe('cost.service', () => {
  const mockModel: AIModelRef = {
    provider: 'openai',
    model: 'gpt-4o-mini',
    kind: 'chat',
    maxTokens: 8000,
    cost: {
      input: 0.005,
      output: 0.015,
    },
  }

  const mockRequest: AIRequest = {
    task: 'generate',
    prompt: 'Test',
  }

  it('should calculate cost from tokens', () => {
    const response: AIResponse = {
      ok: true,
      provider: 'openai',
      model: 'gpt-4o-mini',
      text: 'Test response',
      usage: {
        inputTokens: 1000,
        outputTokens: 500,
        totalTokens: 1500,
        costUSD: 0,
      },
    }

    const usage = costMeter.measure(mockModel, mockRequest, response)

    expect(usage.inputTokens).toBe(1000)
    expect(usage.outputTokens).toBe(500)
    expect(usage.totalTokens).toBe(1500)
    expect(usage.costUSD).toBeGreaterThan(0)
  })

  it('should handle zero tokens', () => {
    const response: AIResponse = {
      ok: true,
      provider: 'openai',
      model: 'gpt-4o-mini',
      text: '',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        costUSD: 0,
      },
    }

    const usage = costMeter.measure(mockModel, mockRequest, response)

    expect(usage.costUSD).toBe(0)
  })

  it('should calculate different costs for different models', () => {
    const expensiveModel: AIModelRef = {
      ...mockModel,
      cost: { input: 0.1, output: 0.3 },
    }

    const response: AIResponse = {
      ok: true,
      provider: 'openai',
      model: 'gpt-4',
      text: 'Test',
      usage: {
        inputTokens: 1000,
        outputTokens: 1000,
        totalTokens: 2000,
        costUSD: 0,
      },
    }

    const usage = costMeter.measure(expensiveModel, mockRequest, response)

    expect(usage.costUSD).toBeGreaterThan(0.3)
  })
})
