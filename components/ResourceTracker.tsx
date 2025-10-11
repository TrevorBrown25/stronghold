"use client";

import { useEffect, useMemo, useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { selectors, useStrongholdStore } from "@/lib/store";
import type { IncomeType, ResourceType } from "@/lib/types";
import { clsx } from "clsx";

const RESOURCE_LABELS: Record<ResourceType, string> = {
  wealth: "Wealth",
  supplies: "Supplies",
  loyalty: "Loyalty"
};

const INCOME_OPTIONS: Array<{ value: IncomeType; description: string }> = [
  { value: "Collect Taxes", description: "+1 Wealth" },
  {
    value: "Trade Commodities",
    description: "Convert 1 Supplies into +1 Wealth"
  },
  {
    value: "Purchase Reserves",
    description: "Convert 1 Wealth into +1 Supplies"
  },
  { value: "Supply Expedition", description: "+1 Supplies" }
];

export function ResourceTracker() {
  const resources = useStrongholdStore((state) => state.resources);
  const incrementResource = useStrongholdStore((state) => state.incrementResource);
  const runFestival = useStrongholdStore((state) => state.runFestival);
  const festivalUsed = useStrongholdStore((state) => state.festivalUsed);
  const income = useStrongholdStore((state) => state.income);
  const incomeTurn = useStrongholdStore((state) => state.incomeTurn);
  const applyIncome = useStrongholdStore((state) => state.applyIncome);
  const turn = useStrongholdStore((state) => state.turn);
  const { used, capacity } = useStrongholdStore(selectors.workOrderSummary);
  const { inProgress, ready, capacity: recruitmentCap } = useStrongholdStore(
    selectors.recruitmentSummary
  );
  const isLocked = useEditLockStore(selectIsLocked);

  const canFestival = useMemo(() => !festivalUsed, [festivalUsed]);
  const [selectedIncome, setSelectedIncome] = useState<IncomeType>(
    income ?? "Collect Taxes"
  );

  useEffect(() => {
    setSelectedIncome(income ?? "Collect Taxes");
  }, [income]);

  const handleApplyIncome = () => {
    if (isLocked) return;
    applyIncome(selectedIncome);
  };

  const renderResourceControl = (key: ResourceType) => (
    <div key={key} className="glass-section flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
        <span className="text-slate-400">{RESOURCE_LABELS[key]}</span>
        <span className="text-lg text-white">{resources[key]}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => incrementResource(key, -1)}
          disabled={isLocked}
          className="flex-1 rounded-full border border-white/10 bg-slate-900/50 py-1 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          –
        </button>
        <button
          onClick={() => incrementResource(key, 1)}
          disabled={isLocked}
          className="flex-1 rounded-full border border-white/10 bg-slate-900/50 py-1 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <section className="glass-panel flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-slate-100">Resources</h2>
        <div className="flex gap-4 text-sm">
          <span className="glass-badge">
            Work Orders {used}/{capacity}
          </span>
          <span className="glass-badge">
            Recruiting {inProgress}/{recruitmentCap}
          </span>
          <span className="glass-badge">Ready Forces {ready}</span>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {renderResourceControl("wealth")}
        <div className="glass-section col-span-2 flex flex-col gap-3 md:col-span-2">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
            <span className="text-slate-400">Income Activity</span>
            <span className="text-xs text-slate-500">Focus the treasury</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {INCOME_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  "flex flex-col gap-1 rounded-2xl border px-3 py-2 text-xs transition",
                  selectedIncome === option.value
                    ? "border-indigo-400/70 bg-indigo-500/10 shadow-[0_18px_35px_-20px_rgba(79,70,229,0.9)]"
                    : "border-white/10 bg-slate-900/50",
                  isLocked
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:border-indigo-400/50 hover:bg-slate-900/60"
                )}
              >
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="income"
                    value={option.value}
                    checked={selectedIncome === option.value}
                    onChange={() => setSelectedIncome(option.value)}
                    disabled={isLocked}
                    className="accent-indigo-400"
                  />
                  <span className="font-semibold text-slate-100">
                    {option.value}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {option.description}
                </span>
              </label>
            ))}
          </div>
          <button
            onClick={handleApplyIncome}
            disabled={isLocked}
            className="w-fit rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply Income
          </button>
          {incomeTurn === turn && (
            <p className="text-[11px] text-emerald-300">
              Income applied for this turn.
            </p>
          )}
        </div>
        {renderResourceControl("supplies")}
        {renderResourceControl("loyalty")}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => runFestival()}
          disabled={isLocked || !canFestival}
          className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-purple-400 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          title="Spend 1 Wealth and 1 Supplies to gain +1 Loyalty. Once per turn."
        >
          Festival
        </button>
      </div>
    </section>
  );
}
