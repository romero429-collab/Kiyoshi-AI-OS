/**
 * Shared types for Kiyoshi Robotics HAL.
 */

export type Mode = 'Welcome' | 'Conversation' | 'SLAM' | 'Navigation' | 'Guard';

export interface SensorFrame {
  timestamp: number;
  vision?: string;
  audio?: string;
  lidar?: string;
  battery?: number;
  pose?: number[]; // dual quaternion or joint state stub
}

export interface NLEvent {
  t: number;
  text: string;
  source: 'vision' | 'audio' | 'lidar' | 'system' | 'pose';
}

export interface Decision {
  action: string;
  confidence: number;
  source: 'fast' | 'core' | 'coach';
  modeHint?: Mode;
}

export interface PlantCommand {
  type: 'velocity' | 'torque' | 'pose';
  value: number[] | string;
  kappaScale: number; // from Protective Hull
}
