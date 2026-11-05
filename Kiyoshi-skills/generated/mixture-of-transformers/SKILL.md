---
name: mixture-of-transformers
description: "Sparse scalable multi-modal foundation architecture modeled from facebookresearch/Mixture-of-Transformers. Use when building MoE skills."
type: tool
lifecycle: active
---

# Mixture-of-Transformers — Sparse Multi-Modal

Modeled from https://github.com/facebookresearch/Mixture-of-Transformers. Remade as a Kiyoshi-owned MoE tool.

## Workflow
1. Route multi-modal inputs through sparse experts.
2. Scale foundation model with Mixture-of-Transformers.
3. Compute under contractive routing (λ_max < 0).

See inventory entry for source metadata.
