# System Synthesis: PI Surveillance Pattern-of-Life DDS

**IEEE-Compliant Discrete Dynamical System Analysis**  
**Document ID:** PI-SURV-POL-DDS-2026-10-22  
**Classification:** Temporal Tracking and Alert Contraction on Multi-Camera RTSP Face Streams

## 1. State-Space Definition

Extends the Hikvision RTSP multi-process face recognition system. Per-camera process state augmented with temporal pattern-of-life vector:  
\[
\mathbf{x}_n^{(i)} = (c_n, d_n, k_n, t_n, m_n, a_n, p_n)^\top
\]
where \(a_n \in \{0,1\}\) is arrival/departure alert flag, \(p_n \in [0,1]\) is pattern-of-life consistency score (occupancy probability over recent window). Global product space remains process-isolated. SCRFD+ArcFace provide identity tracks; multi-frame confirmation feeds \(k_n\); missing video features addressed by temporal aggregation and alert generation.

## 2. Transition Operator \(F\)

\[
\begin{aligned}
c_{n+1} &= \min(1, c_n + \alpha \mathbf{1}_{c_n<0.5}) \\
d_{n+1} &= \mathrm{clip}(d_n + \eta - \gamma m_n, 0, 2) \\
k_{n+1} &= 
\begin{cases}
\min(K_{\max}, k_n+1) & m_n=1 \land c_n>0.8 \land t_n=0 \\
0 & \text{else}
\end{cases} \\
t_{n+1} &= \max(0, t_n-1 + T_{\mathrm{cd}}\mathbf{1}_{k_n\ge K}) \\
m_{n+1} &= \mathbf{1}_{d_{n+1}<\theta} \\
a_{n+1} &= \mathbf{1}_{k_n \ge K \land \text{edge detection on occupancy}} \\
p_{n+1} &= (1-\rho_p) p_n + \rho_p \cdot \mathbf{1}_{m_n=1}
\end{aligned}
\]
Alerts fire on sustained match (set-and-forget departure/arrival). Pattern score contracts toward observed occupancy. Unknown capture and daily logs remain external. Multi-camera correlation via shared identity embeddings across processes (light interface map).

## 3. Phase-Space Analysis

Attractors: healthy monitoring (\(c^*=1\), \(p^*\) matching true occupancy, \(a^*=0\) between events). Alert is a transient spike that contracts after cooldown. Multi-face same-frame and temporal confirmation increase basin of true-positive tracks.

## 4. Lyapunov Spectrum

Largest exponent negative when confirmation threshold \(K\ge 3\) and pattern contraction rate \(\rho_p > 0\), ensuring asymptotic stability of false-alert suppression (Banach contraction on alert trajectories). Process isolation preserves independent spectra.

## 5. Bifurcation & Sensitivity

Increasing embedding noise or lowering \(\theta\) can produce intermittent alerts (bifurcation of \(a_n\)). Visualizer explores occupancy pattern and alert rate.

## 6. Invariant Measures

Under contraction, Dirac measure on consistent pattern-of-life state. Alerts form a contracting transient set.

## 7. Error Dynamics & Robustness

Occupancy error \(e_p = p - p^*\) contracts at rate \(1-\rho_p\). Recovery bounded by \(1/|\lambda_1|\). Auto-reconnect, process restart, and multi-frame reduce sensitivity to single-frame failures. Addresses video features: persistent tracking, set-and-forget monitoring, residence verification via pattern score.

## Verification Reference

Observable in `phase-space-visualizer.html`: contracting pattern score, alert spikes that decay, live \(\lambda_1 < 0\) in stable monitoring.
