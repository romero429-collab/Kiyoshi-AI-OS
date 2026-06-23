// src/main.rs — Kiyoshi AI OS entry point
//
// Demonstrates the full Chapter 1-3 pipeline:
//   1. Construct Ω(0)
//   2. Enqueue events onto Q(t)
//   3. Run the scheduler (Φ operator)
//   4. Check invariants
//   5. Report stability and entropy

use kiyoshi_ai_os::core::event::{Event, EventType, Payload, Priority};
use kiyoshi_ai_os::core::transition::Scheduler;
use kiyoshi_ai_os::metrics::global_state_entropy;
use kiyoshi_ai_os::stability::{LyapunovMonitor, StabilityReport};
use kiyoshi_ai_os::verification::InvariantChecker;

fn main() {
    println!("======================================================");
    println!(" KIYOSHI AI OPERATING SYSTEM — v0.1.0");
    println!(" Chapters 1-3: Foundational Axioms, Math Prelims,");
    println!("               Discrete Dynamical Systems");
    println!("======================================================\n");

    // -----------------------------------------------------------------------
    // 1. Initialise the scheduler (owns Ω, Q, metrics, diagnostics)
    // -----------------------------------------------------------------------
    let mut scheduler = Scheduler::new();
    let mut checker = InvariantChecker::new();
    let mut monitor = LyapunovMonitor::new();

    println!("Ω(0) initialised.  Time index = {}", scheduler.state.time_index);
    println!("All 8 subsystems: ΩUI, ΩAI, ΩAPP, ΩDATA, ΩMEM, ΩNET, ΩIO, ΩSYS\n");

    // -----------------------------------------------------------------------
    // 2. Enqueue a sequence of events onto Q(t)
    // -----------------------------------------------------------------------
    let events: Vec<(EventType, Priority, &str)> = vec![
        (EventType::ApplicationStart,    Priority::High,     "sys"),
        (EventType::AiRequest,           Priority::High,     "ui"),
        (EventType::FileLoad,            Priority::Normal,   "app"),
        (EventType::NetworkPacket,       Priority::Normal,   "net"),
        (EventType::AiResponse,          Priority::High,     "ai"),
        (EventType::CalculationComplete, Priority::Normal,   "app"),
        (EventType::FileSave,            Priority::Normal,   "app"),
        (EventType::FileDelete,          Priority::Normal,   "app"),   // tests conservation
        (EventType::DiagnosticWarning,   Priority::Normal,   "sys"),
        (EventType::TickAdvance,         Priority::Low,      "scheduler"),
    ];

    for (et, priority, source) in events {
        let id = scheduler.next_id();
        let ts = scheduler.state.time_index;
        let event = Event::new(id, ts, et, priority, source, None, Payload::empty());
        scheduler.enqueue(event).expect("event must enqueue");
    }

    println!("Enqueued {} events onto Q(t)\n", scheduler.bus.len());

    // -----------------------------------------------------------------------
    // 3. Process queue — Φ operator drives Ω(0) → Ω(n)
    // -----------------------------------------------------------------------
    scheduler.process_queue();

    println!("Event processing complete.");
    println!("Time index after processing: {}\n", scheduler.state.time_index);

    // -----------------------------------------------------------------------
    // 4. Check all 6 invariants
    // -----------------------------------------------------------------------
    let stability = scheduler.metrics.stability_value();
    let energy = scheduler.metrics.energy.total();
    let violations = checker.check(&scheduler.state, stability, energy);

    if violations.is_empty() {
        println!("✅ All 6 invariants PASS");
    } else {
        for v in &violations {
            println!("❌ Invariant violation [{}]: {}", v.invariant, v.description);
        }
    }
    println!();

    // -----------------------------------------------------------------------
    // 5. Stability and entropy report
    // -----------------------------------------------------------------------
    for m in scheduler.metrics.stability_history() {
        monitor.record(m.value);
    }

    let report = StabilityReport::build(&monitor, &scheduler.metrics, &scheduler.state);
    let entropy = global_state_entropy(&scheduler.state);

    println!("📊 Stability Report:");
    println!("   Attractor status   : {}", report.attractor_status);
    println!("   Lyapunov condition : {}", if report.lyapunov_condition_holds { "✅ holds" } else { "⚠ degrading" });
    println!("   Max ΔΩ             : {:.4}", report.max_delta_norm);
    println!("   Health score       : {:.4}", report.health_score);
    println!("   Entropy H(Ω)       : {:.4} bits", entropy);
    println!("   Computational C    : {:.4}", energy);
    println!("   Transitions logged : {}", scheduler.history().len());
    println!("   Chaos reports      : {}", scheduler.diagnostics.chaos_reports().len());
    println!("   Deletions logged   : {}", scheduler.diagnostics.deletion_log().len());
    println!();

    println!("======================================================");
    println!(" KIYOSHI AI OS — initialisation complete");
    println!("======================================================");
}
