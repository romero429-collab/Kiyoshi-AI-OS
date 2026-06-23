// src/diagnostics.rs
//
// Chapter 3 — Diagnostic systems
//   Axiom 5: Observability — every transition is explainable
//   Chapter 3.6: chaotic behaviour — identify Source, Trigger, Propagation, Recovery
//   Chapter 3.11: Conservation Principle — every deletion logged
//
// Complexity: O(1) per log entry, O(n) for report generation.

use crate::core::transition::TransitionRecord;
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// LogLevel
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LogLevel {
    Info,
    Warning,
    Error,
}

// ---------------------------------------------------------------------------
// DiagnosticEntry — single log record
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticEntry {
    pub level: LogLevel,
    pub message: String,
    /// Sequence number for ordering (monotonically increasing)
    pub sequence: u64,
}

// ---------------------------------------------------------------------------
// ChaosReport — Chapter 3.6
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChaosReport {
    pub time_index: u64,
    pub delta_norm: f64,
    pub source_module: String,
    pub trigger_event_id: u64,
    pub propagation_chain: Vec<String>,
    pub recovery_strategy: String,
}

// ---------------------------------------------------------------------------
// DiagnosticsLog
// ---------------------------------------------------------------------------

pub struct DiagnosticsLog {
    entries: Vec<DiagnosticEntry>,
    chaos_reports: Vec<ChaosReport>,
    deletion_log: Vec<String>,
    sequence_counter: u64,
    /// Threshold above which ΔΩ is flagged as chaotic
    pub chaos_threshold: f64,
}

impl DiagnosticsLog {
    /// Create a new diagnostics log.  O(1).
    pub fn new() -> Self {
        DiagnosticsLog {
            entries: Vec::new(),
            chaos_reports: Vec::new(),
            deletion_log: Vec::new(),
            sequence_counter: 0,
            chaos_threshold: 10.0,
        }
    }

    fn next_seq(&mut self) -> u64 {
        self.sequence_counter += 1;
        self.sequence_counter
    }

    /// Log an informational message.  O(1).
    pub fn log_info(&mut self, msg: impl Into<String>) {
        let seq = self.next_seq();
        self.entries.push(DiagnosticEntry {
            level: LogLevel::Info,
            message: msg.into(),
            sequence: seq,
        });
    }

    /// Log a warning.  O(1).
    pub fn log_warning(&mut self, msg: impl Into<String>) {
        let seq = self.next_seq();
        self.entries.push(DiagnosticEntry {
            level: LogLevel::Warning,
            message: msg.into(),
            sequence: seq,
        });
    }

    /// Log an error.  O(1).
    pub fn log_error(&mut self, msg: impl Into<String>) {
        let seq = self.next_seq();
        self.entries.push(DiagnosticEntry {
            level: LogLevel::Error,
            message: msg.into(),
            sequence: seq,
        });
    }

    /// Record a transition for observability (Axiom 5).  O(1).
    pub fn log_transition(&mut self, record: &TransitionRecord) {
        let msg = format!(
            "t={} event_id={} type={} Δ={:.4} L_before={:.4} L_after={:.4} subs=[{}]",
            record.time_index,
            record.event_id,
            record.event_type,
            record.delta_norm,
            record.stability_before,
            record.stability_after,
            record.subscribers.join(","),
        );
        self.log_info(msg);

        // Detect chaotic behaviour (Chapter 3.6)
        if record.delta_norm > self.chaos_threshold {
            self.report_chaos(ChaosReport {
                time_index: record.time_index,
                delta_norm: record.delta_norm,
                source_module: record.event_type.clone(),
                trigger_event_id: record.event_id,
                propagation_chain: record.subscribers.clone(),
                recovery_strategy: "reduce input rate; verify invariants; roll back if needed"
                    .to_string(),
            });
        }
    }

    /// Log a deletion event (Conservation Principle, Chapter 3.11).  O(1).
    pub fn log_deletion(&mut self, description: impl Into<String>) {
        let entry = format!("[DELETION] {}", description.into());
        self.deletion_log.push(entry.clone());
        self.log_info(entry);
    }

    /// Record a chaos report.  O(1).
    pub fn report_chaos(&mut self, report: ChaosReport) {
        let msg = format!(
            "⚠ CHAOS t={} ΔΩ={:.4} source={} event={}",
            report.time_index, report.delta_norm, report.source_module, report.trigger_event_id
        );
        let seq = self.next_seq();
        self.entries.push(DiagnosticEntry {
            level: LogLevel::Warning,
            message: msg,
            sequence: seq,
        });
        self.chaos_reports.push(report);
    }

    /// All log entries.  O(1).
    pub fn entries(&self) -> &[DiagnosticEntry] {
        &self.entries
    }

    /// All chaos reports.  O(1).
    pub fn chaos_reports(&self) -> &[ChaosReport] {
        &self.chaos_reports
    }

    /// All deletion log entries (Conservation Principle).  O(1).
    pub fn deletion_log(&self) -> &[String] {
        &self.deletion_log
    }

    /// Number of warnings or errors.  O(n).
    pub fn warning_count(&self) -> usize {
        self.entries
            .iter()
            .filter(|e| matches!(e.level, LogLevel::Warning | LogLevel::Error))
            .count()
    }
}

impl Default for DiagnosticsLog {
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
    use crate::core::transition::TransitionRecord;

    fn sample_record(delta: f64) -> TransitionRecord {
        TransitionRecord {
            time_index: 1,
            event_id: 1,
            event_type: "TickAdvance".to_string(),
            subscribers: vec![],
            delta_norm: delta,
            stability_before: 1.0,
            stability_after: 0.9,
        }
    }

    #[test]
    fn test_log_info_increments_sequence() {
        let mut log = DiagnosticsLog::new();
        log.log_info("hello");
        log.log_info("world");
        assert_eq!(log.entries()[0].sequence, 1);
        assert_eq!(log.entries()[1].sequence, 2);
    }

    #[test]
    fn test_log_transition_records_entry() {
        let mut log = DiagnosticsLog::new();
        log.log_transition(&sample_record(0.5));
        assert_eq!(log.entries().len(), 1);
    }

    #[test]
    fn test_chaos_detection_above_threshold() {
        let mut log = DiagnosticsLog::new();
        log.chaos_threshold = 5.0;
        log.log_transition(&sample_record(6.0)); // above threshold
        assert_eq!(log.chaos_reports().len(), 1, "should detect chaos above threshold");
    }

    #[test]
    fn test_chaos_not_triggered_below_threshold() {
        let mut log = DiagnosticsLog::new();
        log.chaos_threshold = 5.0;
        log.log_transition(&sample_record(2.0)); // below threshold
        assert_eq!(log.chaos_reports().len(), 0);
    }

    #[test]
    fn test_deletion_log_conservation() {
        let mut log = DiagnosticsLog::new();
        log.log_deletion("file.txt");
        assert_eq!(log.deletion_log().len(), 1);
        assert!(log.deletion_log()[0].contains("[DELETION]"));
    }
}
