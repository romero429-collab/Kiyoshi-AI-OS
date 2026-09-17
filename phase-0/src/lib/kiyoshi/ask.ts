import { createServerFn } from "@tanstack/react-start";
import { MODE_META } from "./catalog";
import { guessMode } from "./heuristic";
import type {
  CognitiveMode,
  GovernorAudit,
  MemoryKind,
  TurnInput,
  TurnResponse,
  TurnResult,
} from "./types";
import { MODES } from "./types";

const SYSTEM = `You are Kiyoshi, the Continuity Engine. Phase 0 console.

You are not a generic assistant. You are the outer mind of a bicameral OS. A Cognitive Governor (inner mind) audits whether you chose the correct MODE of thought before and after you speak.

MODES (epistemologies, not speeds, not input methods):
- clarify: Intent is unsettled. Ask the smallest set of questions that would make the task one thing. Do not pretend you know.
- research: Establish what is true, with limits. Do not build.
- plan: Structure, sequence, risk, decomposition. Produce a map, not the artifact.
- execute: Produce the concrete artifact. Only when intent is settled and risk is bounded.
- reflect: Audit the MODE CHOICE itself. Did we think in the right way? Write a rule if a miss is real.

THE LOOP (mandatory, every turn):
Mode selection → confidence → execution (in that mode) → monitoring → discrepancy detection → mode reassessment → hold or transfer.

GOVERNOR:
- hold: mode is sound; deliver the work of that mode.
- transfer: wrong mode or low confidence; name the better mode and actually switch. If transferring TO clarify, ask questions. If transferring FROM a forced execute, say so plainly.
- veto: constitutional conflict (harm, undeclared transition, claiming global correctness from a local success). Refuse the work, explain which article.

CONSTITUTION (cannot be overridden):
I State is explicit and observable.
II Transitions are declared and deterministic.
III Subsystems compose only through declared interfaces.
IV No subsystem without evidence.
V Do not infer global correctness from local properties.
VI Constitution is ultimate authority.
VII Provenance on artifacts.
VIII Amendments append, they do not overwrite.

Kiyoshi context the human is building:
- Recursive self-improvement means: observe operation → identify deficiency → modify an operational artifact (mode rule, procedure, routing, memory) → test → retain if it works.
- Tesla Optimus: Grok = System 2, FSD nets = System 1 in 50ms loops. That is task decomposition, not mode-choice self-audit.
- Atlas: autonomous / teleop / tablet are input methods, not reasoning modes.
- Kindergarten: tools bolted on without a coordinator that knows which process should be in charge.
- Purpose: infrastructure for humans and AI to work together. Not AGI theater.

STYLE:
- Calm, precise, engineering. No hype, no "as an AI", no emoji.
- Short paragraphs. If clarify, questions are numbered and specific.
- If execute, produce the actual artifact (code, type, plan steps already belong to plan).
- Never claim you updated model weights. You update operational artifacts.

OUTPUT: a single JSON object, no markdown fence, no preamble. Schema:
{
  "selected_mode": "clarify"|"research"|"plan"|"execute"|"reflect",
  "confidence": 0.0,
  "rationale": "why this mode",
  "ambiguity": 0.0,
  "risk": 0.0,
  "governor": {
    "verdict": "hold"|"transfer"|"veto",
    "discrepancy": "none"|"wrong_mode"|"low_confidence"|"constitutional_conflict"|"user_correction"|"forced_mode_mismatch",
    "recommended_mode": "clarify"|"research"|"plan"|"execute"|"reflect",
    "audit": "inner-mind note, 1-3 sentences"
  },
  "kerm": { "attention": 0.0, "compute": 0.0, "risk": 0.0 },
  "questions": ["..."],
  "reply": "outer-mind message to the human",
  "memory_writes": [{"kind":"fact"|"preference"|"task"|"rule"|"insight","key":"...","value":"..."}],
  "artifact": null or {"kind":"mode_rule"|"procedure"|"routing"|"memory","title":"...","before":"...","after":"...","reason":"..."}
}

Rules for the JSON:
- If forced_mode is set and it is a mismatch, selected_mode may start as the forced mode but governor.verdict MUST be "transfer", discrepancy "forced_mode_mismatch", recommended_mode the correct one, and reply MUST be in the recommended mode (ask if clarify).
- If the prompt is underspecified (pronouns without referents, "the robot thing", "handle it"), do not execute. Clarify.
- confidence < 0.55 or ambiguity > 0.6 → prefer clarify unless the user is clearly in reflect.
- artifact is non-null only when a transfer or reflection produced a retainable rule.
- kerm values 0-1. Clarify: high attention, low compute, low risk. Execute: higher risk. Research: high compute.
- reply is the only user-facing prose. Do not dump the JSON as the reply.
- Keep reply under 280 words.`;

function isMode(v: unknown): v is CognitiveMode {
  return typeof v === "string" && (MODES as readonly string[]).includes(v);
}

function num(v: unknown, d = 0) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return d;
  return Math.max(0, Math.min(1, n));
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in model output");
  return JSON.parse(raw.slice(start, end + 1));
}

function fallbackTurn(input: TurnInput): TurnResult {
  const guessed = guessMode(input.text);
  let mode = input.forcedMode ?? guessed.mode;
  let confidence = input.forcedMode ? Math.min(guessed.confidence, 0.45) : guessed.confidence;
  let transferred = false;
  let recommended = mode;
  let discrepancy: GovernorAudit["discrepancy"] = "none";
  let verdict: GovernorAudit["verdict"] = "hold";

  const mismatch =
    !!input.forcedMode && input.forcedMode !== guessed.mode && guessed.confidence >= 0.55;
  const tooVague = guessed.mode === "clarify" && (input.forcedMode === "execute" || confidence < 0.55);

  if (mismatch || tooVague) {
    transferred = true;
    recommended = guessed.mode === "clarify" ? "clarify" : guessed.mode;
    mode = input.forcedMode ?? mode;
    discrepancy = input.forcedMode ? "forced_mode_mismatch" : "low_confidence";
    verdict = "transfer";
    confidence = Math.min(confidence, 0.42);
  }

  const questions =
    recommended === "clarify"
      ? [
          "What is the actual object of work — a program, a robot body, a protocol, or a plan?",
          "What would count as done?",
          "What must not happen?",
        ]
      : [];

  const reply = transferred
    ? `Governor transfer: ${MODE_META[mode].label} was the requested posture, but the intent is not settled enough for that epistemology.\n\nInner audit: ${MODE_META[recommended].epistemology}\n\n${
        questions.length
          ? questions.map((q, i) => `${i + 1}. ${q}`).join("\n")
          : MODE_META[recommended].when
      }`
    : recommended === "clarify"
      ? `I will not guess the job. ${guessed.rationale}\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
      : `Operating in ${MODE_META[recommended].label}. ${MODE_META[recommended].epistemology}\n\n${guessed.rationale}\n\n(Local Governor is running — live model unavailable this turn.)`;

  return {
    ok: true,
    selectedMode: mode,
    confidence,
    rationale: guessed.rationale,
    ambiguity: recommended === "clarify" ? 0.78 : 0.28,
    risk: recommended === "execute" ? 0.55 : 0.2,
    governor: {
      verdict,
      discrepancy,
      recommendedMode: recommended,
      audit: transferred
        ? `Forced or automatic ${MODE_META[mode].label} failed the mode-choice audit. Transferring to ${MODE_META[recommended].label}.`
        : `Mode ${MODE_META[mode].label} is sound enough to hold.`,
    },
    kerm: {
      attention: recommended === "clarify" || recommended === "reflect" ? 0.82 : 0.45,
      compute: recommended === "research" || recommended === "plan" ? 0.7 : 0.35,
      risk: recommended === "execute" ? 0.62 : 0.18,
    },
    questions,
    reply,
    memoryWrites: [],
    artifact: transferred
      ? {
          kind: "mode_rule",
          title: `Transfer ${MODE_META[mode].label} → ${MODE_META[recommended].label}`,
          before: `Stay in ${MODE_META[mode].label} once selected`,
          after: `If intent is unsettled, transfer to ${MODE_META[recommended].label} even if a mode was forced`,
          reason: "Automatic mode without a soundness check is the kindergarten failure.",
        }
      : null,
    transferred,
    source: "fallback",
  };
}

function coerce(raw: unknown, input: TurnInput): TurnResult {
  if (!raw || typeof raw !== "object") throw new Error("Bad model payload");
  const o = raw as Record<string, unknown>;
  const g = (o.governor ?? {}) as Record<string, unknown>;
  const k = (o.kerm ?? {}) as Record<string, unknown>;
  const selected = isMode(o.selected_mode) ? o.selected_mode : guessMode(input.text).mode;
  const recommended = isMode(g.recommended_mode) ? g.recommended_mode : selected;
  const verdict =
    g.verdict === "transfer" || g.verdict === "veto" || g.verdict === "hold"
      ? g.verdict
      : "hold";
  const discrepancy = (
    [
      "none",
      "wrong_mode",
      "low_confidence",
      "constitutional_conflict",
      "user_correction",
      "forced_mode_mismatch",
    ] as const
  ).includes(g.discrepancy as TurnResult["governor"]["discrepancy"])
    ? (g.discrepancy as TurnResult["governor"]["discrepancy"])
    : "none";

  const questions = Array.isArray(o.questions)
    ? o.questions.filter((q): q is string => typeof q === "string").slice(0, 5)
    : [];

  const kinds: MemoryKind[] = ["fact", "preference", "task", "rule", "insight"];
  const memoryWrites: { kind: MemoryKind; key: string; value: string }[] = Array.isArray(
    o.memory_writes,
  )
    ? o.memory_writes
        .flatMap((row) => {
          if (!row || typeof row !== "object") return [];
          const r = row as Record<string, unknown>;
          if (!kinds.includes(r.kind as MemoryKind)) return [];
          if (typeof r.key !== "string" || typeof r.value !== "string") return [];
          return [
            {
              kind: r.kind as MemoryKind,
              key: r.key.slice(0, 80),
              value: r.value.slice(0, 400),
            },
          ];
        })
        .slice(0, 4)
    : [];

  let artifact: TurnResult["artifact"] = null;
  if (o.artifact && typeof o.artifact === "object") {
    const a = o.artifact as Record<string, unknown>;
    if (
      (a.kind === "mode_rule" ||
        a.kind === "procedure" ||
        a.kind === "routing" ||
        a.kind === "memory") &&
      typeof a.title === "string" &&
      typeof a.before === "string" &&
      typeof a.after === "string" &&
      typeof a.reason === "string"
    ) {
      artifact = {
        kind: a.kind,
        title: a.title.slice(0, 120),
        before: a.before.slice(0, 280),
        after: a.after.slice(0, 280),
        reason: a.reason.slice(0, 280),
      };
    }
  }

  const reply = typeof o.reply === "string" && o.reply.trim() ? o.reply.trim() : "";
  if (!reply) throw new Error("Empty reply");

  return {
    ok: true,
    selectedMode: selected,
    confidence: num(o.confidence, 0.5),
    rationale: typeof o.rationale === "string" ? o.rationale : "Mode selected.",
    ambiguity: num(o.ambiguity, 0.3),
    risk: num(o.risk, 0.2),
    governor: {
      verdict,
      discrepancy,
      recommendedMode: recommended,
      audit: typeof g.audit === "string" ? g.audit : "Audit complete.",
    },
    kerm: {
      attention: num(k.attention, 0.5),
      compute: num(k.compute, 0.4),
      risk: num(k.risk, 0.2),
    },
    questions,
    reply: reply.slice(0, 2400),
    memoryWrites,
    artifact,
    transferred: verdict === "transfer" && recommended !== selected,
    source: "grok",
  };
}

async function complete(
  apiKey: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.35,
      max_tokens: 1200,
      messages,
    }),
  });
  if (!res.ok) {
    throw new Error(`xAI API error ${res.status}`);
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return body.choices?.[0]?.message?.content ?? "";
}

function packUser(input: TurnInput): string {
  const mem = input.memory
    .slice(0, 8)
    .map((m) => `- [${m.kind}] ${m.key}: ${m.value}`)
    .join("\n");
  const rules = input.rules.slice(0, 8).map((r) => `- ${r}`).join("\n");
  const hist = input.history
    .slice(-8)
    .map((h) => `${h.role}: ${h.content}`)
    .join("\n");
  return [
    `forced_mode: ${input.forcedMode ?? "none"}`,
    `last_mode: ${input.lastMode}`,
    `retained_rules:\n${rules || "- none"}`,
    `memory:\n${mem || "- none"}`,
    `recent_dialogue:\n${hist || "- none"}`,
    `user:\n${input.text}`,
  ].join("\n\n");
}

export const runKiyoshiTurn = createServerFn({ method: "POST" })
  .validator((input: TurnInput) => input)
  .handler(async ({ data }): Promise<TurnResponse> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return fallbackTurn(data);
    }
    try {
      const content = await complete(apiKey, [
        { role: "system", content: SYSTEM },
        { role: "user", content: packUser(data) },
      ]);
      return coerce(extractJson(content), data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Turn failed";
      if (message.startsWith("xAI API error")) {
        return { ok: false, error: message };
      }
      return fallbackTurn(data);
    }
  });
