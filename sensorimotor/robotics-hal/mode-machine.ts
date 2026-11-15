/**
 * Discrete mode machine for autonomy behaviors.
 * Transitions are guarded by decision confidence and external events.
 */

import { Mode } from './types';

export class ModeMachine {
  private current: Mode = 'Welcome';

  get mode(): Mode {
    return this.current;
  }

  transition(hint: Mode | undefined, confidence: number): Mode {
    if (!hint || confidence < 0.6) return this.current;

    const allowed: Record<Mode, Mode[]> = {
      Welcome: ['Conversation', 'SLAM', 'Guard'],
      Conversation: ['Navigation', 'Welcome', 'Guard'],
      SLAM: ['Navigation', 'Guard', 'Welcome'],
      Navigation: ['SLAM', 'Guard', 'Conversation'],
      Guard: ['Navigation', 'Welcome', 'SLAM'],
    };

    if (allowed[this.current].includes(hint)) {
      this.current = hint;
    }
    return this.current;
  }

  reset(): void {
    this.current = 'Welcome';
  }
}
