// src/stability.rs
//
// Chapter 3.5 — System Attractors Ω* (stable equilibrium)
// Chapter 3.7 — Lyapunov monitoring: L(Ω(t+1)) ≤ L(Ω(t)) for healthy system
// Chapter 3.6 — Chaotic behaviour detection: measure ΔΩ = ||Ω(t+1) - Ω(t)||
// Chapter 3.8 — Feedback loop bounds
//
// Complexity: O(n) per attractor check (n = history length), O(1) feedback check.

use crate::core::state::GlobalState;
use crate::metrics::{global_state_entropy, MetricsCollector};
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// AttractorStatus — Chapter 3.5
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AttractorStatus {
    /// System is at or near Ω* — no unnecessary computation
    AtAttractor,
    /// System is converging toward Ω*
    Converging,
    /// System is drifting away from Ω*
    Diverging,
    /// Insufficient data to determine
    Unknown,
}

impl std::fmt::Display for AttractorStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AttractorStatus::AtAttractor => write!(f, "AT_ATTRACTOR"),
            AttractorStatus::Converging => write!(f, "CONVERGING"),
            AttractorStatus::Diverging => write!(f, "DIVERGING"),
            AttractorStatus::Unknown => write!(f, "UNKNOWN"),
        }
    }
}

// ---------------------------------------------------------------------------
// FeedbackLoop — Chapter 3.8
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackLoop {
    pub id: String,
    pub is_positive: bool,
    /// Current amplification factor
    pub amplification: f64,
    /// Maximum allowed amplification (must remain bounded)
    pub max_amplification: f64,
}

impl FeedbackLoop {
    pub fn new(id: impl Into<String>, is_positive: bool, max_amplification: f64) -> Self {
        FeedbackLoop {
            id: id.into(),
            is_positive,
            amplification: 1.0,
            max_amplification,
        }
    }

    /// True if this loop is within its bounds.  O(1).
    pub fn is_bounded(&self) -> bool {
        self.amplification <= self.max_amplification
    }
}

// ---------------------------------------------------------------------------
// LyapunovMonitor
// ---------------------------------------------------------------------------

pub struct LyapunovMonitor {
    pub feedback_loops: Vec<FeedbackLoop>,
    attractor_tolerance: f64,
    stability_history: Vec<f64>,
}

impl LyapunovMonitor {
    /// Create a new Lyapunov monitor.  O(1).
    pub fn new() -> Self {
        LyapunovMonitor {
            feedback_loops: Vec::new(),
            attractor_tolerance: 1e-3,
            stability_history: Vec::new(),
        }
    }

    /// Register a feedback loop.  O(1).
    pub fn register_feedback_loop(&mut self, loop_: FeedbackLoop) {
        self.feedback_loops.push(loop_);
    }

    /// Record a new stability value.  O(1).
    pub fn record(&mut self, stability: f64) {
        self.stability_history.push(stability);
    }

    /// Determine the current attractor status.  O(n) where n = window size.
    pub fn attractor_status(&self, window: usize) -> AttractorStatus {
        if self.stability_history.len() < 2 {
            return AttractorStatus::Unknown;
        }
        let tail = if self.stability_history.len() >= window {
            &self.stability_history[self.stability_history.len() - window..]
        } else {
            &self.stability_history
        };

        let last = *tail.last().unwrap();
        let first = *tail.first().unwrap();
        let range = (last - first).abs();

        if range < self.attractor_tolerance {
            AttractorStatus::AtAttractor
        } else if last < first {
            AttractorStatus::Converging
        } else {
            AttractorStatus::Diverging
        }
    }

    /// True if the Lyapunov condition holds over the last `window` entries.
    ///
    /// Healthy: L(Ω(t+1)) ≤ L(Ω(t)).  O(window).
    pub fn lyapunov_condition_holds(&self, window: usize) -> bool {
        if self.stability_history.len() < window {
            return true; // not enough data — assume OK
        }
        let tail = &self.stability_history[self.stability_history.len() - window..];
        tail.windows(2).all(|pair| pair[1] <= pair[0])
    }

    /// Check all feedback loops are bounded.  O(n).
    pub fn all_feedback_bounded(&self) -> bool {
        self.feedback_loops.iter().all(|fl| fl.is_bounded())
    }

    /// Return unbounded feedback loops.  O(n).
    pub fn unbounded_loops(&self) -> Vec<&FeedbackLoop> {
        self.feedback_loops.iter().filter(|fl| !fl.is_bounded()).collect()
    }

    /// Compute a composite health score ∈ [0, 1].  Higher = healthier.  O(n).
    pub fn health_score(&self, metrics: &MetricsCollector) -> f64 {
        // Penalty factors:
        // - max_delta_norm (normalised by a reference scale)
        // - number of unbounded loops
        let delta_penalty = (metrics.max_delta_norm() / 100.0).min(1.0);
        let loop_penalty = (self.unbounded_loops().len() as f64 * 0.1).min(1.0);
        let lyapunov_ok = if self.lyapunov_condition_holds(5) { 0.0 } else { 0.2 };
        (1.0 - delta_penalty - loop_penalty - lyapunov_ok).max(0.0)
    }

    /// Full stability value history.  O(1).
    pub fn stability_history(&self) -> &[f64] {
        &self.stability_history
    }
}

impl Default for LyapunovMonitor {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// High-level stability report
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StabilityReport {
    pub attractor_status: String,
    pub lyapunov_condition_holds: bool,
    pub max_delta_norm: f64,
    pub health_score: f64,
    pub entropy: f64,
    pub unbounded_feedback_count: usize,
}

impl StabilityReport {
    /// Build a stability report from the current monitor, metrics, and state.  O(n).
    pub fn build(
        monitor: &LyapunovMonitor,
        metrics: &MetricsCollector,
        state: &GlobalState,
    ) -> Self {
        StabilityReport {
            attractor_status: monitor.attractor_status(10).to_string(),
            lyapunov_condition_holds: monitor.lyapunov_condition_holds(5),
            max_delta_norm: metrics.max_delta_norm(),
            health_score: monitor.health_score(metrics),
            entropy: global_state_entropy(state),
            unbounded_feedback_count: monitor.unbounded_loops().len(),
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::metrics::MetricsCollector;

    #[test]
    fn test_attractor_unknown_empty() {
        let monitor = LyapunovMonitor::new();
        assert_eq!(monitor.attractor_status(5), AttractorStatus::Unknown);
    }

    #[test]
    fn test_attractor_at_attractor_stable() {
        let mut monitor = LyapunovMonitor::new();
        for _ in 0..10 {
            monitor.record(1.000); // constant → at attractor
        }
        assert_eq!(monitor.attractor_status(5), AttractorStatus::AtAttractor);
    }

    #[test]
    fn test_attractor_converging() {
        let mut monitor = LyapunovMonitor::new();
        for i in 0..10 {
            monitor.record(10.0 - i as f64); // decreasing
        }
        assert_eq!(monitor.attractor_status(5), AttractorStatus::Converging);
    }

    #[test]
    fn test_attractor_diverging() {
        let mut monitor = LyapunovMonitor::new();
        for i in 0..10 {
            monitor.record(i as f64); // increasing
        }
        assert_eq!(monitor.attractor_status(5), AttractorStatus::Diverging);
    }

    #[test]
    fn test_lyapunov_condition_holds_decreasing() {
        let mut monitor = LyapunovMonitor::new();
        for i in (0..10).rev() {
            monitor.record(i as f64); // 9,8,...,0
        }
        assert!(monitor.lyapunov_condition_holds(5), "decreasing L satisfies Lyapunov condition");
    }

    #[test]
    fn test_lyapunov_condition_fails_increasing() {
        let mut monitor = LyapunovMonitor::new();
        for i in 0..10 {
            monitor.record(i as f64); // 0,1,...,9
        }
        assert!(
            !monitor.lyapunov_condition_holds(5),
            "increasing L must fail Lyapunov condition"
        );
    }

    #[test]
    fn test_feedback_bounded() {
        let loop_ = FeedbackLoop::new("ui_feedback", true, 2.0);
        assert!(loop_.is_bounded());
    }

    #[test]
    fn test_feedback_unbounded() {
        let mut loop_ = FeedbackLoop::new("ai_feedback", true, 2.0);
        loop_.amplification = 5.0;
        assert!(!loop_.is_bounded());
    }

    #[test]
    fn test_health_score_range() {
        let monitor = LyapunovMonitor::new();
        let metrics = MetricsCollector::new();
        let score = monitor.health_score(&metrics);
        assert!((0.0..=1.0).contains(&score), "health score must be in [0, 1]");
    }
}
