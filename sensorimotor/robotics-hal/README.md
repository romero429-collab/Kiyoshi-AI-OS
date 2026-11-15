# Kiyoshi Robotics HAL (OM1-inspired)

Extracted usable patterns from OpenMind OM1 (archived MIT-licensed modular AI runtime / HAL for robots).

## Usable Concepts Integrated
- Natural Language Data Bus (NLDB): compress continuous sensor streams into discrete natural-language events for agent reasoning.
- Multi-LLM orchestration: Fast Action (low-latency ~300 ms), Core Cognition (planning), Coach (periodic review).
- Plugin-style Hardware Abstraction Layer mapping high-level intents to actuation.
- Discrete mode machine for autonomy (Welcome, Conversation, SLAM, Navigation, Guard).
- Observability hooks for latency metrics.

## Discrete Dynamical System Framing
The closed-loop map is
\[
\mathbf{x}_{k+1} = f(\mathbf{x}_k, \mathbf{u}_k(\mathrm{LLM}(\mathrm{NLDB}(\mathbf{y}_k))), \mathbf{w}_k),
\]
where NLDB is the nonlinear compression operator, variable LLM latency can modulate the largest error Lyapunov exponent, and the Fast Action path provides local contraction.

## Files
- `architecture.md` — formal layers and data flow.
- `nldb.ts` — TypeScript sketch of the natural-language bus.
- `multi-llm-decision.ts` — orchestration sketch.

See parent `sensorimotor/` for dual-quaternion biped plant.
