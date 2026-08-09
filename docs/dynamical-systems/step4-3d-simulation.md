# Step 4 — 3D Real-Time Simulation Specification (Kiyoshi × MH-FLOCKE)

Observable projector \(\Phi^{\rm K}:\mathcal{M}^{\rm K}\to\mathbb{R}^3\):

\[
\Phi^{\rm K}(\mathbf{x}_t^{\rm K}) = \bigl(x_{\rm res}(t),\; y_{\rm att}(t),\; z_{\rm saf}(t)\bigr)
\]

where the three coordinates are:
- \(x_{\rm res}\): normalized runtime resource utilization,
- \(y_{\rm att}\): attentional / Global-Workspace competition intensity,
- \(z_{\rm saf}\): constitutional safety / consistency residual.

Secondary visual channels encode local Lyapunov sign (particle color), predictive-error magnitude (particle size), and plasticity rate (trail length).

Discrete Newtonian analogy: each particle (representing an agent, tool, or process) obeys

\[
\begin{align*}
\mathbf{p}_{t+1} &= \mathbf{p}_t + \mathbf{u}_t\,\Delta t,\\
\mathbf{u}_{t+1} &= \mathbf{u}_t + \mathbf{f}^{\rm K}(\mathbf{x}_t^{\rm K})\,\Delta t,
\end{align*}
\]

where the force field \(\mathbf{f}^{\rm K}\) is the projection of the composite map \(F^{\rm K}\) onto the three observable degrees of freedom.

Exact real-time loop pseudocode:

```
initialize state x0_K, particles P, constitutional bounds, parameters αK,ηK,kcerK,gnmK,βK
while simulation_running:
    x_{t+1}_K ← F^K(x_t_K)                 # full 15-step closed-loop map
    for each particle p in P:
        p.pos ← Φ^K(x_{t+1}_K)
        p.color ← sign(λ_local(x_{t+1}_K))  # red = positive LE, blue = negative
        p.size  ← |prediction_error|
    update geometry (agents, tools, resource bars, constitution boundary)
    render frame
    if user_adjusts(bifurcation_param):
        recompute local Jacobians and Lyapunov spectrum
        clamp to constitutional polytope
    t ← t+1
```

Five visual verification tests (must match mathematical predictions of Steps 1–3):

1. Quiescent fixed-point regime (αK=0, low gains): all particles converge to a static constitutionally-safe configuration; no color flicker (all λk<0).
2. Orchestration orbit regime (calibrated αK): particles trace closed periodic trajectories whose period equals the scheduler cycle; blue (contracting) coloration dominates.
3. Period-doubling cascade (increasing ηK): trajectories successively double their period; intermittent red flashes appear at the bifurcation points.
4. Strange-attractor crisis (high ηK or high gnmK outside constitutional bounds): trajectories fill a fractal volume; persistent red coloration.
5. Predictive / drive interaction: toggling βK while holding kcerK fixed produces a measurable change in trajectory smoothness and particle size (error amplitude), exactly as predicted by the secondary Hopf.

All visual primitives and stability claims are one-to-one traceable to the state-space definition, local maps, Jacobians, and bifurcation conditions of the preceding steps and to the 12-article constitution.
