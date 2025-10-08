/**
 * Cost metering service
 * Calculates USD cost from token usage and model pricing
 */
import type { AIModelRef, AIRequest, AIResponse } from '@/types/ai.types';

export const costMeter = {
  measure(model: AIModelRef, _req: AIRequest, resp: AIResponse) {
    const inTok = resp.usage?.inputTokens ?? 0;
    const outTok = resp.usage?.outputTokens ?? 0;
    const inputRate = model.cost?.input ?? 0;
    const outputRate = model.cost?.output ?? 0;
    const costUSD = (inTok/1000)*inputRate + (outTok/1000)*outputRate;
    return { 
      inputTokens: inTok, 
      outputTokens: outTok, 
      totalTokens: inTok + outTok, 
      costUSD: Number(costUSD.toFixed(6)) 
    };
  }
};
