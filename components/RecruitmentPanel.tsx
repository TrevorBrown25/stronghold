"use client";

import { useState } from "react";

import { selectors, useStrongholdStore } from "@/lib/store";
import type { RecruitmentInstance, RecruitmentOption } from "@/lib/types";

function formatCost(cost: RecruitmentOption["cost"]) {
  const entries = Object.entries(cost);
  if (!entries.length) return "—";
  return entries.map(([key, value]) => `${value} ${key}`).join(", ");
}

export function RecruitmentPanel() {
  const recruitments = useStrongholdStore((state) => state.recruitments);
  const startRecruitment = useStrongholdStore((state) => state.startRecruitment);
  const advanceRecruitment = useStrongholdStore((state) => state.advanceRecruitment);
  const removeRecruitment = useStrongholdStore((state) => state.removeRecruitment);
  const available = selectors.availableRecruitment();
  const [selected, setSelected] = useState<string>(available[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const handleStart = () => {
    const option = available.find((item) => item.id === selected);
    if (!option) return;
    try {
      startRecruitment(option);
      setMessage(`Started training ${option.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cannot start recruitment.");
    }
  };

  const handleAdvance = (rec: RecruitmentInstance) => {
    advanceRecruitment(rec.id);
    setMessage(`Advanced ${rec.name}.`);
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Recruitment</h2>
          <p className="text-sm text-ink/70">
            Manage training slots for new units.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="rounded-full border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            {available.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} ({option.turnsRequired} turns)
              </option>
            ))}
          </select>
          <button
            onClick={handleStart}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            Begin Training
          </button>
        </div>
      </header>
      {message && (
        <p className="rounded-xl bg-ink/5 px-3 py-2 text-sm text-ink/80">{message}</p>
      )}
      <div className="flex flex-col gap-3">
        {recruitments.length === 0 && (
          <p className="rounded-xl bg-white/60 p-4 text-sm text-ink/70">
            No current recruitment orders. Assign recruits to fill your ranks.
          </p>
        )}
        {recruitments.map((rec) => (
          <div key={rec.id} className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-lg">{rec.name}</h3>
                <p className="text-sm text-ink/70">Cost: {formatCost(rec.cost)}</p>
                <p className="text-xs text-ink/60">Result: {rec.result}</p>
                {rec.completedTurn && (
                  <p className="text-xs font-semibold text-emerald-700">
                    Completed on Turn {rec.completedTurn}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 text-sm">
                <span>
                  Progress {rec.progress}/{rec.turnsRequired}
                </span>
                <div className="h-2 w-48 rounded-full bg-ink/10">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${Math.round((rec.progress / rec.turnsRequired) * 100)}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAdvance(rec)}
                    className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold hover:bg-ink/20"
                  >
                    Advance
                  </button>
                  <button
                    onClick={() => removeRecruitment(rec.id)}
                    className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
