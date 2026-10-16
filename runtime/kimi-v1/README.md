# Kiyoshi v1 — Kimi-Style Runtime

Advanced mobile interface for Kiyoshi AI OS. Clean boundaryless chat UI (React Native + Expo) coupled via WebSocket to the local dynamical engine.

## Architecture
- UI: Dark theme, status bar with live connection indicator
- State: Zustand store with WebSocket lifecycle
- Engine: Four-stage pipeline (RIL → CognitiveSandbox → ErrorContractionEngine → STDP) with Lyapunov telemetry and divergence damping

## Run
```bash
# Terminal 1
python kiyoshi_bridge_server.py

# Terminal 2
npx expo start
```

See docs/DESIGN.md for full DDS framing.
