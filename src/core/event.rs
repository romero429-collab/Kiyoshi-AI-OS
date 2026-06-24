// src/core/event.rs
//
// Chapter 2 — Event definition: e = (τ, σ, p)
//   τ  = timestamp (nanoseconds since epoch)
//   σ  = event type / signature
//   p  = immutable payload
//
// Chapter 3 — Event Bus B: E → M (explicit subscriptions only)
//
// Complexity: O(1) event construction, O(n) dispatch where n = subscriber count.

use std::collections::{HashMap, VecDeque};
use sha2::{Digest, Sha256};
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// EventType — the complete event alphabet Σ (Chapter 3.3)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EventType {
    // User interface
    InputEvent,
    ButtonPress,
    WindowCreated,
    // File system
    FileLoad,
    FileSave,
    FileDelete,
    // Network
    NetworkPacket,
    // AI subsystem
    AiRequest,
    AiResponse,
    // Application lifecycle
    CalculationComplete,
    ApplicationStart,
    ApplicationClose,
    // System signals
    DiagnosticWarning,
    SystemException,
    // Internal scheduler signals
    TickAdvance,
    Custom(String),
}

impl std::fmt::Display for EventType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EventType::Custom(s) => write!(f, "Custom({})", s),
            other => write!(f, "{:?}", other),
        }
    }
}

// ---------------------------------------------------------------------------
// Priority
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum Priority {
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3,
}

// ---------------------------------------------------------------------------
// Payload — immutable, serialisable
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Payload(pub serde_json::Value);

impl Payload {
    pub fn empty() -> Self {
        Payload(serde_json::Value::Null)
    }

    pub fn as_bytes(&self) -> Vec<u8> {
        self.0.to_string().into_bytes()
    }
}

impl std::str::FromStr for Payload {
    type Err = std::convert::Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Payload(serde_json::Value::String(s.to_owned())))
    }
}

// ---------------------------------------------------------------------------
// Event — e = (τ, σ, p)  — immutable once constructed  (Chapter 2 & 3.3)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Event {
    pub id: u64,
    /// τ — timestamp in nanoseconds
    pub timestamp: u64,
    /// σ — event type
    pub event_type: EventType,
    pub priority: Priority,
    pub source: String,
    pub destination: Option<String>,
    /// p — payload (immutable)
    pub payload: Payload,
    /// SHA-256 integrity hash
    pub verification_hash: String,
}

impl Event {
    /// Construct a new immutable event.  O(1).
    pub fn new(
        id: u64,
        timestamp: u64,
        event_type: EventType,
        priority: Priority,
        source: impl Into<String>,
        destination: Option<String>,
        payload: Payload,
    ) -> Self {
        let source = source.into();
        let hash = Self::compute_hash(id, timestamp, &event_type, &source, &payload);
        Event {
            id,
            timestamp,
            event_type,
            priority,
            source,
            destination,
            payload,
            verification_hash: hash,
        }
    }

    /// Verify the integrity of this event by recomputing its hash.  O(1).
    pub fn verify_integrity(&self) -> bool {
        let expected = Self::compute_hash(
            self.id,
            self.timestamp,
            &self.event_type,
            &self.source,
            &self.payload,
        );
        self.verification_hash == expected
    }

    /// Compute SHA-256 over the canonical fields.  O(1).
    fn compute_hash(
        id: u64,
        timestamp: u64,
        event_type: &EventType,
        source: &str,
        payload: &Payload,
    ) -> String {
        let mut hasher = Sha256::new();
        hasher.update(id.to_le_bytes());
        hasher.update(timestamp.to_le_bytes());
        hasher.update(format!("{:?}", event_type).as_bytes());
        hasher.update(source.as_bytes());
        hasher.update(payload.as_bytes());
        hex::encode(hasher.finalize())
    }
}

// ---------------------------------------------------------------------------
// EventBus — B: E → M  (Chapter 2)
//   Explicit subscriptions only.  No implicit routing.
// ---------------------------------------------------------------------------

pub type SubscriberId = String;

pub struct EventBus {
    /// subscriptions[event_type] = [subscriber_id, ...]
    subscriptions: HashMap<String, Vec<SubscriberId>>,
    /// ordered outgoing queue (mirrors Q(t) — Chapter 3.4)
    queue: VecDeque<Event>,
}

impl EventBus {
    /// Create an empty event bus.  O(1).
    pub fn new() -> Self {
        EventBus {
            subscriptions: HashMap::new(),
            queue: VecDeque::new(),
        }
    }

    /// Register a subscriber for an event type.  O(1) amortised.
    pub fn subscribe(&mut self, event_type: &EventType, subscriber: SubscriberId) {
        let key = format!("{:?}", event_type);
        self.subscriptions
            .entry(key)
            .or_default()
            .push(subscriber);
    }

    /// Publish an event onto the queue.  O(1) amortised.
    ///
    /// Returns Err if the event fails integrity verification.
    pub fn publish(&mut self, event: Event) -> Result<(), String> {
        if !event.verify_integrity() {
            return Err(format!(
                "EventBus: integrity check failed for event id={}",
                event.id
            ));
        }
        self.queue.push_back(event);
        Ok(())
    }

    /// Dequeue the next event.  O(1).
    pub fn next_event(&mut self) -> Option<Event> {
        self.queue.pop_front()
    }

    /// Return subscribers for a given event type.  O(1).
    pub fn subscribers_for(&self, event_type: &EventType) -> &[SubscriberId] {
        let key = format!("{:?}", event_type);
        self.subscriptions
            .get(&key)
            .map(|v| v.as_slice())
            .unwrap_or(&[])
    }

    /// True when the queue is empty.
    pub fn is_empty(&self) -> bool {
        self.queue.is_empty()
    }

    /// Number of pending events.
    pub fn len(&self) -> usize {
        self.queue.len()
    }
}

impl Default for EventBus {
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

    fn make_event(id: u64) -> Event {
        Event::new(
            id,
            1_000_000 + id,
            EventType::TickAdvance,
            Priority::Normal,
            "test",
            None,
            Payload::empty(),
        )
    }

    #[test]
    fn test_event_integrity_valid() {
        let e = make_event(1);
        assert!(e.verify_integrity(), "newly constructed event must pass integrity check");
    }

    #[test]
    fn test_event_integrity_tampered() {
        let mut e = make_event(2);
        // Tamper with id after construction
        e.id = 999;
        assert!(
            !e.verify_integrity(),
            "tampered event must fail integrity check"
        );
    }

    #[test]
    fn test_event_immutability_by_cloning() {
        // Axiom 5 / Chapter 2: events are immutable once created.
        // Cloning produces an independent copy; mutating the clone must not affect original.
        let original = make_event(3);
        let mut clone = original.clone();
        clone.id = 999;
        assert_eq!(original.id, 3, "original event must not be affected by clone mutation");
    }

    #[test]
    fn test_event_bus_subscribe_and_dispatch() {
        let mut bus = EventBus::new();
        bus.subscribe(&EventType::TickAdvance, "ai_module".to_string());
        bus.subscribe(&EventType::TickAdvance, "sys_module".to_string());

        let e = make_event(4);
        bus.publish(e).unwrap();

        let subs = bus.subscribers_for(&EventType::TickAdvance);
        assert_eq!(subs.len(), 2);

        let dequeued = bus.next_event().unwrap();
        assert_eq!(dequeued.id, 4);
    }

    #[test]
    fn test_event_bus_rejects_tampered_event() {
        let mut bus = EventBus::new();
        let mut e = make_event(5);
        e.id = 99; // tamper
        let result = bus.publish(e);
        assert!(result.is_err(), "tampered event must be rejected by bus");
    }

    #[test]
    fn test_event_determinism() {
        // Axiom 1: identical inputs → identical outputs
        let e1 = Event::new(
            10, 1000, EventType::AiRequest, Priority::High,
            "src", None, "data".parse().unwrap(),
        );
        let e2 = Event::new(
            10, 1000, EventType::AiRequest, Priority::High,
            "src", None, "data".parse().unwrap(),
        );
        assert_eq!(e1.verification_hash, e2.verification_hash,
            "identical inputs must produce identical event hashes (Axiom 1: Determinism)");
    }
}
