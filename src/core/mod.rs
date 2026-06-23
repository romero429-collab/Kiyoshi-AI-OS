// Core module — Chapter 1 & 2 foundations
//
// Axiom 1: Determinism      — identical states + events → identical outputs
// Axiom 2: Modularity       — components communicate only through formal interfaces
// Axiom 3: State Completeness — Ω(t) contains all subsystem states
// Axiom 4: Event Causality  — S(t+1) = T(S(t), E(t))
// Axiom 5: Observability    — every transition is explainable

pub mod event;
pub mod module;
pub mod state;
pub mod transition;
