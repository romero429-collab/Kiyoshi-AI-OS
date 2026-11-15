/**
 * Multi-LLM decision layer.
 * Fast Action path for latency-critical contraction; Core for planning.
 */

import { Decision, Mode } from './types';

export class MultiLLMDecision {
  async decide(context: string, currentMode: Mode): Promise<Decision> {
    const fast = this.fastAction(context, currentMode);
    if (fast.confidence >= 0.65) return fast;
    return this.core(context, currentMode);
  }

  private fastAction(ctx: string, mode: Mode): Decision {
    const lower = ctx.toLowerCase();
    if (lower.includes('stop') || lower.includes('halt') || lower.includes('emergency')) {
      return { action: 'emergency_stop', confidence: 0.95, source: 'fast', modeHint: mode };
    }
    if (lower.includes('battery') && lower.includes('low')) {
      return { action: 'return_to_charge', confidence: 0.8, source: 'fast' };
    }
    return { action: 'hold_position', confidence: 0.4, source: 'fast' };
  }

  private core(ctx: string, mode: Mode): Decision {
    if (mode === 'Navigation' || mode === 'SLAM') {
      return { action: 'follow_path', confidence: 0.75, source: 'core', modeHint: mode };
    }
    if (mode === 'Guard') {
      return { action: 'patrol_loop', confidence: 0.7, source: 'core' };
    }
    return { action: 'converse', confidence: 0.6, source: 'core', modeHint: 'Conversation' };
  }
}
