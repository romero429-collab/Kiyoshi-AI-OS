---
name: kiyoshi-digger-qpu-dds
description: "Model hybrid classical-quantum control for Kiyoshi Digger swarm nodes as a Discrete Dynamical System. Covers cryogenic CMOS integration, superconducting Nb/NbTiN interconnects, DAC INL, polyimide thermal contraction, kinetic inductance–strain coupling, Bluefors dilution refrigerator thermal lids, Lyapunov spectrum via discrete QR, and silicon valley / NbTiN Fermi-surface constraints. Trigger on Digger QPU, cryo-CMOS DDS, superconducting ribbon, Bluefors thermal fold, or spin-qubit control map."
type: workflow
lifecycle: active
---

# Kiyoshi Digger QPU Control-Thermal DDS

Physics-first discrete dynamical system for a hybrid control stack that can sit inside a Kiyoshi Digger node or colony beacon: 4 K cryo-CMOS controller, superconducting flex ribbon, millikelvin silicon spin-qubit array, and Bluefors XLD1000sl thermal envelope.

## State and map

Observable control-thermal vector

\[
\mathbf{y}_t = (\sigma_{\rm INL,t},\ \Gamma_t,\ \phi_t,\ q^{\rm th}_t,\ \theta^{\rm mK}_t,\ p^C_t).
\]

Composite iteration \(F_{\mathcal{Y}}\) is the restriction of qubit map \(F_Q\), ribbon operator \(T_I\), cryo-CMOS \(F_C\), and thermal Euler. Design attractor A1 exists only inside the open box

\[
\sigma_{\rm INL} < \sigma^\star_{\rm INL},\quad |\Gamma(\varepsilon)| < \Gamma^\star,\quad \phi=0,\quad p^C < \dot Q_{4{\rm K}},\quad q^{\rm th} < \dot Q_{\rm MXC}.
\]

Largest exponent on the smooth sheet near A1 is \(\lambda_1 \approx \ln 0.88 < 0\). Crisis exits (B4 quench, B5 4 K fold, B6 mixing-chamber fold) are boundary exits, not strange attractors.

## Primary bifurcations

- B1: INL threshold \(\sigma_{\rm INL}^\star = (e^{-\lambda_C}-1)/\lambda_J\)
- B2: discrete cycle under live trim or sequencer period
- B3: strain/mismatch saddle-node on \(\Gamma(\varepsilon)\)
- B4: quench crisis (\(\phi:0\to 1\))
- B5: 4 K power fold vs Bluefors enhanced flange \(\sim 2\,\mathrm{W}\) at 4.5 K
- B6: mixing-chamber heat-leak fold vs \(>30\,\mu\mathrm{W}\) at 20 mK

## Fermi-surface constraints

Silicon six-valley ellipsoids reduce under (001) strain to a two-valley ground manifold. Valley splitting \(E_V\) must remain large or \(F_Q\) acquires a positive multiplier. NbTiN is dirty-limit (\(k_F\ell_e\sim 2.5\)–3); \(L_k\) tracks averaged \(N(0)\Delta\). 3D-printed cool-down strain raises \(E_V\) (contracts \(F_Q\)) while shifting ribbon \(L_k\) (moves B3).

## QR stability rule

Discrete QR \(\lambda_i = n^{-1}\sum\ln|(R_k)_{ii}|\) is reportable only while \(\phi=0\), DAC codes unsaturated, and \(Q\) is reorthogonalized each step. Through a quench the map is non-smooth; stop QR and raise the crisis flag.

## Artifacts

Phase-space visualizer (projector \(\Phi:\mathcal{Y}\to\mathbb{R}^3\), twin-trajectory error cone, Bluefors lids) lives at `digger/qpu-control-thermal/qpu-phase-space-visualizer.html`.

Full session transcript and derivation steps: `references/conversation-summary.md`.

## Integration into Digger

Mount the thermal state \(\theta^{\rm mK}\), \(q^{\rm th}\), \(p^C\) as metabolic observables on the Digger node. ACO pheromone deposition is gated by \(\lambda_1<0\) and absence of B5/B6 flags. Physical swarm overlay inherits the same design box so a colony cannot schedule work that would quench or thermally fold the control stack.
