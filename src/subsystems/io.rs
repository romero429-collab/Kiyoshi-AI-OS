// src/subsystems/io.rs — ΩIO: Input/Output State subsystem
//
// Stub implementation of Module trait for the IO subsystem.

use crate::core::event::Event;
use crate::core::module::{FeedbackDeclaration, Module, VerificationResult};

#[derive(Debug, Clone)]
pub struct IoState {
    pub operations_completed: u64,
    pub version: u64,
}

impl Default for IoState {
    fn default() -> Self {
        IoState { operations_completed: 0, version: 0 }
    }
}

pub struct IoSubsystem {
    state: IoState,
    last_explanation: String,
}

impl IoSubsystem {
    pub fn new() -> Self {
        IoSubsystem { state: IoState::default(), last_explanation: "initialised".to_string() }
    }
}

impl Default for IoSubsystem {
    fn default() -> Self { Self::new() }
}

impl Module for IoSubsystem {
    type State = IoState;
    type Input = Event;
    type Output = ();

    fn id(&self) -> &str { "ΩIO" }

    fn state(&self) -> &Self::State { &self.state }

    fn transition(&mut self, input: &Event) -> Self::Output {
        use crate::core::event::EventType;
        match &input.event_type {
            EventType::FileLoad | EventType::FileSave | EventType::NetworkPacket => {
                self.state.operations_completed += 1;
            }
            _ => {}
        }
        self.state.version += 1;
        self.last_explanation = format!(
            "ΩIO: {:?} — ops_completed={}", input.event_type, self.state.operations_completed
        );
    }

    fn verify(&self) -> VerificationResult {
        VerificationResult::Pass
    }

    fn last_transition_explanation(&self) -> String { self.last_explanation.clone() }

    fn feedback_declaration(&self) -> FeedbackDeclaration {
        FeedbackDeclaration {
            sources: vec!["ΩDATA".to_string(), "ΩNET".to_string()],
            targets: vec!["ΩSYS".to_string()],
            max_amplification: 1.0,
            recovery_condition: "drain I/O queue; reset device handles".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{EventType, Payload, Priority};

    #[test]
    fn test_io_operation_count() {
        let mut sub = IoSubsystem::new();
        let e = Event::new(1, 0, EventType::FileLoad, Priority::Normal, "app", None, Payload::empty());
        sub.transition(&e);
        assert_eq!(sub.state().operations_completed, 1);
    }
}
