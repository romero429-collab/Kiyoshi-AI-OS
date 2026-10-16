export const MODES = [
  "clarify",
  "research",
  "plan",
  "execute",
  "reflect",
] as const;

export type CognitiveMode = (typeof MODES)[number];

export type GovernorVerdict = "hold" | "transfer" | "veto";

export type Discrepancy =
  | "none"
  | "wrong_mode"
  | "low_confidence"
  | "constitutional_conflict"
  | "user_correction"
  | "forced_mode_mismatch";

export type LoopStep =
  | "perceive"
  | "select"
  | "confidence"
  | "execute"
  | "monitor"
  | "audit"
  | "transfer"
  | "idle";

export type ViewId =
  | "console"
  | "governor"
  | "agency"
  | "improve"
  | "field"
  | "ground"
  | "constitution"
  | "layers"
  | "memory";

export type NeedId = "energy" | "human" | "drift" | "safety" | "idle";

export type AgencyKind = "maintain" | "serve" | "hold" | "veto";

export type AgencyOrigin = "self" | "operator";

export interface AgencyLog {
  id: string;
  tick: number;
  kind: AgencyKind;
  need: NeedId;
  text: string;
}

export interface AgencyDecision {
  need: NeedId;
  intent: string;
  authority: "granted" | "denied" | "deferred";
  risk: number;
  mode: CognitiveMode;
  action: string;
  verification: string;
  origin: AgencyOrigin;
}

export type RsiPhase =
  | "idle"
  | "observe"
  | "identify"
  | "modify"
  | "test"
  | "evaluate"
  | "retain";

export interface RsiTrial {
  id: string;
  prompt: string;
  expected: CognitiveMode;
  before: CognitiveMode;
  after: CognitiveMode;
  improved: boolean;
}

export type SpecialistId =
  | "anise"
  | "casey"
  | "grok"
  | "gemini"
  | "planner"
  | "hands"
  | "iris"
  | "governor"
  | "clover"
  | "memory";

export type MemoryBand =
  | "working"
  | "persistent"
  | "specialist"
  | "retrieval"
  | "history";

export type GroundStepId =
  | "observe"
  | "interpret"
  | "need"
  | "mode"
  | "capability"
  | "execute"
  | "verify"
  | "remember"
  | "adapt"
  | "reassess";

export type GroundShared = {
  intent: string;
  authority: string;
  capability: string;
  evidence: string;
  result: string;
};

export type SharedKey = keyof GroundShared;

export interface GroundTurn {
  step: GroundStepId;
  actor: SpecialistId;
  rival?: SpecialistId;
  rivals?: SpecialistId[];
  claim: string;
  speak: string;
  yield: string;
  mode?: CognitiveMode;
  shared?: Partial<GroundShared>;
  memory?: { kind: MemoryKind; key: string; value: string };
}

export type Role = "user" | "kiyoshi" | "governor" | "system";

export type MemoryKind = "fact" | "preference" | "task" | "rule" | "insight";

export type ArtifactKind = "mode_rule" | "procedure" | "routing" | "memory";

export interface Kerm {
  attention: number;
  compute: number;
  risk: number;
}

export interface GovernorAudit {
  verdict: GovernorVerdict;
  discrepancy: Discrepancy;
  recommendedMode: CognitiveMode;
  audit: string;
}

export interface MemoryItem {
  id: string;
  kind: MemoryKind;
  key: string;
  value: string;
  at: number;
}

export interface Artifact {
  id: string;
  kind: ArtifactKind;
  title: string;
  before: string;
  after: string;
  reason: string;
  retained: boolean;
  at: number;
}

export interface TransferEvent {
  id: string;
  from: CognitiveMode;
  to: CognitiveMode;
  discrepancy: Discrepancy;
  reason: string;
  at: number;
}

export interface TurnTrace {
  selectedMode: CognitiveMode;
  confidence: number;
  rationale: string;
  ambiguity: number;
  risk: number;
  governor: GovernorAudit;
  kerm: Kerm;
  transferred: boolean;
  forcedMode: CognitiveMode | null;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  at: number;
  questions?: string[];
  trace?: TurnTrace;
}

export interface TurnInput {
  text: string;
  history: { role: "user" | "assistant"; content: string }[];
  memory: { kind: MemoryKind; key: string; value: string }[];
  rules: string[];
  forcedMode: CognitiveMode | null;
  lastMode: CognitiveMode;
}

export interface TurnResult {
  ok: true;
  selectedMode: CognitiveMode;
  confidence: number;
  rationale: string;
  ambiguity: number;
  risk: number;
  governor: GovernorAudit;
  kerm: Kerm;
  questions: string[];
  reply: string;
  memoryWrites: { kind: MemoryKind; key: string; value: string }[];
  artifact: Omit<Artifact, "id" | "at" | "retained"> | null;
  transferred: boolean;
  source: "grok" | "fallback";
}

export interface TurnError {
  ok: false;
  error: string;
  unavailable?: boolean;
}

export type TurnResponse = TurnResult | TurnError;
