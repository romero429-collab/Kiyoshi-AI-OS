---
name: deer-flow
description: "Long-horizon SuperAgent harness modeled from bytedance/deer-flow. Use when building research-and-create agent loops."
type: orchestrator
lifecycle: active
---

# Deer-Flow — Long-Horizon SuperAgent

Modeled from https://github.com/bytedance/deer-flow. Remade as a Kiyoshi-owned multi-step harness.

## Workflow
1. Accept long-horizon goal.
2. Decompose into sandboxed research/code/create steps with subagents.
3. Aggregate under contractive multi-step dynamics (λ_max < 0).

See inventory entry for source metadata.
