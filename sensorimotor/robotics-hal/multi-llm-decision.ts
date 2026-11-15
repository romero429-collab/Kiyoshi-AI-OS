/**
 * Multi-LLM decision sketch inspired by OM1.
 * Fast Action for low latency, Core for planning.
 */

export interface Decision {
  action: string;
  confidence: number;
  source: 'fast' | 'core' | 'coach';
}

export class MultiLLMDecision {
  async decide(context: string): Promise<Decision> {
    // Placeholder: in production route to local small model vs cloud.
    const fast = await this.fastAction(context);
    if (fast.confidence > 0.7) return fast;
    return this.core(context);
  }

  private async fastAction(ctx: string): Promise<Decision> {
    // ~300 ms local path
    return { action: 'hold', confidence: 0.5, source: 'fast' };
  }

  private async core(ctx: string): Promise<Decision> {
    return { action: 'navigate_to_goal', confidence: 0.8, source: 'core' };
  }
}
