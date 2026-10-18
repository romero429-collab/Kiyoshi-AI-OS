# Sui Object Model as Discrete Dynamical System

## State Elements

Each object:
\[
o = (\text{id} \in \{0,1\}^{256},\ \text{owner},\ v \in \mathbb{N},\ \text{digest},\ \text{contents})
\]

Version is Lamport timestamp: new version = 1 + max(input versions).

## Ownership-Gated Paths

- Address-owned: fast path (Byzantine Consistent Broadcast), lowest latency.
- Shared: Mysticeti DAG consensus, ordered under contention.
- Immutable: packages, fixed after publish.
- Wrapped/object-owned: inherits parent path.

Transaction declares input references (id, version, digest) up front → parallel execution on non-overlapping sets.

## Phase Space

Transaction–object DAG: nodes = transactions, edges labeled by consumed object version. Genesis is unique root. Live objects are the frontier.

## Mapping to Kiyoshi

- Local Anise/Iris → address-owned objects (Iris hash, telemetry digest).
- Red Clover mesh → shared objects; mutation allowed only if emitting sub-mesh has lower \(\lambda_1\).
- KSOTA skill graphs → nested or dynamic-field objects.
- Regeneration → object deletion + successor carrying prior digest (invariant preserved).

Error dynamics: version mismatch or aborted PTB is transient; re-issue against latest version restores consistency. Banach contraction can be enforced inside Move before shared mutation succeeds.

This realizes the Continuity Engine and stability-first reconciliation directly on the public ledger without reducing the system to pure token transfer.
