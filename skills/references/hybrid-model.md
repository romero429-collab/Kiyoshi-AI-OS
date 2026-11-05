---
description: "Why the hybrid Rust/Mojo/Bazel + Node/TS model is required for Kiyoshi skills."
connections: [deer-flow, hermes-agent]
---

# Hybrid Model — Multi-Substrate Skill Architecture

## Decision
Not every original repository can be remade entirely in Rust/Mojo/Bazel without loss.

### Reasons
- Many skills are Python-heavy ML/AI stacks (facebookresearch/*, audiocraft, sam2, etc.).
- Some are JavaScript/TypeScript tools or CLIs.
- Deep ecosystem dependencies (PyTorch, Node, specific runtimes) cannot be re-implemented cheaply.

## Chosen Architecture
- **Rust** (or Mojo) core for the contractive logic we own.
- **Optional Node/TS targets** when the original tooling is best left native.
- **Bazel** as the single orchestration layer that can build and run any skill under the Kiyoshi umbrella.

## Discrete Dynamical Systems View
The hybrid embedding
\[
\iota_{\text{hybrid}} : \mathbf{s}_{\text{skill}} \to \text{Rust} \times \text{Node} \times \text{Bazel}
\]
is contractive (\(\lambda_{\max} < 0\)) on the skill subspace while preserving original behavior.

## Date
2026-11-06
