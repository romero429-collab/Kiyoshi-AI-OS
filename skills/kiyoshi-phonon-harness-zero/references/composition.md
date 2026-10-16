# Composition

## Process P — phonon QND

Source: arXiv:2610.10714, Safavi-Naeini, Makihara, Szakiel, 17 September 2026.

| Symbol | Value |
| --- | --- |
| ω_m / 2π | 3.277 GHz |
| m_eff | 0.1995 pg |
| χ / 2π | 164 kHz |
| T₁ | 2.1 ms |
| T₁eff | 649 μs |
| parity interval | 12 μs |
| herald fidelity | 0.85 |
| single-shot agreement | 2/3 |

Γ(h) = 1/T₁, Γ(h*) = 1/T₁eff, Γ_ba = Γ(h*) − Γ(h).

β = T₁ / T₁eff = 3.2357.

Per-check back-action probability 1 − exp(−Γ_ba · 12 μs) = 1.269%, the reported ≈ 1.3%.

## Process H — Harness-Zero

Source: arXiv:2609.24974, Ye, Lu, Dong, Su, Song, 21 September 2026.

Student Qwen3.5-9B. Coach GPT-5.6 Sol. LoRA, 2 epochs. Collection overhead 2.4×. Pattern recovery 82.3% of 28.

| Domain | base + h | base + h* | distilled + h |
| --- | --- | --- | --- |
| SpreadsheetBench | 31.0 | 39.0 | 44.0 |
| AppWorld | 26.8 | 48.2 | 58.9 |
| USPTO | 12.0 | 38.0 | 30.0 |
| macro | 23.3 | 41.7 | 44.3 |

The macro is the unweighted mean, rounded to one decimal. USPTO is the counterexample inside the paper: 30.0 < 38.0.

## The join

```
distill(τ) is legal iff Γ(h*) = Γ(h)
```

`compose` implements that. For this meter Γ_ba ≠ 0, so τ_deploy = T₁.

Occupation score, seed 20261016, 4000 probes uniform on [0, 2 ms], call 1{exp(−t/τ) ≥ 1/2}:

| Setting | τ_student | τ_plant | score |
| --- | --- | --- | --- |
| base + free | 2.1 ms | 2.1 ms | 0.6805 |
| base + watch | 2.1 ms | 649 μs | 0.554 |
| illegal distill, coach deleted | 649 μs | 2.1 ms | 0.52975 |
| legal distill, coach deleted | 2.1 ms | 2.1 ms | 0.6805 |

The paper's 23.3 / 41.7 / 44.3 and these four scores are different experiments. Do not average them.
