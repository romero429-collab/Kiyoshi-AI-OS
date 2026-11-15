# Kiyoshi Robotics HAL

Modular agent-side Hardware Abstraction Layer for the sensorimotor plant.

## Architecture (discrete dynamical system)

The agent loop is the discrete map

\[
\mathbf{x}_{k+1} = f(\mathbf{x}_k, u_k(\mathrm{LLM}(\mathrm{NLDB}(y_k))), \kappa_k),
\]

where:

- \(y_k\) is the raw sensor frame,
- NLDB compresses it to a bounded language event stream,
- LLM (Fast / Core) produces decision \(u_k\),
- HAL maps it to a plant command attenuated by the Protective Hull gain \(\kappa_k\),
- the dual-quaternion plant (see parent `core.py`) advances the continuous state.

Modes form a finite-state automaton with guarded transitions.

## Modules

- `types.ts` — shared interfaces
- `nldb.ts` — Natural Language Data Bus
- `multi-llm-decision.ts` — Fast Action + Core paths
- `mode-machine.ts` — autonomy mode automaton
- `hal.ts` — decision → plant command
- `runtime.ts` — integrated step
- `index.ts` — public API
- `smoke.ts` — runnable smoke test

## Usage

```ts
import { RoboticsRuntime } from './robotics-hal';

const rt = new RoboticsRuntime();
const cmd = await rt.step({ timestamp: Date.now(), vision: 'door ahead' }, 1.0);
```

The command is then applied to the dual-quaternion plant / URDF.
