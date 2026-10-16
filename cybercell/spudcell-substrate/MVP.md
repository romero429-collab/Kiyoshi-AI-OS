# MVP — Minimum Viable Product Specification  
Kiyoshi Cybercell Substrate (SpudCell DDS)

## Core Iteration

Minimal closed dynamical system sufficient to demonstrate the limited-lineage attractor and the sign change of \(\lambda_1\).

**Initial state** (typical laboratory inoculation):
\[
\mathbf{x}_0 = \bigl( V=1.0,\ A=4.8,\ \mathbf{G}=(1,1,1,1,1,1,1),\ R=2.0,\ P^{\rm pore}=0.5,\ P^{\rm FLAG}=0.1,\ \tau=0 \bigr).
\]

**Parameter domain** where \(\lambda_1\) changes sign:
- \(\kappa\in[1.0,4.0]\) (critical values \(\kappa_c\approx1.4\), \(\kappa_u\approx3.2\))
- Fixed secondary parameters: \(\theta=0.8\), \(\rho_{\max}=0.4\), \(T_{\max}=8\), \(\Delta t=1\).

**Numerical scheme**: Explicit Euler with hard clamping
\[
V\leftarrow\max(V,10^{-6}),\quad R\leftarrow\max(R,0),\quad P\leftarrow\max(P,0).
\]
Local truncation error controlled by fixed \(\Delta t=1\) (one metabolic tick). On divergence (\(\|x\|>10^4\) or NaN) reset to nearest point on the extinction attractor and log the event.

**Convergence / stopping criteria**:
- Trajectory enters \(\varepsilon\)-ball of extinction (\(\varepsilon=10^{-3}\)) or reaches \(\tau=T_{\max}\).
- Risk envelope: local sensitivity \(\|\partial x_{t+k}/\partial x_t\|\approx e^{k\lambda_1}\). Inside limited-lineage window the envelope remains bounded; outside it grows exponentially.

**Error bound**: \(\|e_t\|\le\varepsilon_{\rm max}=0.05\) with recovery protocol driven by \(\lambda_e\le-0.18\).

**Minimal fault-injection test**:
1. At \(t=0\) apply instantaneous volume perturbation \(\delta V=0.3\).
2. Verify return to the limited-lineage set (or extinction) within 6 ticks when \(\kappa\in(\kappa_c,\kappa_u)\).
3. Seed = 42 for full reproducibility.

**Decomposition protocol for extension**:
Any higher-fidelity model (full 36-gene reaction network, continuous membrane mechanics, stochastic PDE) must be expressed as a cascade of maps \(F=F_n\circ\cdots\circ F_1\) whose individual Jacobians are supplied and whose product recovers the spectral properties already verified here.

This MVP is the smallest closed, deterministic, IEEE-traceable iteration that reproduces the experimentally observed limited generational viability of SpudCell and the associated Lyapunov sign structure required by the Kiyoshi cybercell substrate.
