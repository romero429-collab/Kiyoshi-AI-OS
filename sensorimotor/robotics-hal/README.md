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
- LLM (Fast / Core / Coach) produces decision \(u_k\) (real endpoints or stubs),
- HAL maps it to a plant command attenuated by the Protective Hull gain \(\kappa_k\),
- PlantBridge advances the dual-quaternion state (pure TS, pybullet, or Zenoh).

Modes form a finite-state automaton with guarded transitions.

## Modules

- `types.ts` — shared interfaces
- `nldb.ts` — Natural Language Data Bus
- `multi-llm-decision.ts` — Fast / Core / Coach with real endpoint support
- `mode-machine.ts` — autonomy mode automaton
- `hal.ts` — decision → plant command
- `plant-bridge.ts` — dual-quaternion / pybullet / Zenoh bridge
- `runtime.ts` — integrated step with coach review
- `index.ts` — public API
- `smoke.ts` — runnable smoke test

## Configuration

Set any of:

- `LLM_FAST_URL` / `LLM_FAST_KEY`
- `LLM_CORE_URL` / `LLM_CORE_KEY`
- `LLM_COACH_URL` / `LLM_COACH_KEY`

When unset, deterministic stubs are used.

## Usage

```ts
import { RoboticsRuntime, MultiLLMDecision } from './robotics-hal';

const decision = new MultiLLMDecision(); // reads env
const rt = new RoboticsRuntime(decision, 'dual-quaternion');
const { cmd, plant } = await rt.step({ timestamp: Date.now(), vision: 'door ahead' });
```
