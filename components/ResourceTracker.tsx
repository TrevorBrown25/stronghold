"use client";

import { useMemo } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { selectors, useStrongholdStore } from "@/lib/store";
import type { ResourceType } from "@/lib/types";
import { RESOURCE_TYPES } from "@/lib/types";

const RESOURCE_LABELS: Record<ResourceType, string> = {
  wealth: "Wealth",
  supplies: "Supplies",
  loyalty: "Loyalty"
};

const RESOURCE_KEYS: ResourceType[] = ["wealth", "supplies", "loyalty"];

export function ResourceTracker() {
  const resources = useStrongholdStore((state) => state.resources);
  const incrementResource = useStrongholdStore((state) => state.incrementResource);
  const runFestival = useStrongholdStore((state) => state.runFestival);
  const festivalUsed = useStrongholdStore((state) => state.festivalUsed);
  const { used, capacity } = useStrongholdStore(selectors.workOrderSummary);
  const { active, capacity: trainingCap } = useStrongholdStore(selectors.trainingSummary);
  const isLocked = useEditLockStore(selectIsLocked);

  const canFestival = useMemo(() => !festivalUsed, [festivalUsed]);

  return (
    <section className="glass-panel flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-slate-100">Resources</h2>
        <div className="flex gap-4 text-sm">
          <span className="glass-badge">
            Work Orders {used}/{capacity}
          </span>
          <span className="glass-badge">
            Training {active}/{trainingCap}
          </span>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {RESOURCE_KEYS.map((key) => (
          <div key={key} className="glass-section flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
              <span className="text-slate-400">{RESOURCE_LABELS[key]}</span>
              <span className="text-lg text-white">{resources[key]}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => incrementResource(key as ResourceType, -1)}
                disabled={isLocked}
                className="flex-1 rounded-full border border-white/10 bg-slate-900/50 py-1 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                –
              </button>
              <button
                onClick={() => incrementResource(key as ResourceType, 1)}
                disabled={isLocked}
                className="flex-1 rounded-full border border-white/10 bg-slate-900/50 py-1 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        ))}
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
