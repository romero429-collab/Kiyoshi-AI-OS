---
schema_version: "0.1"

artifact:
  id: "STD-0001"
  type: "Standard"
  title: "Document Numbering & Identifier Standard"
  version: "0.1"

depends_on:
  - "Constitution-v0.1-R"
  - "Governance-Manual-v0.1"
  - "Provenance-Metadata-Schema-v0.1"
  - "GLO-0001"

provenance:
  authority:
    - "Constitution-v0.1-R Article VII"
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
  id: "LEDGER-0002"
  state: "Accepted"
---

# Document Numbering & Identifier Standard
**Version:** 0.1
**Status:** Accepted

## Purpose
This standard defines the unique identifier and versioning conventions for all governed artifacts in the Kiyoshi Protective Hull. Consistent identifiers enable reliable provenance, ledger tracking, and dependency graphs.

## Identifier Format
All artifact IDs shall follow the pattern: 
`PREFIX-NNNN`

* `PREFIX` is a short uppercase code indicating artifact type.
* `NNNN` is a zero-padded four-digit sequential number (0001, 0002, …).

## Standard Prefixes

| Prefix | Artifact Type |
| :--- | :--- |
| `CONST` | Constitution |
| `GOV` | Governance Manual |
| `PROV` | Provenance Metadata Schema |
| `GLO` | Glossary |
| `STD` | Standard |
| `ADR` | Architecture Decision Record |
| `MS` | Mathematical Specification |
| `AS` | Architecture Specification |
| `IMP` | Implementation |
| `VS` | Verification Suite |
| `LEDGER` | Constitutional Ledger entry |

*Additional prefixes may be introduced only through an amendment to this standard.*

## Versioning
* Artifact versions use the form `MAJOR.MINOR` (e.g., 0.1, 1.0, 1.2).
* Schema version (`schema_version`) evolves independently of the artifact version.
* Historical versions are never overwritten; new versions receive a new version number and a new ledger entry when accepted.

## Status Values
Artifact status values are exactly those defined in Governance Manual Chapter 8:
* Draft
* Under Review
* Accepted
* Accepted with Conditions
* Deferred
* Superseded
* Archived
* Rejected

## Ledger Identifiers
Ledger entries use the form `LEDGER-NNNN` and are assigned only when an artifact reaches an `Accepted` (or `Accepted with Conditions`) state.

## Rules
1. Every governed artifact must have a unique ID conforming to this standard.
2. IDs are never reused.
3. The sequential number is assigned at the moment the artifact enters the "Under Review" or "Accepted" state.
4. Unknown prefixes or formats are prohibited.
