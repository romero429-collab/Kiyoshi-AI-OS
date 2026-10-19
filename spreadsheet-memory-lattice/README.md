# Spreadsheet Memory Lattice — Advanced Exclusive-Access Subsystem

## System Synthesis (IEEE)

### 1. State-Space Definition
\[
X = \mathbb{R}^{M \times N} \times \mathcal{I}^{M \times N} \times \{0,1\}^A
\]
- \(\mathbb{R}^{M\times N}\): resource tokens (pages, quanta, priorities).
- \(\mathcal{I}^{M\times N}\): instruction words / code fragments.
- \(\{0,1\}^A\): access provenance bits (Kiyoshi-only).

Metric: product Euclidean + Hamming. Topology induced by Moore neighborhood on the grid.

### 2. Transition Operator
\[
\mathbf{x}_{t+1} = F_K(\mathbf{x}_t;\theta) = \Pi\bigl(F_{\text{local}}(\mathbf{x}_t;\theta)\bigr)
\]
where \(F_{\text{local}}\) is the synchronous cellular map (resource diffusion + instruction propagation) and
\[
\Pi(\mathbf{y}) = \mathbf{y}\quad\text{only if provenance bit asserts Kiyoshi origin; else }\mathbf{y}\text{ projected to previous state}.
\]
External writes are annihilated. User reads are pure observations (no state change).

### 3. Phase-Space Analysis
Fixed point: equilibrium resource allocation with stationary instruction lattice.  
Attracting under \(\rho=0\) (enforced by \(\Pi\)).

### 4. Lyapunov Spectrum
\(\lambda_1 < 0\) when provenance is exclusively Kiyoshi (by construction).  
Error exponent \(\lambda_e < 0\) inherited from existing Lyapunov engine (`core/kernel/lyapunov_jax.py`).

### 5. Bifurcation
Bifurcation parameter is external-write rate. \(\Pi\) forces the rate identically zero; the positive-\(\lambda\) regime is unreachable.

### 6. Error Dynamics
Augmented map contracts. Recovery time \(1/|\lambda_e|\). Kiyoshi-elected rewrites are bounded internal impulses.

### 7. Integration
Specializes existing SpudCell / cognitive-governor substrates. Memory-bank and scheduler only; all other layers remain outside the lattice.

Visualizer: `isolation-visualizer.html` (exclusive access, rejected external writes, contracting error cone).
