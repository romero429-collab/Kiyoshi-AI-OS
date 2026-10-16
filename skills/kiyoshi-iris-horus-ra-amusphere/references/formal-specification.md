# Formal Mathematical Specification — Iris Local-Layer Horus–Ra Amusphere

## State Space

\[
\mathbf{x}_t \in \mathcal{M} \subset \mathbb{R}^d, \quad
\mathbf{x}_t = (\mathbf{a}_t, \mathbf{r}_t, \mathbf{s}_t, \mathbf{i}_t, \mathbf{h}_t, \mathbf{q}_t)
\]

Admissible polytope \(\mathcal{P} = \{\mathbf{x} : \mathbf{A}\mathbf{x} \le \mathbf{b}\}\) encodes KSBP protected-boundary constraints of Phase 0.

## Composite Map

\[
\mathbf{x}_{t+1} = F(\mathbf{x}_t) = F_6\circ F_5\circ F_4\circ F_3\circ F_2\circ F_1(\mathbf{x}_t)
\]

Local-layer reduction holds Anise/Red Clover/AirSync/Iris at contracting fixed points; only Horus–Ra twin \(\mathbf{z}_t = (\mathbf{h}_t, \mathbf{q}_t)\) advances.

## Local Lyapunov Spectrum (Twin)

\[
\lambda_Z^{\max}(T) = \frac1T \log \sigma_1\bigl(J_Z(T)\bigr)
\]

Error-cone radius:
\[
\rho_{\mathrm{cone}}(t) = \rho_0 \exp(\lambda_Z^{\max}\, t)
\]

## Environmental Field Dynamics

Volumetric density evolves by discrete continuity + Lyapunov source:
\[
\rho_{t+1}(\mathbf{r}) = \mathcal{A}[\rho_t](\mathbf{r}) + \Delta t \cdot \mathcal{S}(\mathbf{z}_t, \lambda_Z^{\max}, \kappa, \beta)
\]
where \(\mathcal{A}\) is upwind advection under the force field \(-\lambda_Z^{\max}\mathbf{p}\) and \(\mathcal{S}\) is the Ra contraction / AirSync noise term. Density is clamped to \([0.02, 1.0]\).

Color field:
\[
t = \mathrm{clamp}\bigl((\lambda_Z^{\max} + 0.35)/0.7, 0, 1\bigr), \quad
\mathrm{RGB} = (0.1+0.85t,\; 0.18+0.12(1-t),\; 0.85-0.7t)
\]

## Stability Condition

Asymptotic stability of the local core holds if and only if \(\lambda_Z^{\max} < 0\) and \(\rho(J_F) < 1\). Positive exponents produce the period-doubling cascade and bounded strange attractor inside \(\mathcal{P}\).

All visual elements in the browser simulator are direct projections of these mathematical objects.
