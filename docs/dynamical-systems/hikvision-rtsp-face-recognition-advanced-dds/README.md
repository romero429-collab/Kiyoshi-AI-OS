# System Synthesis: Advanced Multi-Face Hikvision RTSP Recognition DDS

**IEEE-Compliant Discrete Dynamical System Analysis**  
**Document ID:** RTSP-FACE-ADV-DDS-2026-10-19  
**Classification:** Multi-Face Per-Frame + Process Isolation with Embedding Multiplicity

## 1. State-Space Definition

Extends single-face model to multi-face detection per frame. Global state remains product of per-camera processes for isolation. Each process now carries a short buffer of recent embeddings:  
\[
\mathbf{x}_n^{(i)} = (c_n, \mathbf{d}_n, k_n, t_n, m_n, e_n)^\top
\]
where \(\mathbf{d}_n \in \mathbb{R}^M\) is vector of distances to top-M stored embeddings (multi-embedding per object), \(e_n\) is embedding residual error.

SCRFD multi-face + 5-point landmarks feed multiple ArcFace embeddings per frame. Separate process per RTSP ensures Lyapunov spectra remain decoupled.

## 2. Transition Operator \(F\)

Per-camera map (advanced):  
\[
\begin{aligned}
c_{n+1} &= \min(1, c_n + \alpha \mathbf{1}_{c_n<0.5} - \beta \mathbf{1}_{\mathrm{drop}}) \\
d_{n+1}^{(j)} &= \mathrm{clip}(d_n^{(j)} + \eta - \gamma m_n^{(j)}, 0, 2),\quad j=1\dots M \\
k_{n+1} &= k_n + \sum_j m_n^{(j)} \quad \text{if } c_n>0.8 \land t_n=0 \text{ else reset} \\
t_{n+1} &= \max(0, t_n-1 + T_{\mathrm{cd}} \mathbf{1}_{k_n \ge K}) \\
m_{n+1}^{(j)} &= \mathbf{1}_{d_{n+1}^{(j)} < \theta} \\
e_{n+1} &= (1-\rho) e_n + \sigma \xi_n
\end{aligned}
\]
Multi-frame confirmation aggregates over faces in the same frame. Unknown capture on high residual + no match. Daily log rotation and API retry are external. Auto-restart on process exit.

## 3. Phase-Space Analysis

Healthy attractor: \(c^*=1\), all \(d^{(j)*}\to 0\) for matching identity, \(k\) transient, \(t^*=0\), \(e^*\to 0\). Multi-face increases effective confirmation rate without coupling processes.

## 4. Lyapunov Spectrum

Largest exponent determined by confirmation gain and residual contraction rate \(\rho\). Negative when \(K\ge 3\) and multi-embedding reduces effective noise. Process isolation keeps spectra independent.

## 5. Bifurcation & Sensitivity

High residual \(\sigma\) or low \(\theta\) can push \(\rho(J)\ge 1\), increasing false-positive bursts. Visualizer varies these.

## 6. Invariant Measures

Dirac at healthy multi-embedding match under contraction. Cooldown + multi-frame create contracting false-alarm basin.

## 7. Error Dynamics & Robustness

Embedding error \(e_n\) contracts at rate \(1-\rho\). Recovery time \(O(1/|\lambda_1|)\). Isolation + auto-restart + reconnect provide robustness to RTSP failure.

## Verification Reference

`phase-space-visualizer.html` shows multi-trajectory contraction, live \(\lambda_1\), and multi-face effective rate.
