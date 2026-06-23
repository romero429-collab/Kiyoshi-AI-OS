// src/subsystems/data.rs — ΩDATA: Persistent Data State subsystem
//
// Stub implementation of Module trait for the Data subsystem.
// Conservation Principle (Chapter 3.11): all deletions are logged.

use crate::core::event::Event;
use crate::core::module::{FeedbackDeclaration, Module, VerificationResult};

#[derive(Debug, Clone)]
pub struct DataState {
    pub files_loaded: u64,
    pub files_saved: u64,
    pub deletion_count: u64,
    pub version: u64,
}

impl Default for DataState {
    fn default() -> Self {
        DataState { files_loaded: 0, files_saved: 0, deletion_count: 0, version: 0 }
    }
}

pub struct DataSubsystem {
    state: DataState,
    last_explanation: String,
    /// Conservation log — every deletion recorded (Chapter 3.11)
    deletion_log: Vec<String>,
}

impl DataSubsystem {
    pub fn new() -> Self {
        DataSubsystem {
            state: DataState::default(),
            last_explanation: "initialised".to_string(),
            deletion_log: Vec::new(),
        }
    }

    pub fn deletion_log(&self) -> &[String] {
        &self.deletion_log
    }
}

impl Default for DataSubsystem {
    fn default() -> Self { Self::new() }
}

impl Module for DataSubsystem {
    type State = DataState;
    type Input = Event;
    type Output = ();

    fn id(&self) -> &str { "ΩDATA" }

    fn state(&self) -> &Self::State { &self.state }

    fn transition(&mut self, input: &Event) -> Self::Output {
        use crate::core::event::EventType;
        match &input.event_type {
            EventType::FileLoad => self.state.files_loaded += 1,
            EventType::FileSave => self.state.files_saved += 1,
            EventType::FileDelete => {
                self.state.deletion_count += 1;
                // Conservation Principle: log every deletion
                self.deletion_log.push(format!(
                    "t={} event_id={} payload={}",
                    input.timestamp,
                    input.id,
                    input.payload.0
                ));
            }
            _ => {}
        }
        self.state.version += 1;
        self.last_explanation = format!(
            "ΩDATA: {:?} — loaded={} saved={} deleted={}",
            input.event_type, self.state.files_loaded, self.state.files_saved,
            self.state.deletion_count
        );
    }

    fn verify(&self) -> VerificationResult {
        VerificationResult::Pass
    }

    fn last_transition_explanation(&self) -> String { self.last_explanation.clone() }

    fn feedback_declaration(&self) -> FeedbackDeclaration {
        FeedbackDeclaration {
            sources: vec!["ΩAPP".to_string()],
            targets: vec!["ΩMEM".to_string()],
            max_amplification: 1.5,
            recovery_condition: "flush write buffer; verify checksums".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{EventType, Payload, Priority};

    #[test]
    fn test_deletion_logged() {
        let mut sub = DataSubsystem::new();
        let e = Event::new(5, 100, EventType::FileDelete, Priority::Normal, "app", None, Payload::empty());
        sub.transition(&e);
        assert_eq!(sub.deletion_log().len(), 1,
            "Conservation Principle: deletion must be logged");
    }

    #[test]
    fn test_file_load_save_counts() {
        let mut sub = DataSubsystem::new();
        let load = Event::new(1, 0, EventType::FileLoad, Priority::Normal, "app", None, Payload::empty());
        let save = Event::new(2, 1, EventType::FileSave, Priority::Normal, "app", None, Payload::empty());
        sub.transition(&load);
        sub.transition(&save);
        assert_eq!(sub.state().files_loaded, 1);
        assert_eq!(sub.state().files_saved, 1);
    }
}
