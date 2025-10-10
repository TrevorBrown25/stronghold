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
          <div key={captain.id} className="glass-section">
            <h3 className="text-lg font-semibold text-white">{captain.name}</h3>
            <p className="text-sm text-slate-400">{captain.specialty}</p>
            {captain.traits && (
              <ul className="mt-1 list-disc pl-5 text-xs text-slate-500">
                {captain.traits.map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs font-semibold text-slate-300">
              {captain.assignedMissionId
                ? `Assigned to mission ${captain.assignedMissionId.slice(0, 8)}`
                : "Ready for deployment"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
