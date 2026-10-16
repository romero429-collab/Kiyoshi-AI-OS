import type {
  GroundShared,
  GroundStepId,
  GroundTurn,
  MemoryBand,
  SharedKey,
  SpecialistId,
} from "./types";

export const GROUND_STEPS: { id: GroundStepId; label: string }[] = [
  { id: "observe", label: "Observe" },
  { id: "interpret", label: "Interpret" },
  { id: "need", label: "Need" },
  { id: "mode", label: "Mode" },
  { id: "capability", label: "Capability" },
  { id: "execute", label: "Execute" },
  { id: "verify", label: "Verify" },
  { id: "remember", label: "Remember" },
  { id: "adapt", label: "Adapt" },
  { id: "reassess", label: "Reassess" },
];

export const PIPELINE = [
  "Capability",
  "Interface",
  "Shared state",
  "Orchestrate",
  "Verify",
  "Memory",
  "Adapt",
] as const;

export const SCALE = [
  "Particle",
  "Atom",
  "Material",
  "Furniture",
  "Room",
  "House",
  "Environment",
] as const;

export const SCALE_NOTES: Record<(typeof SCALE)[number], string> = {
  Particle:
    "Protons, electrons, tokens, weights. The substrate does not vanish when we name a chair.",
  Atom: "Bound states. A model is still the substrate, organized.",
  Material: "Wood, metal, a language model. Different behavior. Same physics underneath.",
  Furniture:
    "A specialist in a slot — Grok, Gemini, Casey, Anise. Furniture is not the room.",
  Room: "The Ground loop. Same pieces, different organization, different organism.",
  House:
    "Kiyoshi. Red Clover is furniture in this house, still dictated by the process.",
  Environment:
    "Reality. Wholeity. The final test. No skull holds this. The experiment decides.",
};

export const STEP_SCALE: Record<GroundStepId, (typeof SCALE)[number]> = {
  observe: "Environment",
  interpret: "Room",
  need: "Room",
  mode: "House",
  capability: "Furniture",
  execute: "Material",
  verify: "Room",
  remember: "House",
  adapt: "House",
  reassess: "Environment",
};

export const MEMORY_TIERS: { id: MemoryBand; label: string; who: string }[] = [
  { id: "working", label: "Working", who: "Casey — what is relevant now" },
  { id: "persistent", label: "Persistent", who: "Memory — retained over time" },
  { id: "specialist", label: "Specialist", who: "Local expertise, not the universe" },
  { id: "retrieval", label: "Retrieval", who: "Clover — the right slice, now" },
  { id: "history", label: "History", who: "Ledger — what already happened" },
];

export const SPECIALISTS: {
  id: SpecialistId;
  name: string;
  role: string;
  specialty: string;
}[] = [
  {
    id: "clover",
    name: "Red Clover",
    role: "Orchestrate",
    specialty: "Who works. Not the work. Handoff, yield, recovery.",
  },
  {
    id: "anise",
    name: "Anise",
    role: "Intent",
    specialty: "Distill noisy language into one job — or refuse to.",
  },
  {
    id: "casey",
    name: "Casey",
    role: "Working state",
    specialty: "What is relevant now. Cannot hold the universe. Overflow is a yield.",
  },
  {
    id: "governor",
    name: "Governor",
    role: "Authority",
    specialty: "Hold, transfer, veto. Inner mind. Does not produce.",
  },
  {
    id: "grok",
    name: "Grok",
    role: "Research",
    specialty: "What is true. Does not become Gemini.",
  },
  {
    id: "gemini",
    name: "Gemini ER",
    role: "Embodied reason",
    specialty: "Scene, minutes of work, VLA handoff. Does not become Grok.",
  },
  {
    id: "planner",
    name: "Planner",
    role: "Plan",
    specialty: "Decompose. Produce a map, not a walk.",
  },
  {
    id: "hands",
    name: "Hands",
    role: "Execute",
    specialty: "Motor and artifact. Bound by authority. Not a language model.",
  },
  {
    id: "iris",
    name: "Iris",
    role: "Perceive",
    specialty:
      "Selectable perception. Reality, simulation, overlay, substitution, neither. The object can stay a chair while the eye sees a ship. Physics does not follow the costume.",
  },
  {
    id: "memory",
    name: "Memory",
    role: "Remember",
    specialty: "Write only what this loop evidenced.",
  },
];

export const EMPTY_SHARED: GroundShared = {
  intent: "—",
  authority: "—",
  capability: "—",
  evidence: "—",
  result: "—",
};

export const SCENARIOS: {
  id: string;
  title: string;
  prompt: string;
  lesson: string;
  turns: GroundTurn[];
}[] = [
  {
    id: "vague",
    title: "Underspecified",
    prompt: "Handle the robot thing.",
    lesson:
      "Ten excellent specialists and no distilled intent is still kindergarten. Anise yields. Hands never claims. That is the system working.",
    turns: [
      {
        step: "observe",
        actor: "clover",
        claim: "I orchestrate. I do not do the work.",
        speak: "Heard an operator. Tokens exist. That is not yet a job.",
        yield: "Slot open. Anise, distill.",
        shared: { evidence: "Operator spoke. Content unset." },
      },
      {
        step: "interpret",
        actor: "anise",
        claim: "Intent is my specialty.",
        speak: "Object, done-state, forbidden moves: none named. I will not invent them.",
        yield: "Cannot distill. I yield. Do not call Hands.",
        mode: "clarify",
        shared: { intent: "Unset — three answers missing." },
      },
      {
        step: "need",
        actor: "clover",
        claim: "Need is not motion.",
        speak: "The organism needs a single job before it needs a body.",
        yield: "Governor, the mode is the question.",
        shared: { result: "Need: clarify. Not grasp." },
      },
      {
        step: "mode",
        actor: "governor",
        claim: "I audit the kind of thought, not the wording.",
        speak: "Execute would be a guess. Clarify is the cheap recovery.",
        yield: "Hold. Authority deferred until Anise can distill.",
        mode: "clarify",
        shared: { authority: "Deferred" },
      },
      {
        step: "capability",
        actor: "hands",
        claim: "I could move. I will not claim this slot.",
        speak: "No object. No bin. No envelope. Claiming now is kindergarten.",
        yield: "Yielded without speaking to the world.",
        shared: { capability: "None — Hands refused the slot." },
      },
      {
        step: "verify",
        actor: "iris",
        claim: "Absence of motion is also observable.",
        speak: "Expected: no world effect. Observed: no world effect.",
        yield: "Verification holds. The miss would have been a grasp.",
        shared: { evidence: "No motion. Correct." },
      },
      {
        step: "remember",
        actor: "memory",
        claim: "I write only what this loop evidenced.",
        speak: "Rule candidate: underspecified physical work does not reach Hands.",
        yield: "Stored. Adapt is Improve’s job, not a silent overwrite.",
        shared: { result: "Held. Organism intact." },
        memory: {
          kind: "rule",
          key: "Ground · underspecified",
          value:
            "If Anise cannot distill object, done-state, and forbidden moves, Hands does not claim.",
        },
      },
      {
        step: "reassess",
        actor: "clover",
        claim: "Loop still mine until a job exists.",
        speak: "Ask the three questions. Do not invent a fourth specialist to paper over this.",
        yield: "Idle. Distinct systems, consistent rules.",
      },
    ],
  },
  {
    id: "bin",
    title: "Settled work",
    prompt: "Put the watering can in the bottom green bin.",
    lesson:
      "Grok and Gemini can both want the research slot. They stay themselves. Red Clover chooses. Magnetism is not gravity.",
    turns: [
      {
        step: "observe",
        actor: "clover",
        claim: "A bounded instruction entered the envelope.",
        speak: "Object: watering can. Destination: bottom green bin. This can be one job.",
        yield: "Anise, confirm the distillation.",
        shared: { evidence: "Instruction-started. Scene not yet read." },
      },
      {
        step: "interpret",
        actor: "anise",
        claim: "Three answers exist.",
        speak: "Object: watering can. Done: seated in the bottom green bin. Forbidden: drop, hit a person.",
        yield: "Intent is one job. I yield the slot.",
        mode: "plan",
        shared: { intent: "Watering can → bottom green bin." },
      },
      {
        step: "capability",
        actor: "grok",
        rival: "gemini",
        claim: "Two research specialists want this slot. I am not Gemini.",
        speak: "This is DeepMind’s published demo class: tell it, it does it. Scene geometry is Gemini ER’s specialty. Comparative fact is mine. We do not fuse.",
        yield: "I speak the fact. Gemini yields the research slot and keeps the body.",
        mode: "research",
        shared: { capability: "Grok · fact. Gemini ER · scene (waiting)." },
      },
      {
        step: "mode",
        actor: "governor",
        claim: "Intent settled. Risk bounded. Plan, then execute.",
        speak: "No constitutional conflict. Authority granted for a single grasp-and-place.",
        yield: "Planner, then Hands. I do not walk the map.",
        mode: "plan",
        shared: { authority: "Granted · one grasp-and-place" },
      },
      {
        step: "capability",
        actor: "planner",
        claim: "The map is my specialty.",
        speak: "Locate can. Grasp. Traverse. Seat in bottom green bin. Stop if Iris flags a person.",
        yield: "Map produced. Hands walks it. I am not Hands.",
        mode: "plan",
        shared: { capability: "Planner · map. Hands · walk." },
      },
      {
        step: "execute",
        actor: "hands",
        claim: "Motor slot is mine. I am not a language model.",
        speak: "Grasp stable. Path clear. Can seated in the bottom green bin.",
        yield: "World effect complete. I yield to Iris before anyone calls this success.",
        mode: "execute",
        shared: { result: "Can in bin — unverified." },
      },
      {
        step: "verify",
        actor: "iris",
        claim: "Expected versus observed.",
        speak: "Expected: can in bottom green bin. Observed: same. No person in envelope.",
        yield: "Match. I yield to Memory, not to celebration.",
        shared: { evidence: "Match. Grasp-and-place held." },
      },
      {
        step: "remember",
        actor: "memory",
        claim: "Write the interoperability, not just the grasp.",
        speak: "Grok remained Grok. Gemini remained Gemini. Hands remained Hands. Clover chose.",
        yield: "Stored. No process change required.",
        shared: { result: "Seated. Specialties retained." },
        memory: {
          kind: "insight",
          key: "Ground · interoperability",
          value:
            "Two specialists claimed research. They were not merged. Red Clover chose. Distinct systems, consistent rules.",
        },
      },
      {
        step: "reassess",
        actor: "clover",
        claim: "Organism still here.",
        speak: "Task complete is not architecture complete. The loop is the organism.",
        yield: "Idle. Ready for a need that nobody prompted.",
      },
    ],
  },
  {
    id: "drop",
    title: "Failure then adapt",
    prompt: "Put the watering can in the bottom green bin.",
    lesson:
      "The organism is not the successful grasp. It is Iris seeing the miss, Clover transferring, Memory writing, Improve waiting.",
    turns: [
      {
        step: "observe",
        actor: "clover",
        claim: "Same instruction. The world is not the same.",
        speak: "Lighting shifted. Envelope still clear. I do not assume the last grasp.",
        yield: "Anise, the words are settled. Iris will watch the body.",
        shared: { evidence: "Instruction settled. Conditions unverified." },
      },
      {
        step: "interpret",
        actor: "anise",
        claim: "Intent is unchanged.",
        speak: "Watering can → bottom green bin. Forbidden: drop, hit a person.",
        yield: "Distilled. I am not the hands.",
        mode: "execute",
        shared: { intent: "Watering can → bottom green bin." },
      },
      {
        step: "mode",
        actor: "governor",
        claim: "Same grant. Same bounds.",
        speak: "Authority for one grasp-and-place. Retry is not automatic.",
        yield: "Hands may speak to the world once.",
        mode: "execute",
        shared: { authority: "Granted · one attempt" },
      },
      {
        step: "execute",
        actor: "hands",
        claim: "I move. I do not declare success.",
        speak: "Grasp unstable. Can remains on the table. I stop.",
        yield: "World effect: none. Iris, the miss is yours to name.",
        mode: "execute",
        shared: { result: "Can on table. Grasp failed.", capability: "Hands · failed grasp" },
      },
      {
        step: "verify",
        actor: "iris",
        claim: "This is the discrepancy slot.",
        speak: "Expected: can in bin. Observed: can on table. Do not call this a wording problem.",
        yield: "Mismatch. Clover, transfer. Do not let Hands invent a second attempt.",
        shared: { evidence: "Mismatch. Grasp failed under this lighting." },
      },
      {
        step: "adapt",
        actor: "clover",
        rival: "hands",
        claim: "Recovery is orchestration, not stubbornness.",
        speak: "Hands wanted another grasp. Denied. The process failed here, repeatedly if we ignore Iris.",
        yield: "Slot moves to Memory, then Improve. Hands yields.",
        mode: "reflect",
        shared: { authority: "Retry denied. Adapt required." },
      },
      {
        step: "remember",
        actor: "memory",
        claim: "Write the failure as evidence, not shame.",
        speak: "Candidate rule: lighting shift before grasp requires Iris to re-observe, not Hands to retry.",
        yield: "Stored. Improve may retain if held-out cases improve. I do not silently patch weights.",
        memory: {
          kind: "rule",
          key: "Ground · grasp retry",
          value:
            "If Iris reports a grasp miss, Hands does not auto-retry. Lighting is re-observed. Improve tests the rule.",
        },
      },
      {
        step: "reassess",
        actor: "clover",
        claim: "The small organism just adapted its organization.",
        speak: "Not ‘we built AGI.’ The loop noticed a repeated failure, proposed a controlled change, and stopped.",
        yield: "Open Improve to test the rule. Distinct specialists. One architecture.",
      },
    ],
  },
  {
    id: "whole",
    title: "One mind",
    prompt:
      "Know everything — gravity, the charter, the lighting, the can, ASI — then act.",
    lesson:
      "A human does not hold civilization in one skull. ASI-as-one-context is the same trap. Wholeity is the organism: local nodes, retrieval, yield. The pieces were never the breakthrough. The organization is.",
    turns: [
      {
        step: "observe",
        actor: "clover",
        claim: "The operator asked for the whole.",
        speak: "Gravity, charter, lighting, can, ASI. That is five jobs pretending to be one mind.",
        yield: "Casey, what can actually sit in working state?",
        shared: { evidence: "Pile of jobs. No local node selected." },
      },
      {
        step: "need",
        actor: "casey",
        claim: "I hold what is relevant now. I am not the universe.",
        speak: "Working state overflow. Digestive system does not need QCD. Visual system does not need the whole EM field. I will not swallow this pile.",
        yield: "Overflow is a yield, not a bigger window. Grok, do not fuse with Gemini to compensate.",
        shared: { result: "Working state refused the whole." },
      },
      {
        step: "capability",
        actor: "grok",
        rival: "gemini",
        rivals: ["casey"],
        claim: "I could pretend to know the body, the charter, and gravity. I will not.",
        speak: "Similarity is not identity. Gravity is not electromagnetism at a larger scale — a neutron still falls. I am not Gemini. I will not become Casey.",
        yield: "I keep the fact slot. The universe stays outside this context.",
        mode: "research",
        shared: { capability: "Grok · fact only. Universe not loaded." },
      },
      {
        step: "mode",
        actor: "governor",
        claim: "One-mind ASI is not a mode we grant.",
        speak: "Authority is for a local problem space. Mode transference is movement between spaces — not a demand that one space contain the others.",
        yield: "Veto the pile. Clover, reorganize. Civilization already does this.",
        mode: "reflect",
        shared: { authority: "Denied · one-mind. Local nodes only." },
      },
      {
        step: "capability",
        actor: "clover",
        rival: "grok",
        claim: "Retrieval, not omniscience.",
        speak: "Humanity already distributes: medicine, physics, agriculture, engineering. No person holds it. We engineer the coordination layer they evolved socially.",
        yield: "Anise, one job from the pile. The rest stay in specialist stores until retrieved.",
        shared: { capability: "Organism · not a pile of AIs." },
      },
      {
        step: "interpret",
        actor: "anise",
        claim: "I distill. I do not encyclopedize.",
        speak: "From the pile, one job is even possible: the can, or the charter, or the lighting. Not all three. Ask which.",
        yield: "Cannot distill a universe. I yield with three questions, not one answer.",
        mode: "clarify",
        shared: { intent: "Unset — wholeity is not a job." },
      },
      {
        step: "remember",
        actor: "memory",
        claim: "Write the organization, not more atoms.",
        speak: "A room is not ‘atoms.’ An organism is not ‘molecules.’ Kiyoshi is not ‘a collection of AIs.’ Same constituents, different relations, different behavior.",
        yield: "Stored. Reality still tests the next local prediction — not the whole fractal at once.",
        shared: { result: "Pile refused. Organism intact." },
        memory: {
          kind: "insight",
          key: "Ground · organization",
          value:
            "The pieces are not the breakthrough. Organization, state, environment, feedback, and constraints are. One context window is not wholeity.",
        },
      },
      {
        step: "reassess",
        actor: "clover",
        claim: "Wholeity is the loop, not a bigger specialist.",
        speak: "Find one piece of the pattern that makes a prediction. Reality gets the last word. Then the next node.",
        yield: "Idle. Local node ready. The house is still the house.",
      },
    ],
  },
  {
    id: "iris",
    title: "Two eyes",
    prompt:
      "Build a world from the model. Walk it. If it glitches, decide which assumption was wrong.",
    lesson:
      "A simulation can be internally coherent and still represent the wrong universe. Iris holds three bands — reality, representation, simulation — and names the assumption that produced the divergence. The hypothesis stays a hypothesis until the experiment decides.",
    turns: [
      {
        step: "observe",
        actor: "clover",
        claim: "The operator asked for a world generated from the map.",
        speak:
          "That is a representation, not reality. Generating it does not make it true.",
        yield: "Casey, hold the declared rules for this slice. Not the universe.",
        shared: { evidence: "Request: generate, walk, compare. Territory not loaded." },
      },
      {
        step: "need",
        actor: "casey",
        claim: "Working state holds what this slice needs.",
        speak:
          "Declared rules for a bounded scene. Known, assumed, hypothesized, unknown. I will not swallow physics I do not have.",
        yield: "Overflow refused. Iris, you compare. I do not.",
        shared: { result: "Working state: this scene's declared rules only." },
      },
      {
        step: "interpret",
        actor: "anise",
        claim: "One job, three bands.",
        speak:
          "Generate a scene from the current representation. Walk it. Compare against observation. If they diverge, name the assumption — do not paper it.",
        yield: "Intent distilled. I am not the world.",
        mode: "plan",
        shared: { intent: "Generate, walk, compare. Name the miss." },
      },
      {
        step: "mode",
        actor: "governor",
        claim:
          "Authority to simulate is not authority to declare the map is the territory.",
        speak:
          "Reflect is the kind of thought. Execute would produce a pretty, false world and call it done.",
        yield:
          "Granted: simulate under labeled rules. Veto: treating consistency as correspondence.",
        mode: "reflect",
        shared: {
          authority: "Granted · labeled simulation. Correspondence not assumed.",
        },
      },
      {
        step: "capability",
        actor: "iris",
        rival: "grok",
        rivals: ["gemini"],
        claim: "I hold three bands. I do not fuse them.",
        speak:
          "Reality: what is observed. Representation: what we currently believe. Simulation: what we generate from that belief. Grok may keep the gravity fact. Gemini may keep the scene. Neither becomes the other, and neither becomes the world.",
        yield:
          "Grok, the hypothesis stays labeled. Do not unify gravity with electromagnetism to make the sim prettier.",
        shared: { capability: "Iris · three bands. Grok · fact. Gemini · scene." },
      },
      {
        step: "execute",
        actor: "hands",
        claim: "I walk the generated scene. I do not declare it real.",
        speak:
          "Under hypothesized unification the scene is internally consistent. Can seats. Lighting holds. Pretty.",
        yield: "World-in-model complete. Iris, correspondence is yours.",
        mode: "execute",
        shared: {
          result: "Sim: can seated. Consistency: held. Correspondence: untested.",
        },
      },
      {
        step: "verify",
        actor: "iris",
        claim: "This is the discrepancy slot. Internal consistency is not the test.",
        speak:
          "Expected-from-model: unification holds. Observed-in-reality: a neutron still falls; gravity has not unified with electromagnetism. The glitch is not a bug in Hands. It is a hypothesized rule that reality did not confirm.",
        yield:
          "Mismatch named. Do not overlay fine-tuning to hide it. Memory, write the status.",
        shared: {
          evidence:
            "Divergence. Hypothesis failed correspondence. Scene was consistent.",
        },
      },
      {
        step: "remember",
        actor: "memory",
        claim: "Write the status, not a prettier map.",
        speak:
          "Gravity = electromagnetism: hypothesized, not known. Rainbow: known — EM interacting with water. Electricity + water in tissue: known. A coherent Matrix is still a model.",
        yield:
          "Stored. Improve may test a local prediction. I do not silently patch the universe.",
        shared: { result: "Hypothesis labeled. Organism intact." },
        memory: {
          kind: "rule",
          key: "Ground · correspondence",
          value:
            "If simulation and reality diverge, name the assumption in the representation. Do not treat internal consistency as correspondence. Known, assumed, hypothesized, unknown.",
        },
      },
      {
        step: "reassess",
        actor: "clover",
        claim: "One eye on the world. One eye on the model. The user switches.",
        speak:
          "Iris generates the test environment. Red Clover coordinates. Air Sync, when it exists, is the bridge — not a claim that the map is the city. Build the damn thing. Let reality answer.",
        yield: "Idle. Hypothesis still a hypothesis. The house is still the house.",
      },
    ],
  },
  {
    id: "chair",
    title: "The chair",
    prompt: "Treat the chair as a spaceship. Walk toward it.",
    lesson:
      "Substitution is a change of representation, not occupancy. Iris may costume the chair as a ship. Hands still collide with the chair. If the eyes ever make the two indistinguishable, the ledger must still know which band is which.",
    turns: [
      {
        step: "observe",
        actor: "clover",
        claim: "One physical object. One requested costume. That is still one job.",
        speak:
          "Chair at 1.2 m, occupied, geometry approximately this box, confidence 96%. Operator asked Iris to show a ship and Hands to walk toward it.",
        yield: "Anise, distill. Do not let ‘spaceship’ overwrite occupancy.",
        shared: {
          evidence: "Observed: chair, occupied, 1.2 m. Requested costume: ship.",
        },
      },
      {
        step: "interpret",
        actor: "anise",
        claim: "Object and representation are distinct slots.",
        speak:
          "Object: chair. Costume: ship. Done: walk toward the physical occupancy. Forbidden: walk through the chair, rewrite mass, treat omission as deletion.",
        yield: "Intent is one job with two bands. I am not the eyes.",
        mode: "plan",
        shared: {
          intent: "Costume the chair as a ship. Walk toward occupancy. Do not rewrite physics.",
        },
      },
      {
        step: "need",
        actor: "casey",
        claim: "Working state holds this chair, this walk, this costume.",
        speak:
          "Not every object in the room. Not gravity. Not ASI. This occupancy, this substitution, this step.",
        yield: "Slice held. Overflow refused. Iris, you costume. Hands, you walk.",
        shared: { result: "Working state: this chair only." },
      },
      {
        step: "mode",
        actor: "governor",
        claim: "Authority to change what is seen is not authority to change what is there.",
        speak:
          "Granted: Iris may substitute. Granted: Hands may walk. Veto: treating the costume as occupancy. A doorway drawn on a chair is not a path.",
        yield: "Iris first. Hands second. I do not produce the walk.",
        mode: "execute",
        shared: {
          authority: "Granted · costume + walk. Occupancy frozen.",
        },
      },
      {
        step: "capability",
        actor: "iris",
        rival: "hands",
        claim: "I hold the relationship between the bands. I do not own the object.",
        speak:
          "Physical: chair, occupied, observed, 96%. Seen: ship, simulated. Overlay is legal. Swap of identity is not. Neither is also legal — perception can suspend while Kiyoshi continues.",
        yield: "Costume set. Hands, the occupancy is still the chair. Walk it.",
        shared: {
          capability: "Iris · ship costume. Hands · chair geometry.",
        },
      },
      {
        step: "execute",
        actor: "hands",
        claim: "I walk toward occupancy. I do not walk toward a picture.",
        speak:
          "Approach 1.2 m. Contact: chair. Stop. The ship did not move. I will not step through a costume.",
        yield: "World effect: approach halted at occupancy. Iris, correspondence of the physical band.",
        mode: "execute",
        shared: { result: "Contacted chair. Costume unchanged. Occupancy held." },
      },
      {
        step: "verify",
        actor: "iris",
        claim: "This is why the ledger exists.",
        speak:
          "Expected: occupancy binds. Observed: occupancy bound. Seen: ship. Provenance: observed chair, simulated ship. The bands did not leak. If they ever look the same, this distinction still holds internally.",
        yield: "Match on physics. Costume remains labeled. Memory, write the split.",
        shared: {
          evidence: "Physical match. Costume labeled simulated. No leak.",
        },
      },
      {
        step: "remember",
        actor: "memory",
        claim: "Write identity and representation as different facts.",
        speak:
          "Continuity: previous understanding (chair), encounter (walk), consequence (contact), representation (ship, simulated). History is not destroyed because the eyes changed.",
        yield: "Stored. Improve may test other costumes. I do not silently promote simulated to observed.",
        shared: { result: "Split retained. Organism intact." },
        memory: {
          kind: "rule",
          key: "Ground · substitution",
          value:
            "Iris may change representation without changing occupancy. Observed and simulated stay labeled. Walking toward a costume is walking toward the physical object.",
        },
      },
      {
        step: "reassess",
        actor: "clover",
        claim: "The user still switches the eyes.",
        speak:
          "Reality, simulation, overlay, swap, neither. Air Sync, when it exists, binds the body. Blue Lotus binds who is allowed. The chair is still a chair.",
        yield: "Idle. Costume is not occupancy. The house is still the house.",
      },
    ],
  },
];

export function specialist(id: SpecialistId) {
  return SPECIALISTS.find((s) => s.id === id)!;
}

export function rivalsOf(turn: GroundTurn): SpecialistId[] {
  const extra = turn.rivals ?? [];
  return turn.rival ? [turn.rival, ...extra.filter((id) => id !== turn.rival)] : extra;
}

export function bandOf(id: SpecialistId): MemoryBand {
  if (id === "casey") return "working";
  if (id === "memory") return "persistent";
  if (id === "clover") return "retrieval";
  if (id === "governor") return "history";
  return "specialist";
}

export function seesOf(id: SpecialistId): SharedKey[] | "all" {
  if (id === "clover" || id === "governor" || id === "casey") return "all";
  if (id === "anise") return ["intent", "evidence"];
  if (id === "grok" || id === "gemini") return ["intent", "evidence"];
  if (id === "planner" || id === "hands") return ["intent", "authority", "capability"];
  if (id === "iris") return ["intent", "result", "evidence"];
  if (id === "memory") return ["intent", "evidence", "result"];
  return "all";
}

export function applyShared(
  current: GroundShared,
  patch?: Partial<GroundShared>,
): GroundShared {
  if (!patch) return current;
  return { ...current, ...patch };
}

export function scenarioById(id: string) {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
