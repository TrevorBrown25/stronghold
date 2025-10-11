"use client";

import { useEffect, useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
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
  const available = useStrongholdStore(selectors.availableRecruitment);
  const [selected, setSelected] = useState<string>(available[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const isLocked = useEditLockStore(selectIsLocked);

  useEffect(() => {
    if (!available.some((option) => option.id === selected)) {
      setSelected(available[0]?.id ?? "");
    }
  }, [available, selected]);

  const handleStart = () => {
    if (isLocked) return;
    const option = available.find((item) => item.id === selected);
    if (!option) return;
    try {
      startRecruitment(option);
      setMessage(`Started recruiting ${option.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cannot start recruitment.");
    }
  };

  const handleAdvance = (rec: RecruitmentInstance) => {
    if (isLocked) return;
    advanceRecruitment(rec.id);
    setMessage(`Advanced ${rec.name}.`);
  };

  return (
    <section className="glass-panel flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-slate-100">Recruitment</h2>
          <p className="text-sm text-slate-400">
            Manage recruitment slots for new units.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="input-field rounded-full"
            disabled={isLocked}
          >
            {available.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} ({option.turnsRequired} turns)
              </option>
            ))}
          </select>
          <button
            onClick={handleStart}
            disabled={isLocked}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Begin Recruitment
          </button>
        </div>
      </header>
      {message && (
        <p className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">{message}</p>
      )}
      <div className="flex flex-col gap-3">
        {recruitments.length === 0 && (
          <p className="rounded-xl border border-white/5 bg-slate-900/50 p-4 text-sm text-slate-400">
            No current recruitment orders. Assign recruits to fill your ranks.
          </p>
        )}
        {recruitments.map((rec) => (
          <div key={rec.id} className="glass-section flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{rec.name}</h3>
                <p className="text-sm text-slate-400">Cost: {formatCost(rec.cost)}</p>
                <p className="text-xs text-slate-500">Result: {rec.result}</p>
                {rec.completedTurn && (
                  <p className="text-xs font-semibold text-emerald-300">
                    Completed on Turn {rec.completedTurn}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 text-sm text-slate-300">
                <span className="text-slate-400">
                  Progress {rec.progress}/{rec.turnsRequired}
                </span>
                <div className="h-2 w-48 rounded-full bg-slate-800/60">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                    style={{ width: `${Math.round((rec.progress / rec.turnsRequired) * 100)}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAdvance(rec)}
                    disabled={isLocked}
                    className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Advance
                  </button>
                  <button
                    onClick={() => removeRecruitment(rec.id)}
                    disabled={isLocked}
                    className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
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
