---
name: kiyoshi-pi-surveillance-pattern-dds
description: Discrete dynamical system for PI-style pattern-of-life surveillance on multi-camera RTSP face streams. Adds temporal occupancy scoring, arrival/departure alerts, and contraction of false alerts to the SCRFD/ArcFace pipeline. Generates IEEE artifacts and 3D visualizer.
---

# PI Surveillance Pattern-of-Life DDS Skill

Extends Hikvision RTSP multi-process face recognition with temporal pattern-of-life state, multi-frame confirmation for set-and-forget monitoring, and transient alert dynamics. Verifies contraction of false positives and pattern error via negative Lyapunov exponent. Addresses residence verification and departure tracking.

## Trigger

Requests involving private investigator surveillance, pattern of life, set-and-forget camera monitoring, or extensions to RTSP face systems for temporal tracking.

## Output Contract

Kebab-cased directory with README, MVP, MK, MV, phase-space-visualizer.html. Claims grounded in λ₁ < 0 and spectral radius of alert/pattern map < 1.
