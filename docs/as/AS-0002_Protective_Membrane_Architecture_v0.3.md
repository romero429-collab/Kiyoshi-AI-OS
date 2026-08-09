---
schema_version: "0.1"

artifact:
  id: "AS-0002"
  type: "Architecture Specification"
  title: "Protective Membrane & State Transition Architecture"
  version: "0.3"

depends_on:
  - "CONST-0001"
  - "PROV-0001"
  - "STD-0001"
  - "AS-0001"
  - "MS-0002"
  - "MS-0003"
  - "ADR-0003"
  - "ADR-0004"
  - "ADR-0005"

provenance:
  authority:
    - "Constitution-v0.1-R Article I"
    - "Constitution-v0.1-R Article II"
    - "Constitution-v0.1-R Article III"
  foundation:
    - "MS-0002"
    - "MS-0003"
  structure: []
  rationale:
    - "ADR-0003"
    - "ADR-0004"
    - "ADR-0005"
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
  id: "LEDGER-0016"
  state: "Accepted"
---

# Architecture Specification: Protective Membrane & State Transition Architecture
**Version:** 0.3
**Status:** Accepted

## 1. Purpose
To define the architectural components that operationalize the mathematics of state transition, safety classification, and active mediation. This architecture realizes the "Protective Hull" by enforcing that no external substrate receives unmediated authority over Kiyoshi's internal state, operating strictly on continuously verified authority boundaries.

## 2. Scope & System Boundaries
* **In Scope:** Logic gates, controllers, continuous capability discovery, drift detection, state transformation, decoupling trajectories, and provenance logging.
* **Out of Scope:** Hardware-specific execution details and downstream application payloads.

## 3. State Model
The Protective Membrane operates as a deterministic state machine managing external sessions. Observable states include:
* **Discovering:** Mapping external substrate capabilities (Claimed vs. Verified).
* **Observing:** Gathering substrate transition requests.
* **Classifying:** Evaluating inputs against safety boundaries.
* **Mediating:** Actively transforming or containing an executing session.
* **Escalation Required:** System paused pending Human/Governor authorization due to unresolved Unknown states.
* **Decoupling:** Executing an orchestrated exit trajectory.
* **Isolated:** Logical boundary enforcement; connection rejected or revoked.

## 4. Invariants
* **Scoped Mediation Supremacy:** No externally observable software-defined state transition within Kiyoshi’s controlled execution domain may bypass the Policy Resolver.
* **Zero Default Trust:** An $Unknown$ classification must never silently escalate to $Safe$. Capability claims are strictly untrusted until verified.
* **Protected Subject Invariant:** When interacting with a human user, the priority is strictly: Human Safety $>$ System Integrity $>$ Data Preservation $>$ Availability.
* **Evidence Emission:** Every decision output by the Policy Resolver must synchronously emit an immutable record to the Evidence & Provenance Bus.

## 5. Declared Interfaces
* **Ingress (External Substrate Gateway):** The logical boundary receiving signals.
* **Egress (Internal State Bus):** The sanitized output channel.
* **Egress (Evidence & Provenance Bus):** The append-only telemetry channel.

## 6. Responsibilities
* **Owned:** Capability verification, execution of the Safety Classification Engine, continuous Authority Drift Detection, Policy resolution, Transformation Sandboxing, Safe Decoupling orchestration, and Logical Isolation.
* **Delegated:** Cryptographic hardware verification; Physical hardware power limits.
* **Excluded:** Physical disconnection authority (unless explicitly verified).

## 7. State Transitions & Dynamics
1. **Gateway** receives input $(x, u)$.
2. **Capability Verification Layer** maps claimed capabilities to verified capabilities, generating $A_s(t)$.
3. **Drift Detector** evaluates $\Delta A$. If negative, reclassification is forced.
4. **Classification Engine** evaluates $S(x, u)$.
5. **Policy Resolver** applies ADR-0003 logic. If $A_s$ is insufficient for autonomous safety, it transitions to **Escalation Required**.
6. Selected **Controller** executes mediation. Safe Decoupling strictly follows:
   * `ENTANGLED` $\to$ `STABILIZE` $\to$ `REDUCE AUTHORITY` $\to$ `RESTORE SAFE CHANNEL` $\to$ `VERIFY (User, System, Environment)` $\to$ `RELEASE`
7. **Evidence & Provenance Bus** logs the evaluation chain.

## 8. Subsystem Composition & Dependencies
11 core components compose sequentially: Gateway, Capability Verification Layer, Authority Monitor & Drift Detector, Classification Engine, Escalation Manager, Policy Resolver, Transformation Sandbox, Containment Environment, Decoupling Controller, Isolation Controller, and Evidence Bus.

## 9. Mathematical Mapping
* **Governing MS IDs:** MS-0002, MS-0003.
* **Implemented Results:** The Membrane implements piecewise transition function $T(x_n, u_n)$, utilizing contraction mappings $R(x, u)$ and discrete sequences $D(x_n)$ bounded by ADR-0005 drift vectors.

## 10. Explicit Non-Assumptions
The architecture does not assume physical authority to sever power or detach users. Authority is limited to verified logical vectors.

## 11. Failure Modes & Isolation
* **Emergency Isolation Limits:** Executes logical procedures available to the *current authority domain*.
* **Authority Drift:** Triggers instantaneous fail-safe reclassification.

## 12. Performance & Resource Constraints
The critical path (Verification $\to$ Drift Check $\to$ Classification $\to$ Policy Resolution) must operate within predefined real-time execution bounds to prevent TOCTOU exploits.

## 13. Verification Requirements
* **Gateway Fuzzing:** Subjected to malformed capability claims.
* **Drift Injection:** The Verification Suite must artificially revoke capabilities mid-session to prove the Drift Detector forces safe mediation.

## 14. Related Artifacts
* **Mathematical Specs:** MS-0002, MS-0003
* **ADRs:** ADR-0003, ADR-0004, ADR-0005

## 15. Authority Domains & Capability Truth Model
Authority is a time-dependent, verified context matrix. The Policy Resolver operates exclusively on the graded Available Authority Vector:
$$A_s(t) = (O, R, T, D, I, P, V)$$
Graded from 0 (None) to 3 (Demonstrated).

## 16. Human Escalation Boundary
If a substrate is classified as $Unknown$ and verification cannot establish a reliable $A_s$ vector, the Escalation Manager halts autonomous resolution (if safe to pause) and requests explicit human or governor authorization to proceed. If pausing violates invariants, it defaults to Emergency Isolation.
