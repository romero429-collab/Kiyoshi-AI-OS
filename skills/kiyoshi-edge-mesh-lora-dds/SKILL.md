---
name: kiyoshi-edge-mesh-lora-dds
description: "Model Kiyoshi offline-first edge hardware (Charm keychain to home/robot/drone) as a discrete dynamical system with LoRa mesh, Lyapunov stability, bifurcation analysis, and 3D phase-space visualization. Use when analyzing decentralized robotics, mesh autonomy, substrate scaling, or edge intelligence that does not phone home."
type: workflow
lifecycle: active
---

# Kiyoshi Edge Mesh LoRa DDS

Formalize Claude’s Charm-to-mesh robotics arc (offline-first, mesh peers, online only on own terms) as a 5-D discrete dynamical system. LoRa is the physical parameterization of the mesh block.

## State Space
\(\mathbf{x}_t = (s, c, \mu, \kappa, a)^\top \in \mathcal{X} \subset \mathbb{R}^5\)

- \(s\): log form-factor scale (Charm → Home → Robot → Drone)
- \(c\): local substrate capacity
- \(\mu\): mesh coupling (LoRa-modulated)
- \(\kappa\): cloud dependency (target 0)
- \(a\): autonomy / self-ownership

## Iteration
\(F = F_a \circ F_\kappa \circ F_\mu \circ F_c \circ F_s\)

LoRa parameters \((\mathrm{SF}, D, S, \chi)\) enter only \(F_\mu\) via
\(\beta_\mu = \beta_0 \cdot D \cdot \sigma(S - S_\star(\mathrm{SF})) \cdot \chi\).

## Protocol (dds-chaos-architect)
Execute Steps 1–4 in order. Present only the current step. Await confirmation.

1. State-space + composite map + Jacobian spectral radius at offline face \(\kappa=0, a=1\).
2. Heterogeneous classes (Charm/Home/Robot/Drone) local maps and finite-time Lyapunov.
3. Attractor classification (Type I fixed, Type II LoRa duty-cycle orbit, Type III cloud/mesh chaos) + bifurcation sequence on \(\beta_\mu, \rho_\kappa\).
4. 3-D projector \(\Phi:(c,\mu,\kappa)\to\mathbb{R}^3\), Newtonian particle analogy, verification tests.

## Visualizer
Open `edge-mesh-lora/phase-space-visualizer.html` (or assets copy). Sliders: SF, duty D, SNR, \(\rho_\kappa\), \(\gamma_c\), \(\delta_c\), \(\eta_a\).

Five tests:
1. Type I lock at \(\rho_\kappa<1\), moderate D.
2. Error tube contraction after inject e.
3. LoRa strobe loop when D small.
4. Mesh cascade when \(\beta_\mu \gtrsim 1.15\).
5. Phone-home climb when \(\rho_\kappa \ge 1\).

## References
- Full derivation and conversation: `references/conversation-summary.md`
- Visualizer source: `../../edge-mesh-lora/phase-space-visualizer.html`
