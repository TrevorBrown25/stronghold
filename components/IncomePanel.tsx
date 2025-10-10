"use client";

import { useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { useStrongholdStore } from "@/lib/store";
import { clsx } from "clsx";

const EDICTS: Array<{ value: "Harvest" | "Trade" | "Town Hall" | "Draft"; description: string }> = [
  { value: "Harvest", description: "+1 Supplies" },
  { value: "Trade", description: "+1 Wealth" },
  { value: "Town Hall", description: "+1 Loyalty" },
  { value: "Draft", description: "+1 Supplies, -1 Loyalty" }
];

export function IncomePanel() {
  const applyEdict = useStrongholdStore((state) => state.applyEdict);
  const edict = useStrongholdStore((state) => state.edict);
  const edictTurn = useStrongholdStore((state) => state.edictTurn);
  const turn = useStrongholdStore((state) => state.turn);
  const [selected, setSelected] = useState<"Harvest" | "Trade" | "Town Hall" | "Draft">(
    edict ?? "Harvest"
  );
  const isLocked = useEditLockStore(selectIsLocked);

  const handleApply = () => {
    if (isLocked) return;
    applyEdict(selected);
  };

  return (
    <section className="glass-panel flex flex-col gap-3">
      <header>
        <h2 className="font-display text-2xl text-slate-100">Income &amp; Edict</h2>
        <p className="text-sm text-slate-400">
          Choose the realm&rsquo;s focus this turn to adjust your resources.
        </p>
      </header>
      <div className="grid gap-2 md:grid-cols-2">
        {EDICTS.map((option) => (
          <label
            key={option.value}
            className={clsx(
              "flex flex-col gap-1 rounded-2xl border px-3 py-2 text-sm transition",
              selected === option.value
                ? "border-indigo-400/70 bg-indigo-500/10 shadow-[0_18px_35px_-20px_rgba(79,70,229,0.9)]"
                : "border-white/10 bg-slate-900/50",
              isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-indigo-400/50 hover:bg-slate-900/60"
            )}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="edict"
                value={option.value}
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
                disabled={isLocked}
                className="accent-indigo-400"
              />
              <span className="font-semibold text-slate-100">{option.value}</span>
            </span>
            <span className="text-xs text-slate-400">{option.description}</span>
          </label>
        ))}
      </div>
      <button
        onClick={handleApply}
        disabled={isLocked}
        className="w-fit rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Apply Edict
      </button>
      {edictTurn === turn && (
        <p className="text-xs text-emerald-300">Edict applied for this turn.</p>
      )}
    </section>
  );
}
