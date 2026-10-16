# Digger MSG Energy Subsystem

Constrained Discrete Dynamical System model of the Stan Meyer Magnetic Spin Generator for use as a potential energy stage inside Kiyoshi Digger nodes.

## Status

- Thermodynamic invariant enforced: energy residual ΔE ≥ 0
- Coupling efficiency η ≤ 1
- Residual map is contracting (λ1 < 0)
- Integrated with ACO metabolic CHARGE state via residual gate

## Artifacts

- Visualizer: [msg-digger-visualizer.html](msg-digger-visualizer.html)
- Skill: skills/kiyoshi-digger-msg-dds/

No over-unity claims. The subsystem is a lossy reorientation stage under energy conservation.
