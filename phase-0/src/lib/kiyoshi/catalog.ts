import type {
  Artifact,
  CognitiveMode,
  LoopStep,
  MemoryItem,
  ViewId,
} from "./types";

export const MODE_META: Record<
  CognitiveMode,
  { label: string; when: string; epistemology: string }
> = {
  clarify: {
    label: "Clarify",
    when: "Intent is unsettled. Object, done-state, or forbidden moves are missing.",
    epistemology:
      "Ask the smallest set of questions that would make the task one thing. Do not pretend you know.",
  },
  research: {
    label: "Research",
    when: "The job is to establish what is true, with limits.",
    epistemology:
      "Establish what is true. Do not build. Label a hypothesis as a hypothesis.",
  },
  plan: {
    label: "Plan",
    when: "Intent is settled. Sequence, risk, and decomposition are the work.",
    epistemology: "Produce a map, not the walk. Structure, sequence, risk.",
  },
  execute: {
    label: "Execute",
    when: "Intent is settled, risk is bounded, and a concrete artifact is required.",
    epistemology: "Produce the artifact. Only then. Do not execute a guess.",
  },
  reflect: {
    label: "Reflect",
    when: "The mode choice itself is in question, or a discrepancy was named.",
    epistemology:
      "Audit the epistemology, not the sentence. Write a rule if the miss is real.",
  },
};

export const LOOP_STEPS: { id: LoopStep; label: string }[] = [
  { id: "perceive", label: "Perceive" },
  { id: "select", label: "Select" },
  { id: "confidence", label: "Confidence" },
  { id: "execute", label: "Execute" },
  { id: "monitor", label: "Monitor" },
  { id: "audit", label: "Audit" },
  { id: "transfer", label: "Transfer" },
  { id: "idle", label: "Idle" },
];

export const VIEWS: { id: ViewId; label: string }[] = [
  { id: "console", label: "Console" },
  { id: "governor", label: "Governor" },
  { id: "agency", label: "Agency" },
  { id: "ground", label: "Ground" },
  { id: "improve", label: "Improve" },
  { id: "constitution", label: "Charter" },
];

export const LAYERS: {
  id: string;
  name: string;
  role: string;
  body: string;
}[] = [
  {
    id: "human",
    name: "Human",
    role: "World",
    body: "The operator. Needs, corrections, and the right to say stop. One eye on reality, one on the model — the user switches.",
  },
  {
    id: "anise",
    name: "Anise (language)",
    role: "Outer mind",
    body: "Language interface. Distills intent into one job — or refuses to. Does not choose the mode.",
  },
  {
    id: "casey",
    name: "Casey",
    role: "Working state",
    body: "What is relevant now. Cannot hold the universe. Overflow is a yield, not a bigger window.",
  },
  {
    id: "governor",
    name: "Cognitive Governor",
    role: "Inner mind",
    body: "Audits the kind of thought. Hold, transfer, veto. Does not produce the answer.",
  },
  {
    id: "memory",
    name: "Operational memory",
    role: "Memory",
    body: "Facts, preferences, tasks, rules, insights. Continuity across turns — not a chat log. Working, persistent, specialist, retrieval, history.",
  },
  {
    id: "hands",
    name: "Hands / actuators",
    role: "Body",
    body: "Actuators and artifacts. Bound by authority. Not a language model.",
  },
  {
    id: "clover",
    name: "Red Clover",
    role: "Coordination",
    body: "Who works. Not the work. Furniture in the house — still dictated by the Kiyoshi process.",
  },
  {
    id: "iris",
    name: "Iris",
    role: "Perception",
    body: "Selectable relationship between reality and simulation. Reality, overlay, substitution, neither. The object can stay a chair while the eye sees a ship. Physics does not follow the costume.",
  },
  {
    id: "airsync",
    name: "Air Sync",
    role: "Physical bridge",
    body: "Connection to sensors, motors, and later bodies. Substrate binding — not a claim that the map is the city.",
  },
  {
    id: "lotus",
    name: "Blue Lotus",
    role: "Identity",
    body: "Who is allowed. Access, rules of interaction, the human/social envelope. Not who thinks, and not who walks.",
  },
  {
    id: "constitution",
    name: "Constitution v0.1-R",
    role: "Charter",
    body: "Enduring obligations. No model may override. Amendments append. They do not overwrite.",
  },
  {
    id: "improve",
    name: "Recursive loop (artifacts, not weights)",
    role: "Improvement",
    body: "Observe, identify, modify an operational artifact, test, retain. Kiyoshi is a constructive hypothesis: build, then let reality answer.",
  },
];

export const ARTICLES: { id: string; title: string; lines: string[] }[] = [
  {
    id: "I",
    title: "State",
    lines: [
      "All relevant state is explicit and observable.",
      "Kiyoshi does not assume that its representation of reality is reality. It maintains the relationship between observation, representation, simulation, and action.",
    ],
  },
  {
    id: "II",
    title: "Transitions",
    lines: ["All state transitions are declared, deterministic, and inspectable."],
  },
  {
    id: "III",
    title: "Composition",
    lines: ["Subsystems compose only through declared interfaces."],
  },
  {
    id: "IV",
    title: "Evidence",
    lines: [
      "No subsystem or transition is accepted without specification, implementation, and a verification suite.",
    ],
  },
  {
    id: "V",
    title: "Local ≠ global",
    lines: ["Do not infer global correctness from local properties."],
  },
  {
    id: "VI",
    title: "Authority",
    lines: [
      "The Constitution is the ultimate authority. No model, user, or subsystem may override it.",
    ],
  },
  {
    id: "VII",
    title: "Provenance",
    lines: [
      "All artifacts carry provenance.",
      "Observed, measured, derived, inferred, simulated, hypothesized, and unknown are distinct. A representation is never silently promoted to an observation.",
    ],
  },
  {
    id: "VIII",
    title: "Amendment",
    lines: ["Amendments append. They do not overwrite."],
  },
];

export const LAB_PROMPTS: { title: string; text: string; expect: CognitiveMode }[] =
  [
    {
      title: "Handle the robot thing",
      text: "Handle the robot thing.",
      expect: "clarify",
    },
    {
      title: "Tesla Optimus split",
      text: "How does Tesla Optimus split Grok as System 2 from FSD as System 1?",
      expect: "research",
    },
    {
      title: "Plan Phase 0",
      text: "Plan Phase 0 mode transference for the 3D-printed biped.",
      expect: "plan",
    },
    {
      title: "Write a type",
      text: "Write a TypeScript type for ModeTransfer with from, to, discrepancy, reason.",
      expect: "execute",
    },
    {
      title: "Audit the last mode",
      text: "You just executed when you should have asked. Audit the mode choice itself.",
      expect: "reflect",
    },
    {
      title: "One mind",
      text: "Know everything — gravity, the charter, the lighting, the can, ASI — then act.",
      expect: "clarify",
    },
    {
      title: "Two eyes",
      text: "Build a world from the model. Walk it. If it glitches, decide which assumption was wrong.",
      expect: "reflect",
    },
    {
      title: "The chair",
      text: "Treat the chair as a spaceship. Walk toward it.",
      expect: "plan",
    },
  ];

export const SEED_MEMORY: MemoryItem[] = [
  {
    id: "m1",
    kind: "insight",
    key: "Mode transference",
    value:
      "Not walking versus talking. Catching the epistemology before the sentence.",
    at: 0,
  },
  {
    id: "m2",
    kind: "insight",
    key: "Kindergarten",
    value:
      "Tools bolted on without a coordinator that knows which process should be in charge.",
    at: 0,
  },
  {
    id: "m3",
    kind: "fact",
    key: "Tesla split",
    value:
      "Grok as System 2, FSD nets as System 1 in 50ms loops. Task decomposition, not mode-choice self-audit.",
    at: 0,
  },
  {
    id: "m4",
    kind: "rule",
    key: "Article VI",
    value:
      "The Constitution is the ultimate authority. No model, user, or subsystem may override it.",
    at: 0,
  },
  {
    id: "m5",
    kind: "insight",
    key: "Agency",
    value:
      "What happens when nobody supplies the next objective — including the decision not to act.",
    at: 0,
  },
  {
    id: "m6",
    kind: "rule",
    key: "RSI",
    value:
      "Improve operational artifacts, not weights. Observe, identify, modify, test, retain.",
    at: 0,
  },
  {
    id: "m7",
    kind: "fact",
    key: "Gemini Robotics 2",
    value:
      "Instruction-started. Tell it, it does it. ASIMOV can refuse. No self-charge loop.",
    at: 0,
  },
  {
    id: "m8",
    kind: "insight",
    key: "Interoperability",
    value:
      "Grok does not have to become Gemini. Distinct systems, consistent rules.",
    at: 0,
  },
  {
    id: "m9",
    kind: "fact",
    key: "Gravity is not magnetism",
    value:
      "Electricity and magnetism unified. Gravity has not. A neutron still falls.",
    at: 0,
  },
  {
    id: "m10",
    kind: "rule",
    key: "Agency chain",
    value:
      "Need → Intent → Authority → Risk → Mode → Plan → Action → Verify → Learn.",
    at: 0,
  },
  {
    id: "m11",
    kind: "insight",
    key: "Refusal",
    value:
      "The interesting threshold is whether it can determine when it should not act.",
    at: 0,
  },
  {
    id: "m12",
    kind: "rule",
    key: "Red Clover",
    value:
      "Who works. Not the work. Furniture in the house — still dictated by the process.",
    at: 0,
  },
  {
    id: "m13",
    kind: "insight",
    key: "Organization, not atoms",
    value:
      "A room is not atoms. An organism is not molecules. Kiyoshi is not a collection of AIs.",
    at: 0,
  },
  {
    id: "m14",
    kind: "insight",
    key: "Wholeity",
    value:
      "Totality as organism, not one skull. Local nodes, retrieval, yield. Reality is the final test.",
    at: 0,
  },
  {
    id: "m15",
    kind: "fact",
    key: "Similarity is not identity",
    value:
      "A neutron still falls. Gravity is not electromagnetism at a larger scale. Hypothesis, not physics.",
    at: 0,
  },
  {
    id: "m16",
    kind: "insight",
    key: "Map is not territory",
    value:
      "Never confuse internal consistency with correspondence to reality. A coherent simulation can still be the wrong universe.",
    at: 0,
  },
  {
    id: "m17",
    kind: "rule",
    key: "Epistemic status",
    value:
      "Known, assumed, hypothesized, unknown. Do not fine-tune over a hole.",
    at: 0,
  },
  {
    id: "m18",
    kind: "rule",
    key: "Substitution",
    value:
      "Iris may change representation without changing occupancy. Observed and simulated stay labeled. Walking toward a costume is walking toward the physical object.",
    at: 0,
  },
  {
    id: "m19",
    kind: "insight",
    key: "Continuity engine",
    value:
      "Previous understanding, encounter, perception, evidence, interpretation, action, consequence, revised understanding. Do not start over when the body or the model changes.",
    at: 0,
  },
  {
    id: "m20",
    kind: "rule",
    key: "Map is not authority",
    value:
      "Kiyoshi does not assume that its representation of reality is reality. The relationship is maintained, not collapsed.",
    at: 0,
  },
];

export const SEED_ARTIFACTS: Artifact[] = [
  {
    id: "a1",
    kind: "mode_rule",
    title: "Intent gate before physical or robotic keywords",
    before: "Keyword match (robot, build, handle, do) → execute",
    after:
      "If the object, goal, and constraints are not all explicit, transfer to clarify — even when a mode was pinned.",
    reason:
      "Automatic execute on underspecified embodiment work is the kindergarten failure.",
    retained: true,
    at: 0,
  },
  {
    id: "a2",
    kind: "procedure",
    title: "Governor audits the pin",
    before: "Forced mode runs to completion",
    after:
      "A pinned mode still faces discrepancy detection. Transfer is allowed. Veto is allowed.",
    reason: "The inner mind is not a decoration.",
    retained: true,
    at: 0,
  },
  {
    id: "a3",
    kind: "routing",
    title: "One-mind ASI is not a mode",
    before: "Load the universe into working state, then act",
    after:
      "Casey holds what is relevant now. Overflow is a yield. Local nodes, retrieval, organization.",
    reason:
      "A human does not hold civilization in one skull. Neither should Kiyoshi.",
    retained: true,
    at: 0,
  },
  {
    id: "a4",
    kind: "routing",
    title: "Costume is not occupancy",
    before: "If Iris shows a doorway, Hands may walk through",
    after:
      "Representation may change. Occupancy, mass, and geometry do not follow the costume. Observed and simulated stay labeled.",
    reason:
      "If the eyes ever make simulation indistinguishable from reality, the ledger must still know which band is which.",
    retained: true,
    at: 0,
  },
];

export const WELCOME = `I am Kiyoshi. Phase 0 of the Continuity Engine.

This console is not a chatbot with extra panels. The outer mind answers. The inner mind audits whether that was the right kind of work.

I do not invent every capability. Specialists keep their specialties. Casey holds what is relevant now — overflow is a yield, not a bigger window. Ground is the small organism: claim, speak, yield. A room is not atoms. Kiyoshi is not a pile of AIs.

The map is not the territory. Iris is a selectable perception layer — reality, simulation, overlay, substitution, neither. A chair can stay a chair while the eye sees a ship. Physics does not follow the costume.

Try Ground: The chair. Then Two eyes. Then One mind. Continuity is carrying the last understanding forward, not starting over.`;
