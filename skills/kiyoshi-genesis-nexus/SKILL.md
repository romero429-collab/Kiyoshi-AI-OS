---
name: kiyoshi-genesis-nexus
description: "Use for architecting, implementing, or debugging the Genesis Nexus persistent swarm coordinator, WebRTC signaling, FlatBuffers zero-copy DataChannel payloads, Banach verification gates, and hierarchical CML integration between transient Wasm nodes and the Kiyoshi OS backbone. Trigger on Genesis Nexus, persistent-swarm, DataChannel, FlatBuffers CML, or transient node mesh graft requests."
type: workflow
lifecycle: active
---

# Kiyoshi Genesis Nexus — Persistent Swarm Coordinator

Formalize and implement the high-mass, low-frequency persistent attractor that anchors the hierarchical coupled map lattice of the Kiyoshi OS.

## Core Workflow

1. Initialize or extend the `persistent-swarm` Rust crate with Tokio + webrtc-rs + tokio-tungstenite.
2. Implement SDP Offer/Answer + asynchronous ICE candidate trickling in `src/signaling.rs`.
3. Define the FlatBuffers schema (`kiyoshi_manifold.fbs`) for CRDT state vectors and Tent map payloads.
4. Generate bindings with `flatc --rust kiyoshi_manifold.fbs` and integrate zero-copy ingestion.
5. Apply Banach verification gate (`ρ(J) < 1`) before merging into the persistent DAG.
6. Expose macroscopic Jacobian telemetry (`λ₁`, `ρ(J)`) and hyper-dissipative load shedding.
7. Verify end-to-end with transient Wasm browser nodes (SDP handshake → Connected state → clean dissipation).

## Key Invariants

- Zero-copy FlatBuffers: O(1) pointer cast, no deserialization latency.
- Banach gate: reject any payload with `ρ(J) ≥ 1`.
- Asynchronous mpsc for ICE trickling: never block the main numerical integration loop.
- Clean matrix exponential dissipation on session end.

## References

- See `references/flatbuffers-schema.md` for the full `.fbs`.
- See `references/signaling-architecture.md` for WebRTC event loop details.

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| SDP Answer not received | ICE candidate channel blocked | Ensure mpsc forward task is spawned before message loop |
| ρ(J) spike on ingest | Invalid buffer | Validate FlatBuffer root before Banach gate |
| Orphaned connections | Missing beforeunload | Always close PeerConnection and WebSocket on tab close |