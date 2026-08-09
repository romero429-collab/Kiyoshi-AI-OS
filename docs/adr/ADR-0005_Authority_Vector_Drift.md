---
schema_version: "0.1"

artifact:
  id: "ADR-0005"
  type: "Architecture Decision Record"
  title: "Authority Vector Refinement & Continuous Drift Detection"
  version: "0.1"

depends_on:
  - "CONST-0001"
  - "GOV-0001"
  - "ADR-0004"

provenance:
  authority:
    - "Constitution-v0.1-R Article I"
    - "Constitution-v0.1-R Article V"
  foundation: []
  structure:
    - "AS-0002"
  rationale:
    - "ADR-0004"
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
  id: "LEDGER-0015"
  state: "Accepted"
---

# ADR-0005 — Authority Vector Refinement & Continuous Drift Detection
**Version:** 0.1
**Status:** Accepted

## Context
ADR-0004 established the Available Authority Vector ($A_s$) as a boolean matrix to prevent the Protective Membrane from assuming unverified physical control over external substrates. However, a purely boolean model is too coarse. It fails to capture the spectrum of authority (e.g., claimed vs. actively demonstrated) and incorrectly assumes that authority is static. In adversarial or degrading physical environments, verified authority can be lost mid-session (e.g., a firmware update revokes a shutdown API, or hardware damage severs a control line).

## Decision
The Kiyoshi Protective Hull upgrades the Authority Truth Model to support graded capability tuples and introduces Continuous Authority Drift Detection.

### 1. Graded Authority Tuple
The Available Authority Vector is redefined as a time-dependent function $A_s(t) = (O, R, T, D, I, P, V)$, where each dimension is graded on a strict confidence scale:
* **0 = None:** Capability does not exist.
* **1 = Claimed:** Substrate reports capability (Untrusted, cannot be acted upon).
* **2 = Verified:** Kiyoshi has proven the capability via cryptographic attestation or probing.
* **3 = Demonstrated:** Kiyoshi has successfully executed this capability in the current session.

The dimensions are:
* **O:** Observation (Can we read state?)
* **R:** Restriction (Can we bound inputs/outputs?)
* **T:** Transformation (Can we spoof or rewrite commands?)
* **D:** Decoupling (Can we safely orchestrate an exit?)
* **I:** Isolation (Can we logically sever the connection?)
* **P:** Physical Control (Can we affect hardware power/mechanics?)
* **V:** Verification Confidence (Overall cryptographic/structural trust score).

### 2. Continuous Authority Drift Detection
Authority is explicitly time-dependent. The architecture must continuously evaluate $\Delta A = A_s(t_1) - A_s(t_0)$.
* If $\Delta A < 0$ (a capability drops in grade, e.g., from Verified to None), the system must immediately trigger an `AUTHORITY_DRIFT_DETECTED` interrupt.
* This interrupt forces an immediate reclassification of the substrate and recalculation of the ADR-0003 Minimal Intervention response hierarchy.

## Consequences
**Positive:**
* Allows the Policy Resolver to make highly nuanced decisions based on exact confidence levels.
* Protects the user against "bait-and-switch" adversarial substrates that pass initial verification but drop safety capabilities during operation.

**Trade-offs:**
* Requires continuous polling or asynchronous event monitoring of the substrate's capability endpoints, marginally increasing computational overhead in the Observation Layer.

## Rationale
Authority is a continuous negotiation, not a one-time handshake. By modeling $A_s$ as a time-dependent, graded tuple, Kiyoshi operates as a mathematically bounded, real-time immune system that dynamically adapts as its environment degrades or turns hostile.
