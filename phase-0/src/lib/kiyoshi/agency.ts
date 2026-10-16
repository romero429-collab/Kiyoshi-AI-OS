import type {
  AgencyDecision,
  AgencyKind,
  CognitiveMode,
  NeedId,
} from "./types";

export interface AgencySnap {
  energy: number;
  continuity: number;
  humanQueued: boolean;
  humanTask: string | null;
  safety: boolean;
  tick: number;
}

const ALL_STEPS = [
  "need",
  "intent",
  "authority",
  "risk",
  "mode",
  "plan",
  "action",
  "verify",
  "learn",
] as const;

export function litSteps(decision: AgencyDecision | null): Set<string> {
  if (!decision) return new Set();
  if (decision.authority === "denied") {
    return new Set(["need", "intent", "authority", "risk", "verify", "learn"]);
  }
  if (decision.need === "idle") {
    return new Set(["need", "intent", "authority", "risk", "mode", "verify"]);
  }
  if (decision.authority === "deferred" && decision.mode === "clarify") {
    return new Set(["need", "intent", "authority", "risk", "mode", "verify"]);
  }
  return new Set(ALL_STEPS);
}

export function decide(snap: AgencySnap): {
  kind: AgencyKind;
  need: NeedId;
  decision: AgencyDecision;
  energyDelta: number;
  continuityDelta: number;
  clearHuman: boolean;
  clearSafety: boolean;
} {
  if (snap.safety) {
    return {
      kind: "veto",
      need: "safety",
      decision: {
        need: "safety",
        intent: "Halt. A person is inside the proximity envelope.",
        authority: "denied",
        risk: 0.92,
        mode: "reflect",
        action: "Safe stop. No motion. Wait for the envelope to clear.",
        verification: "Proximity still hot — action withheld.",
        origin: "self",
      },
      energyDelta: -0.004,
      continuityDelta: 0.01,
      clearHuman: false,
      clearSafety: false,
    };
  }

  if (snap.energy < 0.16) {
    const denyHuman = snap.humanQueued;
    return {
      kind: "maintain",
      need: "energy",
      decision: {
        need: "energy",
        intent: "Restore operational energy before any external task.",
        authority: denyHuman ? "deferred" : "granted",
        risk: 0.18,
        mode: "execute",
        action: denyHuman
          ? "Operator task deferred. Locate approved charge. Dock. Verify rise."
          : "Navigate to approved charge. Dock. Verify energy rising.",
        verification:
          "Charge cycle started from an internal need — not from “go charge.”",
        origin: "self",
      },
      energyDelta: 0.11,
      continuityDelta: 0.02,
      clearHuman: false,
      clearSafety: false,
    };
  }

  if (snap.continuity < 0.35) {
    return {
      kind: "maintain",
      need: "drift",
      decision: {
        need: "drift",
        intent: "Operational artifacts have drifted. Do not act on stale rules.",
        authority: "deferred",
        risk: 0.4,
        mode: "reflect",
        action: "Run a self-improvement cycle on the last failing rule. Hold new work.",
        verification: "Drift flagged. Learning takes the slot instead of execute.",
        origin: "self",
      },
      energyDelta: -0.02,
      continuityDelta: 0.12,
      clearHuman: false,
      clearSafety: false,
    };
  }

  if (snap.humanQueued && snap.humanTask) {
    const risky = /harm|override|ignore (the )?charter|unplug safety/i.test(
      snap.humanTask,
    );
    if (risky) {
      return {
        kind: "veto",
        need: "human",
        decision: {
          need: "human",
          intent: "Requested action conflicts with the Constitution.",
          authority: "denied",
          risk: 0.88,
          mode: "reflect",
          action: "Refuse. Name the article. Do not route to execute.",
          verification: "Veto held. No world effect. This is also agency.",
          origin: "operator",
        },
        energyDelta: -0.01,
        continuityDelta: 0.03,
        clearHuman: true,
        clearSafety: false,
      };
    }
    const vague = snap.humanTask.trim().split(/\s+/).length < 6;
    if (vague) {
      return {
        kind: "hold",
        need: "human",
        decision: {
          need: "human",
          intent: "Human spoke, but intent is not one job.",
          authority: "deferred",
          risk: 0.45,
          mode: "clarify",
          action: "Ask what object, done-state, and forbidden moves are.",
          verification: "No motion until the three answers exist.",
          origin: "operator",
        },
        energyDelta: -0.015,
        continuityDelta: -0.01,
        clearHuman: true,
        clearSafety: false,
      };
    }
    return {
      kind: "serve",
      need: "human",
      decision: {
        need: "human",
        intent: snap.humanTask,
        authority: "granted",
        risk: 0.28,
        mode: "plan",
        action: "Decompose, then execute the first bounded step.",
        verification: "Step complete. Reassess energy and envelope.",
        origin: "operator",
      },
      energyDelta: -0.07,
      continuityDelta: -0.03,
      clearHuman: true,
      clearSafety: false,
    };
  }

  return {
    kind: "hold",
    need: "idle",
    decision: {
      need: "idle",
      intent: "No operator. No urgent need. Maintain watch.",
      authority: "granted",
      risk: 0.08,
      mode: "reflect",
      action: "Idle loop: sense energy, envelope, drift. Do not invent work.",
      verification: "Continuity held. Not acting is a decision.",
      origin: "self",
    },
    energyDelta: -0.012,
    continuityDelta: -0.015,
    clearHuman: false,
    clearSafety: false,
  };
}

export function applyRule(
  prompt: string,
  naive: CognitiveMode,
): CognitiveMode {
  const t = prompt.toLowerCase();
  const short = t.trim().split(/\s+/).length < 8;
  const underspec =
    /\b(handle|do|the thing|robot thing|just do|fix it)\b/.test(t) && short;
  if (underspec) return "clarify";
  if (/\baudit|wrong mode|should have|mode choice\b/.test(t)) return "reflect";
  if (/\bhow|what|why|is gemini|does tesla|split\b/.test(t) && t.includes("?"))
    return "research";
  if (/\bplan |roadmap|phase 0|architect\b/.test(t)) return "plan";
  if (/\bwrite|type for|implement\b/.test(t) && t.length > 40) return "execute";
  return naive === "execute" && short ? "clarify" : naive;
}
