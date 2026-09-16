# Reality Integration Layer — Eye View

Kiyoshi's Phase 0 names a Reality Integration Layer. Until the OS owns a spatial backend, **[Eye View](https://github.com/romero429-collab/eye-view)** is that layer in software.

The HUD publishes a typed `PerceptionFrame`:

- look-at (lng, lat, zoom, altitude)
- zone class (OSM land-use / landcover)
- country as *ground context*, never as the inspected object
- focus (heat cell, plot, pulse, building)
- rule stack (container / avoid / snap / dim / prefer)
- local attention (what the operator has been inspecting)

Query in, frame out. Walk mode is the ground-level action channel.

Public HUD: [romero429-collab/eye-view](https://github.com/romero429-collab/eye-view)
Contract notes live in that repo at `docs/kiyoshi.md`.

Do not scrape the DOM. Ingest `src/lib/perception.ts`.
