"use client";

import { useStrongholdStore } from "@/lib/store";

export function CaptainsPanel() {
  const captains = useStrongholdStore((state) => state.captains);

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header>
        <h2 className="font-display text-2xl">Captains</h2>
        <p className="text-sm text-ink/70">
          Assign captains to missions to leverage their specialties.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {captains.map((captain) => (
          <div key={captain.id} className="rounded-2xl bg-white/60 p-4">
            <h3 className="font-semibold text-lg">{captain.name}</h3>
            <p className="text-sm text-ink/70">{captain.specialty}</p>
            {captain.traits && (
              <ul className="mt-1 list-disc pl-5 text-xs text-ink/60">
                {captain.traits.map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs font-semibold text-ink/80">
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
