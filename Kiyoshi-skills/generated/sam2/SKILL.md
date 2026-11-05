---
name: sam2
description: "Segment Anything Model 2 inference modeled from facebookresearch/sam2. Use when building visual segmentation skills."
type: tool
lifecycle: active
---

# SAM 2 — Segment Anything

Modeled from https://github.com/facebookresearch/sam2. Remade as a Kiyoshi-owned segmentation tool.

## Workflow
1. Accept image + prompts.
2. Generate masks via SAM 2.
3. Return under contractive inference (λ_max < 0).

See inventory entry for source metadata.
