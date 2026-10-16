# Kiyoshi v1 — System Scope & Design Blueprint

## 1. Overall Vision (DDS & Chaos Framing)
Kiyoshi v1 is modeled as a discrete dynamical system (DDS) where the conversation state evolves through iterative turns. The iteration operator Φ maps (current_state, user_input) → next_response.

Attractors represent coherent, useful outputs. The UI is the observable projection of this phase space. The goal is a familiar, Kimi-like experience: clean, minimal, fast, and addictive, matching the feel of ChatGPT, Claude, Grok, Gemini, and Kimi itself.

## 2. Core User Experience Goals
- Open app → clean chat screen immediately
- Type normally → fast, helpful responses
- Toggle between Quick mode (fast answers) and Deep mode (step-by-step reasoning)
- Persistent memory across conversations (built on existing memory.md)
- File uploads + basic web search
- Feels exactly like using Kimi (clean dark theme, boundaryless bubbles, minimal UI)

## 3. UI Design Specification (Kimi-Inspired)
### Theme
- Dark mode default (clean, modern, minimal)
- Subtle animations, high contrast text

### Main Chat Screen
- Top bar: Minimal, with mode toggle (Quick / Deep) and New Chat button
- Chat area: Centered, boundaryless message bubbles (no hard borders — content flows naturally)
  - Kiyoshi messages: left-aligned with small avatar
  - User messages: right-aligned
- Bottom input bar: Text field + send button + attachment icon (for files/images)

### Side Menu (Swipe from left)
- Chat history list
- New Chat button
- Settings / Memory controls

### Additional Screens
- Simple onboarding on first launch
- Settings screen for mode defaults, memory management

## 4. Platforms & Tech Stack
- React Native + Expo (single codebase for iOS, Android, Web)
- Future: Easy expansion to desktop via Tauri or similar
- Backend: Connects to existing Kiyoshi skill system and dynamical kernel

## 5. Feature Roadmap for v1
- Core chat with Quick/Deep toggle
- Persistent memory integration
- File upload support
- Basic web search integration
- Clean, production-ready UI matching Kimi polish

## 6. Success Criteria
- Users feel they are using "Kimi but ours"
- Smooth, fast experience on mobile
- Clear path to full Kiyoshi OS later

This document serves as the single source of truth for the v1 build. All code and further docs must align with this scope.
