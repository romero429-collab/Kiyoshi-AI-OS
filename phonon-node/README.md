# Phonon node

The instrument. A lithium-niobate bar counted one phonon at a time, then joined to Harness-Zero.

| Path | Role |
| --- | --- |
| `src/lib/phonon/physics.ts` | Constants and the derived ledger for arXiv:2610.10714 |
| `src/lib/phonon/joint.ts` | Harness-Zero table and `compose` for arXiv:2609.24974 |
| `src/lib/phonon/store.ts` | One trajectory. Watched mode runs parity every 12 μs |
| `src/components/phonon/` | Bar, scope, ledger, belief, claims, the two-process panel |
| `src/routes/index.tsx` | Page that mounts those pieces |
| `src/styles.css` | The instrument's type and color |

The kernel copies that the skill imports live in `../phonon-harness`. The skill is `../skills/kiyoshi-phonon-harness-zero`.

These files use the `@/` alias of the TanStack shell (`@/lib/phonon`, `@/components/phonon`). They are the source of the preview, not a second app.
