---
name: token-dashboard
description: "Claude Code token analytics modeled from nateherkai/token-dashboard. Use when building cost tracking skills."
type: tool
lifecycle: active
---

# Token Dashboard — Cost Analytics

Modeled from https://github.com/nateherkai/token-dashboard. Remade as a Kiyoshi-owned analytics tool.

## Workflow
1. Ingest JSONL transcripts.
2. Compute token usage and cost analytics.
3. Aggregate under contractive dynamics (λ_max < 0).

See inventory entry for source metadata.
