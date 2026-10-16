---
name: kiyoshi-sensorimotor-biped
description: Use for designing, implementing, or verifying the Kiyoshi Sensorimotor Biped architecture as a discrete dynamical system on dual-quaternion SE(3) manifolds with Protective Hull contraction mapping. Covers Jacobian-based operational-space torque control, Monte-Carlo certification under mechanical entropy, and isolation of motor error from the EC-DIS perceptual invariant measure.
---

# Kiyoshi Sensorimotor Biped

## Overview
Formalizes the bipedal effector as a dual-quaternion discrete dynamical system on SE(3). The Protective Hull enforces global contraction by modulating operational wrench attenuation from the dual error norm and actuation latency, guaranteeing that mechanical singularities and ground-reaction entropy cannot back-propagate into the Executive Core's invariant measure.

## Core Protocol
1. Represent effector state as unit dual quaternion \(\hat{q}_k \in \mathbb{D}\mathbb{H}_1\).
2. Propagate via dual Hamilton matrix \(\hat{\Omega}(\hat{\omega}_k, \Delta t)\).
3. Compute dual motor error \(\hat{e}_k = \hat{q}^{\rm true}_k \otimes (\hat{q}^*_k)^{-1}\).
4. Augment Protective Hull gain:
   \[
   \kappa(k) = \kappa_0 + \alpha \max(0, \lambda_1 + \beta_m \|\hat{e}_k\|_2 + \gamma_m \tau_m)
   \]
5. Map Cartesian error to joint torque via \(\tau = J^T F \cdot (\kappa_0 / \kappa(k))\).

## Invariants
- Dual norm preservation to machine precision.
- Motor error cone strictly bounded under stochastic backlash and ground-reaction latency.
- Zero cross-correlation between motor entropy and perceptual EC-DIS Lyapunov exponent.
- Composite spectral radius \(\rho(J) < 1\).

## Triggers
biped, dual quaternion, SE(3), torque control, Protective Hull, sensorimotor, kinematic singularity, operational space control.
