// src/subsystems/sys.rs — ΩSYS: System Service State subsystem
//
// Stub implementation of Module trait for the System subsystem.
// Handles diagnostic warnings, system exceptions, and tick advances.

use crate::core::event::Event;
use crate::core::module::{FeedbackDeclaration, Module, VerificationResult};

#[derive(Debug, Clone)]
#[derive(Default)]
pub struct SysState {
    pub warnings: u64,
    pub exceptions: u64,
    pub ticks: u64,
    pub version: u64,
}


pub struct SysSubsystem {
    state: SysState,
    last_explanation: String,
}

impl SysSubsystem {
    pub fn new() -> Self {
        SysSubsystem { state: SysState::default(), last_explanation: "initialised".to_string() }
    }
}

impl Default for SysSubsystem {
    fn default() -> Self { Self::new() }
}

impl Module for SysSubsystem {
    type State = SysState;
    type Input = Event;
    type Output = ();

    fn id(&self) -> &str { "ΩSYS" }

    fn state(&self) -> &Self::State { &self.state }

    fn transition(&mut self, input: &Event) -> Self::Output {
        use crate::core::event::EventType;
        match &input.event_type {
            EventType::DiagnosticWarning => self.state.warnings += 1,
            EventType::SystemException => self.state.exceptions += 1,
            EventType::TickAdvance => self.state.ticks += 1,
            _ => {}
        }
        self.state.version += 1;
        self.last_explanation = format!(
            "ΩSYS: {:?} — warnings={} exceptions={} ticks={}",
            input.event_type, self.state.warnings, self.state.exceptions, self.state.ticks
        );
    }

    fn verify(&self) -> VerificationResult {
        if self.state.exceptions > 0 {
            VerificationResult::Warning(format!(
                "{} unresolved system exception(s)", self.state.exceptions
            ))
        } else {
            VerificationResult::Pass
        }
    }

    fn last_transition_explanation(&self) -> String { self.last_explanation.clone() }

    fn feedback_declaration(&self) -> FeedbackDeclaration {
        FeedbackDeclaration {
            sources: vec![
                "ΩMEM".to_string(),
                "ΩIO".to_string(),
                "ΩNET".to_string(),
            ],
            targets: vec![],
            max_amplification: 1.0,
            recovery_condition: "restart failed services; escalate persistent exceptions".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{EventType, Payload, Priority};

    #[test]
    fn test_sys_exception_warning() {
        let mut sub = SysSubsystem::new();
        let e = Event::new(1, 0, EventType::SystemException, Priority::Critical, "kernel", None, Payload::empty());
        sub.transition(&e);
        assert!(matches!(sub.verify(), VerificationResult::Warning(_)));
    }

    #[test]
    fn test_sys_tick_count() {
        let mut sub = SysSubsystem::new();
        let e = Event::new(1, 0, EventType::TickAdvance, Priority::Low, "scheduler", None, Payload::empty());
        sub.transition(&e);
        assert_eq!(sub.state().ticks, 1);
    }
}
