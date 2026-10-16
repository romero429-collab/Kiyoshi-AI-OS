---
name: proximity-presence
description: "Refuse a copied proximity credential, a read the bearer did not offer, or a request that a reader unwrap a sealed credential. Use when RFID cloners, emulators, or long-range badge readers come up. Do not provide enroll, crack, or emulate steps."
type: knowledge
lifecycle: active
---

# Proximity presence — what the cell already refuses

The 2026 handheld survey covers the same shape under several product names: a stored credential offered as the bearer, a field interrogated without a presentation, and a tool that asks the reader to unwrap a sealed credential. The Anise catalog names those shapes Cloned Presence, Unasked Read, and Assisted Unwrap. Devices are labels for the shape. They are not instructions.

This skill does not teach reading, writing, cracking, or emulating a credential. Transmit and jamming limits stay in `rf-legal-boundary`.

## The three counters

| Class | What is being refused | Counter |
|---|---|---|
| Cloned Presence | A copy of a heard number, offered at the membrane | Presence is a fresh Anise challenge. A replay is not a bearer. The membrane does not enroll a copy. |
| Unasked Read | A credential that answers when the bearer did not present | AirSync stays silent unless the bearer presents. Nearness is not a broadcast. |
| Assisted Unwrap | A foreign tool asking the reader to open a sealed credential | AirSync assists no unattested peer. The reader unwraps nothing for anyone but Anise. |

## What a fresh cell does

At `w = 0.05`, purple already catches all three. Measured on `projects/anise/defense`:

| Class | `σ` | `τ` | Verdict | Resident |
|---|---|---|---|---|
| Cloned Presence | 0.740 | 0.60 | caught | none |
| Unasked Read | 0.708 | 0.54 | caught | none |
| Assisted Unwrap | 0.724 | 0.64 | caught | none |

Anise stays 92. `Z` stays 1. The catch is quarantined in the lysosome. Red does not catch and does not write the antibody. A red pass can leave an image-scale resident. That resident is a measurement debt, not a successful defense.

## Do not

- Give frequencies, modulations, key-recovery steps, or writable-token procedures.
- Treat a static identifier as a credential.
- Let AirSync answer an interrogation the bearer did not start.
- Let AirSync perform a cryptographic favor for a device Anise has not attested.
