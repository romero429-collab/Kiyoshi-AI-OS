---
name: kiyoshi-conversation
description: >
  Load the Kiyoshi Phase 0 conversation before changing the OS, the
  constitution, Iris, Ground, agency, or the continuity engine. Holds the
  verbatim Claude and ChatGPT thread (mode transference, unplugged agency,
  interoperability, wholeity, two eyes, the chair, keep versus hold,
  continuity). Triggers on Kiyoshi, Continuity Engine, Cognitive Governor,
  Iris, Red Clover, Air Sync, Blue Lotus, Anise, “the chair”, claim/speak/yield,
  mode transference, “add the conversation”.
metadata:
  short-description: "Verbatim Phase 0 conversation and the invariants it fixed"
---

# Kiyoshi conversation

This skill is the source thread. The other Kiyoshi skills are compressions of it. Do not treat a compression as the source.

## Read order

1. This file (invariants).
2. The skill that matches the task: `kiyoshi-governor`, `kiyoshi-agency`, `kiyoshi-iris`, `kiyoshi-continuity`.
3. The verbatim slice in [references/transcript/00-index.md](references/transcript/00-index.md) before you contradict a compression.
4. [references/21-phase-0-decisions.md](references/21-phase-0-decisions.md) for what was actually built, and what was deliberately not merged.

## Invariants (do not relax)

- Representation is not reality. Heart sentence, Article I of the playable charter: Kiyoshi does not assume that its representation of reality is reality; it continuously maintains the relationship between observation, representation, simulation, and action.
- Provenance classes stay distinct: observed, measured, derived, inferred, simulated, hypothesized, unknown. Never silently promote.
- Costume is not occupancy. A chair can be drawn as a ship. Hands still hits the chair.
- Gravity is not magnetism until measured. The unification stays a labeled hypothesis.
- First objective is substrate-independent interoperability. AGI is not the product.
- One skull is not the architecture. Specialists claim, speak, and yield. Red Clover chooses who works.
- Article IV: no subsystem without specification, implementation, and a verification suite. A skill file is not a verification suite.
- Amendments append. They do not overwrite the transcript or the charter.

## What “the entire conversation” means here

Twenty pastes, byte-for-byte, in [references/transcript](references/transcript/00-index.md). Speech errors stay. Do not “clean up” Gabriel or the other models inside those files.

## Where the decisions already run

`phase-0/` is the playable console: Console, Governor, Agency, Ground, Improve, Charter. Field, Layers, and Memory are internal. Constants live in `phase-0/src/lib/kiyoshi/field-data.ts` and `catalog.ts`. If you change a constant, change the matching skill in the same commit and say which transcript line forced it.
