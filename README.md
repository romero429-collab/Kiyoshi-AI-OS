# Kiyoshi-AI-OS
Kiyoshi AI Operating System - Core deterministic modular engine for adaptive intelligent computation

## Related Repositories

This repository includes the following related projects as Git submodules under `external/`:

- `external/kiyoshi` — Offline-first mobile AI coding agent. [View on GitHub](https://github.com/romero429-collab/kiyoshi)
- `external/ai-data-bridge` — Deterministic Coupled Map Lattice & Invariant Manifold Pipeline for Lossless AI-to-AI Context Transfer. [View on GitHub](https://github.com/romero429-collab/ai-data-bridge)

### Working with Submodules

After cloning this repository, initialize the submodules:

```bash
git submodule update --init --recursive
```

To pull the latest changes from all submodules:

```bash
git submodule update --remote --merge
```
