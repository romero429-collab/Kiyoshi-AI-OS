---
name: kiyoshi-quaternion-dds
description: Use for modeling quaternion algebra, Hamilton products, and attitude dynamics as discrete dynamical systems on the real 4D embedding of H. Performs Lyapunov analysis on the real Jacobian, generates contraction/chaos diagnostics for rotations and QNNs, and produces 3D visualizers of imaginary-part trajectories colored by real-part scaling. Trigger on quaternions, Hamilton product, S3 rotations, attitude estimation, or quaternionic neural nets inside Kiyoshi.
---

# Kiyoshi Quaternion DDS

Maps quaternion algebra applications (3-D rotations, multiplicative error filters, QNN layers) to a discrete dynamical system on \(\mathbb{R}^4 \cong \mathbb{H}\).

## Core Protocol
1. Represent every quaternion as a 4-vector. Implement Hamilton product via left-multiplication matrix \(L(q)\).
2. Define iteration \(F(\mathbf{x}) = \gamma L(W)\mathbf{x}\).
3. Compute real 4\times4 Jacobian; extract Lyapunov spectrum. Negative \(\lambda_1\) implies contraction on \(S^3\).
4. Augment with multiplicative error quaternion for attitude recovery analysis (\(\lambda_e < 0\)).

## Artifacts
Emits IEEE System Synthesis, MVP with norm-preservation safeguards, Hamilton-product engine, verification matrix, and Three.js visualizer projecting \(\operatorname{Im}(q)\) to 3D with real-part color and twin trajectories.
