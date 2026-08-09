---
schema_version: "0.1"

artifact:
  id: "ADR-0002"
  type: "Architecture Decision Record"
  title: "Amendment of Mathematical Overclaims in MS-0003"
  version: "0.1"

depends_on:
  - "CONST-0001"
  - "GOV-0001"
  - "MS-0003"

provenance:
  authority:
    - "Constitution-v0.1-R Article VIII"
  foundation: []
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
  id: "LEDGER-0010"
  state: "Accepted"
---

# ADR-0002 — Amendment of Mathematical Overclaims in MS-0003
**Version:** 0.1
**Status:** Accepted

## Context
MS-0003 v0.1 (LEDGER-0009) was locked with overly strong dynamical-systems requirements (Banach fixed-point, negative Lyapunov exponents) and domain-specific verification terminology (error quaternions). These additions violated the minimal, technology-agnostic governance principles of the project by forcing specific continuous-mathematics frameworks onto generalized state models. 

Furthermore, the document contained residual guarantee language ("whenever structurally possible") that could not be deterministically verified.

## Decision
Under Constitution Article VIII and Governance Manual Chapter 5, MS-0003 v0.1 is preserved in the ledger, and an amended version (MS-0003 v0.2) is issued. 

The following changes are authorized:
1. **Proof Obligation 1:** Replaced Banach fixed-point requirement with the requirement that the transformation maps into the safe subset without increasing severity.
2. **Proof Obligation 2:** Replaced Lyapunov exponent requirement with the requirement that decoupling trajectories are finite and terminate in a verified safe state.
3. **Verification Requirements:** Removed "error quaternions" and "phase-space portrait" in favor of generalized boundary and property-based testing.
4. **Purpose Statement:** Replaced unprovable guarantees with capability-based limits.

## Consequences
* **Positive:** The specification remains honest, verifiable, and medium-agnostic. Simple safety transformations (e.g., clamping, rate limiting) are now mathematically valid.
* **Trade-offs:** Specific continuous-time mathematical proofs (Lyapunov stability, Banach contractions) must now be deferred to lower-level, specialized mathematical specifications where they appropriately apply.

## Recovery Policy
MS-0003 v0.1 remains accessible in the historical archive. All future specifications must reference MS-0003 v0.2 or higher.
