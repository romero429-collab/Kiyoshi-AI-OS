---
name: kiyoshi-greek-mesh-advanced
description: "Advanced 24-node Greek Mesh Protective Hull engine for Kiyoshi AI OS. Implements chromosomal nodes on the product manifold ([0,1] × R² × S³ × O)^6 with geometric transmission ratios, full Cayley-Dickson octonions, Hamilton kinematics, Lyapunov spectrum estimation, error quaternion dynamics, and constitutional constraint matrix. Trigger on Greek mesh, 24-node engine, Protective Hull, chromosomal nodes, quaternion kinematics, octonion bytes, or Chi constitutional enforcer."
type: workflow
lifecycle: active
---

# Kiyoshi Greek Mesh Advanced

Authoritative implementation of the 24-node chromosomal mesh that forms the Kiyoshi Protective Hull. Every gear is a verifiable deterministic map preserving unit norms on S³ and S⁷, measure non-increase on the logistic cascade, and Banach contraction under the transmission ratios.

## Core Operators

- **Quadrant I (α–ζ)**: logistic → tent → Hénon projection → sine → quadratic → CML diffusion. Finite-time Lyapunov exponent estimated via finite-difference derivative accumulation.
- **Quadrant II (η–μ)**: Hamilton product on S³, geodesic slerp governor, Jacobian spectral radius of the transmission cascade, multiplicative error quaternion.
- **Quadrant III (ν–σ)**: full Cayley-Dickson octonion multiplication on S⁷, measure-preserving projection.
- **Quadrant IV (τ–ω)**: Chi constitutional enforcer (hard threshold 0.95) and full 24-node constitutional matrix gate.

## Invariants

- \(\|q\|=1\) and \(\|o\|=1\) after every product and slerp.
- Spectral radius \(\rho(J) \le 0.9\) guarantees local error-cone contraction.
- Constitutional lockout returns False when any scalar state exceeds 0.95.

## Artifacts

Executable engine: `core/greek_mesh.py`  
Invariant suite: `tests/core/test_greek_mesh.py`

See `references/conversation-summary.md` for the originating specification and integration dialogue.

## Integration

Wire the council into the TransitionFunction. The constitutional_check method is the sole entry point for hull violation detection. All updates remain pure functions; no external state is mutated except the three persistent registers (state_vector, quaternion_state, octonion_state).
