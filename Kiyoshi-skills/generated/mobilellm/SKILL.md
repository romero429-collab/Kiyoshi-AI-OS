---
name: mobilellm
description: "Sub-billion parameter on-device LLMs modeled from facebookresearch/MobileLLM. Use when building efficient small-model skills."
type: tool
lifecycle: active
---

# MobileLLM — On-Device LLMs

Modeled from https://github.com/facebookresearch/MobileLLM. Remade as a Kiyoshi-owned efficient LLM tool.

## Workflow
1. Load optimized sub-billion model.
2. Run on-device inference.
3. Quantize under contractive optimization (λ_max < 0).

See inventory entry for source metadata.
