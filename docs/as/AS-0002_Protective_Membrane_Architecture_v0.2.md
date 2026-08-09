---
schema_version: "0.1"

artifact:
  id: "AS-0002"
  type: "Architecture Specification"
  title: "Protective Membrane & State Transition Architecture"
  version: "0.2"

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
  status: "Accepted"
  reviewers:
    - "Gabriel"
    - "ChatGPT"
    - "Gemini"
    - "Grok"
  last_reviewed: "2026-07-29"

ledger:
  id: "LEDGER-0013"
  state: "Accepted"
---

# Architecture Specification: Protective Membrane & State Transition Architecture
**Version:** 0.2
**Status:** Accepted

## 1. Purpose
To define the architectural components that operationalize the mathematics of state transition, safety classification, and active mediation. This architecture realizes the "Protective Hull" by enforcing that no external substrate receives unmediated authority over Kiyoshi's internal state, while remaining strictly honest about physical vs. logical control boundaries.

## 2. Scope & System Boundaries
This architecture covers the ingestion, evaluation, mediation, and logging of transition requests originating from outside the governed core. 
* **In Scope:** The logic gates and controllers that discover capabilities, classify inputs, transform state, execute decoupling, and emit provenance evidence.
* **Out of Scope:** Specific hardware drivers, cryptographic authentication mechanisms, and downstream application logic.

## 3. State Model
The Protective Membrane operates as a deterministic state machine managing external sessions. Observable states include:
* **Discovering:** Mapping external substrate capabilities before classification.
* **Observing:** Gathering substrate transition requests.
* **Classifying:** Evaluating inputs against safety boundaries.
* **Mediating:** Actively transforming or containing an executing session.
* **Decoupling:** Executing an orchestrated exit trajectory.
* **Isolated:** Logical boundary enforcement; connection rejected, revoked, or quarantined.

## 4. Invariants
* **Scoped Mediation Supremacy:** No externally observable software-defined state transition within Kiyoshi’s controlled execution domain may bypass the Policy Resolver.
* **Zero Default Trust:** An $Unknown$ classification must never silently escalate to $Safe$.
* **Protected Subject Invariant:** When a connected external substrate interacts with a human user, the priority ordering is strictly: Human Safety $>$ System Integrity $>$ Data Preservation $>$ Availability.
* **Evidence Emission:** Every decision output by the Policy Resolver must synchronously emit an immutable record to the Evidence & Provenance Bus.

## 5. Declared Interfaces
* **Ingress (External Substrate Gateway):** The logical boundary receiving signals from external interfaces, hardware, or networks.
* **Egress (Internal State Bus):** The sanitized output channel delivering governed transitions to Kiyoshi subsystems.
* **Egress (Evidence & Provenance Bus):** The append-only telemetry channel logging classification scores, policy decisions, and structural faults.

## 6. Responsibilities
* **Owned:** Capability discovery, execution of the Safety Classification Engine, Policy resolution per ADR-0003, Execution of Transformation Sandbox, Orchestration of Safe Decoupling trajectories, and Logical Emergency Isolation.
* **Delegated:** Cryptographic hardware verification (delegated to Auth Architecture); Physical hardware power limits (delegated to hardware-specific implementations).
* **Excluded:** Physical disconnection authority (unless explicitly verified as a logical capability), General-purpose computation.

## 7. State Transitions & Dynamics
The subsystem execution flow strictly follows:
1. **Gateway** receives input $(x, u)$ via the Observation Layer.
2. **Observation Layer** executes **Capability Discovery** to map available substrate authority.
3. **Classification Engine** evaluates $S(x, u)$ based on discovered capabilities.
4. **Policy Resolver** applies ADR-0003 logic to determine the response.
5. The selected **Controller** executes the mathematical model. If Safe Decoupling is selected, the trajectory is strictly:
   * `ENTANGLED` $\to$ `STABILIZE` $\to$ `REDUCE AUTHORITY` $\to$ `RESTORE SAFE CHANNEL` $\to$ `VERIFY USER/SYSTEM STATE` $\to$ `RELEASE CONNECTION`
6. The **Evidence & Provenance Bus** logs the full evaluation chain.

## 8. Subsystem Composition & Dependencies
The 9 core components compose sequentially. The Policy Resolver acts as the central directed-acyclic routing node; feedback loops between mediation and observation are tightly bounded to prevent infinite mediation stalls.

## 9. Mathematical Mapping
* **Governing MS IDs:** MS-0002, MS-0003.
* **Implemented Results:**
  * Safety Classification Engine realizes $S(x, u)$.
  * Transformation Sandbox implements $R(x, u) \to (x', u')$.
  * Containment Environment realizes $C(X_{safe}) \to X_c$.
  * Safe Decoupling Controller orchestrates the finite asymptotic trajectory $D(x_n)$.
  * Isolation Controller executes $I(x)$ within available bounds.

## 10. Explicit Non-Assumptions
This architecture intentionally does not assume that it possesses the physical authority to forcibly sever electrical power or physically detach a user from a fail-deadly substrate. Its authority is limited to logical state mediation, capability revocation, and software-level isolation.

## 11. Failure Modes & Isolation
* **Emergency Isolation Limits:** The Isolation Controller executes the logical isolation procedure available to the *current authority domain* (e.g., session termination, capability revocation). It does *not* assume physical disconnection capabilities unless explicitly verified during Discovery.
* **Evidence Bus Saturation:** If the Evidence Bus cannot append records, the Membrane enters a fail-safe hold, halting non-essential ingress until logging is restored.

## 12. Performance & Resource Constraints
To prevent Time-Of-Check to Time-Of-Use (TOCTOU) exploits, the critical path (Discovery $\to$ Classification $\to$ Policy Resolution) must operate within a strict, predefined real-time execution bound.

## 13. Verification Requirements
* **Gateway Fuzzing:** Subjected to high-volume malformed inputs to prove logical isolation integrity.
* **Resolver Determinism:** Property-tested to ensure it strictly follows the ADR-0003 hierarchy under simulated classification states.

## 14. Related Artifacts
* **Mathematical Specifications:** MS-0002, MS-0003
* **Architecture Decision Records:** ADR-0003

## 15. Authority & Control Boundaries
The Protective Membrane shall operate only within verified authority domains. The architecture defines the following control hierarchy:
* **A0:** Physical Hardware Authority
* **A1:** Device Firmware Authority
* **A2:** Operating Runtime Authority
* **A3:** Application Authority
* **A4:** Kiyoshi Protective Hull Authority

Kiyoshi derives its Available Authority Vector $A = \{observe, restrict, transform, isolate\}$ strictly from the Capability Discovery phase. The architecture shall never assume control over external A0 or A1 mechanisms unless that control capability has been explicitly verified.
