/**
 * Robotics runtime loop integrating NLDB, decision, mode machine, and HAL.
 * Discrete step compatible with the dual-quaternion plant.
 */

import { NaturalLanguageDataBus } from './nldb';
import { MultiLLMDecision } from './multi-llm-decision';
import { ModeMachine } from './mode-machine';
import { HardwareAbstractionLayer } from './hal';
import { SensorFrame, PlantCommand } from './types';

export class RoboticsRuntime {
  readonly nldb = new NaturalLanguageDataBus();
  readonly decision = new MultiLLMDecision();
  readonly modes = new ModeMachine();
  readonly hal = new HardwareAbstractionLayer();

  async step(frame: SensorFrame, kappa: number = 1.0): Promise<PlantCommand> {
    this.nldb.ingest(frame);
    const context = this.nldb.recent(8);
    const dec = await this.decision.decide(context, this.modes.mode);
    this.modes.transition(dec.modeHint, dec.confidence);
    return this.hal.toCommand(dec, kappa);
  }

  status(): string {
    return `mode=${this.modes.mode} events=${this.nldb.length}`;
  }
}
