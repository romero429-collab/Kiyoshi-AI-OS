import { useMemo, useState } from "react";
import {
  AXIS_LABELS,
  AXES,
  BRIDGE,
  CONTINUITY,
  DOMAINS,
  ENVELOPES,
  EPISTEMIC,
  GEMINI,
  GITHUB_NOTES,
  INFRASTRUCTURE,
  PRESETS,
  PRIMITIVES,
  REALITY,
  RIGOR,
  SCALE_GENESIS,
  SPECTRA,
  TRIAD,
  readConfiguration,
  type AxisId,
  type AxisLevel,
  type AxisLevels,
} from "@/lib/kiyoshi/field-data";
import { SCALE, SCALE_NOTES } from "@/lib/kiyoshi/ground";
import { LAYERS } from "@/lib/kiyoshi/catalog";
import { useKiyoshi } from "@/lib/kiyoshi/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IrisStage } from "./iris-stage";

const KIYOSHI = PRESETS.find((p) => p.id === "kiyoshi")!.levels;

const SPECTRA_TONE: Record<(typeof SPECTRA)[number]["status"], "live" | "warn" | "quiet" | "danger"> = {
  known: "live",
  hypothesized: "warn",
  metaphor: "quiet",
  false: "danger",
};

function sameLevels(a: AxisLevels, b: AxisLevels) {
  return AXES.every((axis) => a[axis.id] === b[axis.id]);
}

export function FieldView() {
  const setView = useKiyoshi((s) => s.setView);
  const selectGround = useKiyoshi((s) => s.selectGround);
  const [levels, setLevels] = useState<AxisLevels>(KIYOSHI);
  const [scale, setScale] = useState<(typeof SCALE)[number]>("Room");
  const [genesis, setGenesis] = useState<(typeof SCALE_GENESIS)[number]["id"]>("environment");
  const [claimId, setClaimId] = useState("gravity");
  const [triad, setTriad] = useState<(typeof TRIAD)[number]["id"]>("representation");
  const [domainId, setDomainId] = useState<(typeof DOMAINS)[number]["id"]>("simulation");
  const [primitiveId, setPrimitiveId] = useState<(typeof PRIMITIVES)[number]["id"]>(
    "representation",
  );
  const [envelopeId, setEnvelopeId] = useState<(typeof ENVELOPES)[number]["id"]>("reality");
  const [contId, setContId] = useState<(typeof CONTINUITY)[number]["id"]>("encounter");
  const [rigorId, setRigorId] = useState("keep-iris");
  const reading = useMemo(() => readConfiguration(levels), [levels]);
  const activePreset = PRESETS.find((p) => sameLevels(p.levels, levels));
  const claim = SPECTRA.find((s) => s.id === claimId) ?? SPECTRA[3];
  const genesisNote = SCALE_GENESIS.find((g) => g.id === genesis)!;
  const triadNote = TRIAD.find((t) => t.id === triad)!;
  const domain = DOMAINS.find((d) => d.id === domainId)!;
  const primitive = PRIMITIVES.find((p) => p.id === primitiveId)!;
  const envelope = ENVELOPES.find((e) => e.id === envelopeId)!;
  const cont = CONTINUITY.find((c) => c.id === contId)!;
  const rigor = RIGOR.find((r) => r.id === rigorId) ?? RIGOR[1];

  function setAxis(id: AxisId, level: AxisLevel) {
    setLevels((prev) => ({ ...prev, [id]: level }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <header className="rise mb-6">
        <p className="font-mono text-2xs uppercase tracking-wider text-muted">
          Continuity engine · Phase 0
        </p>
        <h2 className="mt-1 text-2xl text-fg">Field</h2>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Kiyoshi does not assume that its representation of reality is reality. It maintains
          the relationship between observation, representation, simulation, and action. First
          objective is not AGI. It is a substrate-independent interoperability system.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => setView("ground")}
          >
            Open the ground loop
          </Button>
          <Button
            variant="ghost"
            className="min-h-11"
            onClick={() => {
              selectGround("chair");
              setView("ground");
            }}
          >
            Play the chair
          </Button>
        </div>
      </header>

      <IrisStage
        onPlay={() => {
          selectGround("chair");
          setView("ground");
        }}
      />

      <section className="mb-8">
        <h3 className="text-lg text-fg">Seven domains</h3>
        <p className="mt-1 text-sm text-muted">
          Kiyoshi OS is the interoperability layer across these. Intelligence runs inside.
          It is not the product.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DOMAINS.map((item) => (
            <Button
              key={item.id}
              variant={domainId === item.id ? "primary" : "secondary"}
              className="min-h-11"
              onClick={() => setDomainId(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-2xs uppercase tracking-wider text-sage">{domain.who}</p>
          <p className="mt-2 text-sm text-fg">{domain.line}</p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Five primitives</h3>
        <p className="mt-1 text-sm text-muted">
          Everything else — agents, maps, games, robots, BCIs — is an application of these.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRIMITIVES.map((item) => (
            <Button
              key={item.id}
              variant={primitiveId === item.id ? "primary" : "secondary"}
              className="min-h-11"
              onClick={() => setPrimitiveId(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-sm text-fg">{primitive.line}</p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Constraint envelopes</h3>
        <p className="mt-1 text-sm text-muted">
          Not one universal Kiyoshi. Core, then substrate, then capability, then governance,
          then the user’s configuration, then the present environment.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ENVELOPES.map((item) => (
            <Button
              key={item.id}
              variant={envelopeId === item.id ? "primary" : "secondary"}
              className="min-h-11"
              onClick={() => setEnvelopeId(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-sm text-fg">{envelope.line}</p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Continuity</h3>
        <p className="mt-1 text-sm text-muted">
          Reality → Kiyoshi → Iris → Kiyoshi → Reality. The simulation is a laboratory, not a
          replacement. Memory is continuity of state and experience — not a chat log.
        </p>
        <ol className="mt-3 flex flex-wrap gap-1">
          {CONTINUITY.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "min-h-11 rounded-full px-3 font-mono text-2xs uppercase tracking-wider",
                  contId === item.id ? "bg-sage/20 text-sage" : "bg-bg-subtle text-muted",
                )}
                onClick={() => setContId(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-fg">{cont.line}</p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Keep / hold</h3>
        <p className="mt-1 text-sm text-muted">
          Strong engineering, kept. Speculative physics, held as labeled hypothesis — never
          as foundation.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {RIGOR.map((item) => (
            <Button
              key={item.id}
              variant={rigorId === item.id ? "primary" : "secondary"}
              className="min-h-11"
              onClick={() => setRigorId(item.id)}
            >
              {item.chip}
            </Button>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <Badge tone={rigor.side === "keep" ? "live" : "warn"}>
            {rigor.side === "keep" ? "Keep" : "Hold as hypothesis"}
          </Badge>
          <h4 className="mt-2 text-base text-fg">{rigor.title}</h4>
          <p className="mt-2 text-sm text-muted">{rigor.body}</p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Compose an agent</h3>
        <p className="mt-1 text-sm text-muted">
          Same mind, different doors. ASI-looking rank is often access and authority, not a
          new species.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant={activePreset?.id === preset.id ? "primary" : "secondary"}
              onClick={() => setLevels(preset.levels)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {AXES.map((axis) => (
            <li
              key={axis.id}
              className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-fg">{axis.name}</p>
                <span className="font-mono text-2xs uppercase tracking-wider text-subtle">
                  {AXIS_LABELS[levels[axis.id]]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{axis.meaning}</p>
              <div className="mt-3 grid grid-cols-3 gap-1">
                {AXIS_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className={cn(
                      "min-h-11 rounded-md font-mono text-2xs uppercase tracking-wider transition-colors duration-150",
                      levels[axis.id] === i
                        ? "bg-sage/20 text-sage"
                        : "bg-bg-subtle text-muted hover:text-fg",
                    )}
                    onClick={() => setAxis(axis.id, i as AxisLevel)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-2xs uppercase tracking-wider text-sage">Reading</p>
          <h4 className="mt-1 text-lg text-fg">{reading.title}</h4>
          <p className="mt-2 text-sm text-muted">{reading.body}</p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Emergence ladder</h3>
        <p className="mt-1 text-sm text-muted">
          Same pieces, different organization, different organism. A room is not atoms.
          Kiyoshi is not a pile of AIs.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {SCALE.map((level) => (
            <button
              key={level}
              type="button"
              className={cn(
                "min-h-11 rounded-full px-3 font-mono text-2xs uppercase tracking-wider transition-colors duration-150",
                scale === level ? "bg-sage/20 text-sage" : "bg-bg-subtle text-muted hover:text-fg",
              )}
              onClick={() => setScale(level)}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-2xs uppercase tracking-wider text-sage">{scale}</p>
          <p className="mt-2 text-sm text-fg">{SCALE_NOTES[scale]}</p>
        </div>
        <p className="mt-4 text-sm text-muted">
          Substrate → interaction → pattern → structure → environment → behavior → feedback.
          Humans did not stop being organisms when they built houses. Each layer becomes the
          environment for the next.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {SCALE_GENESIS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={cn(
                "min-h-11 rounded-full px-3 font-mono text-2xs uppercase tracking-wider transition-colors duration-150",
                genesis === g.id ? "bg-sage/20 text-sage" : "bg-bg-subtle text-muted hover:text-fg",
              )}
              onClick={() => setGenesis(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{genesisNote.note}</p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">One substrate, many spectra</h3>
        <p className="mt-1 text-sm text-muted">
          Similarity is not identity. A common interface does not make every occupant the same
          thing. Pick a claim. Iris will not promote a hypothesis to physics to make the sim prettier.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SPECTRA.map((item) => (
            <Button
              key={item.id}
              variant={claimId === item.id ? "primary" : "secondary"}
              className="min-h-11"
              onClick={() => setClaimId(item.id)}
            >
              {item.name}
            </Button>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-fg">{claim.name}</p>
            <Badge tone={SPECTRA_TONE[claim.status]}>{claim.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">{claim.line}</p>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {EPISTEMIC.map((item) => (
            <li
              key={item.id}
              className={cn(
                "rounded-xl bg-bg-elevated px-4 py-3 shadow-[var(--shadow-border)]",
                claim.status === item.id && "shadow-[var(--shadow-border-hover)]",
              )}
            >
              <p className="font-mono text-2xs uppercase tracking-wider text-sage">{item.label}</p>
              <p className="mt-1 text-sm text-muted">{item.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Two eyes</h3>
        <p className="mt-1 text-sm text-muted">
          Never confuse internal consistency with correspondence. One eye on the world, one on
          the model. The user switches.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRIAD.map((item) => (
            <Button
              key={item.id}
              variant={triad === item.id ? "primary" : "secondary"}
              className="min-h-11"
              onClick={() => setTriad(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-2xs uppercase tracking-wider text-sage">
            {triadNote.label}
          </p>
          <p className="mt-2 text-sm text-fg">{triadNote.line}</p>
        </div>
        <p className="mt-4 text-sm text-muted">
          If reality and simulation diverge, do not say “the sim is wrong” and stop. Ask which
          assumption in the representation produced the miss. That is Proof of Simulation:
          declared rules, provenance, uncertainty left explicit.
        </p>
        <ol className="mt-3 space-y-2">
          {BRIDGE.map((node) => (
            <li
              key={node.id}
              className="rounded-xl bg-bg-elevated px-4 py-3 shadow-[var(--shadow-border)]"
            >
              <p className="font-mono text-2xs uppercase tracking-wider text-sage">{node.name}</p>
              <p className="mt-1 text-sm text-muted">{node.line}</p>
            </li>
          ))}
        </ol>
        <Button
          variant="secondary"
          className="mt-4 min-h-11"
          onClick={() => {
            selectGround("iris");
            setView("ground");
          }}
        >
          Play Two eyes on Ground
        </Button>
      </section>

      <section className="mb-8">
        <p className="font-mono text-2xs uppercase tracking-wider text-sage">{GEMINI.released}</p>
        <h3 className="mt-1 text-lg text-fg">{GEMINI.headline}</h3>
        <ul className="mt-4 space-y-3">
          {GEMINI.models.map((m) => (
            <li
              key={m.name}
              className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base text-fg">{m.name}</h4>
                <Badge tone="quiet">{m.kind}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{m.role}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {GEMINI.facts.map((f) => (
            <li key={f} className="border-l border-sage/40 pl-3">
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Against Kiyoshi</h3>
        <ul className="mt-3 space-y-3">
          {GEMINI.vsKiyoshi.map((row) => (
            <li
              key={row.axis}
              className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"
            >
              <p className="font-mono text-2xs uppercase tracking-wider text-sage">{row.axis}</p>
              <p className="mt-2 text-sm text-fg">{row.kiyoshi}</p>
              <p className="mt-1 text-sm text-muted">Gemini: {row.gemini}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          ER 2 + VLA is Tesla’s split with a better body: System 2 plans, System 1 moves at a
          few hertz. ASIMOV-Agentic can refuse. That is still not “I need energy; I will
          charge; then I resume.” That loop lives in Agency. DeepMind’s watering-can demo is
          the settled task on that view.
        </p>
        <Button variant="ghost" className="mt-2 px-0" onClick={() => setView("agency")}>
          Open the agency loop
        </Button>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">Reality is reality</h3>
        <p className="mt-1 text-sm text-muted">
          Thinking beyond humans is conceivable. Acting beyond the constraints of the world
          is not an intelligence question.
        </p>
        <div className="mt-3 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-2xs uppercase tracking-wider text-sage">
            Gravity is not magnetism
          </p>
          <p className="mt-2 text-sm text-fg">
            Electricity and magnetism unified. Gravity has not. A neutron still falls.
            Reality does not require everything to be the same thing — it requires distinct
            things to interact under consistent rules. Grok does not have to become Gemini.
            Anise does not have to become Red Clover. Call the stronger claim a hypothesis
            and let the experiment decide.
          </p>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {REALITY.map((item) => (
            <li
              key={item.id}
              className="rounded-xl bg-bg-elevated px-4 py-3 shadow-[var(--shadow-border)]"
            >
              <p className="font-medium text-fg">{item.name}</p>
              <p className="mt-1 text-sm text-muted">{item.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="mb-8" />

      <section className="mb-8">
        <h3 className="text-lg text-fg">GitHub ledger</h3>
        <p className="mt-1 text-sm text-muted">
          romero429-collab/Kiyoshi-AI-OS — there is no Discussions tab and there are no
          issues. The conversation is two open pull requests and a specification tree.
        </p>
        <ol className="mt-4 space-y-3">
          {GITHUB_NOTES.map((note) => (
            <li
              key={note.id}
              className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="quiet">{note.kind}</Badge>
                <span className="font-mono text-2xs uppercase tracking-wider text-subtle">
                  {note.state}
                </span>
              </div>
              <h4 className="mt-2 text-base text-fg">{note.title}</h4>
              <p className="mt-2 text-sm text-muted">{note.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-8">
        <h3 className="text-lg text-fg">What a persistent agent actually needs</h3>
        <p className="mt-1 text-sm text-muted">
          Intelligence is one component. The system around it is what turns capability into
          an operating entity.
        </p>
        <ul className="mt-3 flex flex-wrap gap-1">
          {INFRASTRUCTURE.map((item) => (
            <li
              key={item}
              className="rounded-full bg-bg-elevated px-3 py-1 font-mono text-2xs uppercase tracking-wider text-muted shadow-[var(--shadow-border)]"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg text-fg">Declared layers</h3>
          <Button variant="ghost" className="px-0" onClick={() => setView("layers")}>
            Full map
          </Button>
        </div>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {LAYERS.map((layer) => (
            <li
              key={layer.id}
              className="rounded-lg bg-bg-elevated px-4 py-3 shadow-[var(--shadow-border)]"
            >
              <p className="font-mono text-2xs uppercase tracking-wider text-sage">{layer.role}</p>
              <p className="mt-1 text-sm text-fg">{layer.name}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
