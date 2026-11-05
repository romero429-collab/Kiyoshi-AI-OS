# Kiyoshi Skills

Central skills system for the Kiyoshi AI OS.

This folder holds the inventory and generated skills derived from the authenticated user's forked (877) and starred (302) GitHub repositories.

## Structure

- `inventory/` — JSON indexes of starred and forked repositories.
- `generated/` — Generated SKILL.md trees produced via the skill-creator process.
- `scripts/` — Placeholder generators based on init_skill.py workflow.

Skills produced here are later extracted into the agent's skill registry for clean, version-controlled loading.

## Discrete Dynamical System View

The repository-to-skill map is the discrete dynamical system

\[
\mathbf{s}_{n+1} = \Phi(\mathbf{s}_n, r_n)
\]

with contractive error dynamics under progressive disclosure (largest error Lyapunov exponent \(\lambda_{\max} < 0\)).
