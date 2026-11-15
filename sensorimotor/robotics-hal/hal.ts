/**
 * Hardware Abstraction Layer.
 * Maps high-level decisions to plant commands, applying Protective Hull scale.
 */

import { Decision, PlantCommand } from './types';

export class HardwareAbstractionLayer {
  toCommand(decision: Decision, kappa: number = 1.0): PlantCommand {
    const scale = Math.min(1.0, 0.5 / Math.max(kappa, 0.5));

    switch (decision.action) {
      case 'emergency_stop':
        return { type: 'velocity', value: [0, 0, 0], kappaScale: 0 };
      case 'hold_position':
        return { type: 'velocity', value: [0, 0, 0], kappaScale: scale };
      case 'follow_path':
      case 'patrol_loop':
        return { type: 'velocity', value: [0.3 * scale, 0, 0], kappaScale: scale };
      case 'return_to_charge':
        return { type: 'pose', value: 'dock', kappaScale: scale };
      case 'converse':
        return { type: 'velocity', value: [0, 0, 0], kappaScale: scale };
      default:
        return { type: 'velocity', value: [0, 0, 0], kappaScale: scale };
    }
  }
}
