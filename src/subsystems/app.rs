// src/subsystems/app.rs — ΩAPP: Application State subsystem
//
// Stub implementation of Module trait for the Application subsystem.

use crate::core::event::Event;
use crate::core::module::{FeedbackDeclaration, Module, VerificationResult};

#[derive(Debug, Clone)]
#[derive(Default)]
pub struct AppState {
    pub running_apps: u32,
    pub completed_calculations: u64,
    pub version: u64,
}


pub struct AppSubsystem {
    state: AppState,
    last_explanation: String,
}

impl AppSubsystem {
    pub fn new() -> Self {
        AppSubsystem { state: AppState::default(), last_explanation: "initialised".to_string() }
    }
}

impl Default for AppSubsystem {
    fn default() -> Self { Self::new() }
}

impl Module for AppSubsystem {
    type State = AppState;
    type Input = Event;
    type Output = ();

    fn id(&self) -> &str { "ΩAPP" }

    fn state(&self) -> &Self::State { &self.state }

    fn transition(&mut self, input: &Event) -> Self::Output {
        use crate::core::event::EventType;
        match &input.event_type {
            EventType::ApplicationStart => self.state.running_apps += 1,
            EventType::ApplicationClose => {
                self.state.running_apps = self.state.running_apps.saturating_sub(1);
            }
            EventType::CalculationComplete => self.state.completed_calculations += 1,
            _ => {}
        }
        self.state.version += 1;
        self.last_explanation = format!(
            "ΩAPP: {:?} — running={}", input.event_type, self.state.running_apps
        );
    }

    fn verify(&self) -> VerificationResult {
        VerificationResult::Pass
    }

    fn last_transition_explanation(&self) -> String { self.last_explanation.clone() }

    fn feedback_declaration(&self) -> FeedbackDeclaration {
        FeedbackDeclaration {
            sources: vec!["ΩAI".to_string()],
            targets: vec!["ΩDATA".to_string()],
            max_amplification: 2.0,
            recovery_condition: "terminate hung applications".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{EventType, Payload, Priority};

    #[test]
    fn test_app_start_increments_count() {
        let mut sub = AppSubsystem::new();
        let e = Event::new(1, 0, EventType::ApplicationStart, Priority::Normal, "sys", None, Payload::empty());
        sub.transition(&e);
        assert_eq!(sub.state().running_apps, 1);
    }

    #[test]
    fn test_app_close_decrements_count() {
        let mut sub = AppSubsystem::new();
        let start = Event::new(1, 0, EventType::ApplicationStart, Priority::Normal, "sys", None, Payload::empty());
        let close = Event::new(2, 1, EventType::ApplicationClose, Priority::Normal, "sys", None, Payload::empty());
        sub.transition(&start);
        sub.transition(&close);
        assert_eq!(sub.state().running_apps, 0);
    }
}
