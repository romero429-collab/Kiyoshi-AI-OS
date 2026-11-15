/**
 * Smoke test for RoboticsRuntime.
 * Run with: npx tsx sensorimotor/robotics-hal/smoke.ts
 */

import { RoboticsRuntime } from './runtime';
import { SensorFrame } from './types';

async function smoke() {
  const rt = new RoboticsRuntime();
  const frames: SensorFrame[] = [
    { timestamp: 1, vision: 'empty room', battery: 85 },
    { timestamp: 2, audio: 'hello robot', battery: 84 },
    { timestamp: 3, lidar: 'obstacle 1.2m ahead', battery: 15 },
    { timestamp: 4, audio: 'stop', battery: 14 },
  ];

  console.log('--- Robotics HAL smoke ---');
  for (const f of frames) {
    const cmd = await rt.step(f, 1.2);
    console.log(rt.status(), '→', JSON.stringify(cmd));
  }
  console.log('Smoke complete.');
}

if (require.main === module) {
  smoke().catch(console.error);
}
