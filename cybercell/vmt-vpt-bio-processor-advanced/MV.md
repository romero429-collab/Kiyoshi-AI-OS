# MV.md — Advanced Verification Mapping

| Requirement | Experiment | Pass Criterion |
|-------------|------------|----------------|
| Fast contraction | Twin-trajectory fast subsystem | \(\lambda_{fast} < -0.05\) |
| Slow remodeling | Averaged \(\tau\) update | \(\tau\) drifts only above \(\sigma_{crit}\) |
| Guardrail | Large \(p\) injection | \(\hat\lambda_1\) restored < -0.05 in <10 steps |
| RPA robustness | \(p\)-sweep | \(\delta^* = 0\) independent of \(p\) |
| Power-law approx | Step response of multi-mode | Relaxation ~ \(t^{-\alpha}\) over intermediate window |
| TDA diagnostic | Persistence on trajectory | \(\beta_1\) low in contracting regime |
| Mobile viz | Touch + responsive test | Functional on 428×926 viewport |
| Reproducibility | Seed=42 dual-clock | Identical bounded trajectory |

All experiments reproducible.