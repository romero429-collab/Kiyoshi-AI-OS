---
name: freellmapi
description: "Free multi-provider LLM router modeled from tashfeenahmed/freellmapi. Use when building free LLM aggregation skills."
type: tool
lifecycle: active
---

# FreeLLMAPI — Multi-Provider Router

Modeled from https://github.com/tashfeenahmed/freellmapi. Remade as a Kiyoshi-owned routing layer.

## Workflow
1. Accept OpenAI-compatible request.
2. Route across free providers and endpoints.
3. Return response under contractive selection (λ_max < 0).

See inventory entry for source metadata.
