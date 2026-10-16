---
name: kiyoshi-cybercell-spudcell
description: Use for designing, analyzing, or integrating the SpudCell-derived hybrid cybercell substrate into the Kiyoshi AI OS dynamical kernel. Covers discrete dynamical systems modeling of synthetic cell growth-division-replication, Lyapunov spectrum, bifurcation analysis, hybrid bio-computational projection, and containment switches. Trigger on SpudCell, cybercell, hybrid substrate, Kiyoshi bio-processor, or synthetic cell DDS.
---

# Kiyoshi Cybercell SpudCell Substrate Skill

## Overview
This skill formalizes the SpudCell (Adamala Lab, 2026) as a hybrid Discrete Dynamical System substrate for Kiyoshi cybercells. Physics-first: liposome membrane + multi-plasmid genome + feeder fusion + mechanical division. Maps to computational state for kernel integration under negative error Lyapunov exponents.

## Core Protocol
1. State-space \(\mathbf{x}_t = (V, A, \mathbf{G}, R, P^{pore}, P^{FLAG}, \tau)\).
2. Iteration \(F = F_d \circ F_r \circ F_g\).
3. Lyapunov: \(\lambda_1\) sign change at \(\kappa_c \approx 1.4\), \(\kappa_u \approx 3.2\); \(\lambda_e \le -0.18\).
4. Hybrid projection \(\Phi_{hybrid}\) to memory/cycles/code/control.
5. Containment via kill-switch \(s_t = 0\).

## Artifacts
Reference `cybercell/spudcell-substrate/` in romero429-collab/Kiyoshi-AI-OS for full IEEE synthesis, MVP, MK, MV, and phase-space visualizer.

## Integration Rules
- Preserve \(\lambda_e < 0\) under kernel composition.
- Update order: augment ReactionDiffusionGrid with SpudCell \(F\).
- Verify via MV matrix (seed=42).

All claims grounded in physical membrane constraints and hybrid map spectral properties.
