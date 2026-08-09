---
schema_version: "0.1"

artifact:
  id: "IMP-0001"
  type: "Implementation Template"
  title: "Implementation Specification Template"
  version: "0.1"

depends_on:
  - "CONST-0001"
  - "PROV-0001"
  - "STD-0001"
  - "GLO-0001"
  - "MS-0001"
  - "AS-0001"
  - "VS-0001"

provenance:
  authority:
    - "Constitution-v0.1-R Article III"
    - "Constitution-v0.1-R Article IV"
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
  id: "LEDGER-0007"
  state: "Accepted"
---

# Implementation Specification: [Insert Title]
**Version:** [0.X]
**Status:** [Draft / Under Review / Accepted]

## 1. Purpose
[State the exact purpose of this Implementation. Which subsystem of the Kiyoshi Protective Hull is being realized?]

## 2. Scope & Realization Medium
[Define the medium of execution (e.g., software code, physical hardware harness, biological routing framework, or mixed-medium). What is explicitly out of scope for this codebase/hardware?]

## 3. Portability Statement
[Since the Constitution is medium-agnostic, explicitly declare environmental constraints.]
* **Supported Environments:** [Target OS, hardware, or biological substrates]
* **Unsupported Environments:** [Explicitly excluded environments]
* **Portability Assumptions:** [Dependencies on specific endianness, memory models, etc.]
* **Platform-specific Behavior:** [Any deviations based on execution environment]

## 4. Governing Artifacts & Version Compatibility
[List the governing models, architectures, and verification suites, including strict version bounds to manage lifecycle upgrades.]
* **Compatible Architecture Specifications (AS):** [List AS IDs + Versions]
* **Compatible Mathematical Specifications (MS):** [List MS IDs + Versions]
* **Compatible Verification Suites (VS):** [List VS IDs + Versions]
* **Breaking Changes / Migration Notes:** [If applicable]

## 5. Responsibilities Realized (Traceability)
[Provide an explicit mapping from implementation components back to architecture responsibilities defined in the governing AS.]

| Implementation Component | AS Responsibility | Status (Complete/External/Stubbed) |
| :--- | :--- | :--- |
| [Component Name] | [Owned / Delegated Responsibility] | [Status] |

## 6. Declared Interfaces Implemented
[Detail how the interfaces declared in the Architecture Specification are concretely realized in this medium (e.g., REST API, gRPC, Kuramoto phase-sync endpoints, hardware pins).]

## 7. Implementation Invariants
[Declare runtime guarantees unique to this implementation that aren't inherently mathematical (e.g., memory ownership invariants, thread-safety, serialization invariants, resource lifetime bounds).]

## 8. Mathematical Assumptions & Non-Assumption Compliance
* **Relied Assumptions:** [Which mathematical assumptions this codebase explicitly depends on.]
* **Non-Assumption Compliance:** [How this code structurally avoids claiming guarantees beyond the explicitly declared MS/AS Non-Assumptions.]

## 9. Engineering Decisions
[Document significant implementation-level choices that do not rise to the level of project-wide Architecture Decision Records (ADRs).]
* **Decision:** [What was chosen]
* **Rationale:** [Why]
* **Alternatives Considered:** [What was rejected]
* **Impact:** [Effect on performance, security, or maintainability]

## 10. Dependency Manifest
[Classify and list all external requirements.]
* **Runtime Dependencies:** [Libraries, frameworks]
* **Toolchain Dependencies:** [Compilers, build tools]
* **External Services:** [APIs, daemons]
* **Hardware Dependencies:** [Specific chipsets, oscillator node types]

## 11. Configuration, Build, & Deployment
[Provide the exact instructions, flags, and environment variables required to compile, instantiate, and deploy this implementation.]

## 12. Required Verification & Evidence Production
[Create the bridge to VS-0001. What specific evidence artifacts is this implementation configured to produce during testing?]
* **Required VS IDs:** [List VS IDs that must pass]
* **Produced Evidence:** [e.g., Runtime logs, binary hashes, coverage reports, performance benchmarks, thermal metrics]

## 13. Limitations & Known Deviations
[Document any temporary deviations from the Architecture Specification, technical debt, or structural limitations in the current version.]

## 14. Related Artifacts
* **Architecture Decision Records:** [ADR-XXXX]
* **Verification Evidence:** [Evidence IDs produced by this implementation]
