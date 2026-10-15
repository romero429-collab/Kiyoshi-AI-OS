---
name: skyreels-v2-dds
description: "Integrate SkyReels-V2 infinite-length film generative model as a discrete dynamical system into the Dynamical Kernel. Use when adding open-source video generation, diffusion-forcing, cinematic shot grammar, or long-horizon video DDS to Kiyoshi / AetherForge."
type: workflow
lifecycle: active
---

# SkyReels-V2 DDS — Infinite-Length Video Generation as Discrete Dynamical System

Model SkyReels-V2 (Skywork AI) as a well-posed infinite-horizon discrete dynamical system on the video latent manifold and register it as a kernel operator.

## Physics-first view

Video generation is iterative denoising of a spatiotemporal field \(\mathbf{x} \in \mathbb{R}^{T \times H \times W \times C}\). SkyReels-V2 uses Diffusion Forcing: a non-decreasing noise schedule that permits arbitrarily long trajectories while preserving shot-level consistency.

Core iteration map:
\[
\mathbf{x}_{k+1} = \Phi(\mathbf{x}_k, \boldsymbol{\epsilon}_k, t_k; \theta)
\]
where \(\Phi\) is the 14 B DiT denoiser, \(t_k\) is non-decreasing, and the forcing term keeps the trajectory on the trained cinematic measure.

Largest Lyapunov exponent of the error map around target shot trajectories is negative under the published RL + SFT stages, guaranteeing exponential contraction of deviations in camera grammar, actor expression, and motion coherence.

## DDS mapping

- **State**: video latent + SkyCaptioner-V1 embedding + shot-language tokens.
- **Map**: diffusion-forcing step + optional re-caption.
- **Attractors**: cinematic shot grammars (low-dimensional sub-manifolds).
- **Perturbations**: text prompt or image-to-video injection; forcing schedule prevents escape even as \(T \to \infty\).

## Integration steps (kernel operator)

1. Formalize the inference loop as a registered DDS operator with Lyapunov certificate.
2. Expose T2V / I2V / infinite-extension endpoints. Do not load 14 B weights until a dedicated GPU session is allocated.
3. Attach 3-D phase-space visualizer (error cone + Lyapunov heatmap) for any generated clip.
4. Apply shot-language consistency gate + content filter before committing output to the kernel.

## Reference

Source paper: arXiv:2504.13074  
Repo: https://github.com/SkyworkAI/SkyReels-V2  
Models: Hugging Face Skywork/SkyReels-V2-* series (1.3 B / 5 B / 14 B, 540 P / 720 P, DF / T2V / I2V).

See `references/conversation.md` for the full originating analysis.
