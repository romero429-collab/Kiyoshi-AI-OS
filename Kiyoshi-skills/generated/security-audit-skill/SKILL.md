---
name: security-audit-skill
description: "Multi-phase security audit modeled from cloudflare/security-audit-skill. Use when building verified audit skills."
type: workflow
lifecycle: active
---

# Security Audit Skill — Verified Findings

Modeled from https://github.com/cloudflare/security-audit-skill. Remade as a Kiyoshi-owned audit loop.

## Workflow
1. Run multi-phase audit.
2. Independently verify findings.
3. Emit machine-readable report under contractive verification (λ_max < 0).

See inventory entry for source metadata.
