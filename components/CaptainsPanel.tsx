"use client";

import { useStrongholdStore } from "@/lib/store";

export function CaptainsPanel() {
  const captains = useStrongholdStore((state) => state.captains);

  return (
    <section className="glass-panel flex flex-col gap-3">
      <header>
        <h2 className="font-display text-2xl text-slate-100">Captains</h2>
        <p className="text-sm text-slate-400">
          Assign captains to missions to leverage their specialties.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {captains.map((captain) => (
          <div key={captain.id} className="glass-section flex flex-col gap-3">
            <header>
              <h3 className="text-lg font-semibold text-white">
                {captain.name}
                <span className="block text-sm font-normal text-slate-300">
                  &mdash; {captain.title}
                </span>
              </h3>
              <p className="mt-1 text-sm italic text-slate-400">{captain.flavor}</p>
            </header>
            <ul className="space-y-1 text-sm text-slate-200">
              {captain.abilities.map((ability) => (
                <li key={ability} className="flex gap-2">
                  <span className="text-slate-500">•</span>
                  <span className="leading-snug">{ability}</span>
                </li>
              ))}
            </ul>
            {captain.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {captain.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-800/60 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-auto text-xs font-semibold uppercase tracking-wide text-emerald-400">
              {captain.assignedMissionId
                ? `Assigned to mission ${captain.assignedMissionId.slice(0, 8)}`
                : captain.status}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
