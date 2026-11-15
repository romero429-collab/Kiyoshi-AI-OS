# Robotics HAL (OM1-inspired)

Use when designing or extending Kiyoshi's sensorimotor / robotics layer with hardware-agnostic agent runtime patterns.

## Triggers
- robotics OS, robot HAL, natural language data bus, multi-LLM robot control, autonomy modes

## Instructions
1. Load the dual-quaternion plant from sensorimotor/core.py.
2. Route sensor frames through NaturalLanguageDataBus (nldb.ts).
3. Feed recent context to MultiLLMDecision.
4. Map resulting action through HAL to plant torque / velocity commands.
5. Enforce Protective Hull contraction on the discrete map.

## Files
- sensorimotor/robotics-hal/
