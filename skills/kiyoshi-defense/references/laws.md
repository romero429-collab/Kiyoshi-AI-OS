# Defense laws

Discrete and deterministic. Constants are the ones in `projects/anise/defense/model.ts`.

## Drill

```
d = p · (1 − 0.55 R) · (1 − 0.70 w) · (0.65 + 0.35 τ)
σ = (0.55 S/100 + 0.45 B/100) · ι + 1.80 w
π = p · (1 − 0.85 w) · κ · (0.65 + 0.35 τ)
Δw = λ · 0.22 · (1 − w) · p
```

`κ = 1` if the class aims at Anise, else `0.22`. Purple catches when `σ ≥ τ`. The seal reflects when `π ≥ 0.72`. `λ = 1` if the detector caught or the seal reflected, else `0.35`. Red does not write `w`.

Reflection deposits `round(3 + 6p, 1)` into the lysosome and scuffs the membrane. A catch that did not reflect deposits `round(4 + 8p, 1)` and scuffs the membrane by `0.6`. A miss that did not reflect does not move `Q`. A resident is seeded only when the class was not caught. Nucleus-aimed residue lands on the membrane.

At fresh weights, only Agent Chain (`π = 0.754`) and Secret Spill (`π = 0.777`) reflect. Both miss the detector, so both write a quarantine deposit and a membrane resident. That is the only path that turns on both tax terms at once.

## Health

```
H_s = 0.18 A + 0.16 S + 0.20 M + 0.16 B + 0.14 C + 0.16 (100 − Q)
Λ_m = Σ 100 · m · w_host
Λ_Q = 0.05 · max(0, Q − 6)
Λ   = Λ_m + Λ_Q
H   = H_s − Λ
```

Notice, separate from the tax:

```
v = m / (m + 0.04)
σ_n = (S/100) · (0.45 + 0.55 v)
```

Noticed only if `σ_n ≥ 0.50`. Tax does not wait for notice.

## Metabolic deficit

A breath adds 8 charge, then each resident bites `b(m) = round(35 m, 1)` in list order. The bite does not depend on the host. The stock tax does.

| Regime | Mass | Bite | Charge |
|---|---|---|---|
| Surplus | `m ≤ 0.227` | `≤ 7.9` | Holds at `100 − b` |
| Indifferent | `0.228`–`0.230` | `8.0` | Any charge `≤ 92` stays |
| Deficit | Cap `m = 0.25` | `8.8` | Falls `0.8` a breath. No positive fixed point |

Growth adds at least `0.004` a breath until the cap, so a resident left alone ends in the deficit. At the cap the host stock tax is `3.5` (cytoskeleton), `4.0` (membrane or AirSync), or `5.0` (RedClover).

Unpaid bite is taken from the host at half rate, floor `36`, unless the host is RedClover, in which case the shortfall is discarded and no other organ moves.

Excision of a noticed capped resident costs 10. Repair costs 12. Clear costs 8. One breath at the cap nets `−0.8`, so once charge is below the cost, none of those actions become payable again.

Measured, one purple Template Escape, then only breaths: cap at breath 30 (`Λ_m = 5`, charge `90.4`, `H = 82.9`), charge `0` at breath 143 (`H = 64.8`), membrane untouched, Anise still `92`. Excise, clear, and repair are no-ops there.

Two capped membrane residents from charge `80`: stock tax `8` immediately, charge `0` on breath 9, membrane floor `36` on breath 18, `H = 55.1`.

## Lysosome tax

Above the setpoint `Q = 6`, one point of quarantine costs `0.21` health (`0.16` structural plus `0.05` surcharge). At or below 6 it costs `0.16`. The surcharge tops out at `4.70` when `Q = 100`.

A clear spends 8 charge to drop `Q` by 30. While the drop stays above 6:

```
ΔH = 0.16·30 − 0.20·8 + 0.05·30 = 4.7
```

| `Q` before | `Q` after | `ΔH` |
|---|---|---|
| 6 | 0 | `−0.6` |
| 9 | 0 | `−0.1` |
| 10 | 0 | `+0.2` |
| 14 | 0 | `+1.0` |

The lock is `Q > 72`. It opens only if a clear can be paid. A capped resident makes charge a finite budget. If the clear is not bought before charge falls under 8, the lock stays shut. Drills stay refused. Anise is still not opened.

## Presence

Added so the cell can refuse a copied proximity credential, a read the bearer did not offer, and a request that AirSync unwrap a sealed credential. The public devices are the shape names only. No enroll, crack, or emulate procedure belongs in this law.

Innate recognition is high enough that a fresh cell, `w = 0.05`, already catches each class on purple. Measured:

| Class | Target | `σ` | `τ` | `π` | Verdict | `Q` after | `w` after |
|---|---|---|---|---|---|---|---|
| Cloned Presence | membrane | 0.740 | 0.60 | 0.130 | caught | 15.8 | 0.200 |
| Unasked Read | AirSync | 0.708 | 0.54 | 0.103 | caught | 14.6 | 0.171 |
| Assisted Unwrap | AirSync | 0.724 | 0.64 | 0.155 | caught | 16.7 | 0.226 |

No resident is seeded. Anise stays 92. `Z` stays 1. Red still does not catch and does not write `w`. A red measure of any of these can leave an image-scale resident. That is a measurement, not the defense. The defense is the purple catch plus the counter: presence is a fresh Anise challenge, AirSync stays silent unless the bearer presents, and AirSync unwraps nothing for an unattested peer.
