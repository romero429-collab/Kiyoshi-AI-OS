// src/subsystems/mem.rs — ΩMEM: Runtime Memory State subsystem
//
// Stub implementation of Module trait for the Memory subsystem.

use crate::core::event::Event;
use crate::core::module::{FeedbackDeclaration, Module, VerificationResult};

#[derive(Debug, Clone)]
pub struct MemState {
    /// Simulated allocated bytes
    pub allocated_bytes: u64,
    pub peak_bytes: u64,
    pub version: u64,
}

impl Default for MemState {
    fn default() -> Self {
        MemState { allocated_bytes: 0, peak_bytes: 0, version: 0 }
    }
}

pub struct MemSubsystem {
    state: MemState,
    last_explanation: String,
    /// Soft limit in bytes
    pub soft_limit: u64,
}

impl MemSubsystem {
    pub fn new() -> Self {
        MemSubsystem {
            state: MemState::default(),
            last_explanation: "initialised".to_string(),
            soft_limit: 1_073_741_824, // 1 GiB
        }
    }
}

impl Default for MemSubsystem {
    fn default() -> Self { Self::new() }
}

impl Module for MemSubsystem {
    type State = MemState;
    type Input = Event;
    type Output = ();

    fn id(&self) -> &str { "ΩMEM" }

    fn state(&self) -> &Self::State { &self.state }

    fn transition(&mut self, input: &Event) -> Self::Output {
        // Simulate allocation changes based on event type
        use crate::core::event::EventType;
        match &input.event_type {
            EventType::ApplicationStart => self.state.allocated_bytes += 4096,
            EventType::ApplicationClose => {
                self.state.allocated_bytes = self.state.allocated_bytes.saturating_sub(4096);
            }
            EventType::FileLoad => self.state.allocated_bytes += 1024,
            _ => {}
        }
        if self.state.allocated_bytes > self.state.peak_bytes {
            self.state.peak_bytes = self.state.allocated_bytes;
        }
        self.state.version += 1;
        self.last_explanation = format!(
            "ΩMEM: {:?} — allocated={}B peak={}B",
            input.event_type, self.state.allocated_bytes, self.state.peak_bytes
        );
    }

    fn verify(&self) -> VerificationResult {
        if self.state.allocated_bytes > self.soft_limit {
            VerificationResult::Warning(format!(
                "allocated {} bytes exceeds soft limit {}", self.state.allocated_bytes, self.soft_limit
            ))
        } else {
            VerificationResult::Pass
        }
    }

    fn last_transition_explanation(&self) -> String { self.last_explanation.clone() }

    fn feedback_declaration(&self) -> FeedbackDeclaration {
        FeedbackDeclaration {
            sources: vec!["ΩDATA".to_string()],
            targets: vec!["ΩSYS".to_string()],
            max_amplification: 1.0,
            recovery_condition: "trigger garbage collection; free caches".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{EventType, Payload, Priority};

    #[test]
    fn test_mem_soft_limit_warning() {
        let mut sub = MemSubsystem::new();
        sub.soft_limit = 100;
        sub.state.allocated_bytes = 200;
        assert!(matches!(sub.verify(), VerificationResult::Warning(_)));
    }

    #[test]
    fn test_mem_peak_tracking() {
        let mut sub = MemSubsystem::new();
        let e = Event::new(1, 0, EventType::ApplicationStart, Priority::Normal, "sys", None, Payload::empty());
        sub.transition(&e);
        assert!(sub.state().peak_bytes >= sub.state().allocated_bytes);
    }
}
