/**
 * Unit tests for AI cost meter
 */
import { describe, it, expect } from 'vitest'
import { costMeter } from '@/services/ai/cost.service'
import type { AIModelRef, AIRequest, AIResponse } from '@/types/ai.types'

describe('AI Cost Meter Service', () => {
  it('should calculate cost correctly for chat models', () => {
    const model: AIModelRef = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      kind: 'chat',
      cost: { input: 0.005, output: 0.015 }
    }

    const req: AIRequest = {
      task: 'generate',
      prompt: 'test'
    }

    const resp: AIResponse = {
      ok: true,
      provider: 'openai',
      model: 'gpt-4o-mini',
      text: 'Hello',
      usage: { inputTokens: 1000, outputTokens: 500, totalTokens: 1500, costUSD: 0 }
    }

    const usage = costMeter.measure(model, req, resp)

    // (1000/1000) * 0.005 + (500/1000) * 0.015 = 0.005 + 0.0075 = 0.0125
    expect(usage.costUSD).toBeCloseTo(0.0125, 4)
    expect(usage.inputTokens).toBe(1000)
    expect(usage.outputTokens).toBe(500)
    expect(usage.totalTokens).toBe(1500)
  })

  it('should handle zero-cost models', () => {
    const model: AIModelRef = {
      provider: 'llama-local',
      model: 'llama3',
      kind: 'chat'
      // No cost defined
    }

    const req: AIRequest = { task: 'generate', prompt: 'test' }
    const resp: AIResponse = {
      ok: true,
      provider: 'llama-local',
      model: 'llama3',
      text: 'Hello',
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, costUSD: 0 }
    }

    const usage = costMeter.measure(model, req, resp)
    expect(usage.costUSD).toBe(0)
  })

  it('should calculate cost for large token counts', () => {
    const model: AIModelRef = {
      provider: 'openai',
      model: 'gpt-4o',
      kind: 'chat',
      cost: { input: 0.01, output: 0.03 }
    }

    const req: AIRequest = { task: 'generate', prompt: 'test' }
    const resp: AIResponse = {
      ok: true,
      provider: 'openai',
      model: 'gpt-4o',
      text: 'Response',
      usage: { inputTokens: 50000, outputTokens: 25000, totalTokens: 75000, costUSD: 0 }
    }

    const usage = costMeter.measure(model, req, resp)

    // (50000/1000) * 0.01 + (25000/1000) * 0.03 = 0.5 + 0.75 = 1.25
    expect(usage.costUSD).toBeCloseTo(1.25, 2)
  })
})
