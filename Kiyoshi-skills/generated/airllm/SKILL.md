---
name: airllm
description: "Low-memory LLM inference modeled from lyogavin/airllm. Use when building 4GB-GPU inference skills."
type: tool
lifecycle: active
---

# AirLLM — Low-Memory Inference

Modeled from https://github.com/lyogavin/airllm. Remade as a Kiyoshi-owned inference tool.

## Workflow
1. Load large model layer-by-layer on 4GB GPU.
2. Run inference.
3. Manage memory under contractive loading (λ_max < 0).

See inventory entry for source metadata.
