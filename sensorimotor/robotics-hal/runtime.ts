/**
 * Robotics runtime with Coach review and plant bridge.
 */

import { NaturalLanguageDataBus } from './nldb';
import { MultiLLMDecision } from './multi-llm-decision';
import { ModeMachine } from './mode-machine';
import { HardwareAbstractionLayer } from './hal';
import { PlantBridge } from './plant-bridge';
import { SensorFrame, PlantCommand } from './types';

export class RoboticsRuntime {
  readonly nldb = new NaturalLanguageDataBus();
  readonly decision: MultiLLMDecision;
  readonly modes = new ModeMachine();
  readonly hal = new HardwareAbstractionLayer();
  readonly plant: PlantBridge;

  private stepCount = 0;

  constructor(
    decision?: MultiLLMDecision,
    plantBackend: 'dual-quaternion' | 'pybullet' | 'zenoh' = 'dual-quaternion',
  ) {
    this.decision = decision ?? new MultiLLMDecision();
    this.plant = new PlantBridge(plantBackend);
  }

  async step(frame: SensorFrame, kappaHint = 1.0): Promise<{ cmd: PlantCommand; plant: ReturnType<PlantBridge['getState']> }> {
    this.nldb.ingest(frame);
    const context = this.nldb.recent(8);
    let dec = await this.decision.decide(context, this.modes.mode);

    this.stepCount++;
    if (this.stepCount % 5 === 0) {
      const reviewed = await this.decision.coachReview(context, dec, this.modes.mode);
      if (reviewed && reviewed.action !== 'keep') {
        dec = { ...reviewed, source: 'coach' };
      }
    }

    this.modes.transition(dec.modeHint, dec.confidence);
    const cmd = this.hal.toCommand(dec, kappaHint);
    const plantState = this.plant.apply(cmd);

    return { cmd, plant: plantState };
  }

  status(): string {
    const p = this.plant.getState();
    return `mode=${this.modes.mode} events=${this.nldb.length} kappa=${p.kappa.toFixed(3)} err=${p.errorNorm.toFixed(4)}`;
  }
}
