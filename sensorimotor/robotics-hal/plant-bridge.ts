/**
 * Dual-quaternion plant bridge.
 * Computes Protective Hull kappa and applies PlantCommand.
 * Backends: 'dual-quaternion' (pure TS, matches core.py math), 'pybullet', 'zenoh'.
 */

import { PlantCommand } from './types';

export interface DualState {
  dq: number[]; // 8-element dual quaternion
  kappa: number;
  errorNorm: number;
}

export class PlantBridge {
  private state: DualState = {
    dq: [1, 0, 0, 0, 0, 0, 0, 0],
    kappa: 0.5,
    errorNorm: 0,
  };

  constructor(private backend: 'dual-quaternion' | 'pybullet' | 'zenoh' = 'dual-quaternion') {}

  getState(): DualState {
    return { ...this.state };
  }

  apply(cmd: PlantCommand, lambda1 = 0.0, eP = 0.0, tauP = 0.0): DualState {
    const tauM = Math.random() < 0.12 ? Math.floor(Math.random() * 4) + 2 : 0;
    const noise = Array.from({ length: 8 }, () => (Math.random() - 0.5) * 0.03);
    const dqTrue = this.normalize(this.add(this.state.dq, noise));
    const eM = this.dualErrorNorm(dqTrue, this.state.dq);

    const dynamic = Math.max(
      0,
      lambda1 + 1.2 * eP + 0.05 * tauP + 1.5 * eM + 0.08 * tauM,
    );
    const kappa = 0.5 + 0.1 * dynamic;

    const scale = cmd.kappaScale;
    if (cmd.type === 'velocity' && Array.isArray(cmd.value)) {
      const v = cmd.value as number[];
      this.state.dq[4] += (v[0] || 0) * scale * 0.01;
      this.state.dq[5] += (v[1] || 0) * scale * 0.01;
      this.state.dq[6] += (v[2] || 0) * scale * 0.01;
    } else if (cmd.type === 'pose' && cmd.value === 'dock') {
      this.state.dq = this.normalize([1, 0, 0, 0, 0, 0, 0, 0]);
    }

    this.state.dq = this.normalize(this.state.dq);
    this.state.kappa = kappa;
    this.state.errorNorm = eM;

    if (this.backend === 'pybullet') {
      // placeholder: publish to pybullet via child_process or socket
    } else if (this.backend === 'zenoh') {
      // placeholder: zenoh put on topic /plant/cmd
    }

    return this.getState();
  }

  private dualErrorNorm(dqTrue: number[], dqCmd: number[]): number {
    const mag = Math.hypot(
      dqTrue[1] - dqCmd[1],
      dqTrue[2] - dqCmd[2],
      dqTrue[3] - dqCmd[3],
      dqTrue[5] - dqCmd[5],
      dqTrue[6] - dqCmd[6],
      dqTrue[7] - dqCmd[7],
    );
    return mag;
  }

  private normalize(dq: number[]): number[] {
    const rNorm = Math.hypot(dq[0], dq[1], dq[2], dq[3]) || 1;
    const out = dq.map((v, i) => (i < 4 ? v / rNorm : v));
    const dot = out[0] * out[4] + out[1] * out[5] + out[2] * out[6] + out[3] * out[7];
    out[4] -= dot * out[0];
    out[5] -= dot * out[1];
    out[6] -= dot * out[2];
    out[7] -= dot * out[3];
    return out;
  }

  private add(a: number[], b: number[]): number[] {
    return a.map((v, i) => v + (b[i] || 0));
  }
}
