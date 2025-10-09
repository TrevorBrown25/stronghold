"use client";

import { useMemo } from "react";

import { selectors, useStrongholdStore } from "@/lib/store";
import type { ResourceType } from "@/lib/types";

const RESOURCE_LABELS: Record<ResourceType | "intel", string> = {
  wealth: "Wealth",
  supplies: "Supplies",
  loyalty: "Loyalty",
  intel: "Intel"
};

export function ResourceTracker() {
  const resources = useStrongholdStore((state) => state.resources);
  const incrementResource = useStrongholdStore((state) => state.incrementResource);
  const addIntel = useStrongholdStore((state) => state.addIntel);
  const spendIntel = useStrongholdStore((state) => state.spendIntel);
  const runFestival = useStrongholdStore((state) => state.runFestival);
  const { used, capacity } = useStrongholdStore(selectors.workOrderSummary);
  const { active, capacity: trainingCap } = useStrongholdStore(selectors.trainingSummary);

  const canFestival = useMemo(
    () => !resources.festivalUsed,
    [resources.festivalUsed]
  );

  const resourceKeys: (ResourceType | "intel")[] = [
    "wealth",
    "supplies",
    "loyalty",
    "intel"
  ];

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Resources</h2>
        <div className="flex gap-4 text-sm">
          <span className="rounded-full bg-white/80 px-3 py-1 font-semibold text-ink/80">
            Work Orders {used}/{capacity}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 font-semibold text-ink/80">
            Training {active}/{trainingCap}
          </span>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {resourceKeys.map((key) => (
          <div key={key} className="flex flex-col gap-2 rounded-2xl bg-white/60 p-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{RESOURCE_LABELS[key]}</span>
              <span className="text-lg">{resources[key]}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => incrementResource(key as ResourceType, -1)}
                className="flex-1 rounded-full bg-ink/10 py-1 text-sm font-semibold hover:bg-ink/20"
              >
                –
              </button>
              <button
                onClick={() => incrementResource(key as ResourceType, 1)}
                className="flex-1 rounded-full bg-ink/10 py-1 text-sm font-semibold hover:bg-ink/20"
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
          disabled={!canFestival}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink/30"
          title="Spend 1 Wealth and 1 Supplies to gain +1 Loyalty. Once per turn."
        >
          Festival
        </button>
        <button
          onClick={() => addIntel()}
          className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold hover:bg-ink/20"
        >
          Gain Intel
        </button>
        <button
          onClick={() => spendIntel()}
          className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold hover:bg-ink/20"
        >
          Spend Intel
        </button>
      </div>
    </section>
  );
}
