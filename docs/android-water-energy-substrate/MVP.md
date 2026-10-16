# MVP Specification: Android Water-to-Energy Substrate

Minimal closed iteration:
- \(x_0 = (0.1, 0, 0, 0, 1, 0)^\top\)
- Parameter domain: \(g_A \in [0.1, 5.0]\) where \(\lambda_1\) changes sign near \(g_A \approx 1.5\)
- Scheme: discrete Euler step with \(\Delta t = 0.01\), local truncation \(O(\Delta t^2)\)
- Convergence: trajectory enters \(\epsilon=10^{-3}\) ball of fixed point
- Risk: \(\partial x_{t+k}/\partial x_t \approx e^{k\lambda}\)
- Error bound \(\|e_t\| \le 0.05\), recovery by damping
- Fault: single perturbation at t=0 recovers if \(\lambda_e < 0\)

Decomposition for extensions: couple to Kiyoshi kernel via Blackboard interface.