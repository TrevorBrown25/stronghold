"use client";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { PHASES, useStrongholdStore } from "@/lib/store";
import { clsx } from "clsx";

interface Props {
  onCompleteTurn: () => void;
}

export function PhaseSidebar({ onCompleteTurn }: Props) {
  const activePhase = useStrongholdStore((state) => state.activePhase);
  const setPhase = useStrongholdStore((state) => state.setPhase);
  const turn = useStrongholdStore((state) => state.turn);
  const isLocked = useEditLockStore(selectIsLocked);

  return (
    <aside className="flex w-64 flex-col gap-4 rounded-3xl bg-white/70 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Turn {turn}</h2>
        <button
          disabled={isLocked}
          onClick={onCompleteTurn}
          className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink/30"
        >
          End Turn
        </button>
      </div>
      <nav className="flex flex-col gap-2">
        {PHASES.map((phase) => (
          <button
            key={phase}
            disabled={isLocked}
            onClick={() => setPhase(phase)}
            className={clsx(
              "rounded-xl px-4 py-3 text-left font-semibold transition",
              activePhase === phase
                ? "bg-accent text-white shadow-md"
                : "bg-white/60 text-ink hover:bg-white",
              isLocked && "cursor-not-allowed opacity-60 hover:bg-white/60"
            )}
          >
            {phase}
          </button>
        ))}
      </nav>
      <p className="rounded-xl bg-white/50 p-3 text-xs text-ink/80">
        Track each Stronghold phase in order. Ending the turn will reset captain
        assignments and mark the Festival as available again.
      </p>
    </aside>
  );
}
