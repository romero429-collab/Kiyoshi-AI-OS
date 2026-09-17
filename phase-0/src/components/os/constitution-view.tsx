import { ARTICLES } from "@/lib/kiyoshi/catalog";

export function ConstitutionView() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="rise mb-6">
        <p className="font-mono text-2xs uppercase tracking-wider text-muted">
          v0.1-R · Baseline
        </p>
        <h2 className="mt-1 text-2xl text-fg">Kiyoshi Constitution</h2>
        <p className="mt-2 text-sm text-muted">
          Enduring obligations only. Mechanisms live below. Prefer moving knowledge downward rather
          than amending the charter. No model may override these articles.
        </p>
      </header>
      <ol className="space-y-3">
        {ARTICLES.map((article) => (
          <li
            key={article.id}
            className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"
          >
            <p className="font-mono text-2xs uppercase tracking-wider text-sage">
              Article {article.id}
            </p>
            <h3 className="mt-1 text-lg text-fg">{article.title}</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {article.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
