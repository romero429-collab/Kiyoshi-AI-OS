import {
  Activity,
  Brain,
  Globe2,
  MessageSquare,
  Repeat2,
  RotateCcw,
  ScrollText,
  Waypoints,
} from "lucide-react";
import { useEffect } from "react";
import { VIEWS } from "@/lib/kiyoshi/catalog";
import { useKiyoshi } from "@/lib/kiyoshi/store";
import type { ViewId } from "@/lib/kiyoshi/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConsoleView } from "./console-view";
import { ConstitutionView } from "./constitution-view";
import { GovernorView } from "./governor-view";
import { AgencyView } from "./agency-view";
import { FieldView } from "./field-view";
import { GroundView } from "./ground-view";
import { ImproveView } from "./improve-view";
import { LayersView } from "./layers-view";
import { LotusMark } from "./lotus";
import { MemoryView } from "./memory-view";
import { ModeChip } from "./mode-chip";

const ICONS: Record<ViewId, typeof MessageSquare> = {
  console: MessageSquare,
  governor: Brain,
  agency: Activity,
  improve: Repeat2,
  field: Globe2,
  ground: Waypoints,
  constitution: ScrollText,
  layers: Globe2,
  memory: Repeat2,
};

function NavButton({
  id,
  compact,
}: {
  id: ViewId;
  compact?: boolean;
}) {
  const view = useKiyoshi((s) => s.view);
  const setView = useKiyoshi((s) => s.setView);
  const Icon = ICONS[id];
  const label = VIEWS.find((v) => v.id === id)?.label ?? id;
  const active = view === id;
  return (
    <button
      type="button"
      onClick={() => setView(id)}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150",
        compact ? "flex-col justify-center gap-1 px-2 text-2xs uppercase tracking-wider" : "",
        active ? "bg-bg-subtle text-fg" : "text-muted hover:text-fg",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export function Shell() {
  const view = useKiyoshi((s) => s.view);
  const storeMode = useKiyoshi((s) => s.mode);
  const lastTrace = useKiyoshi((s) => s.lastTrace);
  const pending = useKiyoshi((s) => s.pending);
  const mode =
    lastTrace?.transferred ? lastTrace.governor.recommendedMode : storeMode;
  const resetSession = useKiyoshi((s) => s.resetSession);

  useEffect(() => {
    void Promise.resolve(useKiyoshi.persist.rehydrate());
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg md:flex-row">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border md:flex">
        <div className="flex items-center gap-2 px-4 py-5">
          <LotusMark className="size-7" />
          <div>
            <p className="font-display text-base leading-none text-fg">Kiyoshi</p>
            <p className="mt-1 font-mono text-2xs uppercase tracking-wider text-muted">
              OS · Phase 0
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {VIEWS.map((v) => (
            <NavButton key={v.id} id={v.id} />
          ))}
        </nav>
        <div className="px-3 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted"
            onClick={() => resetSession()}
          >
            <RotateCcw className="size-3.5" />
            Reset session
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <LotusMark className="size-6" />
            <span className="font-display text-base">Kiyoshi</span>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="font-mono text-2xs uppercase tracking-wider text-subtle">
              Bicameral · live
            </span>
            {pending && (
              <span className="shimmer-text font-mono text-2xs uppercase tracking-wider">
                Loop running
              </span>
            )}
          </div>
          <ModeChip mode={mode} active />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          {view === "console" && <ConsoleView />}
          {view === "governor" && <GovernorView />}
          {view === "agency" && <AgencyView />}
          {view === "ground" && <GroundView />}
          {view === "improve" && <ImproveView />}
          {view === "field" && <FieldView />}
          {view === "constitution" && <ConstitutionView />}
          {view === "layers" && <LayersView />}
          {view === "memory" && <MemoryView />}
        </main>
      </div>

      <nav className="grid grid-cols-6 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
        {VIEWS.map((v) => (
          <NavButton key={v.id} id={v.id} compact />
        ))}
      </nav>
    </div>
  );
}
