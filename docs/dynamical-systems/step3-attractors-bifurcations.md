# Step 3 — Phase-Space Geometry, Attractors, and Bifurcation Diagram (Kiyoshi × MH-FLOCKE)

State space \(\mathcal{M}^{\rm K}\) equipped with Euclidean metric and the admissible polytope defined by the 12-article constitution (safety bounds, resource limits, offline-first constraints, local-model token budgets).

Attractor classification:

1. Stable fixed point — constitutionally compliant idle / quiescent runtime (all higher adaptive gains zero). Invariant under \(F^{\rm K}\) and asymptotically stable when \(\rho(J_{F^{\rm K}})<1\).
2. Stable periodic orbit — cyclic agent / tool orchestration loop (heartbeat + inference + verification cycle). Asymptotic stability when all Floquet multipliers lie inside the unit circle.
3. Strange attractor — appears only under pathological high-plasticity or unconstrained priority-gain regimes that violate constitutional bounds; characterized by positive largest Lyapunov exponent.

Primary bifurcation parameters (lifted from MH-FLOCKE and constrained by constitution):

- competence-gate blending factor \(\alpha^{\rm K}\) (deterministic scheduler \(\leftrightarrow\) adaptive inference),
- plasticity / adaptation rate \(\eta^{\rm K}\),
- predictive-error (verification) gain \(k_{\rm cer}^{\rm K}\),
- priority / neuromodulator gain \(g_{\rm nm}^{\rm K}\),
- external drive / goal strength \(\beta^{\rm K}\).

Bifurcation sequence:

- Increasing \(\alpha^{\rm K}\): supercritical Hopf that births the stable periodic orchestration orbit from the quiescent fixed point.
- Increasing \(\eta^{\rm K}\): period-doubling cascade of the orchestration orbit, potentially culminating in a crisis that produces a strange attractor if constitutional bounds are exceeded.
- Increasing \(k_{\rm cer}^{\rm K}\): saddle-node of prediction-error fixed points that can annihilate the desired orbit.
- Interaction of \(\beta^{\rm K}\) and \(k_{\rm cer}^{\rm K}\): secondary Hopf producing measurable modulation of verification error amplitude (analogous to the documented 10 % interaction effect).

All conditions expressed solely via spectral properties of the local Jacobians of Step 2 and therefore fully traceable.
