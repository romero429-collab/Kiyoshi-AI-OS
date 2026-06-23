// src/core/transition.rs
//
// Chapter 3.2 — Universal Transition Operator Φ: Ω × E → Ω
// Chapter 3.4 — Event Queue Q(t) — ordered, deterministic processing
//
// Axiom 4: Event Causality — S(t+1) = T(S(t), E(t))
// Axiom 5: Observability   — every transition is logged
//
// Processing rule (Chapter 3.4):
//   while Q ≠ Ø {
//     remove first event
//     verify integrity
//     identify subscribers
//     execute transition
//     generate outputs
//     append new events
//     record diagnostics
//   }
//
// Complexity: O(n · k) per step, n = subscribers, k = subsystem state size.

use crate::core::event::{Event, EventBus, EventType, Payload, Priority};
use crate::core::state::GlobalState;
use crate::diagnostics::DiagnosticsLog;
use crate::metrics::MetricsCollector;
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// TransitionRecord — observability artefact (Axiom 5)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionRecord {
    pub time_index: u64,
    pub event_id: u64,
    pub event_type: String,
    pub subscribers: Vec<String>,
    pub delta_norm: f64,
    pub stability_before: f64,
    pub stability_after: f64,
}

// ---------------------------------------------------------------------------
// Scheduler — owns Q(t) and drives the Φ operator
// ---------------------------------------------------------------------------

pub struct Scheduler {
    pub bus: EventBus,
    pub state: GlobalState,
    pub metrics: MetricsCollector,
    pub diagnostics: DiagnosticsLog,
    pub history: Vec<TransitionRecord>,
    next_event_id: u64,
}

impl Scheduler {
    /// Create a new Scheduler with the initial global state Ω(0).  O(1).
    pub fn new() -> Self {
        Scheduler {
            bus: EventBus::new(),
            state: GlobalState::initial(),
            metrics: MetricsCollector::new(),
            diagnostics: DiagnosticsLog::new(),
            history: Vec::new(),
            next_event_id: 1,
        }
    }

    /// Allocate a new monotonically increasing event id.  O(1).
    pub fn next_id(&mut self) -> u64 {
        let id = self.next_event_id;
        self.next_event_id += 1;
        id
    }

    /// Enqueue an event onto Q(t).  O(1).
    pub fn enqueue(&mut self, event: Event) -> Result<(), String> {
        self.bus.publish(event)
    }

    /// Helper to create and enqueue a tick event.  O(1).
    pub fn tick(&mut self) {
        let id = self.next_id();
        let ts = self.state.time_index;
        let event = Event::new(
            id,
            ts,
            EventType::TickAdvance,
            Priority::Low,
            "scheduler",
            None,
            Payload::empty(),
        );
        // tick events are always valid — unwrap is safe
        self.bus.publish(event).expect("tick event must publish");
    }

    /// Process all pending events in Q(t) — Chapter 3.4 processing loop.
    ///
    /// Complexity: O(n · m) where n = queue length, m = subscriber count.
    pub fn process_queue(&mut self) {
        while !self.bus.is_empty() {
            let event = match self.bus.next_event() {
                Some(e) => e,
                None => break,
            };

            // Step 1 — verify event integrity
            if !event.verify_integrity() {
                self.diagnostics.log_warning(format!(
                    "Integrity check failed for event id={}", event.id
                ));
                continue;
            }

            // Step 2 — identify subscribers
            let subscribers: Vec<String> = self
                .bus
                .subscribers_for(&event.event_type)
                .to_vec();

            // Step 3 — record state before transition
            let state_before = self.state.clone();
            let stability_before = self.metrics.stability_value();

            // Step 4 — execute transition: Φ(Ω(t), E(t)) → Ω(t+1)
            apply_transition(&mut self.state, &event);
            self.state.advance_time();

            // Step 5 — update metrics
            let delta = state_before.delta_norm(&self.state);
            self.metrics.record_transition(&state_before, &self.state, &event);

            // Step 6 — record diagnostics (Axiom 5: Observability)
            let stability_after = self.metrics.stability_value();
            let record = TransitionRecord {
                time_index: self.state.time_index,
                event_id: event.id,
                event_type: format!("{:?}", event.event_type),
                subscribers: subscribers.clone(),
                delta_norm: delta,
                stability_before,
                stability_after,
            };
            self.diagnostics.log_transition(&record);
            self.history.push(record);
        }
    }

    /// Return the full transition history for inspection.  O(1).
    pub fn history(&self) -> &[TransitionRecord] {
        &self.history
    }
}

impl Default for Scheduler {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// apply_transition — Φ core logic
//
// Routes the event to the appropriate subsystem state.
// This is a pure function of (Ω, E): identical inputs → identical Ω′.
// Axiom 1: Determinism.  Axiom 4: Event Causality.
// ---------------------------------------------------------------------------

/// Apply a single event to the global state, producing the next state.
/// O(1) — constant number of branches regardless of state size.
pub fn apply_transition(state: &mut GlobalState, event: &Event) {
    let source = event.source.clone();
    let event_type_str = format!("{:?}", event.event_type);

    match &event.event_type {
        EventType::InputEvent | EventType::ButtonPress | EventType::WindowCreated => {
            state.ui.set(
                format!("last_event_{}", event.id),
                serde_json::json!({ "type": event_type_str, "source": source }),
            );
        }
        EventType::AiRequest | EventType::AiResponse => {
            state.ai.set(
                format!("last_event_{}", event.id),
                serde_json::json!({ "type": event_type_str }),
            );
        }
        EventType::ApplicationStart | EventType::ApplicationClose | EventType::CalculationComplete => {
            state.app.set(
                format!("last_event_{}", event.id),
                serde_json::json!({ "type": event_type_str }),
            );
        }
        EventType::FileLoad | EventType::FileSave => {
            state.data.set(
                format!("last_event_{}", event.id),
                serde_json::json!({ "type": event_type_str }),
            );
        }
        EventType::FileDelete => {
            // Conservation Principle (Chapter 3.11): deletions must be logged
            state.data.set(
                format!("deleted_{}", event.id),
                serde_json::json!({
                    "type": "FileDelete",
                    "logged": true,
                    "timestamp": event.timestamp
                }),
            );
        }
        EventType::NetworkPacket => {
            state.net.set(
                format!("last_event_{}", event.id),
                serde_json::json!({ "type": event_type_str }),
            );
        }
        EventType::DiagnosticWarning | EventType::SystemException => {
            state.sys.set(
                format!("last_event_{}", event.id),
                serde_json::json!({ "type": event_type_str, "source": source }),
            );
        }
        EventType::TickAdvance => {
            // Clock tick: advance system subsystem version
            state.sys.set(
                format!("tick_{}", event.timestamp),
                serde_json::json!(event.timestamp),
            );
        }
        EventType::Custom(name) => {
            state.sys.set(
                format!("custom_{}", event.id),
                serde_json::json!({ "name": name }),
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{Event, EventType, Payload, Priority};

    fn make_event(id: u64, et: EventType) -> Event {
        Event::new(id, id * 1000, et, Priority::Normal, "test", None, Payload::empty())
    }

    #[test]
    fn test_determinism_axiom1() {
        // Axiom 1: identical (state, event) must produce identical next state.
        let mut s1 = GlobalState::initial();
        let mut s2 = GlobalState::initial();

        let e1 = make_event(1, EventType::TickAdvance);
        let e2 = make_event(1, EventType::TickAdvance);

        apply_transition(&mut s1, &e1);
        apply_transition(&mut s2, &e2);

        assert_eq!(s1, s2, "Axiom 1: deterministic transition must produce identical states");
    }

    #[test]
    fn test_event_causality_axiom4() {
        // Axiom 4: S(t+1) = T(S(t), E(t)) — the next state depends only on current state + event.
        let initial = GlobalState::initial();
        let mut s = initial.clone();
        let e = make_event(7, EventType::AiRequest);
        apply_transition(&mut s, &e);
        // AI subsystem version must have advanced
        assert!(s.ai.version > initial.ai.version,
            "Axiom 4: AI event must transition the AI subsystem state");
    }

    #[test]
    fn test_file_delete_conservation_principle() {
        // Chapter 3.11: deletions must be logged in state.
        let mut s = GlobalState::initial();
        let e = make_event(42, EventType::FileDelete);
        apply_transition(&mut s, &e);
        let key = format!("deleted_{}", 42);
        assert!(
            s.data.data.contains_key(&key),
            "Conservation Principle: FileDelete must be recorded in ΩDATA"
        );
    }

    #[test]
    fn test_scheduler_processes_queue() {
        let mut sched = Scheduler::new();
        sched.tick();
        assert_eq!(sched.bus.len(), 1);
        sched.process_queue();
        assert_eq!(sched.bus.len(), 0, "queue must be empty after processing");
        assert_eq!(sched.history.len(), 1, "one transition must be recorded");
    }

    #[test]
    fn test_scheduler_time_advances() {
        let mut sched = Scheduler::new();
        assert_eq!(sched.state.time_index, 0);
        sched.tick();
        sched.process_queue();
        assert_eq!(sched.state.time_index, 1);
    }

    #[test]
    fn test_scheduler_rejects_tampered_event() {
        let mut sched = Scheduler::new();
        let mut e = Event::new(
            99, 0, EventType::AiRequest, Priority::High, "src", None, Payload::empty(),
        );
        e.id = 0; // tamper — hash will fail
        // publish should fail
        assert!(sched.enqueue(e).is_err());
    }
}
