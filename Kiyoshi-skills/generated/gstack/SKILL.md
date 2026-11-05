---
name: gstack
description: "Multi-role agent orchestration modeled from Garry Tan's gstack: 23 opinionated tools acting as CEO, Designer, Eng Manager, Release Manager, Doc Engineer, and QA. Use when coordinating multi-role coding agents."
type: orchestrator
lifecycle: active
---

# GStack — Multi-Role Agent Orchestration

Modeled from https://github.com/garrytan/gstack. Remade as a Kiyoshi-owned orchestration pattern.

## Workflow
1. Assign roles from the 23-tool set (CEO, Designer, Eng Manager, Release, Docs, QA).
2. Route tasks through role-specific agents with explicit handoff contracts.
3. Enforce contractive coordination: each handoff reduces uncertainty (λ_max < 0).
4. Aggregate outputs into a single release artifact.

See inventory entry for source metadata.
