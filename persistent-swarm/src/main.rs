//! Genesis Nexus — Persistent Swarm Coordinator
//! Entry point for the high-mass, low-frequency anchor of the Kiyoshi macroscopic CML.

use std::net::SocketAddr;
use tokio::sync::mpsc;
use tracing::{info, warn, error};

mod nexus;
mod signaling;
mod data_channel;
mod telemetry;

use nexus::GenesisNexus;
use signaling::SignalingServer;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    info!("=== Genesis Nexus Initializing ===");
    info!("Persistent backbone for Kiyoshi macroscopic coupled map lattice");

    let (tx, rx) = mpsc::channel(1024);

    let nexus = GenesisNexus::new(rx);

    // Spawn the main Nexus actor
    let nexus_handle = tokio::spawn(async move {
        nexus.run().await;
    });

    // Spawn WebRTC Signaling Server (Step 1)
    let signaling_addr: SocketAddr = "0.0.0.0:8080".parse()?;
    let signaling_server = SignalingServer::new(signaling_addr);
    let signaling_handle = tokio::spawn(async move {
        if let Err(e) = signaling_server.run().await {
            error!("Signaling server error: {}", e);
        }
    });

    info!("Genesis Nexus started. Signaling server listening on ws://0.0.0.0:8080");
    info!("Awaiting transient and persistent node connections...");

    // Placeholder: keep process alive
    tokio::signal::ctrl_c().await.unwrap();
    warn!("Shutdown signal received. Beginning graceful matrix exponential decay...");

    // In production: trigger hyper-dissipative shutdown of all connections
    nexus_handle.await.unwrap();

    info!("Genesis Nexus terminated cleanly.");
}