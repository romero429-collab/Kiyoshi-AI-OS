// Subsystems module — all 8 components of Ω (Chapter 3.1)
//
// ΩUI, ΩAI, ΩAPP, ΩDATA, ΩMEM, ΩNET, ΩIO, ΩSYS
//
// Each subsystem is a stub ready for expansion.  Every stub implements the
// Module trait (M = S, I, O, T, V) defined in core::module.

pub mod ui;
pub mod ai;
pub mod app;
pub mod data;
pub mod mem;
pub mod net;
pub mod io;
pub mod sys;
