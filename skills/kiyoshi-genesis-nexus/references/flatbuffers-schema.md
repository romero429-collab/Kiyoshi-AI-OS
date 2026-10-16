# FlatBuffers Schema for Kiyoshi CML DataChannel

```flatbuffers
// kiyoshi_manifold.fbs
namespace kiyoshi.cml;

struct Quaternion {
  w: float32;
  x: float32;
  y: float32;
  z: float32;
}

struct DDSMetrics {
  lambda_1: float32;
  spectral_radius: float32;
  ergodicity_epsilon: float32;
}

table CrdtStateVector {
  node_id: uint64;
  vector_clock: uint64;
  kinetic_state: float32;
  kinematics: Quaternion;
  metrics: DDSMetrics;
}

table TentMapPayload {
  collision_id: uint64;
  x_left: float32;
  x_right: float32;
  resolved_state: float32;
}

union PayloadContent {
  CrdtStateVector,
  TentMapPayload
}

table DataChannelMessage {
  timestamp: uint64;
  content: PayloadContent;
}

root_type DataChannelMessage;
```

Generate with: `flatc --rust kiyoshi_manifold.fbs`