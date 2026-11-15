# Robotics HAL Architecture (OM1-derived)

## Layers
1. Raw Sensor Layer — cameras, LiDAR, IMU, microphones, battery.
2. Captioning / Compression — VLM / ASR produce text events.
3. Natural Language Data Bus (NLDB) — shared discrete token stream.
4. Data Fuser — merges into context window.
5. Decision Layer
   - Fast Action LLM (local, latency-bounded).
   - Core LLM (cloud/planning).
   - Coach LLM (review).
6. HAL — intent → robot commands (Zenoh/ROS2-style or direct).
7. Actuation — plant (see dual-quaternion biped in parent).

## Mode Machine
Discrete states with guarded transitions: Welcome → Conversation | SLAM | Navigation | Guard.

## Stability Note
Under high sensor rates or network jitter the delay-augmented Jacobian may have positive Lyapunov exponent; Fast Action path is the primary contraction mechanism.
