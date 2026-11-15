/**
 * Natural Language Data Bus.
 * Compresses multimodal sensor frames into a bounded discrete event stream.
 */

import { SensorFrame, NLEvent } from './types';

export class NaturalLanguageDataBus {
  private events: NLEvent[] = [];
  private readonly maxEvents = 256;

  ingest(frame: SensorFrame): NLEvent[] {
    const out: NLEvent[] = [];
    if (frame.vision) {
      out.push({ t: frame.timestamp, text: frame.vision, source: 'vision' });
    }
    if (frame.audio) {
      out.push({ t: frame.timestamp, text: frame.audio, source: 'audio' });
    }
    if (frame.lidar) {
      out.push({ t: frame.timestamp, text: frame.lidar, source: 'lidar' });
    }
    if (frame.battery !== undefined) {
      out.push({
        t: frame.timestamp,
        text: `Battery ${frame.battery.toFixed(1)}%`,
        source: 'system',
      });
    }
    if (frame.pose) {
      out.push({
        t: frame.timestamp,
        text: `Pose norm ${Math.hypot(...frame.pose).toFixed(3)}`,
        source: 'pose',
      });
    }
    this.events.push(...out);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    return out;
  }

  recent(n = 16): string {
    return this.events
      .slice(-n)
      .map((e) => `[${e.source}@${e.t}] ${e.text}`)
      .join('\n');
  }

  clear(): void {
    this.events = [];
  }

  get length(): number {
    return this.events.length;
  }
}
