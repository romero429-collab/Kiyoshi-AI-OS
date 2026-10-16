---
name: kiyoshi-octonion-nonassociativity-dds
description: Use for modeling octonion algebra and its non-associativity (associator [a,b,c]) as a discrete dynamical system on the real 8D embedding of O. Analyzes Lyapunov spectrum of left-multiplication, associator error contraction, and higher-order sensitivity. Trigger on octonions, non-associativity, associator, S7, or exceptional algebras inside Kiyoshi.
---

# Kiyoshi Octonion Non-associativity DDS

Maps the non-associative octonion algebra to a discrete dynamical system on \(\mathbb{R}^8 \cong \mathbb{O}\).

## Core Protocol
1. Represent octonions as 8-vectors. Realize left-multiplication via the Fano-plane multiplication table.
2. Define iteration \(F(\mathbf{x}) = \gamma L(w)\mathbf{x}\). Largest Lyapunov exponent \(\lambda_1 = \ln|\gamma|\).
3. Track the associator error \(e = (ab)c - a(bc)\). Error contracts exponentially for \(\gamma < 1/\sqrt{2}\).
4. Alternative property guarantees that any two elements generate an associative subalgebra (isomorphic to \(\mathbb{H}\)).

## Artifacts
Emits System Synthesis, MVP with renormalization and associator fault-injection, multiplication engine, verification matrix, and 3D visualizer of projected imaginary trajectories with associator-norm monitoring.
