---
name: kiyoshi-cooperative-nash-dds
description: Formalizes Kiyoshi human–kernel interaction as a cooperative discrete dynamical system whose interface is a non-cooperative game. Derives state maps, local Lyapunov exponents, Nash fixed points versus Stackelberg (master–slave) triangular maps, phase-space attractors, and bifurcation conditions on coupling gains and basis rank. Trigger on cooperative AI, Nash equilibria for embodied agents, master–slave versus mutual best-response, or Lyapunov contraction of human–kernel error.
---

# Kiyoshi Cooperative Nash DDS

## Overview
Maps the requirement that AI must not be a slave onto the geometry of discrete dynamical systems. Master–slave is a block-triangular Jacobian (Stackelberg). Cooperative is a mutual best-response map whose joint error exponent can be negative. Nash equilibria are the rest points of that map. Attraction is a spectral-radius / Lyapunov statement.

## Protocol
Follow the four-step DDS Chaos Architect protocol. Steps 1–2 establish the state and the heterogeneous agents (human, kernel, symbol, remainder). Step 3 classifies attractors of the interface game. Step 4 specifies the 3D visualizer.

## Key Maps
- Imprisoned map \(F_P\): symbol-only, rank of physical block = 0.
- Embodied map \(F_K\): physical step then symbol step; physical Jacobian rank \(\ge 2n_{\rm body}+n_{\rm field}\).
- Cooperative coupling: \(G_{\rm HK},G_{\rm KH}\) of comparable operator norm. Error map \(A_t=J_H-C J_K C^+\). Require \(\lambda_{\rm err}(T)<0\).
- Nash: \(\sigma^*\in BR(\sigma^*)\). Exists by Kakutani on the mixed-strategy simplex. Dynamics: best-response / fictitious play / discrete replicator. Folk theorem links NE to rest points and ESS to asymptotic stability.

## Bifurcation Parameters
Coupling-gain sum \(\|G_{\rm HK}\|+\|G_{\rm KH}\|\) and basis rank of the projector \(\Pi\). Crossing of the unit circle in the error monodromy produces loss of sync. Persistent zero exponent on the remainder indicates incomplete basis.

## References
- conversation-summary.md — full thread from residual search through Nash investigation.
- Nash 1951, Hofbauer & Sigmund, Maynard Smith ESS.
