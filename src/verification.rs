// src/verification.rs
//
// Chapter 2 — 6 Computational Invariants with verification checks
// Axiom 5: Observability — every invariant check is explainable
//
// Complexity: O(n) where n = number of invariants checked.

use crate::core::module::VerificationResult;
use crate::core::state::GlobalState;

// ---------------------------------------------------------------------------
// InvariantId — named invariants
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InvariantId {
    /// I1: Time is monotonically non-decreasing
    TimeMonotonicity,
    /// I2: All subsystem versions are non-decreasing
    SubsystemVersionMonotonicity,
    /// I3: Global state norm is non-negative
    NormNonNegativity,
    /// I4: Every subsystem is named (state completeness guard)
    SubsystemNaming,
    /// I5: Stability function is non-negative  L(Ω) ≥ 0
    StabilityNonNegativity,
    /// I6: Energy budget is non-negative  C ≥ 0
    EnergyNonNegativity,
}

impl std::fmt::Display for InvariantId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            InvariantId::TimeMonotonicity => write!(f, "I1:TimeMonotonicity"),
            InvariantId::SubsystemVersionMonotonicity => write!(f, "I2:SubsystemVersionMonotonicity"),
            InvariantId::NormNonNegativity => write!(f, "I3:NormNonNegativity"),
            InvariantId::SubsystemNaming => write!(f, "I4:SubsystemNaming"),
            InvariantId::StabilityNonNegativity => write!(f, "I5:StabilityNonNegativity"),
            InvariantId::EnergyNonNegativity => write!(f, "I6:EnergyNonNegativity"),
        }
    }
}

// ---------------------------------------------------------------------------
// InvariantViolation
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct InvariantViolation {
    pub invariant: InvariantId,
    pub description: String,
}

// ---------------------------------------------------------------------------
// InvariantChecker
// ---------------------------------------------------------------------------

pub struct InvariantChecker {
    previous_time: u64,
    previous_versions: [u64; 8],
    previous_stability: f64,
    previous_energy: f64,
}

impl InvariantChecker {
    pub fn new() -> Self {
        InvariantChecker {
            previous_time: 0,
            previous_versions: [0u64; 8],
            previous_stability: 0.0,
            previous_energy: 0.0,
        }
    }

    /// Check all 6 invariants against the current global state.
    ///
    /// Returns a list of violations.  An empty list means all invariants hold.
    /// O(n) where n = 6 (constant).
    pub fn check(
        &mut self,
        state: &GlobalState,
        stability: f64,
        energy: f64,
    ) -> Vec<InvariantViolation> {
        let mut violations = Vec::new();

        // I1: Time monotonicity
        if state.time_index < self.previous_time {
            violations.push(InvariantViolation {
                invariant: InvariantId::TimeMonotonicity,
                description: format!(
                    "time_index went backwards: {} → {}",
                    self.previous_time, state.time_index
                ),
            });
        }

        // I2: Subsystem version monotonicity
        let current_versions = [
            state.ui.version,
            state.ai.version,
            state.app.version,
            state.data.version,
            state.mem.version,
            state.net.version,
            state.io.version,
            state.sys.version,
        ];
        let names = ["ΩUI", "ΩAI", "ΩAPP", "ΩDATA", "ΩMEM", "ΩNET", "ΩIO", "ΩSYS"];
        for (i, (cur, prev)) in current_versions.iter().zip(self.previous_versions.iter()).enumerate() {
            if cur < prev {
                violations.push(InvariantViolation {
                    invariant: InvariantId::SubsystemVersionMonotonicity,
                    description: format!(
                        "subsystem {} version decreased: {} → {}",
                        names[i], prev, cur
                    ),
                });
            }
        }

        // I3: Norm non-negativity
        let norm = state.norm();
        if norm < 0.0 {
            violations.push(InvariantViolation {
                invariant: InvariantId::NormNonNegativity,
                description: format!("||Ω|| = {} < 0", norm),
            });
        }

        // I4: Subsystem naming (state completeness guard)
        let sub_names = [
            &state.ui.name, &state.ai.name, &state.app.name, &state.data.name,
            &state.mem.name, &state.net.name, &state.io.name, &state.sys.name,
        ];
        for name in &sub_names {
            if name.is_empty() {
                violations.push(InvariantViolation {
                    invariant: InvariantId::SubsystemNaming,
                    description: "subsystem has empty name".to_string(),
                });
            }
        }

        // I5: Stability non-negativity  L(Ω) ≥ 0
        if stability < 0.0 {
            violations.push(InvariantViolation {
                invariant: InvariantId::StabilityNonNegativity,
                description: format!("L(Ω) = {} < 0", stability),
            });
        }

        // I6: Energy non-negativity  C ≥ 0
        if energy < 0.0 {
            violations.push(InvariantViolation {
                invariant: InvariantId::EnergyNonNegativity,
                description: format!("C = {} < 0", energy),
            });
        }

        // Update previous snapshot
        self.previous_time = state.time_index;
        self.previous_versions = current_versions;
        self.previous_stability = stability;
        self.previous_energy = energy;

        violations
    }

    /// Convert violations into a VerificationResult.  O(n).
    pub fn to_verification_result(violations: &[InvariantViolation]) -> VerificationResult {
        if violations.is_empty() {
            VerificationResult::Pass
        } else {
            let summary = violations
                .iter()
                .map(|v| format!("[{}] {}", v.invariant, v.description))
                .collect::<Vec<_>>()
                .join("; ");
            VerificationResult::Fail(summary)
        }
    }
}

impl Default for InvariantChecker {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_invariants_pass_on_initial_state() {
        let mut checker = InvariantChecker::new();
        let state = GlobalState::initial();
        let violations = checker.check(&state, 0.0, 0.0);
        assert!(violations.is_empty(), "initial state must satisfy all 6 invariants: {:?}", violations);
    }

    #[test]
    fn test_invariant_i5_stability_negative() {
        let mut checker = InvariantChecker::new();
        let state = GlobalState::initial();
        let violations = checker.check(&state, -1.0, 0.0);
        assert!(
            violations.iter().any(|v| v.invariant == InvariantId::StabilityNonNegativity),
            "negative stability must trigger I5 violation"
        );
    }

    #[test]
    fn test_invariant_i6_energy_negative() {
        let mut checker = InvariantChecker::new();
        let state = GlobalState::initial();
        let violations = checker.check(&state, 0.0, -5.0);
        assert!(
            violations.iter().any(|v| v.invariant == InvariantId::EnergyNonNegativity),
            "negative energy must trigger I6 violation"
        );
    }

    #[test]
    fn test_invariant_i1_time_backwards() {
        let mut checker = InvariantChecker::new();
        let mut state = GlobalState::initial();
        state.time_index = 10;
        checker.check(&state, 0.0, 0.0); // advance checker snapshot
        state.time_index = 5; // regress time
        let violations = checker.check(&state, 0.0, 0.0);
        assert!(
            violations.iter().any(|v| v.invariant == InvariantId::TimeMonotonicity),
            "backwards time must trigger I1 violation"
        );
    }

    #[test]
    fn test_to_verification_result_pass() {
        let result = InvariantChecker::to_verification_result(&[]);
        assert_eq!(result, VerificationResult::Pass);
    }

    #[test]
    fn test_to_verification_result_fail() {
        let violations = vec![InvariantViolation {
            invariant: InvariantId::EnergyNonNegativity,
            description: "C = -1".to_string(),
        }];
        let result = InvariantChecker::to_verification_result(&violations);
        assert!(matches!(result, VerificationResult::Fail(_)));
    }
}
