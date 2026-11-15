# Systems Architecture — Robotics HAL

## 1. Physical Plant
Dual-quaternion kinematics on \(\mathbb{D}\mathbb{H}_1\) with Protective Hull contraction gain \(\kappa(k)\). Source of truth: `../core.py`.

## 2. Agent Discrete Loop
1. SensorFrame \( y_k \)
2. NLDB compression → bounded event list
3. Context window
4. MultiLLMDecision (Fast path ≤ 300 ms target, Core fallback)
5. ModeMachine transition (guarded by confidence)
6. HAL maps Decision → PlantCommand with \(\kappa\)-attenuation
7. Plant step

## 3. Stability
Variable LLM latency enters as a time-varying delay. The Fast Action path supplies local contraction when the largest error Lyapunov exponent would otherwise become positive. Hull gain \(\kappa(k)\) further attenuates commands under high error or delay.

## 4. Interfaces
- Inputs: SensorFrame
- Outputs: PlantCommand (velocity / pose / torque stub)
- Observability: `runtime.status()`, event count, current mode

## 5. Extension Points
- Replace stub LLM calls with real endpoints
- Bind PlantCommand to pybullet / ROS2 / Zenoh bridge
- Add Coach LLM periodic review
