# Conversation Summary — TikTok PI Surveillance Extension

Date: 2026-10-22

User provided TikTok https://www.tiktok.com/t/ZPLAUMwey/ (Austin the PI) discussing surveillance websites/tools for private investigators: set-and-forget for when someone leaves for work, verifying residence/occupancy.

Existing Hikvision RTSP + SCRFD + ArcFace multi-process system covers detection, embeddings, multi-frame confirmation, cooldown, reconnect. Missing parts addressed: temporal pattern-of-life score p_n, arrival/departure alert a_n as contracting transient, multi-camera identity interface for persistent tracking.

Synthesized as advanced DDS on augmented per-camera state. Transition map includes pattern contraction p_{n+1} = (1-ρ_p)p_n + ρ_p * match, alert on occupancy edge after confirmation. Largest Lyapunov exponent negative under K ≥ 3, guaranteeing Banach contraction of false alerts and pattern error.

Artifacts: pi-surveillance-pattern-of-life-dds/. Full conversation captured.
