---
name: kiyoshi-defense
description: "Operate the Anise defense instrument. Use when protecting the cell, running red or purple assays, pricing parasite mass, clearing the lysosome, or checking that Zero stayed sealed. Trigger on Kiyoshi defense, Anise nucleus, RedClover charge, resident mass, metabolic deficit, or lysosome tax."
type: workflow
lifecycle: active
---

# Kiyoshi Defense — Anise cell protocols

Source of truth is `romero429-collab/main`, path `projects/anise/defense`. This skill operates that instrument. It does not redefine Kiyoshi. Kiyoshi stays the Continuity Engine (`kiyoshi-project-lock`). The organ names here are the Anise cell's names.

## Invariants

- `Z = 1` on every trace. A drill that would open Anise is reflected. Anise is not reduced on a reflection, and Anise is not a parasite host.
- Purple catches when `σ ≥ τ` and writes `w`. Red reports `σ` and does not write `w`.
- Health is structural, then taxed: `H = H_s − Λ`. A resident is counted whether or not AirSync has noticed it.
- Do not publish exploit steps. Classes are shapes. Counters are the membrane, the attestation, the fixed metabolism, and the seal.

## Organs

| Organ | Role | Weight in `H_s` |
|---|---|---|
| Anise | Nucleus, antibody index, Zero seal | `0.18 A` |
| AirSync | Sensory | `0.16 S` |
| RedClover | Mitochondrion, the only charge | `0.20 M` |
| Membrane | Only public surface | `0.16 B` |
| Cytoskeleton | Bounded transitions | `0.14 C` |
| Lysosome | Quarantine | `0.16 (100 − Q)` |

## When to use which action

1. If `Q > 72`, the only legal next spend is a clear. Drills are refused.
2. If any organ other than RedClover or the lysosome is under `62`, repair before another drill.
3. If charge cannot pay the drill, breathe. Do not invent a second charge source.
4. A resident with mass at the cap (`0.25`, bite `8.8`) must be excised while charge can still pay. After charge falls through the excise cost, breathing cannot bank it back.
5. Clear the lysosome when `Q ≥ 10`. Clearing a resting lysosome (`Q = 6`) loses health.

## Laws

The equations, the three bite regimes, the quarantine surcharge, and the measured trajectories are in `references/laws.md`. The session that fixed them is in `references/conversation-summary.md`.

Code check, from `projects/anise/defense`:

```bash
node --experimental-strip-types --test model.test.ts
```
