# Sandbox adapters (not the OS)

These two files ran the Phase 0 console inside the app builder. They were not copied into `phase-0/src` because they import the builder’s auth provider and preview bridge.

Auth is off. Database is off. They are adapters, not a subsystem, and they do not satisfy Article IV by themselves.

- `src/routes/__root.tsx` — document shell, fonts, tokens. Auth provider and preview bridge are builder wrappers.
- `src/router.tsx` — `getRouter()`, error component, generated route tree.

The OS itself is `phase-0/src`. The conversation that produced it is `skills/`.
