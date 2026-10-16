//! WebRTC Signaling Server for the Genesis Nexus
//!
//! Handles full SDP Offer/Answer exchange, ICE candidate trickling,
//! and DataChannel binary payload ingestion (FlatBuffers zero-copy).

use futures_util::{SinkExt, StreamExt};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc;
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tracing::{info, warn, error};
use webrtc::api::APIBuilder;
use webrtc::data_channel::data_channel_message::DataChannelMessage;
use webrtc::ice_transport::ice_server::RTCIceServer;
use webrtc::peer_connection::configuration::RTCConfiguration;
use webrtc::peer_connection::peer_connection_state::RTCPeerConnectionState;
use webrtc::peer_connection::sdp::session_description::RTCSessionDescription;

use crate::data_channel::ingest_transient_payload;

pub struct SignalingServer {
    addr: SocketAddr,
}

impl SignalingServer {
    pub fn new(addr: SocketAddr) -> Self {
        Self { addr }
    }

    pub async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        let listener = TcpListener::bind(self.addr).await?;
        info!("Genesis Nexus Signaling Server listening on ws://{}", self.addr);

        let ice_servers = vec![RTCIceServer {
            urls: vec!["stun:stun.l.google.com:19302".to_owned()],
            ..Default::default()
        }];

        let api = APIBuilder::new().build();

        loop {
            let (stream, addr) = listener.accept().await?;
            let ice_servers = ice_servers.clone();
            let api = api.clone();

            tokio::spawn(async move {
                if let Err(e) = handle_connection(stream, addr, ice_servers, api).await {
                    error!("Connection error from {}: {}", addr, e);
                }
            });
        }
    }
}

async fn handle_connection(
    stream: TcpStream,
    addr: SocketAddr,
    ice_servers: Vec<RTCIceServer>,
    api: webrtc::api::API,
) -> Result<(), Box<dyn std::error::Error>> {
    let ws_stream = accept_async(stream).await?;
    let (mut write, mut read) = ws_stream.split();

    let config = RTCConfiguration {
        ice_servers,
        ..Default::default()
    };

    let peer_connection = Arc::new(api.new_peer_connection(config).await?);

    // Channel for ICE candidates (trickling)
    let (ice_tx, mut ice_rx) = mpsc::channel::<String>(32);

    // Set ICE candidate handler — asynchronous trickling
    let ice_tx_clone = ice_tx.clone();
    peer_connection.on_ice_candidate(Box::new(move |candidate| {
        let ice_tx = ice_tx_clone.clone();
        Box::pin(async move {
            if let Some(c) = candidate {
                if let Ok(json) = serde_json::to_string(&c) {
                    let _ = ice_tx.send(json).await;
                }
            }
        })
    }));

    // Forward ICE candidates over WebSocket
    let write_clone = write.clone();
    tokio::spawn(async move {
        while let Some(candidate_json) = ice_rx.recv().await {
            if let Err(e) = write_clone.send(Message::Text(candidate_json)).await {
                warn!("Failed to send ICE candidate: {}", e);
                break;
            }
        }
    });

    // Create DataChannel for CML payloads
    let data_channel = peer_connection
        .create_data_channel("kiyoshi-cml", None)
        .await?;

    // Handle incoming binary payloads (FlatBuffers)
    let addr_clone = addr;
    data_channel.on_message(Box::new(move |msg: DataChannelMessage| {
        let addr = addr_clone;
        Box::pin(async move {
            if msg.is_string {
                info!("Text message on DataChannel from {}: {}", addr, msg.data);
            } else {
                info!("Binary DataChannel payload from {} ({} bytes)", addr, msg.data.len());
                // Zero-copy ingest with Banach verification
                ingest_transient_payload(&msg.data, &addr.to_string());
            }
        })
    }));

    // Monitor connection state
    let pc_clone = peer_connection.clone();
    tokio::spawn(async move {
        pc_clone.on_peer_connection_state_change(Box::new(move |state: RTCPeerConnectionState| {
            info!("PeerConnection state for {}: {:?}", addr, state);
            if state == RTCPeerConnectionState::Connected {
                info!("Transient node {} successfully connected (DataChannel ready)", addr);
            }
            Box::pin(async {})
        }));
    });

    // Main signaling message loop
    while let Some(msg) = read.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                // Detect SDP Offer
                if text.contains("v=0") && text.contains("o=") {
                    info!("Received SDP Offer from transient node {}", addr);

                    let offer = RTCSessionDescription::offer(text)?;
                    peer_connection.set_remote_description(offer).await?;

                    let answer = peer_connection.create_answer(None).await?;
                    peer_connection.set_local_description(answer.clone()).await?;

                    // Send Answer back
                    write.send(Message::Text(answer.sdp)).await?;
                    info!("Sent SDP Answer to transient node {}", addr);
                } else {
                    write.send(Message::Text(format!("ACK: {}", text))).await?;
                }
            }
            Ok(Message::Close(_)) => {
                info!("Transient node {} disconnected cleanly", addr);
                break;
            }
            Err(e) => {
                warn!("WebSocket error from {}: {}", addr, e);
                break;
            }
            _ => {}
        }
    }

    peer_connection.close().await?;
    Ok(())
}