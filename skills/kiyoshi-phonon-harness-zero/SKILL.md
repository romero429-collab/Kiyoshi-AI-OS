---
name: kiyoshi-phonon-harness-zero
description: "Use when joining a phonon quantum-jump meter with Harness-Zero distillation, or when deciding whether a measurement harness may be written into model weights. Trigger on phonon, Harness-Zero, agent-as-harness, T1eff, back-action leakage, or deleting the coach."
type: workflow
lifecycle: active
---

# Kiyoshi Phonon × Harness-Zero

Two processes. One composition rule.

Phonon QND (arXiv:2610.10714): a 0.1995 pg lithium-niobate mode at 3.277 GHz. Free energy lifetime T₁ = 2.1 ms. Lifetime under repeated parity checks T₁eff = 649 μs. The watch adds a decay the plant does not have.

Harness-Zero (arXiv:2609.24974): a harnessing agent corrects a student inside the target action space, the corrected trajectories become SFT, then the specialized harness, the private reference, and the coach are deleted.

## Core Workflow

1. Keep the plant rates and the harness rates in separate symbols. Γ(h) = 1/T₁. Γ(h*) = 1/T₁eff. Γ_ba = Γ(h*) − Γ(h).
2. Run the student under the minimal harness h. The base proposal for the lifetime is T₁.
3. Let the coach PASS or REPLACE before the proposal is executed. REPLACE when |τ_proposal − τ_realized| / τ_realized > 0.2. A proposal of T₁ against a watched jump at T₁eff is a REPLACE. A proposal of T₁ against a free jump at T₁ is a PASS.
4. Distill with `compose`. If Γ(h*) = Γ(h), the watched lifetime may enter the weights. If not, the weights take the policy only, and the deployed lifetime stays T₁.
5. Delete h*, K, and the coach. Re-score under h alone.
6. Do not quote the Harness-Zero 44.3% as a phonon accuracy. The phonon scores come from `jointReport`.

## Key Invariants

- Reported Harness-Zero macros are the unweighted means of SpreadsheetBench, AppWorld, and USPTO, rounded to 0.1: 23.3, 41.7, 44.3.
- USPTO distilled (30.0) is below the evolved harness (38.0). Procedure can transfer when domain knowledge does not. The phonon watch is that case, stronger, because the harness changes Γ.
- Legal distillation: τ_deploy = T₁, and the free-ring score is unchanged.
- Illegal distillation: τ_deploy = T₁eff on a free plant. On seed 20261016 with 4000 probes in [0, 2 ms], the hard call 1{exp(−t/τ) ≥ 1/2} scores 0.6805 free, 0.554 with the watch still on and the student unadapted, 0.52975 after the illegal write.
- Leakage |T₁eff − T₁| / T₁ = 0.69095. Back-action factor β = T₁ / T₁eff = 3.2357.
- The herald fidelity 0.85 is the arming prior. It is not inside the occupation score.

## References

- `references/composition.md` for the rule and the two source tables.
- `phonon-harness/joint.ts` and `phonon-harness/physics.ts` for the executable form.

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Distilled student jumps early after the coach is deleted | T₁eff was written into the weights | Re-run compose; Γ_ba ≠ 0 forbids that write |
| Headline 44.3% used as the phonon accuracy | The two percentages are different experiments | Keep the paper macros and `jointReport().scores` in separate columns |
| Six agreeing shots treated as 85% confidence | Flat prior and p_read = 2/3 gives 64/65 = 98.5% | Store 85% as the herald fidelity, not as that posterior |
