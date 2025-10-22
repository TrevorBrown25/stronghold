"use client";

import { selectors, useStrongholdStore } from "@/lib/store";
import { RESOURCE_TYPES, type ResourceType } from "@/lib/types";

const RESOURCE_LABELS: Record<ResourceType, string> = {
  wealth: "Wealth",
  supplies: "Supplies",
  loyalty: "Loyalty"
};

export function ResourceOverview() {
  const resources = useStrongholdStore((state) => state.resources);
  const { used, capacity } = useStrongholdStore(selectors.workOrderSummary);
  const { inProgress, capacity: recruitmentCap } =
    useStrongholdStore(selectors.recruitmentSummary);
  const readyForces = useStrongholdStore(selectors.readyForces);

  return (
    <section className="glass-panel flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl text-slate-100">Resources</h2>
        <div className="flex flex-wrap gap-2 text-sm sm:justify-end sm:gap-3">
          <span className="glass-badge">
            Work Orders {used}/{capacity}
          </span>
          <span className="glass-badge">
            Recruiting {inProgress}/{recruitmentCap}
          </span>
          <span className="glass-badge">Ready Forces {readyForces}</span>
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {RESOURCE_TYPES.map((type) => (
          <div
            key={type}
            className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-300"
          >
            <p className="text-xs uppercase text-slate-500">
              {RESOURCE_LABELS[type]}
            </p>
            <p className="text-xl font-semibold text-white">
              {resources[type]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
