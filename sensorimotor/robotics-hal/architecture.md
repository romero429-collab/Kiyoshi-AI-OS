# Systems Architecture — Robotics HAL

## 1. Physical Plant
Dual-quaternion kinematics on \(\mathbb{D}\mathbb{H}_1\) with Protective Hull contraction gain \(\kappa(k)\).  
Source of truth: `../core.py`.  
Runtime bridge: `plant-bridge.ts` (pure-TS port of the kappa step + optional pybullet / Zenoh backends).

## 2. Agent Discrete Loop
1. SensorFrame \( y_k \)
2. NLDB compression → bounded event list
3. Context window
4. MultiLLMDecision  
   - Fast Action endpoint (or stub)  
   - Core endpoint (or stub)  
   - Coach review every N steps (advisory override)
5. ModeMachine transition (guarded by confidence)
6. HAL maps Decision → PlantCommand with \(\kappa\)-attenuation
7. PlantBridge.apply → updates dual-quaternion state

## 3. Stability
Variable LLM latency enters as a time-varying delay.  
The Fast Action path supplies local contraction when the largest error Lyapunov exponent would otherwise become positive.  
Hull gain \(\kappa(k)\) further attenuates commands under high error or delay.

## 4. Interfaces
- Inputs: SensorFrame  
- Outputs: PlantCommand + DualState  
- Endpoints: configurable via constructor or env (`LLM_FAST_URL`, `LLM_CORE_URL`, `LLM_COACH_URL`, matching keys)  
- Observability: `runtime.status()`, event count, current mode, kappa, error norm

## 5. Extension Points
- Supply real OpenAI-compatible endpoints for Fast / Core / Coach  
- Implement pybullet or Zenoh transport inside PlantBridge  
- Bind final PlantCommand torque to the full dual-quaternion plant in `core.py`
