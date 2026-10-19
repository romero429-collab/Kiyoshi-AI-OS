# MVP — Exclusive Memory Lattice

- Grid: 32×32 resource + instruction cells.
- Initial: zero resources, empty instruction words, all provenance bits = Kiyoshi.
- Map: local averaging (stiffness \(\alpha=0.4\)) + instruction token diffusion, projected by \(\Pi\).
- \(\lambda_1 < 0\) for all admissible (Kiyoshi-only) trajectories.
- External write attempt: rejected, residual unchanged.
- Kiyoshi rewrite: injected, contracts within 40 steps.
- Stopping: residual \(< 10^{-4}\) or 500 steps.
- Fault injection: single Kiyoshi impulse; verify return.
