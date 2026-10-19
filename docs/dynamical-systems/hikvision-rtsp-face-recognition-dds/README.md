# System Synthesis: Hikvision RTSP Multi-Camera Face Recognition as Discrete Dynamical System

**IEEE-Compliant Discrete Dynamical System Analysis**  
**Document ID:** RTSP-FACE-DDS-2026-10-19  
**Classification:** Multi-Process Stability and Recognition Confirmation

## 1. State-Space Definition

The system is a collection of independent processes, one per RTSP camera, for stability under stream failure. Global state  
\[
\mathbf{X}_n = (\mathbf{x}_n^{(1)}, \dots, \mathbf{x}_n^{(N)}) \in X = (\mathbb{R}^5)^N
\]
where each camera process state is  
\[
\mathbf{x}_n^{(i)} = (c_n, d_n, k_n, t_n, m_n)^\top
\]
- \(c_n \in [0,1]\): RTSP connection health (1 = connected, 0 = reconnecting),  
- \(d_n \geq 0\): ArcFace embedding cosine distance to nearest known identity,  
- \(k_n \in \mathbb{N}_0\): multi-frame confirmation counter,  
- \(t_n \geq 0\): cooldown timer (frames remaining),  
- \(m_n \in \{0,1\}\): match flag (1 if distance below threshold).

SCRFD provides 5-point landmarks and detection boxes per frame; ArcFace produces 512-D embeddings. Multiple embeddings stored per object.

## 2. Transition Operator \(F\)

Per-camera iteration (decoupled processes):  
\[
\begin{aligned}
c_{n+1} &= \min(1, c_n + \alpha_{\mathrm{recon}} \cdot \mathbf{1}_{\mathrm{reconnect}} - \beta_{\mathrm{drop}} \cdot \mathbf{1}_{\mathrm{fail}}) \\
d_{n+1} &= \mathrm{clip}(d_n + \eta_{\mathrm{noise}} - \gamma_{\mathrm{match}} \cdot m_n, 0, 2) \\
k_{n+1} &= 
\begin{cases}
k_n + 1 & \text{if } m_n=1 \land c_n > 0.8 \land t_n=0 \\
0 & \text{if } m_n=0 \lor t_n > 0 \\
k_n & \text{otherwise}
\end{cases} \\
t_{n+1} &= \max(0, t_n - 1 + T_{\mathrm{cd}} \cdot \mathbf{1}_{k_n \ge K_{\mathrm{conf}}}) \\
m_{n+1} &= \mathbf{1}_{d_{n+1} < \theta_{\mathrm{arc}}}
\end{aligned}
\]
where \(\alpha_{\mathrm{recon}}, \beta_{\mathrm{drop}}, \eta_{\mathrm{noise}}, \gamma_{\mathrm{match}}, T_{\mathrm{cd}}, K_{\mathrm{conf}}, \theta_{\mathrm{arc}}\) are control parameters. Unknown faces trigger image capture when \(k_n\) reaches threshold and no match. Daily rotating logs are external side effects. API retry is exponential backoff on \(c_n\) recovery. Auto-restart on process death.

## 3. Phase-Space Analysis

Fixed point under healthy stream and consistent identity: \(c^*=1\), \(d^*=0\), \(k^*=0\) (after cooldown), \(t^*=0\), \(m^*=1\). Multi-face frames increase effective detection rate. Separate processes ensure one camera failure does not cascade (isolation of Lyapunov spectra).

## 4. Lyapunov Spectrum

Local Jacobian of the confirmation subsystem (linearized around threshold crossing) has largest eigenvalue magnitude controlled by the confirmation increment and cooldown. Negative largest Lyapunov exponent when multi-frame confirmation \(K_{\mathrm{conf}} \ge 3\) and cooldown active, guaranteeing asymptotic stability of false-positive suppression. Connection health has independent spectrum; reconnection rate yields \(\lambda_c < 0\) under RTSP auto-reconnect.

## 5. Bifurcation & Sensitivity

Increasing noise \(\eta_{\mathrm{noise}}\) or decreasing threshold \(\theta_{\mathrm{arc}}\) can drive \(\rho(J) \ge 1\), producing intermittent false positives (period-doubling-like confirmation failures). Visualizer explores this via sliders.

## 6. Invariant Measures

Under contraction conditions the unique attractor is the healthy confirmed-match state. Cooldown and multi-frame create a transient basin that contracts false alarms.

## 7. Error Dynamics & Robustness

Error in embedding distance \(e_d = d - d^*\) contracts when match probability exceeds noise. Recovery time bounded by \(1/|\lambda_1|\). Process isolation + auto-restart provides robustness; unknown capture is a side-channel sink.

## Verification Reference

Observable in `phase-space-visualizer.html`. Contracting regimes show decaying confirmation counters after true match and suppressed duplicates via cooldown.
