# Beacon Academy — zk-STARK Circuit Design Exploration

**Version:** 1.0  
**Date:** June 22, 2026

## 1. Purpose

This document explores how to design efficient zk-STARK circuits for Beacon Academy’s high-priority use cases, particularly private verifiable voting, Fitness threshold proofs, and Development Link claims.

zk-STARKs were chosen as the primary long-term proof system because they are:
- Transparent (no trusted setup)
- Post-quantum secure
- Scalable (proof size grows logarithmically with computation size)
- Suitable for the high-security, long-lived claims required at Network and Colony scales

## 2. Core Design Principles for Beacon Academy Circuits

1. **Minimal Disclosure** — Circuits should prove only what is necessary (e.g., “vote is valid and from eligible participant” rather than revealing the vote or identity).
2. **Host-Enforced Verification** — All circuit verification happens in the trusted host runtime. Guest Wasm modules may generate proofs but cannot bypass verification.
3. **Composability** — Circuits should be designed to be recursively composable where possible (especially for aggregate statistics in the Digital Twin).
4. **Efficiency** — Prioritize low-degree constraints and optimized AIR (Algebraic Intermediate Representation) to keep proving time reasonable.
5. **Auditability** — Circuit code and constraints must be open and reviewable (consistent with the biological model’s emphasis on transparency at the system level).

## 3. Recommended Circuit Architecture

### 3.1 Arithmetic Intermediate Representation (AIR)

Beacon Academy circuits should use a **STARK-friendly AIR** with:
- Low-degree transition constraints (degree ≤ 3 preferred)
- Periodic constraints for rhythmic wave alignment
- Efficient range checks using lookup arguments or bitwise decompositions

### 3.2 Recommended Constraint System Style

Use a hybrid approach:
- **Plonkish-style** custom gates for complex logic (voting eligibility, Development Link strength calculations)
- **STARK-native** FRI-based polynomial commitments for scalability

### 3.3 Key Circuit Modules (Priority Order)

| Priority | Circuit Module                  | Description                                                                 | Primary Use Case                     | Estimated Constraint Count |
|----------|---------------------------------|-----------------------------------------------------------------------------|--------------------------------------|----------------------------|
| 1 (High) | `VoteValidity`                  | Proves voter eligibility + well-formed ballot without revealing choice     | Democratic voting (Section 5)       | Medium                     |
| 2 (High) | `FitnessThreshold`              | Proves Quad/Academy meets contribution threshold(s) without exact metrics  | Resource priority, influence        | Medium-High                |
| 3        | `DevelopmentLinkStrength`       | Proves a Development Link meets quality criteria over a time window        | Mentorship verification             | Medium                     |
| 4        | `ResilienceEligibility`         | Proves eligibility for fission support or crisis resource claims           | Section 13 resilience triggers      | Low-Medium                 |
| 5        | `AggregateStatistic`            | Recursive proof that an aggregate (e.g., average skill rate) is correct    | Digital Twin (Section 14)           | High (but recursive)       |

## 4. Circuit Design Recommendations by Use Case

### 4.1 Private Verifiable Voting (`VoteValidity`)

**Goal**: Prove that a participant is eligible to vote and that their encrypted/nullified vote is well-formed, without revealing the vote or identity.

**Key Constraints**:
- Merkle proof of eligibility in the current voter set (or Development Link registry)
- Correct encryption of vote (if using encrypted ballots)
- Nullifier has not been used before (prevents double voting)
- Vote is within valid option space

**Recommended Technique**:
- Use a nullifier derived from a secret + context (similar to Zcash/MACI)
- Combine with a membership proof in a Merkle tree of eligible participants
- For coercion resistance, consider MACI-style key evolution or quadratic voting extensions

### 4.2 Fitness Threshold Proofs (`FitnessThreshold`)

**Goal**: Prove that a Quad or Academy’s aggregated contribution meets or exceeds a threshold without revealing the exact Fitness score or individual metrics.

**Key Constraints**:
- Correct aggregation of Primary Role contribution + passion project value over a time window
- Weighted sum meets threshold
- No negative contributions (or proper handling of penalties)

**Recommended Technique**:
- Use range proofs + sumcheck-style aggregation
- Consider recursive proofs if proving over long time windows or many Quads

### 4.3 Development Link Strength Proofs

**Goal**: Prove that a Development Link has maintained sufficient strength/skill transfer over a period without exposing the full interaction history.

**Key Constraints**:
- Link existed for required duration
- Minimum number of successful skill-transfer interactions occurred
- Link strength remained above threshold on average

## 5. Implementation Recommendations

1. **Start with `VoteValidity` circuit** — Highest impact and clearest requirements.
2. **Use a STARK-friendly DSL** (e.g., Cairo, Miden, or a custom Rust-based AIR generator) for circuit development.
3. **Implement recursive proving early** — Critical for `AggregateStatistic` proofs used by the Digital Twin.
4. **Design circuits with future homomorphic encryption integration in mind** — Some claims may later combine ZK + FHE (see hybrid architecture document).
5. **Auditability requirement** — All circuit code and constraint definitions must be publicly reviewable and versioned on the ledger.

## 6. Open Questions & Risks

- Proving time for complex Fitness aggregation circuits may be high initially. Mitigation: Start with simpler threshold proofs and evolve to full aggregation.
- Recursive proof overhead for Digital Twin aggregate statistics needs careful benchmarking.
- Side-channel resistance during proof generation on participant devices (especially mobile) requires attention.

---

**Next Recommended Step**: Combine this with the Homomorphic Encryption investigation to define the full hybrid cryptographic architecture.
