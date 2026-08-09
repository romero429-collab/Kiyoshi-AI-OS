---
schema_version: "0.1"

artifact:
  id: "ADR-0004"
  type: "Architecture Decision Record"
  title: "Authority Truth & Capability Verification Model"
  version: "0.1"

depends_on:
  - "CONST-0001"
  - "GOV-0001"
  - "AS-0002"

provenance:
  authority:
    - "Constitution-v0.1-R Article III"
    - "Constitution-v0.1-R Article V"
  foundation: []
  structure:
    - "AS-0002"
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
  id: "LEDGER-0014"
  state: "Accepted"
---

# ADR-0004 — Authority Truth & Capability Verification Model
**Version:** 0.1
**Status:** Accepted

## Context
AS-0002 v0.2 establishes that the Protective Membrane must perform *Capability Discovery* to understand an external substrate's authority limits before classifying its safety state. 

However, relying strictly on a substrate's self-reported capabilities introduces a severe vulnerability. A malicious or fail-deadly device (e.g., a NerveGear analog) could falsely report that it supports a safe software shutdown, tricking the Policy Resolver into selecting a Safe Decoupling sequence that physically cannot be executed, thereby masking a lethal trap. 

To maintain the architectural honesty mandated by Constitution Article V, Kiyoshi cannot treat an external system's claims as absolute truth.

## Decision
The Kiyoshi Protective Hull adopts the **Capability Truth Model**, formalizes the **Available Authority Vector ($A_s$)**, and establishes a **Human Escalation Boundary**.

### 1. The Capability Truth Model (Untrusted Discovery)
A substrate's capabilities exist in three distinct phases of truth. The Protective Membrane must never act on the first phase.
* **Claimed Capability:** What the external device self-reports. (Strictly Untrusted).
* **Verified Capability:** What Kiyoshi actively proves the device can do via cryptographic attestation, hardware sandboxing, or micro-transition probing.
* **Available Authority Vector:** The final, constrained set of actions the Policy Resolver is actually allowed to command.

### 2. Formal Available Authority Vector ($A_s$)
Authority is not a strict vertical hierarchy, but a contextual capability matrix. The Policy Resolver evaluates mediation choices strictly against $A_s$, defined as a boolean vector of verified capabilities:
$$A_s = \{observe, restrict, transform, decouple, physical\_control\}$$
If $A_s[physical\_control] == False$, Kiyoshi formally acknowledges it cannot physically shut down the device and adjusts its mediation policy accordingly.

### 3. Safe Decoupling Checkpoints
Safe Decoupling ($D(x_n)$) must now satisfy three dimensional verification checkpoints before the sequence completes and the connection is fully released:
1. **User State:** Biological / consciousness baseline restored & stable.
2. **System State:** Kiyoshi internal software integrity preserved.
3. **Environment State:** Physical device hardware stable and non-lethal.

### 4. Human-in-the-loop Escalation Boundary
If a substrate is classified as $Unknown$ and verification cannot establish a reliable $A_s$ vector, the system shall not autonomously guess the safest transformation. 
* Instead, it shall enter an **ESCALATION_REQUIRED** state.
* If safe to pause, it will request explicit human (or designated governor) authorization to proceed.
* If pausing would violate an invariant or escalate danger, it defaults immediately to Emergency Isolation.

## Consequences
**Positive:**
* Eliminates the "spoofing" vulnerability where dangerous hardware lies about its safety features.
* Prevents autonomous systems from making irreversible decisions in highly ambiguous scenarios.
* Clarifies that Kiyoshi's authority is strictly contextual and verified.

**Trade-offs:**
* Connection handshakes will have higher latency, as devices cannot just "plug and play" without going through active micro-transition probing and capability verification.

## Rationale
Kiyoshi's strength is not that it can control everything; it is that it always knows exactly what it *can* and *cannot* control. By enforcing the Capability Truth Model, the Protective Hull acts like a true immune system: it interrogates unknown entities, verifies their behavior, and only allows interaction within verified bounds.
