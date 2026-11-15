/**
 * Natural Language Data Bus sketch for Kiyoshi robotics.
 * Compresses sensor frames into discrete language events.
 */

export interface SensorFrame {
  timestamp: number;
  vision?: string; // VLM caption
  audio?: string;  // ASR text
  lidar?: string;  // spatial summary
  battery?: number;
}

export interface NLEvent {
  t: number;
  text: string;
  source: 'vision' | 'audio' | 'lidar' | 'system';
}

export class NaturalLanguageDataBus {
  private events: NLEvent[] = [];

  ingest(frame: SensorFrame): NLEvent[] {
    const out: NLEvent[] = [];
    if (frame.vision) out.push({ t: frame.timestamp, text: frame.vision, source: 'vision' });
    if (frame.audio) out.push({ t: frame.timestamp, text: frame.audio, source: 'audio' });
    if (frame.lidar) out.push({ t: frame.timestamp, text: frame.lidar, source: 'lidar' });
    if (frame.battery !== undefined) {
      out.push({ t: frame.timestamp, text: `Battery at ${frame.battery}%`, source: 'system' });
    }
    this.events.push(...out);
    // Keep last N for context window
    if (this.events.length > 256) this.events = this.events.slice(-256);
    return out;
  }

  recent(n = 16): string {
    return this.events.slice(-n).map(e => `[${e.source}] ${e.text}`).join('\n');
  }
}
