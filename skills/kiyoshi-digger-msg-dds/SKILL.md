---
name: kiyoshi-digger-msg-dds
description: "Physics-first Discrete Dynamical System model of Stan Meyer Magnetic Spin Generator as a constrained energy subsystem for Kiyoshi Digger nodes. Enforces thermodynamic invariants (ΔE ≥ 0), Lyapunov contraction of residual map, and integration with ACO metabolic states. Trigger on Magnetic Spin Generator, MSG digger, Meyer generator DDS, or digger energy residual."
type: workflow
lifecycle: active
---

# Kiyoshi Digger Magnetic Spin Generator DDS

Physics-first discrete dynamical system for the Stan Meyer Magnetic Spin Generator (MSG) treated as a candidate energy subsystem inside a Kiyoshi Digger node. The model rejects over-unity claims and embeds the first law of thermodynamics as a hard invariant.

## Physical constraints (IEEE)

Faraday induction and Lenz reaction hold:

\[
\mathcal{E} = -\frac{d\Phi_B}{dt}
\]

Energy balance at each pulse:

\[
W_{\rm in} \ge W_{\rm out} + Q_{\rm losses}
\]

Magnetostatic fields are conservative. Permanent magnetization stores energy supplied during initialization; reorientation against mutual interactions and reaction fields requires input from orientation coils.

## Discrete map

State at pulse index \( n \):

- \(\mathbf{m}_n \in S^2\): mean orientation of magnetized particle ensemble
- \( u_n \in \mathbb{R}_+ \): normalized input pulse amplitude
- \( y_n \): induced output energy packet
- \( \Delta E_n \ge 0 \): energy residual (thermodynamic invariant)
- battery coupling to ACO layer

Orientation update:

\[
\mathbf{m}_{n+1} = R(u_n) \mathbf{m}_n + \xi_n
\]

Energy residual map (largest Lyapunov exponent \(\lambda_1 < 0\) on admissible sheet):

\[
\Delta E_{n+1} = \max\bigl(0,\ \Delta E_n + \|u_n\|^2 - \eta\, f(\|\Delta\mathbf{m}_n\|)\bigr)
\]

with coupling efficiency \( \eta \le 1 \). Trajectories are attracted to the half-space \(\Delta E \ge 0\).

## Digger integration

- Mount \(\Delta E_n\), \(\eta\), and residual Lyapunov as metabolic observables.
- ACO CHARGE state may issue orientation pulses only when \(\Delta E_n > 0\) and \(\lambda_1 < 0\).
- Residual gate prevents scheduling of work that would violate energy conservation.
- Compatible with existing digger/qpu-control-thermal thermal envelope (shared metabolic vector).

## Artifacts

- Phase-space / geometry visualizer: `digger/msg-energy-subsystem/msg-digger-visualizer.html`
- Full conversation transcript and derivation: `references/conversation-summary.md`

## Design inequalities retained

\[
\Delta E_n \ge 0, \qquad \eta \le 1, \qquad \lambda_1(\text{residual}) < 0
\]

All over-unity interpretations are excluded by construction. The subsystem is a lossy inductive reorientation stage, not a net energy source.
