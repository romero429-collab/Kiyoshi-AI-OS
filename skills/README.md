# Kiyoshi Skills Workspace

Multi-substrate Bazel workspace that hosts every finalized skill.

## Substrates
- **Rust** — systems / OS / deterministic runtime (`@rules_rust`)
- **Mojo** — AI / numerical kernels (Modular rules, placeholder)
- **Bazel** — orchestration that can also pull TypeScript / Node / other languages via `@rules_nodejs`

## Goal
Each skill target reproduces the behavior of its original repository while living under the Kiyoshi umbrella.

## Layout
```
skills/
  <skill-name>/
    BUILD.bazel          # Bazel targets for this skill
    src/                 # Rust / Mojo / TS sources
    SKILL.md             # (copied from generated/)
```

See `//skills/<name>:BUILD.bazel` for individual skill rules.
