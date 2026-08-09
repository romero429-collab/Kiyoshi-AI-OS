# MV — Model-Verification Mapping  
**Traceability Matrix for Kiyoshi Atomic Cybercell**

| Requirement ID | Functional / Non-functional Claim | Verification Method | Expected Outcome | Seed / Tolerance |
|----------------|-----------------------------------|---------------------|------------------|------------------|
| R1 | Unique hyperbolic fixed point in operating regime | (a) Solve \(F(x)=x\) numerically; (b) Jacobian eigenvalues | All Re(\(\lambda\)) < 0 | seed=42, tol=1e-8 |
| R2 | \(\lambda_1\le-0.12\) | Two-trajectory Lyapunov estimation + QR method | \(\lambda_1<0\) for \(\alpha\in[0.05,0.30]\) | 10^4 random IC, seed=7 |
| R3 | Exponential error recovery \(\lambda_e=\lambda_1<0\) | Fault injection \(\|e_0\|_2=0.4\); measure residual | \(\|e\|_\infty<10^{-4}\) within 30 steps | seed=13 |
| R4 | No period-2 orbits inside resource ball | Direct substitution + contradiction | None found | analytic |
| R5 | Pitchfork bifurcation at \(\alpha_c\approx0.41\) | Parameter continuation | Supercritical pitchfork | step=0.001 |
| R6 | Invariant measure = Dirac at \(x^*\) | Attractor reconstruction from long trajectory | All points collapse to single location | N=5000 |
| R7 | Build configuration converges in ≤4 steps | Execute MK engine from all 16 Boolean starts | Fixed point \(c^*=(1,1,1,1)\) | exhaustive |
| R8 | Numerical robustness (NaN / divergence) | Inject extreme state \(\|x\|_2=10^6\); observe recovery | Reset to nearest attractor; continue | seed=99 |

All experiments are reproducible. Numeric logs reside in `verification-data/`. The accompanying 3-D visualizer implements methods (a), (b), (c) and the fault-injection protocol interactively.

---
*End of Model-Verification Mapping*
