# Conversation Summary — Kiyoshi Edge Mesh + LoRa DDS
Date: 2026-09-24 (session), persisted 2026-10-16

## Source
Claude described the hardware arc: start with keychain Charm that proves the substrate at small scale, then scale to smart-home devices, robots, drones. Each runs Kiyoshi locally, meshes with peers, goes online only on its own terms. Contrast with cloud-dependent robots that go dark if the company folds. Later: biological processors, substrate-agnostic computation. Core principle: intelligence at the edge.

User added: connect a LoRa radio system so communication devices are in the mesh.

## Modeling (dds-chaos-architect Steps 1–4)

### Step 1 — State and map
State \(\mathbf{x}=(s,c,\mu,\kappa,a)^\top\).
Composite \(F=F_a\circ F_\kappa\circ F_\mu\circ F_c\circ F_s\).
Offline fixed point \(\kappa^*=0, a^*=1\). Spectral-radius condition for stability of edge-owned regime.

### Step 2 — Classes
Charm, Home, Robot, Drone differ by \(\delta_c^{(i)}\), \(\beta_\mu^{(i)}\). Local finite-time Lyapunov. Charm most fragile (thermal + low duty). Promotion only if \(\lambda_1^{(i)}<0\).

### Step 3 — Attractors and bifurcations (with LoRa)
LoRa \((\mathrm{SF},D,S,\chi)\) parameterizes \(\beta_\mu\).
- Type I: stable fixed point on \(\kappa=0,a=1\).
- Type II: period-\(P=\lceil1/D\rceil\) LoRa duty-cycle orbit.
- Type III: mesh over-coupling cascade or cloud phone-home.
Bifurcation sequence: substrate fold → autonomy saddle-node → mesh period-doubling → crisis → cloud transcritical at \(\rho_\kappa=1\).

### Step 4 — 3-D simulation
Projector \(\Phi:(c,\mu,\kappa)\). Newtonian particle trails, twin trajectories, error tube, Lyapunov coloring. Five visual verification tests. Self-contained Three.js harness.

## Artifacts
- edge-mesh-lora/phase-space-visualizer.html
- skills/kiyoshi-edge-mesh-lora-dds/

## Physical reading
Negative largest Lyapunov = exponential return to edge-owned meshed body of any size. Multiplier >1 on \(\kappa\) = device cannot exist if company folds. Scale is slaved to proven local contraction.
