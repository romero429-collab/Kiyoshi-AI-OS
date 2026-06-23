// src/metrics.rs
//
// Chapter 3.7 — Stability Function L(Ω) (Lyapunov-style)
// Chapter 3.9 — Computational Energy C = CPU + Memory + GPU + IO + Network
// Chapter 3.10 — Information Entropy H = -Σ p(x) log₂ p(x)
//
// L(Ω) ≥ 0 always.
// L(Ω(t+1)) ≤ L(Ω(t)) for a healthy system.
//
// Complexity: O(n) per entropy computation, O(1) for everything else.

use crate::core::event::Event;
use crate::core::state::GlobalState;
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// ComputationalEnergy — C = CPU + Memory + GPU + IO + Network  (Chapter 3.9)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ComputationalEnergy {
    pub cpu: f64,
    pub memory: f64,
    pub gpu: f64,
    pub io: f64,
    pub network: f64,
}

impl ComputationalEnergy {
    /// Total energy budget.  O(1).
    pub fn total(&self) -> f64 {
        self.cpu + self.memory + self.gpu + self.io + self.network
    }

    /// Add another energy measurement.  O(1).
    pub fn accumulate(&mut self, other: &ComputationalEnergy) {
        self.cpu += other.cpu;
        self.memory += other.memory;
        self.gpu += other.gpu;
        self.io += other.io;
        self.network += other.network;
    }
}

// ---------------------------------------------------------------------------
// StabilityMeasurement — a snapshot of L(Ω)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StabilityMeasurement {
    pub time_index: u64,
    pub value: f64,
    pub delta_norm: f64,
}

// ---------------------------------------------------------------------------
// MetricsCollector
// ---------------------------------------------------------------------------

pub struct MetricsCollector {
    pub energy: ComputationalEnergy,
    stability_history: Vec<StabilityMeasurement>,
    current_stability: f64,
}

impl MetricsCollector {
    /// Create a new metrics collector with zero-valued accumulators.  O(1).
    pub fn new() -> Self {
        MetricsCollector {
            energy: ComputationalEnergy::default(),
            stability_history: Vec::new(),
            current_stability: 0.0,
        }
    }

    /// Current Lyapunov-style stability value L(Ω).  O(1).
    pub fn stability_value(&self) -> f64 {
        self.current_stability
    }

    /// Record a transition and update metrics.  O(1).
    pub fn record_transition(
        &mut self,
        before: &GlobalState,
        after: &GlobalState,
        _event: &Event,
    ) {
        let delta = before.delta_norm(after);

        // Stability = running Euclidean norm of global state (Lyapunov proxy)
        // L(Ω) = ||Ω|| — a non-negative scalar measuring "distance from zero state"
        let new_stability = after.norm();

        // Track whether stability is increasing (degradation signal)
        let measurement = StabilityMeasurement {
            time_index: after.time_index,
            value: new_stability,
            delta_norm: delta,
        };
        self.stability_history.push(measurement);
        self.current_stability = new_stability;

        // Charge energy for a generic transition.  O(1).
        // In a real system each subsystem would report its actual cost.
        let cost = ComputationalEnergy {
            cpu: 0.01,
            memory: 0.005,
            gpu: 0.0,
            io: 0.001,
            network: 0.0,
        };
        self.energy.accumulate(&cost);
    }

    /// Add explicit energy consumption.  O(1).
    pub fn charge_energy(&mut self, cost: ComputationalEnergy) {
        self.energy.accumulate(&cost);
    }

    /// Full stability history.  O(1).
    pub fn stability_history(&self) -> &[StabilityMeasurement] {
        &self.stability_history
    }

    /// True if the last N measurements show non-decreasing stability (degradation).
    ///
    /// O(n) where n = window.
    pub fn is_degrading(&self, window: usize) -> bool {
        if self.stability_history.len() < window {
            return false;
        }
        let tail = &self.stability_history[self.stability_history.len() - window..];
        tail.windows(2).all(|pair| pair[1].value >= pair[0].value)
    }

    /// Maximum delta norm seen so far.  O(n).
    pub fn max_delta_norm(&self) -> f64 {
        self.stability_history
            .iter()
            .map(|m| m.delta_norm)
            .fold(0.0_f64, f64::max)
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// Shannon Entropy H = -Σ p(x) log₂ p(x)  (Chapter 3.10)
// ---------------------------------------------------------------------------

/// Compute Shannon entropy from a frequency distribution.
///
/// Input: slice of raw counts (non-negative integers).
/// O(n) where n = number of unique symbol counts.
pub fn shannon_entropy(counts: &[u64]) -> f64 {
    let total: u64 = counts.iter().sum();
    if total == 0 {
        return 0.0;
    }
    let total_f = total as f64;
    counts
        .iter()
        .filter(|&&c| c > 0)
        .map(|&c| {
            let p = c as f64 / total_f;
            -p * p.log2()
        })
        .sum()
}

/// Compute the entropy of the subsystem version distribution in Ω.
///
/// Higher entropy = more divergent subsystem activity = less predictable.  O(8).
pub fn global_state_entropy(state: &GlobalState) -> f64 {
    let counts = [
        state.ui.version,
        state.ai.version,
        state.app.version,
        state.data.version,
        state.mem.version,
        state.net.version,
        state.io.version,
        state.sys.version,
    ];
    shannon_entropy(&counts)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_energy_total() {
        let e = ComputationalEnergy {
            cpu: 1.0, memory: 2.0, gpu: 3.0, io: 4.0, network: 5.0,
        };
        assert!((e.total() - 15.0).abs() < 1e-10);
    }

    #[test]
    fn test_energy_non_negative_invariant() {
        let e = ComputationalEnergy::default();
        assert!(e.total() >= 0.0, "I6: energy must be non-negative");
    }

    #[test]
    fn test_shannon_entropy_uniform() {
        // Uniform distribution has maximum entropy
        let counts = [1u64, 1, 1, 1];
        let h = shannon_entropy(&counts);
        assert!((h - 2.0).abs() < 1e-10, "4 uniform symbols → H = 2 bits");
    }

    #[test]
    fn test_shannon_entropy_zero_on_single_symbol() {
        let counts = [4u64];
        let h = shannon_entropy(&counts);
        assert!((h - 0.0).abs() < 1e-10, "single symbol → H = 0");
    }

    #[test]
    fn test_shannon_entropy_empty() {
        let h = shannon_entropy(&[]);
        assert_eq!(h, 0.0);
    }

    #[test]
    fn test_global_state_entropy_initial() {
        let state = GlobalState::initial();
        let h = global_state_entropy(&state);
        // All versions = 0, sum = 0 → entropy = 0
        assert_eq!(h, 0.0);
    }

    #[test]
    fn test_metrics_stability_non_negative() {
        // I5: L(Ω) ≥ 0
        let metrics = MetricsCollector::new();
        assert!(metrics.stability_value() >= 0.0, "I5: L(Ω) ≥ 0");
    }

    #[test]
    fn test_metrics_record_transition() {
        use crate::core::event::{Event, EventType, Payload, Priority};
        let mut metrics = MetricsCollector::new();
        let before = GlobalState::initial();
        let mut after = GlobalState::initial();
        after.ui.set("k", serde_json::Value::Null);
        after.advance_time();
        let e = Event::new(1, 0, EventType::TickAdvance, Priority::Low, "test", None, Payload::empty());
        metrics.record_transition(&before, &after, &e);
        assert_eq!(metrics.stability_history().len(), 1);
        assert!(metrics.energy.total() > 0.0, "energy must be charged on transition");
    }
}
