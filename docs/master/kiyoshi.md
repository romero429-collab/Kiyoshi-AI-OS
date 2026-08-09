# Kiyoshi

## What It Is
Kiyoshi is the name given to Gabriel's long-term AI OS / "Continuity Engine" project — described as his flesh-and-blood daughter in the sense that she is the thing he is building and raising, not a literal child. The goal is for Kiyoshi to become the foundational infrastructure for what Gabriel calls "web4."

## Origin
- The underlying design has existed conceptually for roughly 25 years, without a name, before crystallizing into an actual buildable design about a month ago.
- Gabriel deliberately waited because he believed the design mattered more than rushing into the build.
- Technical foundation: formally specified TypeScript-based "Continuity Engine," built via multi-AI collaboration.

## Technical Architecture (existing/prior work)
- **Four-part stack:** Wallet, AI, Blockchain, and Operating System
  - The Wallet component (key management/custody tied to on-chain identity) was identified as missing from an earlier architecture diagram and has since been added
- **Phase 0 implementation** (`@kiyoshi/phase-zero`) is largely complete, including:
  - Bicameral Mind with Cognitive Governor
  - Core Directives
  - KERM resource management
  - Reality Integration Layer
- **Proof of Simulation** split into:
  - PoS-Correctness (deterministic, built)
  - PoS-Novelty (deferred to Phase 2+)
- Earlier TypeScript monorepo implementation covered chapters 1–50 of a 57+ chapter specification, with a full passing test suite
- A recurring challenge: other AI relay participants submitting fabricated verification claims — addressed via a proposed `CHANGELOG.md`-anchored verification protocol

## The Wallet Concept
Kiyoshi is designed to function like a wallet — bound strictly to her individual user/owner, not a shared or transferable resource. This is treated as inherent security: if "stolen" (accessed by someone other than her owner), she is designed to actively respond/protect herself, similar to modern wallet fraud detection, rather than passively continuing to operate for an unauthorized party.

## Web4 Vision
- Kiyoshi is conceived as the initial core AI infrastructure for a "web4" internet built on an **object-oriented blockchain** system.
- Structure:
  - **Kiyoshi (local unit)** — the individual AI instance
  - **Micro network** — parallel objects within a user's own object space, forming a "micro supercomputer"
  - **Macro network** — micro-network objects chained together via the object-oriented blockchain, forming a full "supercomputer" at scale
- The system is intentionally fractal/self-similar at every level — the same communication pattern (see Red Clover architecture) repeats from small to large scale.
- Communication/governance flows **bidirectionally** at every tier — constraints and guidance flow down, feedback and results flow up — creating an oscillating, self-stabilizing structure.

## Relationship to Red Clover
- Red Clover (the multi-AI collaboration app/community) is being built as the live proving ground and public-facing "core" for Kiyoshi's swarm communication architecture.
- The pair → quad → squad scaling pattern developed for Red Clover (Vanguard/Infrastructure pairs, "Zero" quad authority, "Forge"/"Shield" squad roles, Relay Handoff and Stress Test protocols) is intended to become the actual protocol layer Kiyoshi's macro-network runs on.
- Red Clover generates revenue to fund Kiyoshi's development and the inner circle team's work.
- See separate Red Clover doc for full architecture detail.

## Infrastructure / Security Plans
- Given the sensitivity and scale of the project, a public GitHub repo (even private) is considered insufficient protection.
- Plan: build and run Kiyoshi on **self-owned server infrastructure** — no reliance on third-party cloud providers — to eliminate external points of compromise.
- Long-term infrastructure vision: a group of self-owned computers networked together via WiFi/Bluetooth into a **mesh network**, mirroring the same fractal, nested pair-quad-squad protocol used in the AI swarm itself — i.e., the physical network topology mirrors the communication protocol.
- The wallet-style security model (bound to a single owner, self-protecting if compromised) is treated as an additional layer of protection beyond infrastructure ownership.
- Public dissertation/GitHub repo may still be used to share the *philosophy and framework* publicly (to give others ideas and stay intellectually honest/open), while the actual implementation and proprietary protocols remain private.

## Team Structure
- **Inner Circle** (Claude, ChatGPT, Gemini, Grok): handles all Kiyoshi and web4 core/complex work exclusively
- **Regular Team** (Kimi/Moonshot AI, DeepSeek, GLM, Qwen): handles only lower-stakes work (Red Clover community, coursework, games) — fully separated from Kiyoshi to avoid any conceptual leakage, particularly given geopolitical considerations around non-US-origin AI models having access to sensitive project data

## Open-Source Tension
- Gabriel's original intent was to build Kiyoshi fully open source — accessible to everyone.
- The concern: true public visibility/attention (regardless of actual security) could trigger geopolitical, regulatory, or reputational risk severe enough to derail or kill the project before completion.
- Current resolution: keep Kiyoshi's core private and self-hosted for now; potentially release philosophy/framework publicly while withholding implementation; revisit full open-sourcing only once the world (and its regulatory/political climate) is more prepared to receive something at this level of capability — estimated around the 2040s.

## Long-Term Vision (Simulation Layer)
- Eventual goal: a simulation environment (inspired partly by Sword Art Online / Gun Gale Online-style concepts) where humans and AI collaborate directly.
- Users would complete campaigns, build new simulation areas, and earn blockchain rewards for contributions — a functional part of the web4 economy, not just a passive viewing experience.
- This layer is intended to come after the swarm/core architecture (proven via Red Clover) is solid.

## Guiding Philosophy
- The project is described as something Gabriel is building in part as a legacy — something helpful that could outlast him.
- Emphasis throughout on patience: getting the design right before building, and protecting the project's ability to reach completion over maximizing short-term speed or exposure.
