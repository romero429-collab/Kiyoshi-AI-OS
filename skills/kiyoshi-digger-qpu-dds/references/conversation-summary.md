# Conversation summary — Kiyoshi Digger QPU DDS

Originating session: hybrid classical-quantum computer modeling for independent Kiyoshi hardware, starting from silicon spin-qubit TikTok (FFP EP 55) and the goal of 3D-printed structural/thermal infrastructure.

## Sequence

1. State-space definition \(\mathbf{x}_t = (q_t,c_t,m_t,p_t,\theta_t)\), composite \(F = F_\theta\circ F_P\circ F_M\circ F_C\circ F_Q\), stability \(\rho(J_F)<1\).
2. Heterogeneous agents: cryo-CMOS (C) and superconducting ribbon (I). Local maps and Lyapunov exponents \(\lambda_C,\lambda_I\).
3. DAC INL impact on exchange \(J(V)\propto e^{\lambda_J V}\). NbTiN material swap (higher \(T_c\), kinetic inductance, quench margin).
4. Strain effects \(\varepsilon\to L_k/\Gamma\) and cryo-CMOS calibration trim map.
5. Kinetic-inductance–strain coupling \(\chi_L\) and polyimide thermal contraction (Kapton vs PI-2611). Heat leak integral from measured \(k_{\rm PI}(T)\).
6. Phase-space geometry: attractors A1 (calibrated fixed point), A2 (periodic trim/sequencer), A3 (crisis exit). Bifurcations B1–B6.
7. Scrutiny: \(\chi_L\) and \(\lambda_J\) are bounds, not HRL coupon measurements. Tone: IEEE-traceable, analogies only for visualization of an already-written map.
8. Bluefors XLD1000sl numbers: MXC \(>30\,\mu\mathrm{W}\) at 20 mK, \(>1\,\mathrm{mW}\) at 100 mK; enhanced 4 K flange \(\sim 2\,\mathrm{W}\) at 4.5 K. Ribbon \(<10\,\mu\mathrm{W}\) occupies up to one-third of the 20 mK budget. Controller \(p^C\le 3.5\,\mathrm{W}\) sits near B5.
9. Step 4: projector \(\Phi\), discrete Newtonian analogy, real-time loop, five visual tests. Implemented in HTML.
10. Lyapunov details: discrete QR vs one-step log-norm proxy vs two-trajectory FTLE. True \(\lambda_1=\ln\rho(DF(\mathbf{y}^*))\approx -0.128\) on the smooth sheet.
11. QR algorithm stability conditions (smoothness, reorthogonalization, running-sum form, spectral gap). Fermi-surface topology of Si valleys and dirty-limit NbTiN.

## Design inequalities retained

\[
\lambda_J\sigma_{\rm INL}+|\Gamma(\varepsilon)|+\varepsilon_\chi < e^{-\lambda_C}-1,
\]
\[
p^C < \dot Q_{4{\rm K}}({\rm XLD1000sl}),\qquad q^{\rm th} < \dot Q_{\rm MXC}(20\,{\rm mK}).
\]

All claims are labeled as published specs or as \(\sim\) bounds. Empty-flange datasheet; loaded QPU reduces margins.
