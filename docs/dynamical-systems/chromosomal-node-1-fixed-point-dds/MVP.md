# MVP Specification — Chromosomal Node 1 Contraction Mapping

**Minimal Verifiable Prototype**

## Core Iteration

```python
import numpy as np

def F(x, y, r, lam, eps):
    """Quadratic map realizing the prescribed Jacobian at origin."""
    xn = r * x + eps * y - x**2
    yn = lam * y + eps * x - y**2
    return xn, yn
```

## Numerical Safeguards

- Clamp each coordinate to the interval \([-10,10]\) after every iteration to prevent overflow.
- If \(\|\mathbf{x}\|_2 > 50\) reset the trajectory to a random point inside the unit ball (graceful recovery).
- Adaptive parameter projection: if a slider move causes \(|\mu_{\max}| \ge 1\), freeze the offending parameter and display status “MARGINAL / CHAOTIC”.

## Minimal Fault-Injection Test

1. Integrate 500 steps from \(\mathbf{x}_0 = (10^{-4},10^{-4})\) with parameters satisfying \(|\mu_{\max}| < 0.9\).
2. Inject a one-step additive perturbation of magnitude \(10^{-3}\) at step 250.
3. Verify that the subsequent trajectory returns to a ball of radius \(10^{-5}\) within 80 further iterations (predicted by \(\lambda_1\)).

## Decomposition Protocol for Extensions

- Step A: Uncoupled scalar logistic (\(r\) only) — already verified.
- Step B: 2-D linear coupling (\(\varepsilon\)) — current MVP.
- Step C: Full quadratic terms + inter-node mesh (future Phase 2).

All subsequent nodes inherit this exact local map as their baseline before mesh activation.
