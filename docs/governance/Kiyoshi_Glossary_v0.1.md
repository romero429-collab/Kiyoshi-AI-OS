---
schema_version: "0.1"

artifact:
  id: "GLO-0001"
  type: "Glossary"
  title: "Kiyoshi Shared Glossary"
  version: "0.1"

depends_on:
  - "Constitution-v0.1-R"
  - "Governance-Manual-v0.1"
  - "Provenance-Metadata-Schema-v0.1"

provenance:
  authority:
    - "Constitution-v0.1-R"
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
  last_reviewed: "2026-07-28"

ledger:
  id: "LEDGER-0001"
  state: "Accepted"
---

# Kiyoshi Shared Glossary
**Version:** 0.1
**Status:** Accepted

## Purpose
This Glossary establishes precise, shared definitions for core terminology used throughout the Kiyoshi Protective Hull. It eliminates silent semantic disagreements. It does not create new obligations.

## Core Definitions

### Artifact
Any versioned project object governed by the Kiyoshi governance framework. Examples include the Constitution, Governance Manual, Mathematical Specifications, Architecture Specifications, ADRs, Implementations, Verification Suites, and supporting documents. Every governed artifact shall possess provenance metadata.

### Composition
The combination of subsystems through declared interfaces only. Composition must preserve all constitutional invariants. No subsystem may rely on undocumented internal behavior of another.
> *Traceability: Constitution Article III*

### Declared Interface
The explicitly documented boundary through which a subsystem exchanges information or services with other subsystems. All permitted interactions shall occur through declared interfaces.

### Deterministic
Given the same explicit state and the same defined inputs, a governed process shall produce the same defined result.

### Evidence
Objective artifacts demonstrating that a governed artifact satisfies its declared specifications and applicable constitutional obligations. Evidence may include verification suites, formal proofs, analyses, test results, or other approved verification outputs.
> *Traceability: Constitution Article IV*

### Implementation
The concrete realization of an Architecture Specification in any executable medium (software, hardware, biological system, simulation, formal artifact, or other). The Constitution is medium-agnostic.

### Invariant
A property that must remain true before and after every valid state transition. Invariants are declared explicitly and are subject to verification.

### Observable
A property whereby the information required to determine or verify a governed artifact’s state can be obtained through defined interfaces, instrumentation, or verification procedures.

### Specification
A formal document that defines required properties, behaviors, interfaces, constraints, or evidence for a governed artifact. Specifications describe requirements; they do not themselves constitute implementations.

### State
The complete, explicit collection of information that fully determines the system’s condition at a given moment. State must have deterministic semantics and must be observable.
> *Traceability: Constitution Article I*

### Subsystem
An independent, bounded component that maintains its own state and transitions. Subsystems must be independently verifiable and may compose with other subsystems only through declared interfaces.

### Transition
A change from one state to another. Every transition must satisfy declared invariants. Undefined transitions are invalid. Given the same state and inputs, a transition must produce the same resulting state.
> *Traceability: Constitution Article II*

### Verification
The mandatory process of producing and evaluating evidence that an Implementation satisfies its Mathematical Specification, Architecture Specification, and all applicable constitutional obligations.
> *Traceability: Constitution Article IV*
