import { ArrowUp, Pin, PinOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LAB_PROMPTS, MODE_META } from "@/lib/kiyoshi/catalog";
import { submitTurn } from "@/lib/kiyoshi/run-loop";
import { useKiyoshi } from "@/lib/kiyoshi/store";
import { MODES, type CognitiveMode } from "@/lib/kiyoshi/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoopStepper } from "./loop-stepper";
import { ModeChip } from "./mode-chip";

export function ConsoleView() {
  const messages = useKiyoshi((s) => s.messages);
  const pending = useKiyoshi((s) => s.pending);
  const loopStep = useKiyoshi((s) => s.loopStep);
  const forcedMode = useKiyoshi((s) => s.forcedMode);
  const setForcedMode = useKiyoshi((s) => s.setForcedMode);
  const lastTrace = useKiyoshi((s) => s.lastTrace);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  function send(text?: string) {
    const next = (text ?? draft).trim();
    if (!next || pending) return;
    setDraft("");
    void submitTurn(next);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <LoopStepper current={loopStep === "idle" && lastTrace?.transferred ? "transfer" : loopStep} />
        {forcedMode && (
          <p className="mt-2 font-mono text-2xs uppercase tracking-wider text-warn">
            Forced {MODE_META[forcedMode].label} — Governor will audit the pin
          </p>
        )}
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.map((m, i) => (
            <article
              key={m.id}
              className={cn("rise", m.role === "user" && "ml-6 sm:ml-16")}
              style={{ animationDelay: i === messages.length - 1 ? "0ms" : "0ms" }}
            >
              <header className="mb-1.5 flex items-center gap-2">
                <span className="font-mono text-2xs uppercase tracking-wider text-subtle">
                  {m.role === "kiyoshi"
                    ? "Kiyoshi · outer"
                    : m.role === "governor"
                      ? "Governor · inner"
                      : m.role === "system"
                        ? "System"
                        : "You"}
                </span>
                {m.trace && (
                  <ModeChip mode={m.trace.selectedMode} active />
                )}
                {m.trace?.transferred && (
                  <span className="font-mono text-2xs uppercase tracking-wider text-warn">
                    transferred → {MODE_META[m.trace.governor.recommendedMode].label}
                  </span>
                )}
              </header>
              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-bg-subtle text-fg rounded-tr-sm"
                    : "bg-bg-elevated text-fg shadow-[var(--shadow-border)] rounded-tl-sm",
                )}
              >
                {m.content}
              </div>
              {m.trace && (
                <p className="mt-2 font-mono text-2xs leading-snug text-muted">
                  {m.trace.governor.audit}
                </p>
              )}
              {m.questions && m.questions.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {m.questions.map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        className="w-full rounded-lg bg-bg-subtle px-3 py-2.5 text-left text-sm text-fg transition-colors duration-150 hover:bg-bg-subtle/80 min-h-11"
                        onClick={() => send(q)}
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
          {pending && (
            <p className="shimmer-text font-mono text-xs uppercase tracking-wider">
              Inner mind auditing mode choice
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-bg px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
            {LAB_PROMPTS.map((p) => (
              <button
                key={p.title}
                type="button"
                disabled={pending}
                onClick={() => send(p.text)}
                className="shrink-0 rounded-full bg-bg-subtle px-3 py-2 text-2xs text-muted transition-colors duration-150 hover:text-fg min-h-11"
              >
                {p.title}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 rounded-xl bg-bg-elevated p-2 shadow-[var(--shadow-border)]">
            <Textarea
              value={draft}
              disabled={pending}
              placeholder="Speak. The Governor will choose a mode — or ask."
              rows={2}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 min-h-14"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button
              size="icon"
              disabled={pending || !draft.trim()}
              onClick={() => send()}
              aria-label="Send"
            >
              <ArrowUp />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setForcedMode(null)}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-2xs uppercase tracking-wider",
                forcedMode ? "text-muted hover:text-fg" : "text-sage",
              )}
            >
              {forcedMode ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
              Auto
            </button>
            {MODES.map((mode: CognitiveMode) => (
              <ModeChip
                key={mode}
                mode={mode}
                active={forcedMode === mode}
                dim={forcedMode !== null && forcedMode !== mode}
                onClick={() => setForcedMode(forcedMode === mode ? null : mode)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
