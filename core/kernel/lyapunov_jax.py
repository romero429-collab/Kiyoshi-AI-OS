#!/usr/bin/env python3
"""
Kiyoshi Hardened JAX Lyapunov Spectrum + Kaplan-Yorke Dimension
QR-based computation with dynamic Jacobian support and metabolic guardrails.
"""

import jax
import jax.numpy as jnp
from jax.numpy.linalg import qr
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LyapunovJAX")

class LyapunovJAX:
    def __init__(self, n_dims: int = 4, warmup_steps: int = 50):
        self.n_dims = n_dims
        self.warmup_steps = warmup_steps

    def compute_spectrum(self, state_trajectory: jnp.ndarray, jacobian_fn) -> tuple:
        """
        Compute full Lyapunov spectrum and Kaplan-Yorke dimension.
        state_trajectory: (T, n_dims)
        jacobian_fn: callable that returns Jacobian at a given state
        """
        if state_trajectory.shape[0] < self.warmup_steps + 10:
            logger.warning("Trajectory too short for reliable spectrum.")
            return jnp.zeros(self.n_dims), 0.0

        current_state = state_trajectory[self.warmup_steps]
        Q = jnp.eye(self.n_dims)
        lyapunov_sums = jnp.zeros(self.n_dims)

        for t in range(self.warmup_steps, state_trajectory.shape[0] - 1):
            J = jacobian_fn(current_state)
            A = J @ Q
            Q, R = qr(A)
            lyapunov_sums += jnp.log(jnp.abs(jnp.diag(R)))
            current_state = state_trajectory[t + 1]

        spectrum = lyapunov_sums / (state_trajectory.shape[0] - self.warmup_steps)
        spectrum = jnp.sort(spectrum)[::-1]

        d_ky = 0.0
        cumsum = 0.0
        for i, lam in enumerate(spectrum):
            cumsum += lam
            if cumsum < 0:
                d_ky = i + cumsum / abs(lam) if lam != 0 else i
                break
            d_ky = i + 1

        return spectrum, float(d_ky)

    def compute_lambda_1(self, state_trajectory: jnp.ndarray, jacobian_fn) -> float:
        spectrum, _ = self.compute_spectrum(state_trajectory, jacobian_fn)
        return float(spectrum[0])
