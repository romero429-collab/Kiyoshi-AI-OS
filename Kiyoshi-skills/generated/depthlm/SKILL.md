---
name: depthlm
description: "DepthLM depth estimation modeled from facebookresearch/DepthLM_Official. Use when building depth skills."
type: tool
lifecycle: active
---

# DepthLM — Depth Estimation

Modeled from https://github.com/facebookresearch/DepthLM_Official. Remade as a Kiyoshi-owned depth tool.

## Workflow
1. Accept image input.
2. Estimate depth with DepthLM.
3. Output under contractive dynamics (λ_max < 0).

See inventory entry for source metadata.
