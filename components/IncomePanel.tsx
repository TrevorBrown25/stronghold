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
    <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header>
        <h2 className="font-display text-2xl">Income &amp; Edict</h2>
        <p className="text-sm text-ink/70">
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
                ? "border-accent bg-white"
                : "border-transparent bg-white/60",
              isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
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
              />
              <span className="font-semibold">{option.value}</span>
            </span>
            <span className="text-xs text-ink/70">{option.description}</span>
          </label>
        ))}
      </div>
      <button
        onClick={handleApply}
        disabled={isLocked}
        className="w-fit rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink/30"
      >
        Apply Edict
      </button>
      {edictTurn === turn && (
        <p className="text-xs text-emerald-700">Edict applied for this turn.</p>
      )}
    </section>
  );
}
