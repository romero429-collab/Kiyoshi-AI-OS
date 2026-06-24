// src/core/module.rs
//
// Chapter 2 — Module definition: M = (S, I, O, T, V)
//   S: Internal State Space
//   I: Input Space
//   O: Output Space
//   T: State Transition Function  T: S × I → S
//   V: Verification Function      → VerificationResult
//
// Axiom 2: Modularity — components communicate only through formal interfaces.
// Axiom 5: Observability — every transition must be explainable.
//
// Complexity: O(1) per trait method (implementations may vary).

use crate::core::event::Event;
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// VerificationResult — returned by V (the verification function)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum VerificationResult {
    Pass,
    Warning(String),
    Fail(String),
}

impl VerificationResult {
    pub fn is_ok(&self) -> bool {
        matches!(self, VerificationResult::Pass | VerificationResult::Warning(_))
    }
}

impl std::fmt::Display for VerificationResult {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            VerificationResult::Pass => write!(f, "PASS"),
            VerificationResult::Warning(msg) => write!(f, "WARNING: {}", msg),
            VerificationResult::Fail(msg) => write!(f, "FAIL: {}", msg),
        }
    }
}

// ---------------------------------------------------------------------------
// ModuleId
// ---------------------------------------------------------------------------

pub type ModuleId = String;

// ---------------------------------------------------------------------------
// FeedbackDeclaration — Chapter 3.8
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackDeclaration {
    pub sources: Vec<ModuleId>,
    pub targets: Vec<ModuleId>,
    /// Maximum allowed amplification factor (positive feedback must be bounded)
    pub max_amplification: f64,
    pub recovery_condition: String,
}

// ---------------------------------------------------------------------------
// Module trait — formal interface for all subsystems (Axiom 2)
// ---------------------------------------------------------------------------

/// Every subsystem in Kiyoshi AI OS must implement this trait.
///
/// S (state), I (input), O (output) are associated types so that the type
/// system enforces the formal M = (S, I, O, T, V) definition.
pub trait Module: Send + Sync {
    /// The internal state type of this module.
    type State: Clone + std::fmt::Debug;
    /// The input type (subset of Event payloads).
    type Input;
    /// The output type produced after a transition.
    type Output;

    // --- Identity ---

    /// Unique module identifier.  O(1).
    fn id(&self) -> &str;

    // --- S: State access ---

    /// Read the current internal state.  O(1).
    fn state(&self) -> &Self::State;

    // --- T: State transition function T: S × I → S  ---

    /// Apply a transition given an event.
    ///
    /// Returns the produced output and records a diagnostic entry.
    /// Every call is deterministic: identical (state, event) → identical output.  O(1).
    fn transition(&mut self, input: &Event) -> Self::Output;

    // --- V: Verification function ---

    /// Verify that the current state satisfies all invariants.  O(1).
    fn verify(&self) -> VerificationResult;

    // --- Observability (Axiom 5) ---

    /// Return a human-readable explanation of the last transition.  O(1).
    fn last_transition_explanation(&self) -> String;

    // --- Feedback declarations (Chapter 3.8) ---

    /// Declare feedback loop metadata.  O(1).
    fn feedback_declaration(&self) -> FeedbackDeclaration;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verification_result_display() {
        assert_eq!(VerificationResult::Pass.to_string(), "PASS");
        assert!(VerificationResult::Warning("low memory".into()).to_string().contains("WARNING"));
        assert!(VerificationResult::Fail("null ptr".into()).to_string().contains("FAIL"));
    }

    #[test]
    fn test_verification_result_is_ok() {
        assert!(VerificationResult::Pass.is_ok());
        assert!(VerificationResult::Warning("x".into()).is_ok());
        assert!(!VerificationResult::Fail("x".into()).is_ok());
    }
}
