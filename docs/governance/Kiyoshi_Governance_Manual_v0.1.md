# Kiyoshi Protective Hull Governance Manual
**Version:** 0.1
**Status:** Baseline

## Chapter 1 — Purpose and Scope
**Purpose:** This manual defines the procedural governance for the Kiyoshi Protective Hull. It establishes how the Constitution is maintained, how engineering artifacts enter the project, and how proposals are evaluated. 

**Scope:** This Governance Manual defines the procedures for governing the Kiyoshi project. It does not establish architectural, mathematical, implementation, or domain-specific requirements. Such requirements belong in their respective lower-layer artifacts.

## Chapter 2 — Artifact Hierarchy
All contributions must map to the following strict dependency chain. Knowledge must be pushed to the lowest possible layer.

1. **Constitution:** Enduring obligations and global invariants.
2. **Governance Manual:** Procedural governance and review protocols.
3. **Mathematical Specification:** Formal models and proofs supporting the architecture.
4. **Architecture Specification:** System boundaries, manifold mapping, and component composition.
5. **Architecture Decision Record (ADR):** The rationale for choosing a specific architectural path.
6. **Implementation:** The executable medium (code, physical hardware, biological harness).
7. **Verification Suite:** Deterministic evidence that the implementation satisfies the hierarchy.

## Chapter 3 — The Constitutional Court (Review Protocol)
The Constitutional Court is a structured evaluation process, not a committee. The Constitutional Court evaluates compliance; it does not create constitutional obligations. Only the Constitution establishes obligations. 

Every proposal entering the system must undergo this protocol to determine its correct placement. Reviewers must explicitly answer:
* Which constitutional articles apply to this proposal?
* Which mathematical specification supports it?
* Does this proposal mandate a constitutional, architectural, or implementation change?
* Does this proposal violate any existing constitutional article?

## Chapter 4 — Constitutional Admission Criteria
To be admitted as an amendment or a new article within the Constitution, a proposal must satisfy all five of the following tests:
* **Timeless:** Survives technological and algorithmic shifts.
* **Normative:** Defines a strict obligation, not an implementation detail.
* **Minimal:** Cannot be derived from an existing article.
* **Enforceable:** Can be verified programmatically or mathematically within a subsystem.
* **Non-conflicting:** Introduces no contradictions with the existing baseline.

## Chapter 5 — Amendment Process
The Constitution is append-only. Silent edits are strictly prohibited. The amendment process flows linearly:

**Proposal → Court Review → Evidence Verification → Ledger Entry → Version Bump → Archive**

Historical texts are preserved in their entirety. Amendments must explicitly reference the articles they modify and the ADRs that justify the change.

## Chapter 6 — Provenance Requirements
Every artifact introduced into the Kiyoshi Protective Hull must explicitly declare its provenance. 
* **Authority:** The governing constitutional articles.
* **Foundation:** The supporting mathematical specifications.
* **Structure:** The governing architecture specifications.
* **Rationale:** The associated ADR.
* **Realization:** The specific implementation ID.
* **Evidence:** The specific verification suite ID.

## Chapter 7 — Burden of Proof
The burden of proof rests entirely on the proposer. Reviewers are not required to prove why a proposal should be rejected. The proposer must provide the evidence demonstrating that the addition satisfies all admission criteria, cannot live in a lower architectural layer, and improves the integrity of the system.

## Chapter 8 — Review States
Proposals do not exist as simply "Accepted" or "Rejected." They must explicitly carry one of the following operational states:
* **Draft:** Initial formulation, lacking complete evidence.
* **Under Review:** Actively undergoing the Constitutional Court protocol.
* **Accepted:** Passed all criteria and merged into the active architecture.
* **Accepted with Conditions:** Approved pending specific, documented modifications.
* **Deferred:** Valid proposal, but structurally premature for the current version.
* **Superseded:** Replaced by a more robust architecture or specification.
* **Archived:** Preserved historical state of a modified artifact.
* **Rejected:** Failed admission criteria; logged with rationale.

## Chapter 9 — Constitutional Ledger
No proposal is ever deleted. The ledger tracks the lifecycle of every idea submitted to the project, logging the Identifier, Author, Reviewers, Date, Status, Rationale, Evidence, and Version History.

## Chapter 10 — Baseline Stability
Governance Manual v0.1 is designated as the procedural baseline. Subsequent revisions shall be made through the governance process defined herein and shall preserve complete historical version records.
