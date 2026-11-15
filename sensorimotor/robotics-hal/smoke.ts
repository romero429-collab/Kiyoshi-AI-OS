/**
 * Smoke test with real-endpoint capable decision layer and plant bridge.
 * Run with: npx tsx sensorimotor/robotics-hal/smoke.ts
 */

import { RoboticsRuntime } from './runtime';
import { MultiLLMDecision } from './multi-llm-decision';
import { SensorFrame } from './types';

async function smoke() {
  const decision = new MultiLLMDecision();
  const rt = new RoboticsRuntime(decision, 'dual-quaternion');

  const frames: SensorFrame[] = [
    { timestamp: 1, vision: 'empty room', battery: 85 },
    { timestamp: 2, audio: 'hello robot', battery: 84 },
    { timestamp: 3, lidar: 'obstacle 1.2m ahead', battery: 15 },
    { timestamp: 4, audio: 'stop', battery: 14 },
    { timestamp: 5, vision: 'clear path', battery: 13 },
  ];

  console.log('--- Robotics HAL smoke (with plant bridge + coach hook) ---');
  for (const f of frames) {
    const { cmd, plant } = await rt.step(f, 1.2);
    console.log(rt.status(), '→', JSON.stringify(cmd), 'plant.dq0=', plant.dq[0].toFixed(3));
  }
  console.log('Smoke complete.');
}

if (require.main === module) {
  smoke().catch(console.error);
}
