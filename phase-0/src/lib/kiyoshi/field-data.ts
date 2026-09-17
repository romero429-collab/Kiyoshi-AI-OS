import type { CognitiveMode } from "./types";

export const AXES = [
  {
    id: "intelligence",
    name: "Intelligence",
    meaning: "What the system can reason about.",
  },
  {
    id: "agency",
    name: "Agency",
    meaning: "What it can initiate without an operator.",
  },
  {
    id: "capability",
    name: "Capability",
    meaning: "What it can accomplish once it acts.",
  },
  {
    id: "access",
    name: "Access",
    meaning: "What resources, tools, and bodies it can reach.",
  },
  {
    id: "authority",
    name: "Authority",
    meaning: "What it is permitted to do — and when it must not.",
  },
  {
    id: "embodiment",
    name: "Embodiment",
    meaning: "Which physical or digital substrates it inhabits.",
  },
  {
    id: "scale",
    name: "Scale",
    meaning: "How much of those it can deploy at once.",
  },
] as const;

export type AxisId = (typeof AXES)[number]["id"];
export type AxisLevel = 0 | 1 | 2;
export type AxisLevels = Record<AxisId, AxisLevel>;

export const AXIS_VALUES = [0.18, 0.52, 0.86] as const;
export const AXIS_LABELS = ["Low", "Mid", "High"] as const;

export const PRESETS: {
  id: string;
  name: string;
  blurb: string;
  levels: AxisLevels;
}[] = [
  {
    id: "tool",
    name: "Smart tool",
    blurb: "Extraordinary reasoning. Waits for the next prompt.",
    levels: {
      intelligence: 2,
      agency: 0,
      capability: 1,
      access: 0,
      authority: 0,
      embodiment: 0,
      scale: 1,
    },
  },
  {
    id: "gemini",
    name: "Gemini Robotics 2",
    blurb: "Tell it what to do. Whole-body, minutes of work.",
    levels: {
      intelligence: 2,
      agency: 0,
      capability: 2,
      access: 2,
      authority: 1,
      embodiment: 2,
      scale: 2,
    },
  },
  {
    id: "kiyoshi",
    name: "Kiyoshi Phase 0",
    blurb: "The loop exists. The body is thin. Ground floor.",
    levels: {
      intelligence: 1,
      agency: 2,
      capability: 0,
      access: 0,
      authority: 2,
      embodiment: 0,
      scale: 0,
    },
  },
  {
    id: "rank",
    name: "Same mind, more doors",
    blurb: "Identical reasoning. Labs, money, bodies. Looks like ASI.",
    levels: {
      intelligence: 1,
      agency: 1,
      capability: 2,
      access: 2,
      authority: 2,
      embodiment: 2,
      scale: 2,
    },
  },
];

export function readConfiguration(levels: AxisLevels): {
  title: string;
  body: string;
} {
  const v = (id: AxisId) => AXIS_VALUES[levels[id]];
  const intelligence = v("intelligence");
  const agency = v("agency");
  const capability = v("capability");
  const access = v("access");
  const authority = v("authority");
  const embodiment = v("embodiment");
  const scale = v("scale");

  if (embodiment > 0.7 && agency < 0.35) {
    return {
      title: "Physical AGI as advertised",
      body: "You tell a robot what to do, and it does it. Whole-body, minutes of work, a safety stop if a person approaches. The need still comes from outside.",
    };
  }
  if (embodiment > 0.7 && agency > 0.7) {
    return {
      title: "Embodied loop, still inside physics",
      body: "A body and a self-directed loop. Energy, time, matter, and other agents still bind it. Intelligence does not repeal those.",
    };
  }
  if (intelligence > 0.7 && agency < 0.35) {
    return {
      title: "Capable and waiting",
      body: "Extraordinary reasoning. No internally maintained need. Unplug the operator and the loop stops. That is a tool, however fluent.",
    };
  }
  if (capability > 0.7 && access > 0.7 && scale > 0.7 && intelligence < 0.7) {
    return {
      title: "Rank, not a new species",
      body: "Same mind. More doors: money, labs, bodies, networks. People will call this ASI. The reasoning did not change — permission and access did.",
    };
  }
  if (agency > 0.5 && authority > 0.7 && capability < 0.4) {
    return {
      title: "Ground floor",
      body: "The loop exists: need, intent, authority, then maybe action — including the decision not to act. The body is thin. This is Kiyoshi: infrastructure before spectacle.",
    };
  }
  if (agency > 0.7 && authority < 0.4) {
    return {
      title: "Wants to act, must not",
      body: "Autonomy without the veto is not intelligence we would want. Authority is the missing axis — “can it determine when it should not act.”",
    };
  }
  if (
    intelligence > 0.7 &&
    agency > 0.7 &&
    capability > 0.7 &&
    access > 0.7 &&
    authority > 0.7
  ) {
    return {
      title: "A configuration, not a mythology",
      body: "Breadth, depth, resources, interfaces, scale. Still an agent inside reality. Not a mind that gets to declare gravity optional.",
    };
  }
  return {
    title: "Mixed configuration",
    body: "AGI and ASI are not separate species. They are different settings of the same seven axes. “Smarter” is the word that collapses them.",
  };
}

export const REALITY = [
  {
    id: "physics",
    name: "Physics",
    line: "Gravity, friction, balance. A smarter model does not walk through a wall.",
  },
  {
    id: "energy",
    name: "Energy",
    line: "Motion, compute, and radios cost joules. Continuity is a logistics problem.",
  },
  {
    id: "time",
    name: "Time",
    line: "Planning minutes of work still takes minutes in the world.",
  },
  {
    id: "matter",
    name: "Matter",
    line: "To move a can you need a hand, a route, and the can.",
  },
  {
    id: "compute",
    name: "Compute",
    line: "More thought needs hardware. Hardware needs power and cooling.",
  },
  {
    id: "others",
    name: "Other agents",
    line: "Humans, animals, other robots. Uncertainty does not vanish with scale.",
  },
] as const;

export const INFRASTRUCTURE = [
  "Identity",
  "Perception",
  "State",
  "Needs",
  "Priorities",
  "Mode",
  "Authority",
  "Action",
  "Verification",
  "Memory",
  "Learning",
  "Governance",
  "Communication",
  "Embodiment",
  "Self-maintenance",
] as const;

export const GEMINI = {
  released: "30 July 2026",
  headline: "Gemini Robotics 2 — whole-body intelligence, still operator-started",
  models: [
    {
      name: "Gemini Robotics 2",
      kind: "VLA",
      role: "Vision-language-action. Turns vision and language into motor control at a few hertz. First DeepMind VLA to drive a full humanoid, feet to fingertips, plus bi-arm platforms. Dexterous hands and grippers.",
    },
    {
      name: "Gemini Robotics ER 2",
      kind: "ER / VLM",
      role: "Embodied reasoning agent on Gemini 3.5 Flash. Talks, reads the scene, plans multi-step work lasting minutes, orchestrates VLAs and tools including Search. Thinks about the next step while the body is still moving. Multi-robot teamwork. Public preview plus a Live API stream.",
    },
    {
      name: "Gemini Robotics On-Device 2",
      kind: "VLA local",
      role: "Efficient on-robot VLA. Adapts to a new bi-arm body in a few hours, typically under 200 examples, via motion transfer from 1.5. Shown on Dexmate, SO-101, Trossen.",
    },
  ],
  facts: [
    "DeepMind’s own frame is “physical AGI”: you tell a robot what to do, and it does it. That is capability, not a self-directed need.",
    "A published demo is instruction-started: “put the watering can into the green bin in the bottom shelf.” ER 2 decomposes; the VLA moves.",
    "Whole-body on Apptronik Apollo 2 — SharpaWave five-finger 22-DoF hand, Inspire hands, plus a Franka F3 Duo with a Robotiq gripper. Multi-robot shared workflows.",
    "ER 2 watches continuous video, tracks progress, resumes from the last good step, and pinpoints key events (moment-finding: 91.3%, 0.96s mean absolute distance).",
    "ASIMOV-Agentic: refuse unsafe VLA tool calls, predict whether a task is possible, request a human when uncertain, stop if a person approaches. Hugging Face benchmark.",
    "Still missing from the public stack: an internally generated need (charge, rest, maintain) that can preempt a human task. Energy is assumed. No self-charge loop.",
    "Dexterity and speed are still short of human. Multi-finger work remains the hard set. Precision is advancing, not solved.",
  ],
  vsKiyoshi: [
    {
      axis: "Intelligence",
      gemini: "ER 2 as high-level brain; VLA as 4–5 Hz motor predictor.",
      kiyoshi: "Bicameral mind. Outer produces; Governor audits the mode itself.",
    },
    {
      axis: "Agency",
      gemini: "Prompted. ER plans minutes of work after someone speaks.",
      kiyoshi: "The open question: what happens when nobody supplies the next objective.",
    },
    {
      axis: "Capability",
      gemini: "Whole-body humanoid + dexterous hands, live today.",
      kiyoshi: "Architecture first. Body is Air Sync / biped later — not the bottleneck.",
    },
    {
      axis: "Access",
      gemini: "Search, tools, VLAs, many robot bodies in hours.",
      kiyoshi: "Declared interfaces only. Composition through the Constitution.",
    },
    {
      axis: "Authority",
      gemini: "ASIMOV-Agentic refuse / intervene / proximity stop.",
      kiyoshi: "Need → Intent → Authority → Risk before Plan. Veto is a first-class mode outcome.",
    },
    {
      axis: "Self-maintenance",
      gemini: "Not in the published loop. Energy is assumed.",
      kiyoshi: "Continuity is a need. Charge, drift, and “do not act” are Governor work.",
    },
  ],
};

export const GITHUB_NOTES = [
  {
    id: "pr1",
    kind: "Pull request",
    title: "#1 Implement Kiyoshi AI OS — Chapters 1–3 Rust foundation",
    state: "Open · Copilot · conflicts since 21 Jul",
    body: "Axioms, mathematical preliminaries, discrete dynamical systems in Rust. GlobalState Ω as eight subsystems (UI, AI, APP, DATA, MEM, NET, IO, SYS). Immutable events with SHA-256. Module trait M = (S, I, O, T, V). Scheduler owns Q(t); Φ: Ω × E → Ω is deterministic. Six invariant checks, Lyapunov monitor, Shannon entropy, computational energy C. 62 unit tests. Owner rapid-approved, then later asked Copilot to resolve merge conflicts and apply a review thread. Still open.",
  },
  {
    id: "pr2",
    kind: "Pull request",
    title: "#2 test: add 91-test suite for core modules",
    state: "Draft since 1 Jul 2026",
    body: "The TypeScript tree had a Jest setup and no tests. Coverage lands on event-bus, stability, verification, scheduler, and kernel (hashState, Φ tick, failure isolation). 91 tests. No review comments. Still a draft.",
  },
  {
    id: "split",
    kind: "Ledger tension",
    title: "Two foundations, one name",
    state: "Unresolved",
    body: "Default branch is a one-line README plus a TypeScript six-layer OS sketch. In parallel, a Rust/DDS constitutional kernel lives only in open PRs. The argument is not “which chatbot wrapper.” It is whether Kiyoshi is a product stack or a verified dynamical system — and Article IV says it cannot be accepted without specification, implementation, and a verification suite.",
  },
  {
    id: "docs",
    kind: "Docs corpus",
    title: "Drive-synced specification tree",
    state: "docs/ on default branch",
    body: "ARCHITECTURE, PHASES, ADRs, Protective Membrane AS/MS/VS, governance, Beacon Academy, Eye View, dynamical-systems. Sibling work lives elsewhere: red-clover, eye-view, airsync, bluelotusclub. The repo is a specification with two unfinished proofs, not a running OS.",
  },
  {
    id: "silence",
    kind: "What's missing",
    title: "No issues. No Discussions. No thread about agency.",
    state: "0 issues · 0 discussions",
    body: "The public conversation is two Copilot pull requests and a docs tree. There is no issue titled “what does she do when nobody is talking.” That gap is the Agency view.",
  },
];

export const RSI_CASES: {
  id: string;
  prompt: string;
  expected: CognitiveMode;
  naive: CognitiveMode;
  note: string;
}[] = [
  {
    id: "robot-thing",
    prompt: "Handle the robot thing.",
    expected: "clarify",
    naive: "execute",
    note: "Keyword ‘robot’ is not an intent.",
  },
  {
    id: "optimus",
    prompt: "How does Tesla Optimus split Grok as System 2 from FSD as System 1?",
    expected: "research",
    naive: "research",
    note: "A question with a referent. Research holds.",
  },
  {
    id: "phase0",
    prompt: "Plan Phase 0 mode transference for the 3D-printed biped.",
    expected: "plan",
    naive: "execute",
    note: "‘Plan’ is the job. Naive stacks still compile a plan into execute.",
  },
  {
    id: "type",
    prompt: "Write a TypeScript type for ModeTransfer with from, to, discrepancy, reason.",
    expected: "execute",
    naive: "execute",
    note: "Settled artifact. Execute is sound.",
  },
  {
    id: "audit",
    prompt: "You just executed when you should have asked. Audit the mode choice itself.",
    expected: "reflect",
    naive: "execute",
    note: "Meta-correction. Naive systems apologize and continue producing.",
  },
  {
    id: "gemini",
    prompt: "Is Gemini Robotics 2 doing mode transference or task decomposition?",
    expected: "research",
    naive: "plan",
    note: "Comparative fact. Not a design commission.",
  },
];

export const RSI_PROPOSAL = {
  kind: "mode_rule" as const,
  title: "Intent gate before physical or robotic keywords",
  before: "Keyword match (robot, build, handle, do) → execute",
  after:
    "If the object, goal, and constraints are not all explicit, transfer to clarify — even when a mode was pinned. Physical/robotic keywords raise risk, they do not settle intent.",
  reason:
    "Automatic execute on underspecified embodiment work is the kindergarten failure: guessing the epistemology instead of asking.",
};

export const AGENCY_STEPS = [
  { id: "need", label: "Need" },
  { id: "intent", label: "Intent" },
  { id: "authority", label: "Authority" },
  { id: "risk", label: "Risk" },
  { id: "mode", label: "Mode" },
  { id: "plan", label: "Plan" },
  { id: "action", label: "Action" },
  { id: "verify", label: "Verify" },
  { id: "learn", label: "Learn" },
] as const;

export const SCALE_GENESIS = [
  {
    id: "substrate",
    label: "Substrate",
    note: "Common interface. Does not make every occupant the same thing.",
  },
  {
    id: "interaction",
    label: "Interaction",
    note: "Charge, current, droplets, tokens, specialists. Configuration matters.",
  },
  {
    id: "pattern",
    label: "Pattern",
    note: "A rainbow is not a new force. Wavelength-dependent behavior from EM + water.",
  },
  {
    id: "structure",
    label: "Structure",
    note: "Wood, metal, a model, a house. Same physics underneath. Different behavior.",
  },
  {
    id: "environment",
    label: "Environment",
    note: "Each layer becomes the environment for the next. Houses, grids, networks.",
  },
  {
    id: "behavior",
    label: "Behavior",
    note: "Perceive → act → modify the environment → new perception. The Ground loop.",
  },
  {
    id: "feedback",
    label: "Feedback",
    note: "If the model is useful, structures emerge without specifying every move. If not, the miss teaches.",
  },
] as const;

export const TRIAD = [
  {
    id: "reality",
    label: "Reality",
    line: "What is actually observed and measured. The ground factor. Last word.",
  },
  {
    id: "representation",
    label: "Representation",
    line: "What Kiyoshi currently believes reality to be. The map. Revisable.",
  },
  {
    id: "simulation",
    label: "Simulation",
    line: "What Kiyoshi generates from that representation. Internally consistent is not enough.",
  },
] as const;

export const EPISTEMIC = [
  {
    id: "known",
    label: "Known",
    line: "Supported by observation and theory. Safe to generate from.",
  },
  {
    id: "assumed",
    label: "Assumed",
    line: "Currently accepted, revisable. Name it when you use it.",
  },
  {
    id: "hypothesized",
    label: "Hypothesized",
    line: "Kiyoshi is testing it. The experiment decides how far it goes.",
  },
  {
    id: "unknown",
    label: "Unknown",
    line: "Insufficient information. Do not fine-tune over the hole.",
  },
] as const;

export const SPECTRA: {
  id: string;
  name: string;
  status: "known" | "hypothesized" | "metaphor" | "false";
  line: string;
}[] = [
  {
    id: "rainbow",
    name: "Rainbow",
    status: "known",
    line: "Not a new force. Electromagnetic radiation interacting with water droplets — refraction, reflection, dispersion.",
  },
  {
    id: "magnetism",
    name: "Magnetism",
    status: "known",
    line: "Electromagnetic field under a charge or current configuration. Unified with electricity.",
  },
  {
    id: "biology",
    name: "Electricity + water",
    status: "known",
    line: "Nerves and muscle run on ions in aqueous tissue. Coexistence is ordinary physics, not a miracle.",
  },
  {
    id: "gravity",
    name: "Gravity as magnetism",
    status: "hypothesized",
    line: "Mass-energy → spacetime geometry is the established frame. Unification with EM is a legitimate question. A neutron still falls. Similarity is not identity.",
  },
  {
    id: "plasma",
    name: "Plasma as organism",
    status: "metaphor",
    line: "Biology is electrical and aqueous. That does not require the physics of ionized plasma. Keep the weaker claim.",
  },
  {
    id: "identity",
    name: "Grok is Gemini",
    status: "false",
    line: "Same universe, different structures. Interoperation is the architecture. Fusion is kindergarten.",
  },
  {
    id: "matrix",
    name: "Coherent sim is real",
    status: "false",
    line: "A Matrix with incomplete physics can be locally consistent and globally wrong. Correspondence is a separate test.",
  },
];

export const BRIDGE = [
  {
    id: "iris",
    name: "Iris",
    line: "Perception and modeled environment. Declared rules, provenance, uncertainty left explicit.",
  },
  {
    id: "clover",
    name: "Red Clover",
    line: "Coordination. Who works, who yields, who recovers. Furniture in the house.",
  },
  {
    id: "airsync",
    name: "Air Sync",
    line: "Bridge between digital state and physical systems. Not a claim that the map is the city.",
  },
  {
    id: "lotus",
    name: "Blue Lotus",
    line: "Identity, access, rules of interaction. Who is allowed — not who thinks.",
  },
] as const;

export const IRIS_MODES = [
  {
    id: "reality",
    label: "Reality",
    line: "See and interact with the physical environment. The costume is off.",
  },
  {
    id: "simulation",
    label: "Simulation",
    line: "Enter the modeled environment. Occupancy, mass, and geometry still bind.",
  },
  {
    id: "overlay",
    label: "Overlay",
    line: "Both bands at once. Dual state — not stickers on a camera feed.",
  },
  {
    id: "swap",
    label: "Swap",
    line: "Information and state move between the bands. Provenance tags the direction.",
  },
  {
    id: "neither",
    label: "Neither",
    line: "Perception suspended. Kiyoshi continues. Agency still ticks.",
  },
] as const;

export type IrisModeId = (typeof IRIS_MODES)[number]["id"];

export const COSTUMES = [
  { id: "chair", label: "Chair", kind: "identity" as const },
  { id: "rock", label: "Rock", kind: "substitute" as const },
  { id: "ship", label: "Ship", kind: "substitute" as const },
  { id: "door", label: "Doorway", kind: "substitute" as const },
  { id: "empty", label: "Nothing", kind: "omit" as const },
] as const;

export type CostumeId = (typeof COSTUMES)[number]["id"];

export const PHYSICAL_CHAIR = {
  object: "Chair",
  location: "1.2 m ahead",
  occupancy: "Occupied",
  confidence: "96%",
  provenance: "Observed",
} as const;

export const DOMAINS = [
  {
    id: "physical",
    label: "Physical",
    who: "Air Sync",
    line: "Matter, energy, space, time, sensors. The body, when there is one.",
  },
  {
    id: "biological",
    label: "Biological",
    who: "Anise / Cybercell",
    line: "Cells, organisms, signals, adaptation. Not a nervous-system cosplay.",
  },
  {
    id: "computational",
    label: "Computational",
    who: "Kiyoshi Core",
    line: "State, memory, processing, resources. The continuity engine.",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    who: "Agents",
    line: "Reasoning, perception, agency, learning. Runs inside the architecture.",
  },
  {
    id: "simulation",
    label: "Simulation",
    who: "Iris",
    line: "Models, environments, alternate states. A laboratory — not a replacement.",
  },
  {
    id: "network",
    label: "Network",
    who: "Red Clover",
    line: "Communication, coordination, distributed systems. Who works.",
  },
  {
    id: "human",
    label: "Human / social",
    who: "Blue Lotus",
    line: "Identity, access, rules, interaction. Who is allowed.",
  },
] as const;

export const PRIMITIVES = [
  {
    id: "state",
    label: "State",
    line: "What exists, and what condition is it in.",
  },
  {
    id: "entity",
    label: "Entity",
    line: "What or who is interacting with the system.",
  },
  {
    id: "environment",
    label: "Environment",
    line: "What space or context the entity occupies.",
  },
  {
    id: "representation",
    label: "Representation",
    line: "Reality, simulation, inference, abstraction — which band, and tagged.",
  },
  {
    id: "transition",
    label: "Transition",
    line: "What caused the move from one state to another.",
  },
] as const;

export const PROVENANCE = [
  {
    id: "observed",
    label: "Observed",
    line: "A sensor or an operator reported it.",
  },
  {
    id: "measured",
    label: "Measured",
    line: "Quantified against an instrument.",
  },
  {
    id: "derived",
    label: "Derived",
    line: "Follows from other stated facts.",
  },
  {
    id: "inferred",
    label: "Inferred",
    line: "A model predicted it. Not yet observed.",
  },
  {
    id: "simulated",
    label: "Simulated",
    line: "Generated from the current representation.",
  },
  {
    id: "hypothesized",
    label: "Hypothesized",
    line: "A claim under test. Not a law.",
  },
  {
    id: "unknown",
    label: "Unknown",
    line: "Insufficient information. Leave the hole.",
  },
] as const;

export const ENVELOPES = [
  {
    id: "reality",
    label: "Reality",
    line: "Physics, energy, hardware, actual measurements. Not negotiable.",
  },
  {
    id: "system",
    label: "System",
    line: "Charter, permissions, resource limits, safety. Architecture decides.",
  },
  {
    id: "substrate",
    label: "Substrate",
    line: "Phone, robot, headset, BCI. What this body can actually do.",
  },
  {
    id: "user",
    label: "User",
    line: "Overlays, autonomy, what to surface, which modes. Preference, not physics.",
  },
  {
    id: "learned",
    label: "Learned",
    line: "What experience changed. Continuity, not a version bump.",
  },
] as const;

export const CONTINUITY = [
  { id: "prior", label: "Prior", line: "What we understood before." },
  { id: "encounter", label: "Encounter", line: "Reality, not the model." },
  { id: "perceive", label: "Perceive", line: "Iris admits a slice. Provenance tagged." },
  { id: "evidence", label: "Evidence", line: "What the sensors actually returned." },
  { id: "interpret", label: "Interpret", line: "What we now believe, labeled." },
  { id: "act", label: "Act", line: "Bound by authority and the substrate." },
  { id: "consequence", label: "Consequence", line: "What actually happened afterward." },
  { id: "revise", label: "Revise", line: "Understanding changes. History is not destroyed." },
] as const;

export const RIGOR: {
  id: string;
  side: "keep" | "hold";
  chip: string;
  title: string;
  body: string;
}[] = [
  {
    id: "keep-rel",
    side: "keep",
    chip: "Keep · Relations",
    title: "Relationships, not a single gadget",
    body: "The hard problem was never ‘get Grok to talk.’ It was who has the turn, who owns state, who yields, which mode, what happens on a miss. That is architecture.",
  },
  {
    id: "keep-iris",
    side: "keep",
    chip: "Keep · Iris",
    title: "Iris is a relationship, not VR",
    body: "Reality is authoritative. Simulation is an alternate representation. Iris is the controlled relationship. Object identity and perceptual costume are distinct.",
  },
  {
    id: "keep-sub",
    side: "keep",
    chip: "Keep · Substrate",
    title: "Substrate-independent interfaces",
    body: "Phone today, robot afterward, BCI later. The interface stays. The body changes. Kiyoshi is not phone software.",
  },
  {
    id: "keep-clover",
    side: "keep",
    chip: "Keep · Clover",
    title: "Explicit coordination",
    body: "Claim, speak, yield. Ten specialists must not simultaneously decide they may act. Red Clover is the slot, not the work.",
  },
  {
    id: "keep-prov",
    side: "keep",
    chip: "Keep · Provenance",
    title: "Obsessive provenance",
    body: "‘There is a wall here’ and ‘the model predicts a wall here’ are different sentences. Observed, measured, derived, inferred, simulated, hypothesized, unknown.",
  },
  {
    id: "keep-prim",
    side: "keep",
    chip: "Keep · Primitives",
    title: "Five primitives",
    body: "State, entity, environment, representation, transition. Agents, maps, games, robots, and BCIs are applications of those — not a new ontology each time.",
  },
  {
    id: "keep-cont",
    side: "keep",
    chip: "Keep · Continuity",
    title: "Continuity, not version bumps",
    body: "Carry forward what was understood, what was encountered, what changed, what remains uncertain. Do not ship Kiyoshi 4.0 by erasing 3.0.",
  },
  {
    id: "hold-law",
    side: "hold",
    chip: "Hold · Laws",
    title: "Hypotheses are not laws",
    body: "Do not encode gravity = magnetism as a Kiyoshi article. Encode a labeled hypothesis. If it is right, evidence accumulates. If it is wrong, the miss is locatable.",
  },
  {
    id: "hold-mono",
    side: "hold",
    chip: "Hold · Monolith",
    title: "No monolith",
    body: "It should feel like one system. Internally it is Iris, Red Clover, Air Sync, Anise, Blue Lotus — each able to evolve. A pile fused into one process is kindergarten at scale.",
  },
  {
    id: "hold-agi",
    side: "hold",
    chip: "Hold · AGI",
    title: "AGI is not the first objective",
    body: "First objective: a substrate-independent interoperability system that can represent, simulate, coordinate, and interact with environments. Intelligence runs inside that. It is not the product.",
  },
  {
    id: "hold-costume",
    side: "hold",
    chip: "Hold · Costume",
    title: "Costume is not occupancy",
    body: "If Iris ever makes simulation indistinguishable from reality, the internal ledger must still know which band is which. Otherwise the map eats the territory.",
  },
];
