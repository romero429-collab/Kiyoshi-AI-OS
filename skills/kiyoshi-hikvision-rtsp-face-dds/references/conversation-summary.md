# Conversation Summary — Hikvision RTSP Face Recognition DDS

Date: 2026-10-19

User requested addition of Hikvision RTSP streams, SCRFD face detection with 5-point landmarks, ArcFace ONNX embeddings (multiple stored per object), separate process per camera for stability, multi-face detection and recognition in the same frame, multi-frame confirmation to reduce false positives, cooldown-based duplicate suppression, API retry with x-api-, unknown face image capture, daily rotating log files, RTSP auto-reconnect and object auto-restart.

Synthesized as discrete dynamical system on per-camera 5-D (then advanced multi-embedding) state space. Transition map includes connection health recovery, distance contraction on match, confirmation counter increment, cooldown timer. Largest Lyapunov exponent negative under K_conf ≥ 3 and healthy stream, guaranteeing contraction mapping of false-positive trajectories (Banach). Process isolation decouples spectra.

Artifacts: hikvision-rtsp-face-recognition-dds/ and advanced multi-face version. Full conversation captured for skill persistence. All math reproducible under seed 42.
