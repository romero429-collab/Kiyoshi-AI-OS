/**
 * Multi-LLM decision layer with real endpoint support.
 * Fast Action (local or low-latency endpoint), Core (planning endpoint),
 * Coach (periodic review).
 *
 * Configure via constructor or env:
 *   LLM_FAST_URL, LLM_FAST_KEY
 *   LLM_CORE_URL, LLM_CORE_KEY
 *   LLM_COACH_URL, LLM_COACH_KEY
 * Falls back to deterministic stubs when no endpoint is set.
 */

import { Decision, Mode } from './types';

export interface LLMConfig {
  url?: string;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

export class MultiLLMDecision {
  constructor(
    private fastCfg: LLMConfig = {},
    private coreCfg: LLMConfig = {},
    private coachCfg: LLMConfig = {},
  ) {
    this.fastCfg.url ??= process.env.LLM_FAST_URL;
    this.fastCfg.apiKey ??= process.env.LLM_FAST_KEY;
    this.coreCfg.url ??= process.env.LLM_CORE_URL;
    this.coreCfg.apiKey ??= process.env.LLM_CORE_KEY;
    this.coachCfg.url ??= process.env.LLM_COACH_URL;
    this.coachCfg.apiKey ??= process.env.LLM_COACH_KEY;
  }

  async decide(context: string, currentMode: Mode): Promise<Decision> {
    const fast = await this.callOrStub('fast', context, currentMode, this.fastCfg);
    if (fast.confidence >= 0.65) return fast;
    return this.callOrStub('core', context, currentMode, this.coreCfg);
  }

  async coachReview(context: string, lastDecision: Decision, mode: Mode): Promise<Decision | null> {
    if (!this.coachCfg.url) return null;
    try {
      const reviewed = await this.callEndpoint(this.coachCfg, this.buildCoachPrompt(context, lastDecision, mode));
      if (reviewed.confidence >= 0.5) return reviewed;
    } catch {
      // coach is advisory; ignore failures
    }
    return null;
  }

  private async callOrStub(
    source: 'fast' | 'core',
    context: string,
    mode: Mode,
    cfg: LLMConfig,
  ): Promise<Decision> {
    if (cfg.url) {
      try {
        return await this.callEndpoint(cfg, this.buildPrompt(context, mode, source));
      } catch {
        // fall through to stub on network / parse error
      }
    }
    return source === 'fast' ? this.fastStub(context, mode) : this.coreStub(context, mode);
  }

  private async callEndpoint(cfg: LLMConfig, prompt: string): Promise<Decision> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs ?? 800);
    try {
      const res = await fetch(cfg.url!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: cfg.model ?? 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 120,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`LLM ${res.status}`);
      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content ?? '';
      return this.parseDecision(text);
    } finally {
      clearTimeout(timer);
    }
  }

  private buildPrompt(context: string, mode: Mode, source: string): string {
    return `You are the ${source} decision layer of a robotics OS. Current mode: ${mode}.
Recent sensor context:
${context}

Respond ONLY with a single JSON object:
{"action":"emergency_stop|hold_position|follow_path|patrol_loop|return_to_charge|converse","confidence":0.0-1.0,"modeHint":"Welcome|Conversation|SLAM|Navigation|Guard|null"}`;
  }

  private buildCoachPrompt(context: string, last: Decision, mode: Mode): string {
    return `You are the Coach review layer. Mode: ${mode}.
Context:
${context}
Last decision: ${JSON.stringify(last)}
Respond ONLY with JSON: {"action":"...","confidence":0.0-1.0,"modeHint":"..."} or {"action":"keep","confidence":0.0}`;
  }

  private parseDecision(text: string): Decision {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('no json');
      const obj = JSON.parse(match[0]);
      return {
        action: String(obj.action || 'hold_position'),
        confidence: Math.max(0, Math.min(1, Number(obj.confidence) || 0.5)),
        source: 'core',
        modeHint: obj.modeHint || undefined,
      };
    } catch {
      return { action: 'hold_position', confidence: 0.3, source: 'core' };
    }
  }

  private fastStub(ctx: string, mode: Mode): Decision {
    const lower = ctx.toLowerCase();
    if (lower.includes('stop') || lower.includes('halt') || lower.includes('emergency')) {
      return { action: 'emergency_stop', confidence: 0.95, source: 'fast', modeHint: mode };
    }
    if (lower.includes('battery') && (lower.includes('low') || lower.includes('15') || lower.includes('14'))) {
      return { action: 'return_to_charge', confidence: 0.8, source: 'fast' };
    }
    return { action: 'hold_position', confidence: 0.4, source: 'fast' };
  }

  private coreStub(ctx: string, mode: Mode): Decision {
    if (mode === 'Navigation' || mode === 'SLAM') {
      return { action: 'follow_path', confidence: 0.75, source: 'core', modeHint: mode };
    }
    if (mode === 'Guard') {
      return { action: 'patrol_loop', confidence: 0.7, source: 'core' };
    }
    return { action: 'converse', confidence: 0.6, source: 'core', modeHint: 'Conversation' };
  }
}
