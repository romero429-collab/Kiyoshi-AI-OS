---
name: orca
description: "Fleet orchestration for coding agents (Claude Code, Codex, etc.), modeled from stablyai/orca. Use when running multi-agent coding fleets."
type: orchestrator
lifecycle: active
---

# Orca — Coding Agent Fleet

Modeled from https://github.com/stablyai/orca. Remade as a Kiyoshi-owned fleet runtime.

## Workflow
1. Register coding agents into the fleet.
2. Dispatch tasks with subscription-aware routing.
3. Aggregate results under contractive swarm dynamics (λ_max < 0).

See inventory entry for source metadata.
