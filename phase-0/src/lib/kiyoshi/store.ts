import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_ARTIFACTS, SEED_MEMORY, WELCOME } from "./catalog";
import { decide } from "./agency";
import { EMPTY_SHARED, applyShared, scenarioById } from "./ground";
import type {
  AgencyDecision,
  AgencyLog,
  Artifact,
  CognitiveMode,
  GroundShared,
  GroundTurn,
  LoopStep,
  MemoryItem,
  Message,
  RsiPhase,
  RsiTrial,
  TransferEvent,
  TurnTrace,
  ViewId,
} from "./types";

function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

interface KiyoshiState {
  view: ViewId;
  mode: CognitiveMode;
  forcedMode: CognitiveMode | null;
  loopStep: LoopStep;
  pending: boolean;
  messages: Message[];
  memory: MemoryItem[];
  artifacts: Artifact[];
  transfers: TransferEvent[];
  lastTrace: TurnTrace | null;
  energy: number;
  continuity: number;
  agencyRunning: boolean;
  agencyTick: number;
  humanQueued: boolean;
  humanTask: string | null;
  safety: boolean;
  agencyLog: AgencyLog[];
  lastDecision: AgencyDecision | null;
  rsiPhase: RsiPhase;
  rsiTrials: RsiTrial[];
  rsiRetained: boolean;
  groundScenario: string;
  groundIndex: number;
  groundLog: GroundTurn[];
  groundShared: GroundShared;
  setView: (view: ViewId) => void;
  setForcedMode: (mode: CognitiveMode | null) => void;
  setLoopStep: (step: LoopStep) => void;
  setPending: (pending: boolean) => void;
  addUser: (content: string) => string;
  addKiyoshi: (content: string, extra?: Partial<Message>) => void;
  applyTrace: (trace: TurnTrace) => void;
  writeMemory: (items: { kind: MemoryItem["kind"]; key: string; value: string }[]) => void;
  retainArtifact: (artifact: Omit<Artifact, "id" | "at" | "retained">) => void;
  recordTransfer: (event: Omit<TransferEvent, "id" | "at">) => void;
  startAgency: () => void;
  stopAgency: () => void;
  tickAgency: () => void;
  queueHuman: (task: string) => void;
  drainEnergy: () => void;
  toggleSafety: () => void;
  setRsiPhase: (phase: RsiPhase) => void;
  setRsiTrials: (trials: RsiTrial[]) => void;
  markRsiRetained: () => void;
  selectGround: (id: string) => void;
  stepGround: () => void;
  resetGround: () => void;
  resetSession: () => void;
}

const welcome: Message = {
  id: "welcome",
  role: "kiyoshi",
  content: WELCOME,
  at: Date.now(),
};

export const useKiyoshi = create<KiyoshiState>()(
  persist(
    (set, get) => ({
      view: "console",
      mode: "clarify",
      forcedMode: null,
      loopStep: "idle",
      pending: false,
      messages: [welcome],
      memory: SEED_MEMORY,
      artifacts: SEED_ARTIFACTS,
      transfers: [],
      lastTrace: null,
      energy: 0.82,
      continuity: 0.74,
      agencyRunning: false,
      agencyTick: 0,
      humanQueued: false,
      humanTask: null,
      safety: false,
      agencyLog: [],
      lastDecision: null,
      rsiPhase: "idle",
      rsiTrials: [],
      rsiRetained: false,
      groundScenario: "vague",
      groundIndex: 0,
      groundLog: [],
      groundShared: EMPTY_SHARED,
      setView: (view) => set({ view }),
      setForcedMode: (forcedMode) => set({ forcedMode }),
      setLoopStep: (loopStep) => set({ loopStep }),
      setPending: (pending) => set({ pending }),
      addUser: (content) => {
        const id = nid("u");
        set({
          messages: [
            ...get().messages,
            { id, role: "user", content, at: Date.now() },
          ],
        });
        return id;
      },
      addKiyoshi: (content, extra) => {
        set({
          messages: [
            ...get().messages,
            {
              id: nid("k"),
              role: extra?.role ?? "kiyoshi",
              content,
              at: Date.now(),
              questions: extra?.questions,
              trace: extra?.trace,
            },
          ],
        });
      },
      applyTrace: (trace) => {
        const operating =
          trace.governor.verdict === "transfer" || trace.transferred
            ? trace.governor.recommendedMode
            : trace.selectedMode;
        set({
          lastTrace: trace,
          mode: operating,
        });
      },
      writeMemory: (items) => {
        if (!items.length) return;
        const next = items.map((item) => ({
          id: nid("m"),
          kind: item.kind,
          key: item.key,
          value: item.value,
          at: Date.now(),
        }));
        set({ memory: [...next, ...get().memory].slice(0, 80) });
      },
      retainArtifact: (artifact) => {
        set({
          artifacts: [
            {
              ...artifact,
              id: nid("a"),
              at: Date.now(),
              retained: true,
            },
            ...get().artifacts,
          ].slice(0, 40),
        });
      },
      recordTransfer: (event) => {
        set({
          transfers: [
            { ...event, id: nid("t"), at: Date.now() },
            ...get().transfers,
          ].slice(0, 40),
        });
      },
      startAgency: () => set({ agencyRunning: true }),
      stopAgency: () => set({ agencyRunning: false }),
      tickAgency: () => {
        const s = get();
        const result = decide({
          energy: s.energy,
          continuity: s.continuity,
          humanQueued: s.humanQueued,
          humanTask: s.humanTask,
          safety: s.safety,
          tick: s.agencyTick,
        });
        const energy = Math.max(0.04, Math.min(1, s.energy + result.energyDelta));
        const continuity = Math.max(
          0.08,
          Math.min(1, s.continuity + result.continuityDelta),
        );
        const tick = s.agencyTick + 1;
        const log: AgencyLog = {
          id: nid("g"),
          tick,
          kind: result.kind,
          need: result.need,
          text: result.decision.action,
        };
        set({
          energy,
          continuity,
          agencyTick: tick,
          lastDecision: result.decision,
          mode: result.decision.mode,
          humanQueued: result.clearHuman ? false : s.humanQueued,
          humanTask: result.clearHuman ? null : s.humanTask,
          safety: result.clearSafety ? false : s.safety,
          agencyLog: [log, ...s.agencyLog].slice(0, 24),
        });
      },
      queueHuman: (task) => set({ humanQueued: true, humanTask: task }),
      drainEnergy: () =>
        set({ energy: Math.max(0.08, get().energy - 0.28) }),
      toggleSafety: () => set({ safety: !get().safety }),
      setRsiPhase: (rsiPhase) => set({ rsiPhase }),
      setRsiTrials: (rsiTrials) => set({ rsiTrials, rsiRetained: false }),
      markRsiRetained: () => set({ rsiRetained: true }),
      selectGround: (id) =>
        set({
          groundScenario: id,
          groundIndex: 0,
          groundLog: [],
          groundShared: EMPTY_SHARED,
        }),
      resetGround: () =>
        set({
          groundIndex: 0,
          groundLog: [],
          groundShared: EMPTY_SHARED,
        }),
      stepGround: () => {
        const s = get();
        const scenario = scenarioById(s.groundScenario);
        if (s.groundIndex >= scenario.turns.length) return;
        const turn = scenario.turns[s.groundIndex];
        if (!turn) return;
        if (turn.memory) {
          get().writeMemory([turn.memory]);
        }
        if (turn.mode) {
          set({ mode: turn.mode });
        }
        set({
          groundIndex: s.groundIndex + 1,
          groundLog: [turn, ...s.groundLog].slice(0, 24),
          groundShared: applyShared(s.groundShared, turn.shared),
        });
      },
      resetSession: () =>
        set({
          messages: [{ ...welcome, at: Date.now() }],
          memory: SEED_MEMORY,
          artifacts: SEED_ARTIFACTS,
          transfers: [],
          lastTrace: null,
          mode: "clarify",
          forcedMode: null,
          loopStep: "idle",
          pending: false,
          energy: 0.82,
          continuity: 0.74,
          agencyRunning: false,
          agencyTick: 0,
          humanQueued: false,
          humanTask: null,
          safety: false,
          agencyLog: [],
          lastDecision: null,
          rsiPhase: "idle",
          rsiTrials: [],
          rsiRetained: false,
          groundScenario: "vague",
          groundIndex: 0,
          groundLog: [],
          groundShared: EMPTY_SHARED,
        }),
    }),
    {
      name: "kiyoshi-os-v1",
      skipHydration: true,
      partialize: (s) => ({
        messages: s.messages.slice(-40),
        memory: s.memory,
        artifacts: s.artifacts,
        transfers: s.transfers.slice(0, 40),
        mode: s.mode,
        lastTrace: s.lastTrace,
      }),
    },
  ),
);
