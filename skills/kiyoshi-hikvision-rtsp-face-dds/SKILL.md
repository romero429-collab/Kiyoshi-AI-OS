---
name: kiyoshi-hikvision-rtsp-face-dds
description: Discrete dynamical system model of multi-process Hikvision RTSP face recognition with SCRFD detection, ArcFace multi-embeddings, multi-frame confirmation, cooldown suppression, and process isolation. Generates IEEE artifacts and 3D Lyapunov visualizer.
---

# Hikvision RTSP Face Recognition DDS Skill

Maps per-camera RTSP processes, SCRFD multi-face + 5-point landmarks, ArcFace embeddings (multiple per object), confirmation counters, and cooldown to a discrete dynamical system. Verifies contraction of false positives via negative largest Lyapunov exponent and spectral radius < 1. Produces full artifact set.

## Trigger

Requests for Hikvision RTSP streams, face detection/recognition pipelines, multi-process camera stability, or embedding confirmation dynamics in Kiyoshi.

## Output Contract

Kebab-cased directory with README, MVP, MK, MV, phase-space-visualizer.html. Claims grounded in λ₁ sign and Banach contraction of confirmation errors.
