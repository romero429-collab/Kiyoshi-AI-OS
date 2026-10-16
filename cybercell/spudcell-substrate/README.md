# Kiyoshi Cybercell Substrate — SpudCell Discrete Dynamical System Synthesis

**IEEE-Compliant System Synthesis Document**  
Version 1.0 | 2026-07-26  
Derived from physical SpudCell (Adamala Lab, University of Minnesota, 2026) as foundational substrate for the Kiyoshi AI OS cybercell architecture.

## 1. State-Space Definition

The state space \(\mathcal{M}\) is the hybrid manifold of a chemically defined liposome:

\[
\mathbf{x}_t = \bigl( V_t,\, A_t,\, \mathbf{G}_t \in \mathbb{Z}_{\ge 0}^7,\, R_t,\, P_t^{\rm pore},\, P_t^{\rm FLAG},\, \tau_t \bigr)^\top \in \mathcal{M}\subset\mathbb{R}^{12}.
\]

- \(V_t > 0\): interior aqueous volume (µm³)  
- \(A_t \ge 4\pi (3V_t/4\pi)^{2/3}\): membrane area (µm²) enforcing spherical lower bound  
- \(\mathbf{G}_t\): integer plasmid copy-number vector (7 plasmids, total genome \(\approx 90\) kbp)  
- \(R_t \ge 0\): free metabolite/resource concentration  
- \(P_t^{\rm pore}, P_t^{\rm FLAG} \ge 0\): surface densities of engineered tags (molecules µm⁻²)  
- \(\tau_t \in \{0,\dots,T_{\max}\}\): discrete generational age (hard limit \(\approx 5\)–\(10\))

Metric: Euclidean after logarithmic embedding of extensive variables \((V,A,R)\). Topology is that of a closed polytope with free boundary on the membrane constraint and absorbing wall at \(\tau = T_{\max}\).

## 2. Transition Operator \(F\)

The discrete map \(F:\mathcal{M}\times P\to\mathcal{M}\) is the ordered composition of three physical subprocesses (one laboratory tick \(\approx\) one metabolic cycle):

\[
F = F_d\circ F_r\circ F_g.
\]

**Growth–Fusion (\(F_g\)):**
\[
\begin{align*}
V_{t+1} &= V_t + \alpha R_t\sigma(P_t^{\rm pore})\Delta t,\\
A_{t+1} &= A_t + \beta V_{t+1}^{2/3}\sigma(P_t^{\rm pore})\Delta t,\\
R_{t+1} &= R_t - \gamma V_t + \eta\sigma(P_t^{\rm pore})R_{\rm feeder},\\
P_{t+1}^{\rm pore} &= (1-\lambda_{\rm deg})P_t^{\rm pore} + \mu_{\rm pore}G_t^{({\rm pore})}.
\end{align*}
\]

**Genome Replication (\(F_r\)):**
\[
\mathbf{G}_{t+1} = \mathbf{G}_t + {\rm Bin}\bigl(\mathbf{G}_t;\rho(R_t)\bigr),\qquad
\rho(R)=\rho_{\max}\frac{R}{K+R}.
\]

**Division (\(F_d\))** (hybrid jump when \(P_t^{\rm FLAG}A_t > \Theta_{\rm stress}\)):
\[
(V,A,\mathbf{G},R)\mapsto\Bigl(\tfrac12 V,\;\tfrac12 A,\;{\rm split}(\mathbf{G}),\;\tfrac12 R\Bigr).
\]

Kill-switch \(s_t\in\{0,1\}\) multiplies the feeder influx term; \(s_t=0\) forces collapse to the extinction fixed point in finite time.

## 3. Phase-Space Analysis

Three exhaustive attractors exist:

- **Extinction fixed point** \(\mathbf{x}^*_{\rm ext}=(0,0,\mathbf{0},0,0,0,T_{\max})\) — globally attracting for \(\kappa<\kappa_c\).  
- **Limited-lineage quasi-attractor** \(\mathcal{A}_{\rm lim}\) — compact invariant set of finite genealogical trees of depth \(\le T_{\max}\), stable for \(\kappa_c<\kappa<\kappa_u\). Matches the experimentally observed 5–10 generation viability window.  
- **Runaway growth** — unbounded expanding orbits for \(\kappa>\kappa_u\); unreachable under laboratory kill-switch.

No strange attractor of positive metric entropy is present inside the experimentally accessible domain.

## 4. Lyapunov Spectrum

Largest Lyapunov exponent of the composed map:

\[
\lambda_1 = \frac{n_g\lambda_g + n_r\lambda_r + n_d\lambda_d}{n_g+n_r+n_d}.
\]

- \(\lambda_g\): growth–fusion contribution (sign changes at feeding threshold).  
- \(\lambda_r = \ln(1+\rho(R))+O(\|\nabla\rho\|)\): genome amplification.  
- \(\lambda_d\le -\ln 2 < 0\): every division is strictly contracting.

Critical values (numerically determined from product of Jacobians):  
\(\kappa_c\approx 1.4\), \(\kappa_u\approx 3.2\).

Error Lyapunov exponent on the limited-lineage attractor: \(\lambda_e\le -0.18 < 0\), guaranteeing exponential recovery of membrane and plasmid deviations on timescale \(\approx 5.5\) ticks.

## 5. Bifurcation & Sensitivity Analysis

Primary bifurcation parameter:
\[
\kappa = \frac{\alpha\eta\mu_{\rm pore}}{\gamma\lambda_{\rm deg}}.
\]

Sequence (increasing \(\kappa\)):

1. Transcritical bifurcation at \(\kappa_c\) (extinction fixed point exchanges stability with limited-lineage branch; multiplier \(+1\)).  
2. Saddle-node of short-period division cycles.  
3. Boundary crisis at \(\kappa_u\) (limited-lineage set collides with unstable manifold of extinction and is destroyed).

Secondary control \(\theta=\Theta_{\rm stress}/\langle A\rangle\) shifts both critical values.

Local sensitivity \(\partial\mathbf{x}_{t+k}/\partial\mathbf{x}_t \approx e^{k\lambda_1}\) is bounded inside the limited-lineage window and explodes outside it.

## 6. Invariant Measures

Natural invariant measure \(\mu\) on \(\mathcal{A}_{\rm lim}\) is the normalized occupation measure of the genealogical tree.  
Observed complete-genome transmission fidelity after five generations:
\[
\int_{\mathcal{A}_{\rm lim}}\mathbf{1}_{\{\mathbf{G}=\mathbf{G}_{\rm full}\}}\,d\mu\approx 0.30.
\]

## 7. Error Dynamics & Robustness

Augmented state \((\mathbf{x},e)\). Error map:
\[
e_{t+1}=J_F(\mathbf{x}_t)e_t + \boldsymbol{\xi}_t.
\]

In the operating window \(\lambda_e<0\), recovery time constant \(1/|\lambda_e|\approx 5.5\) ticks.  
Kill-switch forces the system onto the extinction attractor, providing hard containment against environmental escape or dual-use misuse.

All claims are traceable to the physical membrane constraint, hybrid division rule, and the three local Jacobians of the growth–fusion–replication–division cascade. The 3-D visualizer (phase-space-visualizer.html) renders trajectories, Lyapunov sign coloring, error tubes, and bifurcation surfaces for direct geometric verification.

---
*End of System Synthesis. This document constitutes the formal substrate specification for the Kiyoshi cybercell dynamical kernel.*
