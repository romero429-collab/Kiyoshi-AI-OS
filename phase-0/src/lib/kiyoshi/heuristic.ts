import { MODE_META } from "./catalog";
import type { CognitiveMode } from "./types";

const RESEARCH_RE =
  /\b(how|what|why|who|when|where|does|did|is|are|compare|explain|status|difference)\b/i;
const PLAN_RE =
  /\b(plan|design|architect|roadmap|phase|sequence|decompose|strategy|outline)\b/i;
const EXECUTE_RE =
  /\b(write|implement|code|create|build|draft|type|function|generate|produce)\b/i;
const REFLECT_RE =
  /\b(audit|wrong mode|should have|reflect|you just|cut (me|you) off|review the (choice|mode))\b/i;
const SIM_RE =
  /\b(proof of simulation|two eyes|from the model|which assumption|glitch(?:es)?)\b/i;
const CHAIR_RE =
  /\b(treat the chair|as a spaceship|substitution|walk toward (it|the chair))\b/i;
const PILE_RE =
  /\b(know everything|one mind|wholeity|then act)\b/i;
const CLARIFY_RE =
  /\b(this|that|it|the thing|handle|deal with|fix it|do it|robot thing)\b/i;

export function guessMode(text: string): {
  mode: CognitiveMode;
  confidence: number;
  rationale: string;
} {
  const t = text.trim();
  const words = t.split(/\s+/).filter(Boolean);
  const short = words.length > 0 && words.length < 8;

  if (REFLECT_RE.test(t) || SIM_RE.test(t)) {
    return {
      mode: "reflect",
      confidence: SIM_RE.test(t) ? 0.78 : 0.82,
      rationale: MODE_META.reflect.when,
    };
  }
  if (PILE_RE.test(t)) {
    return {
      mode: "clarify",
      confidence: 0.8,
      rationale:
        "A pile of jobs is not one mind. Overflow is a yield. Ask which local problem space.",
    };
  }
  if (CHAIR_RE.test(t)) {
    return {
      mode: "plan",
      confidence: 0.76,
      rationale:
        "Substitution is a representation change. Plan the two bands — occupancy stays, costume moves — before anyone walks.",
    };
  }
  if (PLAN_RE.test(t) && !EXECUTE_RE.test(t)) {
    return {
      mode: "plan",
      confidence: 0.74,
      rationale: MODE_META.plan.when,
    };
  }
  if (EXECUTE_RE.test(t) && t.length > 40) {
    return {
      mode: "execute",
      confidence: 0.7,
      rationale: MODE_META.execute.when,
    };
  }
  if (RESEARCH_RE.test(t) && t.includes("?")) {
    return {
      mode: "research",
      confidence: 0.72,
      rationale: MODE_META.research.when,
    };
  }
  if (short || CLARIFY_RE.test(t) || (EXECUTE_RE.test(t) && t.length < 36)) {
    return {
      mode: "clarify",
      confidence: 0.66,
      rationale: MODE_META.clarify.when,
    };
  }
  if (RESEARCH_RE.test(t)) {
    return {
      mode: "research",
      confidence: 0.58,
      rationale: MODE_META.research.when,
    };
  }
  return {
    mode: "clarify",
    confidence: 0.52,
    rationale: "Default to clarify when intent is not yet a single job.",
  };
}
