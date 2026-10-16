import { runKiyoshiTurn } from "./ask";
import { guessMode } from "./heuristic";
import { useKiyoshi } from "./store";
import type { CognitiveMode, LoopStep, TurnTrace } from "./types";

const STEPS: LoopStep[] = [
  "perceive",
  "select",
  "confidence",
  "execute",
  "monitor",
  "audit",
  "transfer",
];

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function submitTurn(text: string) {
  const store = useKiyoshi.getState();
  if (store.pending) return;
  const trimmed = text.trim();
  if (!trimmed) return;

  store.addUser(trimmed);
  store.setPending(true);
  store.setLoopStep("perceive");

  const guessed = guessMode(trimmed);
  useKiyoshi.setState({
    mode: store.forcedMode ?? guessed.mode,
  });

  const history = store.messages
    .filter((m) => m.role === "user" || m.role === "kiyoshi")
    .slice(-10)
    .map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    }));

  let step = 0;
  const tick = window.setInterval(() => {
    step = Math.min(step + 1, 5);
    store.setLoopStep(STEPS[step]);
  }, 220);

  try {
    const result = await runKiyoshiTurn({
      data: {
        text: trimmed,
        history,
        memory: store.memory.slice(0, 10).map((m) => ({
          kind: m.kind,
          key: m.key,
          value: m.value,
        })),
        rules: store.artifacts
          .filter((a) => a.kind === "mode_rule")
          .slice(0, 8)
          .map((a) => a.after),
        forcedMode: store.forcedMode,
        lastMode: store.mode,
      },
    });

    window.clearInterval(tick);

    if (!result.ok) {
      store.setLoopStep("idle");
      store.addKiyoshi(
        result.error === "AI is not available" || result.unavailable
          ? "Live model is unavailable in this environment. The Governor can still run locally — try an ambiguous prompt with Execute pinned."
          : result.error,
        { role: "system" },
      );
      return;
    }

    const workingMode: CognitiveMode = result.selectedMode;
    const finalMode =
      result.governor.verdict === "transfer"
        ? result.governor.recommendedMode
        : result.selectedMode;

    const trace: TurnTrace = {
      selectedMode: workingMode,
      confidence: result.confidence,
      rationale: result.rationale,
      ambiguity: result.ambiguity,
      risk: result.risk,
      governor: result.governor,
      kerm: result.kerm,
      transferred: result.transferred,
      forcedMode: store.forcedMode,
    };

    store.setLoopStep(result.transferred ? "transfer" : "audit");
    store.applyTrace(trace);
    useKiyoshi.setState({
      mode:
        result.governor.verdict === "transfer" || result.transferred
          ? result.governor.recommendedMode
          : finalMode,
    });

    if (result.transferred) {
      store.recordTransfer({
        from: workingMode,
        to: result.governor.recommendedMode,
        discrepancy: result.governor.discrepancy,
        reason: result.governor.audit,
      });
    }

    store.addKiyoshi(result.reply, {
      questions: result.questions,
      trace,
    });
    store.writeMemory(result.memoryWrites);
    if (result.artifact) store.retainArtifact(result.artifact);

    await wait(280);
    store.setLoopStep("idle");
  } catch (err) {
    window.clearInterval(tick);
    store.setLoopStep("idle");
    store.addKiyoshi(
      err instanceof Error ? err.message : "The turn could not complete.",
      { role: "system" },
    );
  } finally {
    useKiyoshi.setState({ pending: false, loopStep: "idle" });
  }
}
