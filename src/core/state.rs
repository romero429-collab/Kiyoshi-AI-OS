// src/core/state.rs
//
// Chapter 2 — Global State: Ω = S₁ × S₂ × ... × Sn (Cartesian product)
// Chapter 3 — Universal State Space:
//   Ω = ΩUI × ΩAI × ΩAPP × ΩDATA × ΩMEM × ΩNET × ΩIO × ΩSYS
//
// Axiom 3: State Completeness — Ω(t) contains ALL subsystem states.
//
// Complexity: O(1) for state access, O(n) for norm computation (n = subsystems).

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// SubsystemState — the common envelope held by every subsystem slot in Ω
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SubsystemState {
    pub name: String,
    /// Arbitrary key-value data stored by the subsystem.
    pub data: std::collections::HashMap<String, serde_json::Value>,
    /// Monotonic version counter — incremented on every transition.
    pub version: u64,
}

impl SubsystemState {
    pub fn new(name: impl Into<String>) -> Self {
        SubsystemState {
            name: name.into(),
            data: std::collections::HashMap::new(),
            version: 0,
        }
    }

    /// Insert or update a key-value pair.  O(1).
    pub fn set(&mut self, key: impl Into<String>, value: serde_json::Value) {
        self.data.insert(key.into(), value);
        self.version += 1;
    }

    /// Compute a simple numeric norm for this subsystem state (used by ΔΩ).  O(k).
    pub fn norm(&self) -> f64 {
        // Norm = version number; concrete subsystems may override this semantic.
        self.version as f64
    }
}

impl Default for SubsystemState {
    fn default() -> Self {
        SubsystemState::new("unnamed")
    }
}

// ---------------------------------------------------------------------------
// GlobalState — Ω  (Chapter 3.1)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GlobalState {
    /// ΩUI — User Interface State
    pub ui: SubsystemState,
    /// ΩAI — Artificial Intelligence State
    pub ai: SubsystemState,
    /// ΩAPP — Application State
    pub app: SubsystemState,
    /// ΩDATA — Persistent Data State
    pub data: SubsystemState,
    /// ΩMEM — Runtime Memory State
    pub mem: SubsystemState,
    /// ΩNET — Network State
    pub net: SubsystemState,
    /// ΩIO — Input / Output State
    pub io: SubsystemState,
    /// ΩSYS — System Service State
    pub sys: SubsystemState,
    /// Global monotonic time index t
    pub time_index: u64,
}

impl GlobalState {
    /// Construct the initial Ω(0).  O(1).
    pub fn initial() -> Self {
        GlobalState {
            ui: SubsystemState::new("ΩUI"),
            ai: SubsystemState::new("ΩAI"),
            app: SubsystemState::new("ΩAPP"),
            data: SubsystemState::new("ΩDATA"),
            mem: SubsystemState::new("ΩMEM"),
            net: SubsystemState::new("ΩNET"),
            io: SubsystemState::new("ΩIO"),
            sys: SubsystemState::new("ΩSYS"),
            time_index: 0,
        }
    }

    /// Advance the time index — called after every full Φ application.  O(1).
    pub fn advance_time(&mut self) {
        self.time_index += 1;
    }

    /// Compute ||Ω(t+1) − Ω(t)|| as Euclidean distance over subsystem norms.
    ///
    /// Used for chaotic behaviour detection (Chapter 3.6).  O(n) where n = 8.
    pub fn delta_norm(&self, other: &GlobalState) -> f64 {
        let subsystem_deltas: &[(f64, f64)] = &[
            (self.ui.norm(), other.ui.norm()),
            (self.ai.norm(), other.ai.norm()),
            (self.app.norm(), other.app.norm()),
            (self.data.norm(), other.data.norm()),
            (self.mem.norm(), other.mem.norm()),
            (self.net.norm(), other.net.norm()),
            (self.io.norm(), other.io.norm()),
            (self.sys.norm(), other.sys.norm()),
        ];
        subsystem_deltas
            .iter()
            .map(|(a, b)| (a - b).powi(2))
            .sum::<f64>()
            .sqrt()
    }

    /// Total state norm ||Ω||.  O(n).
    pub fn norm(&self) -> f64 {
        [
            self.ui.norm(),
            self.ai.norm(),
            self.app.norm(),
            self.data.norm(),
            self.mem.norm(),
            self.net.norm(),
            self.io.norm(),
            self.sys.norm(),
        ]
        .iter()
        .map(|x| x.powi(2))
        .sum::<f64>()
        .sqrt()
    }
}

impl Default for GlobalState {
    fn default() -> Self {
        Self::initial()
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initial_state_time_zero() {
        let s = GlobalState::initial();
        assert_eq!(s.time_index, 0, "initial time index must be 0");
    }

    #[test]
    fn test_advance_time() {
        let mut s = GlobalState::initial();
        s.advance_time();
        assert_eq!(s.time_index, 1);
        s.advance_time();
        assert_eq!(s.time_index, 2);
    }

    #[test]
    fn test_delta_norm_zero_on_equal_states() {
        let s = GlobalState::initial();
        let delta = s.delta_norm(&s.clone());
        assert!(
            (delta - 0.0).abs() < 1e-10,
            "delta_norm of identical states must be 0"
        );
    }

    #[test]
    fn test_delta_norm_positive_on_different_states() {
        let s1 = GlobalState::initial();
        let mut s2 = GlobalState::initial();
        s2.ui.set("key", serde_json::Value::Bool(true)); // bumps version
        let delta = s1.delta_norm(&s2);
        assert!(delta > 0.0, "delta_norm must be > 0 when states differ");
    }

    #[test]
    fn test_state_completeness_axiom3() {
        // Axiom 3: Ω must contain all 8 subsystems.
        let s = GlobalState::initial();
        assert_eq!(s.ui.name, "ΩUI");
        assert_eq!(s.ai.name, "ΩAI");
        assert_eq!(s.app.name, "ΩAPP");
        assert_eq!(s.data.name, "ΩDATA");
        assert_eq!(s.mem.name, "ΩMEM");
        assert_eq!(s.net.name, "ΩNET");
        assert_eq!(s.io.name, "ΩIO");
        assert_eq!(s.sys.name, "ΩSYS");
    }

    #[test]
    fn test_subsystem_state_set_increments_version() {
        let mut sub = SubsystemState::new("test");
        assert_eq!(sub.version, 0);
        sub.set("k", serde_json::Value::Null);
        assert_eq!(sub.version, 1);
        sub.set("k2", serde_json::Value::Bool(false));
        assert_eq!(sub.version, 2);
    }
}
