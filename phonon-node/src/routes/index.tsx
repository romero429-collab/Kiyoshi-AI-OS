import { createFileRoute } from "@tanstack/react-router";
import { Resonator, Scope } from "@/components/phonon/device";
import { Belief, Cite, Claims, Controls, Ensemble, Header, Ledger } from "@/components/phonon/console";
import { Joint } from "@/components/phonon/joint-panel";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-8 pb-16 sm:px-6">
      <Header />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Resonator />
        <Scope />
      </div>
      <Controls />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Ledger />
        <Belief />
      </div>
      <Claims />
      <Joint />
      <Ensemble />
      <Cite />
    </main>
  );
}
