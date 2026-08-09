---
schema_version: "0.1"

artifact:
  id: "ADR-0003"
  type: "Architecture Decision Record"
  title: "Protective Response Hierarchy & Principle of Minimal Intervention"
  version: "0.1"

depends_on:
  - "CONST-0001"
  - "GOV-0001"
  - "MS-0002"
  - "MS-0003"

provenance:
  authority:
    - "Constitution-v0.1-R Article I"
    - "Constitution-v0.1-R Article V"
  foundation:
    - "MS-0003"
  structure: []
  rationale: []
  realization: []
  evidence: []

review:
  status: "Accepted"
  reviewers:
    - "Gabriel"
    - "ChatGPT"
    - "Gemini"
    - "Grok"
  last_reviewed: "2026-07-29"

ledger:
  id: "LEDGER-0012"
  state: "Accepted"
---

# ADR-0003 — Protective Response Hierarchy & Principle of Minimal Intervention
**Version:** 0.1
**Status:** Accepted

## Context
With the acceptance of MS-0003 v0.2, the Kiyoshi Protective Hull possesses the mathematical foundation to execute multiple classes of safety mediation: Containment, Transformation, Safe Decoupling, and Emergency Isolation. 

However, mathematics merely defines *what is structurally possible*; it does not dictate *which option the system should choose*. Without a governed policy, the architecture could arbitrarily select Emergency Isolation when a less destructive Transformation would suffice, potentially triggering "fail-deadly" consequences in hostile external substrates.

## Decision
The Kiyoshi Protective Hull adopts the **Principle of Minimal Intervention**. 

When mediating an unsafe or unknown state transition, the system shall strictly prefer the least destructive mathematically verified response that preserves the safety invariants of $X_{safe}$.

The system must evaluate and select its response according to the following strict hierarchy:
1. **Prevention:** Reject the connection or input before state entanglement occurs.
2. **Containment:** Allow operation, but strictly bound within a partitioned safety subset $X_c$.
3. **Transformation:** Actively rewrite or spoof the unsafe request into a safe equivalent mapping $(x', u')$.
4. **Safe Decoupling:** Execute a governed, finite trajectory $D(x_n)$ to safely extract the user/system from the substrate.
5. **Emergency Isolation:** (Last Resort) Execute $I(x)$ to minimize interaction when no safe decoupling or transformation can be mathematically guaranteed.

A more severe response (lower on the list) may only be selected if a less severe response is mathematically unresolvable, unverified, or physically impossible given the substrate's constraints.

## Consequences
**Positive:**
* Cleanly separates policy from pure mathematics.
* Prevents the Protective Hull from overreacting and accidentally triggering physical fail-safes in external hardware.
* Establishes a deterministic logic gate for the upcoming `AS-0002` Policy Resolver component.

**Trade-offs:**
* Requires the Protective Hull to expend computational cycles evaluating Transformation and Containment options before executing an Abort, marginally increasing latency during threat response.

## Rationale
A protective system's objective is the preservation of the protected subject, not the destruction of the threat. By formalizing this hierarchy, Kiyoshi acts as a highly nuanced active controller rather than a blunt-force firewall. 
