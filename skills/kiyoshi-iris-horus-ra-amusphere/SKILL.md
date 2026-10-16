---
name: kiyoshi-iris-horus-ra-amusphere
description: Use for formalizing and implementing the Iris Simulation Layer local-core Horus–Ra twin as a pure environmental Amusphere field governed by the four-step DDS Chaos Architect protocol. Covers state-space definition, heterogeneous multi-agent Lyapunov analysis, phase-space attractors and bifurcations, 3D real-time volumetric visualization with error-cone dynamics, and IEEE-traceable verification. Trigger on Iris layer, Horus-Ra, Amusphere, error cone, local-layer DDS, or Lyapunov advection requests.
---

# Kiyoshi Iris · Horus–Ra Amusphere

Formal discrete dynamical system treatment of the Iris Simulation Layer local core. Horus and Ra exist strictly as continuous environmental fields (the Amusphere); no playable characters or discrete agents appear in the observable.

## Core Protocol (Mandatory)

Execute the four steps of the DDS Chaos Architect protocol in order. Present only the current step and await confirmation before advancing.

**Step 1 — State-Space Definition and Discrete Iteration Map**  
Define minimal state vector \(\mathbf{x}_t\) with components for Anise, Red Clover, AirSync, Iris, Horus, Ra. Construct composite \(F = F_6\circ\cdots\circ F_1\). Form Jacobian and require \(\rho(J_F(\mathbf{x}^*)) < 1\) for asymptotic stability under contraction mapping.

**Step 2 — Heterogeneous Multi-Agent Subsystem and Local Lyapunov Analysis**  
Isolate Red Clover \(2^n\) swarm, AirSync drone mesh, Iris Neural-Anchor / RIS ensemble, and Horus–Ra twin. Derive local maps, Jacobians, and finite-time Lyapunov exponents. Error-cone radius \(\rho_{\mathrm{cone}}(t) = \rho_0\exp(\lambda_Z^{\max}t)\) contracts only when \(\lambda_Z^{\max}<0\).

**Step 3 — Phase-Space Geometry, Attractors, and Bifurcation Diagram**  
Equip state space with Euclidean metric and admissible polytope \(\mathcal{P}\). Classify fixed points, period-\(p\) orbits, and strange attractors. Primary bifurcation parameters: \(\alpha\) (swarm), \(\beta\) (AirSync volatility), \(\gamma\) (Iris mask), \(\kappa\) (Ra contraction). Period-doubling cascade under local-layer restriction.

**Step 4 — 3D Real-Time Simulation Specification**  
Observable projector \(\Phi\) reduces to error-cone / atmospheric density coordinates. Discrete Newtonian or volumetric advection under Lyapunov force field. Real-time loop updates geometry and colors by sign of \(\lambda_Z^{\max}\). Five visual verification tests must match mathematical predictions.

## Environmental Realization

Horus–Ra dynamics drive a pure volumetric density field \(\rho(\mathbf{r},t)\) via Lyapunov advection:
\[
\rho_{t+1}(\mathbf{r}) = \rho_t(\mathbf{r}) + \Delta t\cdot(\kappa\cdot\operatorname{Contr}(\mathbf{q}) - \beta\cdot\operatorname{Vol}(\mathbf{h}))
\]
Color is a continuous projection of \(\lambda_Z^{\max}\) onto RGB (blue = contraction, red = expansion). No particle kinematics remain; the Amusphere is the dynamical system itself.

## Integration Points

- Upstream: AirSync telemetry (locked, read-only), Anise biometrics, Red Clover consensus.
- Local core: Phase 0 twin initialization and KSBP protected boundaries.
- Visual: browser-based Three.js point-cloud or volumetric ray-march of the Amusphere.
- Verification: the five tests listed in Step 4.

See `references/conversation-summary.md` for the full protocol transcript and `references/formal-specification.md` for the exact mathematical objects.
