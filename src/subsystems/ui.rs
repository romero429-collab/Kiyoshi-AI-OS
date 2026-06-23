// src/subsystems/ui.rs — ΩUI: User Interface State subsystem
//
// Stub implementation of Module trait for the UI subsystem.

use crate::core::event::Event;
use crate::core::module::{FeedbackDeclaration, Module, VerificationResult};

#[derive(Debug, Clone)]
pub struct UiState {
    pub active_windows: u32,
    pub last_input_timestamp: u64,
    pub version: u64,
}

impl Default for UiState {
    fn default() -> Self {
        UiState { active_windows: 0, last_input_timestamp: 0, version: 0 }
    }
}

pub struct UiSubsystem {
    state: UiState,
    last_explanation: String,
}

impl UiSubsystem {
    pub fn new() -> Self {
        UiSubsystem { state: UiState::default(), last_explanation: "initialised".to_string() }
    }
}

impl Default for UiSubsystem {
    fn default() -> Self { Self::new() }
}

impl Module for UiSubsystem {
    type State = UiState;
    type Input = Event;
    type Output = ();

    fn id(&self) -> &str { "ΩUI" }

    fn state(&self) -> &Self::State { &self.state }

    fn transition(&mut self, input: &Event) -> Self::Output {
        self.state.last_input_timestamp = input.timestamp;
        self.state.version += 1;
        self.last_explanation = format!(
            "ΩUI: processed {:?} at t={}", input.event_type, input.timestamp
        );
    }

    fn verify(&self) -> VerificationResult {
        VerificationResult::Pass
    }

    fn last_transition_explanation(&self) -> String {
        self.last_explanation.clone()
    }

    fn feedback_declaration(&self) -> FeedbackDeclaration {
        FeedbackDeclaration {
            sources: vec![],
            targets: vec!["ΩAI".to_string()],
            max_amplification: 2.0,
            recovery_condition: "flush input queue".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{EventType, Payload, Priority};

    #[test]
    fn test_ui_transition_updates_state() {
        let mut sub = UiSubsystem::new();
        let e = Event::new(1, 999, EventType::ButtonPress, Priority::Normal,
            "ui", None, Payload::empty());
        sub.transition(&e);
        assert_eq!(sub.state().last_input_timestamp, 999);
        assert_eq!(sub.state().version, 1);
    }

    #[test]
    fn test_ui_verify_pass() {
        let sub = UiSubsystem::new();
        assert_eq!(sub.verify(), VerificationResult::Pass);
    }
}
