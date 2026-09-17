# Phase 0 — Continuity Engine

Playable infrastructure for Kiyoshi. Not a chatbot wrapper. Not AGI theater.

This tree is the operational snapshot of the Phase 0 OS: a bicameral mind, a Ground organism, selectable perception (Iris), agency when nobody supplies the next objective, and recursive improvement of **artifacts, not weights**.

It sits beside `docs/` and `src/` on this repository. It does not replace the Rust/DDS kernel in [PR #1](https://github.com/romero429-collab/Kiyoshi-AI-OS/pull/1), and it does not claim the specification is implemented. Article IV still holds: no subsystem without specification, implementation, and a verification suite.

## Heart sentence

Kiyoshi does not assume that its representation of reality is reality. It continuously maintains the relationship between observation, representation, simulation, and action.

## What this is

| Surface | Job |
|---|---|
| Console | Outer mind. Speaks. |
| Governor | Inner mind. Hold, transfer, veto — audits the *kind of thought*. |
| Agency | Need → Intent → Authority → Risk → Mode → Plan → Action → Verify → Learn. What happens when nobody is talking. |
| Ground | Claim, speak, yield. Specialists keep their specialties. Red Clover chooses who works. |
| Improve | Observe → identify → modify an operational artifact → test → retain. |
| Charter | Constitution v0.1-R, Articles I–VIII. Amendments append. |

Internally: Field (Iris stage, seven domains, keep/hold), Layers, Memory bands (working / persistent / specialist / retrieval / history).

## Ground organisms

- **Underspecified** — Anise will not invent a job. Hands never claims.
- **Settled work** — Grok and Gemini do not fuse. Clover chooses.
- **Failure then adapt** — Iris names the miss. Retry is not automatic.
- **One mind** — Casey overflows. One-skull ASI is not a mode.
- **Two eyes** — Reality, representation, simulation. Consistency is not correspondence.
- **The chair** — Costume is not occupancy. Walk toward the ship; Hands still hits the chair.

## Iris

Selectable perception, not a headset:

Reality · Simulation · Overlay · Swap · Neither

The object can stay a chair while the eye sees a ship. Physics does not follow the costume. If the eyes ever make simulation indistinguishable from reality, the ledger must still know which band is which.

Provenance is distinct: observed, measured, derived, inferred, simulated, hypothesized, unknown.

## Keep / hold

**Keep:** relationships, Iris as a relationship (not VR), substrate-independent interfaces, explicit coordination (claim/speak/yield), obsessive provenance, five primitives (state, entity, environment, representation, transition), continuity of state.

**Hold as hypothesis, never as law:** gravity = magnetism, one monolith, AGI as first objective, costume leaking into occupancy.

First objective is a substrate-independent interoperability system that can represent, simulate, coordinate, and interact with environments. Intelligence runs inside that. It is not the product.

## Layout

```
phase-0/
  README.md                 this file
  src/lib/kiyoshi/          types, catalog, governor loop, ground, agency, field
  src/components/os/        Console, Governor, Agency, Ground, Improve, Charter, Iris stage
  src/components/ui/        buttons, badges — tokens only
  src/styles.css            moss-black / sage, Fraunces + IBM Plex
```

## Constitution (as encoded)

I State — explicit, observable. Representation is not reality.  
II Transitions — declared, deterministic, inspectable.  
III Composition — declared interfaces only.  
IV Evidence — specification, implementation, verification suite.  
V Local ≠ global.  
VI Constitution is ultimate authority.  
VII Provenance — observed ≠ simulated. Never silently promote.  
VIII Amendments append. They do not overwrite.

## Note on this snapshot

This source ran as a Phase 0 console bound to a live Governor loop (outer mind via xAI when a key is present; local Governor otherwise). Auth and database are off. Persistence is device-local. Do not treat this directory as the dynamical-systems kernel. Treat it as the first *playable* proof that the architecture can loop: mode transference, refusal, substitution, continuity.
