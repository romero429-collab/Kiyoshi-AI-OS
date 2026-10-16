---
name: kiyoshi-v1-kimi-runtime
description: Kiyoshi v1 Kimi-style React Native runtime with WebSocket bridge to Python dynamical engine. Full design session for boundaryless chat UI, Zustand store, connection status, four-stage pipeline (RIL → Sandbox → ErrorContraction → STDP), divergence damping, and telemetry. Use to build or extend the mobile interface on the Kiyoshi OS core.
---

# Kiyoshi v1 Kimi-Style Runtime

This skill captures the complete conversation and implementation that established the first shippable, Kimi-like chat experience for Kiyoshi while keeping the dynamical kernel fully decoupled.

## Key Outcomes
- Modular UI/engine separation via WebSocket Jacobian bridge
- Real-time connection status indicator for topological observability
- Four-stage cognitive pipeline with spectral radius / λ₁ logging
- Explicit divergence handling (_handle_divergence) when λ₁ > 0
- Ready for replacement of stubs with core/daemon/run_kiyoshi.py and kernel/lyapunov_jax.py

## Files in runtime/kimi-v1/
App.tsx, src/theme.ts, src/store/useKiyoshi.ts, src/screens/ChatScreen.tsx, kiyoshi_bridge_server.py, kiyoshi_engine.py, docs/DESIGN.md

Generated from the full design and verification session on the coupled map lattice between React Native phase-space and Python execution environment.
