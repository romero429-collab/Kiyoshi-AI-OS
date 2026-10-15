---
name: kiyoshi-protocol-languages
description: Designs and maintains the two protocol languages (Internal Authority Language and Zero-Trust Transfer Language) plus their cryptographic suites for Red Clover agents under the Kiyoshi Protective Membrane. Trigger on requests involving data transfer protocols, zero-trust agent communication, authority vector language design, or mapping ASI intent challenges to Kiyoshi architecture.
---

# Kiyoshi Protocol Languages

## Overview
This skill captures the design constraints for the two languages required so every Red Clover agent operates under native zero-trust while the Protective Membrane (AS-0002) can still enforce contracting authority.

## Core Languages

### Internal Authority Language (IAL)
- Post-verification only.
- Carries graded \( A_s(t) \), intent claims, Evidence Bus records.
- Must remain contracting (negative or zero largest Lyapunov exponent on acceptance).

### Zero-Trust Transfer Language (ZTL)
- Pre-verification / peer-to-peer.
- All claims default to Unknown.
- Membrane free to reject, transform, contain, or isolate.

Each requires a dedicated cryptographic suite.

## Usage
When designing or extending agent messaging:
1. Identify whether the message is pre- or post-Membrane verification.
2. Select IAL or ZTL accordingly.
3. Ensure the cryptographic layer binds to the Authority Vector and Evidence Bus invariants.
4. Verify no path allows silent Unknown → Safe escalation.

## Related Artifacts
- AS-0002 Protective Membrane Architecture v0.3
- ADR-0003 Protective Response Hierarchy
- Anise Cybernetic Cell Specification
- Iris Lyapunov Stability Protocol
