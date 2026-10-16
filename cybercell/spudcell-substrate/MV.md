# MV — Model-Verification Mapping  
Kiyoshi Cybercell Substrate (SpudCell DDS)

Traceability matrix mapping every functional and non-functional requirement of the cybercell substrate onto concrete, reproducible verification experiments on the discrete dynamical system.

| Requirement ID | Requirement Statement | Verification Method | Experiment Description | Acceptance Criterion | Seed / Tolerance |
|---------------|-----------------------|---------------------|------------------------|----------------------|------------------|
| R1 | State space \(\mathcal{M}\) respects physical membrane constraint | Forward trajectory integration | Integrate 100 random initial conditions; assert \(A_t\ge 4\pi(3V_t/4\pi)^{2/3}\) at every step | 100 % compliance | seed=42, tol=1e-9 |
| R2 | Limited-lineage attractor exists for \(\kappa\in(\kappa_c,\kappa_u)\) | Attractor reconstruction + age histogram | 50 lineages; record generation depth at extinction | Mean depth \(\in[5,10]\) | seed=42 |
| R3 | \(\lambda_1\) changes sign at \(\kappa_c\approx1.4\) and \(\kappa_u\approx3.2\) | Twin-trajectory Lyapunov estimation | Two nearby trajectories, \(\delta x_0=10^{-8}\); compute finite-time \(\lambda\) vs \(\kappa\) | Sign change within \(\pm0.1\) of predicted critical values | seed=42, horizon=40 |
| R4 | Every division is contracting (\(\lambda_d\le-\ln2\)) | Saltation-matrix spectral radius | 200 division events; compute \(\|S\|\) | \(\|S\|\le0.5+\varepsilon\) | seed=42, \(\varepsilon=1e-4\) |
| R5 | Error Lyapunov \(\lambda_e\le-0.18\) inside operating window | Fault-injection + recovery measurement | Impulse \(\delta V=0.3\) at \(t=0\); measure return time | Mean recovery \(\le6\) ticks | seed=42 |
| R6 | Kill-switch forces extinction | Parameter sweep with \(s_t=0\) | 30 trajectories under forced \(s=0\) | All reach \(\|x\|<10^{-3}\) in \(\le15\) ticks | seed=42 |
| R7 | Complete-genome fidelity \(\approx0.30\) after 5 generations | Monte-Carlo inheritance statistics | 500 lineages; count full \(\mathbf{G}\) transmission | Fidelity \(\in[0.25,0.35]\) | seed=42 |
| R8 | Visualizer trajectories match mathematical claims | Direct observation of five visual tests (see visualizer) | Operator inspection of rendered phase space, error tubes, bifurcation surface | All five tests pass by eye and by logged numeric values | N/A |

All experiments are deterministic given the stated seed.  
Any claim of stability, chaos, or recovery that cannot be reproduced by one of the above methods is rejected.

This matrix constitutes the complete verification basis for acceptance of the SpudCell-derived cybercell substrate into the Kiyoshi dynamical kernel.
