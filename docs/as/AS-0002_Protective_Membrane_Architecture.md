---
schema_version: "0.1"

artifact:
  id: "AS-0002"
  type: "Architecture Specification"
  title: "Protective Membrane & State Transition Architecture"
  version: "0.1"

depends_on:
  - "CONST-0001"
  - "PROV-0001"
  - "STD-0001"
  - "AS-0001"
  - "MS-0002"
  - "MS-0003"
  - "ADR-0003"

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
  realization: []
  evidence: []

review:
  status: "Under Review"
  reviewers:
    - "Gabriel"
    - "ChatGPT"
    - "Gemini"
    - "Grok"
  last_reviewed: "2026-07-29"

ledger:
  id: null
  state: null
---

# Architecture Specification: Protective Membrane & State Transition Architecture
**Version:** 0.1
**Status:** Under Review

## 1. Purpose
To define the architectural components that operationalize the mathematics of state transition, safety classification, and active mediation. This architecture realizes the "Protective Hull" by enforcing that no external substrate receives unmediated authority over Kiyoshi's internal state.

## 2. Scope & System Boundaries
This architecture covers the ingestion, evaluation, mediation, and logging of transition requests originating from outside the governed core. 
* **In Scope:** The logic gates and controllers that classify inputs, transform state, execute decoupling, and emit provenance evidence.
* **Out of Scope:** Specific hardware drivers, cryptographic authentication mechanisms, and downstream application logic.

## 3. State Model
The Protective Membrane itself operates as a deterministic state machine managing external sessions. Observable states include:
* **Observing:** Gathering substrate capabilities and transition requests.
* **Classifying:** Evaluating inputs against safety boundaries.
* **Mediating:** Actively transforming or containing an executing session.
* **Decoupling:** Executing an orchestrated exit sequence.
* **Isolated:** Hard boundary enforcement; connection rejected or nullified.

## 4. Invariants
* **Mediation Supremacy:** No transition request $(x, u)$ from an external substrate may bypass the Policy Resolver before affecting internal state.
* **Zero Default Trust:** An $Unknown$ classification must never silently escalate to $Safe$.
* **Evidence Emission:** Every decision output by the Policy Resolver must synchronously emit an immutable record to the Evidence & Provenance Bus.

## 5. Declared Interfaces
* **Ingress (External Substrate Gateway):** The sole physical/logical boundary receiving signals from external interfaces, hardware, or networks.
* **Egress (Internal State Bus):** The sanitized output channel delivering governed transitions to Kiyoshi subsystems.
* **Egress (Evidence & Provenance Bus):** The append-only telemetry channel logging classification scores, policy decisions, and structural faults.

## 6. Responsibilities
* **Owned:** * Execution of the Safety Classification Engine.
  * Policy resolution per ADR-0003 (Minimal Intervention).
  * Execution of the Transformation Sandbox.
  * Orchestration of Safe Decoupling trajectories.
* **Delegated:** * Cryptographic hardware verification (delegated to future Identity/Auth Architecture).
  * Physical hardware power limits (delegated to hardware-specific implementations).
* **Excluded:** * General-purpose computation or application hosting.

## 7. State Transitions & Dynamics
The subsystem execution flow strictly follows:
1. **Gateway** receives input $(x, u)$ via the Observation Layer.
2. **Classification Engine** evaluates $S(x, u)$.
3. **Policy Resolver** applies ADR-0003 logic to determine the response (Prevent, Contain, Transform, Decouple, Isolate).
4. The selected **Controller** (Transformation Sandbox, Containment Environment, Decoupling Controller, or Isolation Controller) executes the mathematical model.
5. The **Evidence & Provenance Bus** logs the full evaluation chain.

## 8. Subsystem Composition & Dependencies
The 9 core components (Gateway, Observation Layer, Classification Engine, Policy Resolver, Transformation Sandbox, Containment Environment, Decoupling Controller, Isolation Controller, and Evidence Bus) compose sequentially. The Policy Resolver acts as the central directed-acyclic routing node; feedback loops between mediation and observation are tightly bounded to prevent infinite mediation stalls.

## 9. Mathematical Mapping
* **Governing MS IDs:** MS-0002, MS-0003.
* **Implemented Results:**
  * The Safety Classification Engine directly realizes $S(x, u)$.
  * The Transformation Sandbox implements $R(x, u) \to (x', u')$.
  * The Containment Environment realizes $C(X_{safe}) \to X_c$.
  * The Safe Decoupling Controller orchestrates the discrete asymptotic trajectory $D(x_n)$.
  * The Isolation Controller executes $I(x)$.

## 10. Explicit Non-Assumptions
This architecture intentionally does not assume that it possesses the physical authority to forcibly sever electrical power or physically detach a user from a fail-deadly substrate. Its authority is limited to logical state mediation, spoofing, and software-level isolation.

## 11. Failure Modes & Isolation
* **Classification Timeout:** If the Safety Classification Engine fails to evaluate an input within the bounded latency constraint, the Policy Resolver defaults to Emergency Isolation.
* **Evidence Bus Saturation:** If the Evidence Bus cannot append records, the Membrane enters a fail-safe hold, halting all non-essential ingress until logging is restored (preventing un-auditable state changes).

## 12. Performance & Resource Constraints
To prevent Time-Of-Check to Time-Of-Use (TOCTOU) exploits and buffer exhaustion, the critical path (Observation $\to$ Classification $\to$ Policy Resolution) must operate within a strict, predefined real-time execution bound.

## 13. Verification Requirements
* **Gateway Fuzzing:** The External Substrate Gateway must be subjected to high-volume malformed inputs to prove isolation integrity.
* **Resolver Determinism:** The Policy Resolver must be property-tested to ensure it strictly follows the ADR-0003 hierarchy under all simulated classification states.

## 14. Related Artifacts
* **Mathematical Specifications:** MS-0002, MS-0003
* **Architecture Decision Records:** ADR-0003
