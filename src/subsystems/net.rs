// src/subsystems/net.rs — ΩNET: Network State subsystem
//
// Stub implementation of Module trait for the Network subsystem.

use crate::core::event::Event;
use crate::core::module::{FeedbackDeclaration, Module, VerificationResult};

#[derive(Debug, Clone)]
pub struct NetState {
    pub packets_received: u64,
    pub bytes_received: u64,
    pub version: u64,
}

impl Default for NetState {
    fn default() -> Self {
        NetState { packets_received: 0, bytes_received: 0, version: 0 }
    }
}

pub struct NetSubsystem {
    state: NetState,
    last_explanation: String,
}

impl NetSubsystem {
    pub fn new() -> Self {
        NetSubsystem { state: NetState::default(), last_explanation: "initialised".to_string() }
    }
}

impl Default for NetSubsystem {
    fn default() -> Self { Self::new() }
}

impl Module for NetSubsystem {
    type State = NetState;
    type Input = Event;
    type Output = ();

    fn id(&self) -> &str { "ΩNET" }

    fn state(&self) -> &Self::State { &self.state }

    fn transition(&mut self, input: &Event) -> Self::Output {
        use crate::core::event::EventType;
        if let EventType::NetworkPacket = &input.event_type {
            self.state.packets_received += 1;
            // Payload byte count as proxy for transfer size
            self.state.bytes_received += input.payload.as_bytes().len() as u64;
        }
        self.state.version += 1;
        self.last_explanation = format!(
            "ΩNET: {:?} — packets={} bytes={}",
            input.event_type, self.state.packets_received, self.state.bytes_received
        );
    }

    fn verify(&self) -> VerificationResult {
        VerificationResult::Pass
    }

    fn last_transition_explanation(&self) -> String { self.last_explanation.clone() }

    fn feedback_declaration(&self) -> FeedbackDeclaration {
        FeedbackDeclaration {
            sources: vec![],
            targets: vec!["ΩAI".to_string(), "ΩDATA".to_string()],
            max_amplification: 2.0,
            recovery_condition: "throttle incoming connections; drop low-priority packets".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::event::{EventType, Payload, Priority};

    #[test]
    fn test_net_packet_count() {
        let mut sub = NetSubsystem::new();
        let e = Event::new(1, 0, EventType::NetworkPacket, Priority::Normal, "net", None, Payload::from_str("hello"));
        sub.transition(&e);
        assert_eq!(sub.state().packets_received, 1);
        assert!(sub.state().bytes_received > 0);
    }
}
