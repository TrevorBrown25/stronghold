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
    <aside className="glass-panel flex w-64 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-slate-100">Turn {turn}</h2>
        <button
          disabled={isLocked}
          onClick={onCompleteTurn}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(76,29,149,0.8)] transition hover:from-indigo-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
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
              "rounded-xl border px-4 py-3 text-left font-semibold transition",
              activePhase === phase
                ? "border-indigo-400/70 bg-indigo-500/20 text-white shadow-[0_18px_35px_-20px_rgba(79,70,229,0.9)]"
                : "border-white/10 bg-slate-900/40 text-slate-300 hover:border-indigo-400/60 hover:bg-slate-900/60 hover:text-white",
              isLocked && "cursor-not-allowed opacity-60 hover:border-white/10 hover:bg-slate-900/40"
            )}
          >
            {phase}
          </button>
        ))}
      </nav>
      <p className="glass-section text-xs text-slate-400">
        Track each Stronghold phase in order. Ending the turn will reset captain
        assignments and mark the Festival as available again.
      </p>
    </aside>
  );
}
