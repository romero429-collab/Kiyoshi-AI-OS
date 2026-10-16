import { LAYERS } from "@/lib/kiyoshi/catalog";
import { useKiyoshi } from "@/lib/kiyoshi/store";

export function LayersView() {
  const setView = useKiyoshi((s) => s.setView);
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <header className="rise mb-6">
        <p className="font-mono text-2xs uppercase tracking-wider text-muted">Composition</p>
        <h2 className="mt-1 text-2xl text-fg">Declared layers</h2>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Subsystems compose only through declared interfaces. Casey holds the working slice.
          Red Clover is furniture in the house. Iris is the eyes — selectable, not a headset.
          Air Sync binds a body later. Blue Lotus binds who is allowed. The interesting part
          is not any one piece — it is the coordinator that decides which epistemology is in
          charge.
        </p>
      </header>
      <ol className="grid gap-3 sm:grid-cols-2">
        {LAYERS.map((layer, i) => (
          <li
            key={layer.id}
            className="rise rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="font-mono text-2xs uppercase tracking-wider text-sage">{layer.role}</p>
            <h3 className="mt-1 text-lg text-fg">{layer.name}</h3>
            <p className="mt-2 text-sm text-muted">{layer.body}</p>
            {layer.id === "constitution" && (
              <button
                type="button"
                className="mt-3 min-h-11 text-sm text-accent hover:underline"
                onClick={() => setView("constitution")}
              >
                Open charter
              </button>
            )}
            {layer.id === "governor" && (
              <button
                type="button"
                className="mt-3 min-h-11 text-sm text-accent hover:underline"
                onClick={() => setView("governor")}
              >
                Open governor
              </button>
            )}
            {layer.id === "iris" && (
              <button
                type="button"
                className="mt-3 min-h-11 text-sm text-accent hover:underline"
                onClick={() => setView("field")}
              >
                Iris stage — Field
              </button>
            )}
            {layer.id === "casey" && (
              <button
                type="button"
                className="mt-3 min-h-11 text-sm text-accent hover:underline"
                onClick={() => setView("memory")}
              >
                Memory bands
              </button>
            )}
            {layer.id === "clover" && (
              <button
                type="button"
                className="mt-3 min-h-11 text-sm text-accent hover:underline"
                onClick={() => setView("ground")}
              >
                Open the ground loop
              </button>
            )}
            {layer.id === "lotus" && (
              <button
                type="button"
                className="mt-3 min-h-11 text-sm text-accent hover:underline"
                onClick={() => setView("constitution")}
              >
                Open charter
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
