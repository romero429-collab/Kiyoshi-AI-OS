---
name: corrosion
description: "Gossip-based service discovery modeled from superfly/corrosion. Use when building distributed systems skills."
type: tool
lifecycle: active
---

# Corrosion — Gossip Discovery

Modeled from https://github.com/superfly/corrosion. Remade as a Kiyoshi-owned discovery tool.

## Workflow
1. Join distributed system.
2. Propagate membership via gossip.
3. Converge under contractive propagation (λ_max < 0).

See inventory entry for source metadata.
