// src/subsystems/ai.rs — ΩAI: Artificial Intelligence State subsystem
//
// Stub implementation of Module trait for the AI subsystem.

use crate::core::event::Event;
use crate::core::module::{FeedbackDeclaration, Module, VerificationResult};

#[derive(Debug, Clone)]
pub struct AiState {
    pub pending_requests: u32,
    pub completed_requests: u64,
    pub confidence: f64,
    pub version: u64,
}

impl Default for AiState {
    fn default() -> Self {
        AiState { pending_requests: 0, completed_requests: 0, confidence: 1.0, version: 0 }
    }
}

pub struct AiSubsystem {
    state: AiState,
    last_explanation: String,
}

impl AiSubsystem {
    pub fn new() -> Self {
        AiSubsystem { state: AiState::default(), last_explanation: "initialised".to_string() }
    }
}

impl Default for AiSubsystem {
    fn default() -> Self { Self::new() }
}

impl Module for AiSubsystem {
    type State = AiState;
    type Input = Event;
    type Output = ();

    fn id(&self) -> &str { "ΩAI" }

    fn state(&self) -> &Self::State { &self.state }

    fn transition(&mut self, input: &Event) -> Self::Output {
        use crate::core::event::EventType;
        match &input.event_type {
            EventType::AiRequest => self.state.pending_requests += 1,
            EventType::AiResponse => {
                self.state.pending_requests = self.state.pending_requests.saturating_sub(1);
                self.state.completed_requests += 1;
            }
            _ => {}
        }
        self.state.version += 1;
        self.last_explanation = format!(
            "ΩAI: processed {:?} — pending={} completed={}",
            input.event_type, self.state.pending_requests, self.state.completed_requests
        );
    }

    fn verify(&self) -> VerificationResult {
        if self.state.confidence < 0.0 || self.state.confidence > 1.0 {
            VerificationResult::Fail("confidence out of [0,1] range".to_string())
        } else {
            VerificationResult::Pass
        }
    }

    fn last_transition_explanation(&self) -> String {
        self.last_explanation.clone()
    }

    fn feedback_declaration(&self) -> FeedbackDeclaration {
        FeedbackDeclaration {
            sources: vec!["ΩUI".to_string()],
            targets: vec!["ΩAPP".to_string()],
            max_amplification: 3.0,
            recovery_condition: "reduce request rate; clear pending queue".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{EventType, Payload, Priority};

    #[test]
    fn test_ai_request_increments_pending() {
        let mut sub = AiSubsystem::new();
        let e = Event::new(1, 0, EventType::AiRequest, Priority::High, "ui", None, Payload::empty());
        sub.transition(&e);
        assert_eq!(sub.state().pending_requests, 1);
    }

    #[test]
    fn test_ai_response_decrements_pending() {
        let mut sub = AiSubsystem::new();
        let req = Event::new(1, 0, EventType::AiRequest, Priority::High, "ui", None, Payload::empty());
        let resp = Event::new(2, 1, EventType::AiResponse, Priority::High, "ai", None, Payload::empty());
        sub.transition(&req);
        sub.transition(&resp);
        assert_eq!(sub.state().pending_requests, 0);
        assert_eq!(sub.state().completed_requests, 1);
    }
}
