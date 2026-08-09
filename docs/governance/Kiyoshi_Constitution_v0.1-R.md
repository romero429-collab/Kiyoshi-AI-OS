# Kiyoshi Constitution
**Version:** 0.1-R (Reconstructed)
**Status:** Baseline
**Confidence:** B (Supported by multi-model consensus; historical artifact unavailable)
**Date:** 2026-07-28

*This document contains only enduring obligations. Mechanisms, algorithms, and implementation details belong in lower-layer specifications.*

---

## Article I — State
* The system shall define explicit state.
* Every state shall have deterministic semantics.
* State shall be observable.

> **Admission:** Timeless · Normative · Minimal · Enforceable · Non-conflicting

## Article II — Transition
* Every state transition shall satisfy declared invariants.
* Undefined transitions are invalid.
* Transition behavior shall be deterministic given the same state and inputs.

> **Admission:** Timeless · Normative · Minimal · Enforceable · Non-conflicting

## Article III — Composition
* Subsystems shall compose only through declared interfaces.
* Composition shall preserve all constitutional invariants.
* No subsystem may rely on undocumented internal behavior of another.

> **Admission:** Timeless · Normative · Minimal · Enforceable · Non-conflicting

## Article IV — Verification
* No subsystem shall be accepted without evidence.
* Evidence consists of a Mathematical Specification, an Architecture Specification, an Implementation, a Verification Suite, and an Architecture Decision Record that together demonstrate compliance with the Constitution.

> **Admission:** Timeless · Normative · Minimal · Enforceable · Non-conflicting

## Article V — Explicit Non-Assumptions
* The architecture shall not infer global correctness, uniqueness, or invertibility solely from local properties.
* Any claim of global guarantees shall specify the mechanism by which those guarantees are established and the evidence that supports them.

> **Admission:** Timeless · Normative · Minimal · Enforceable · Non-conflicting

## Article VI — Authority
* The Constitution is the ultimate authority.
* No individual contributor, model, or process may override constitutional obligations.
* Amendments require the formal process defined in the Governance Manual.

> **Admission:** Timeless · Normative · Minimal · Enforceable · Non-conflicting

## Article VII — Provenance
* Every artifact shall maintain a chain of provenance answering:
    * **Authority** (which constitutional articles)
    * **Foundation** (mathematical specification)
    * **Structure** (architecture specification)
    * **Rationale** (ADR)
    * **Realization** (implementation)
    * **Evidence** (verification suite).

> **Admission:** Timeless · Normative · Minimal · Enforceable · Non-conflicting

## Article VIII — Amendment
* Amendments shall target specific articles, provide engineering or mathematical rationale, cite supporting ADRs and evidence, and preserve the historical text by appending rather than overwriting.

> **Admission:** Timeless · Normative · Minimal · Enforceable · Non-conflicting

---

## Next Actions & Layer Separations

1. **Governance Manual:** Define procedures (reviews, amendments, acceptance, versioning).
2. **Provenance Metadata Schema:** Define structured schema for artifact declarations.
3. **Glossary:** Define shared terms (state, transition, invariant, composition, verification, implementation).
4. **ADR-0001:** Record the rationale for the reconstructed Constitution, the unrecovered status of the historical version, and the governance decision that led to v0.1-R.

**Core Engineering Principle for the Kiyoshi Protective Hull:**
*Prefer moving knowledge downward rather than upward.*
If it can live in a lower specification, do not amend the Constitution.
