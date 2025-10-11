"use client";

import { useMemo } from "react";

import { ALL_TROOPS, buildMatchupMatrix } from "@/lib/matchups";

const cellStyle = (value: number) => {
  if (value > 0) {
    return "rounded bg-emerald-500/10 text-emerald-200";
  }
  if (value < 0) {
    return "rounded bg-rose-500/10 text-rose-200";
  }
  return "text-slate-400";
};

export function TroopMatchupsPanel() {
  const matrix = useMemo(() => buildMatchupMatrix(), []);

  return (
    <section className="glass-panel flex flex-col gap-4">
      <header>
        <h2 className="font-display text-2xl text-slate-100">Troop Matchups</h2>
        <p className="text-sm text-slate-400">
          Positive values indicate bonuses for the attacker. Values stack for elite composites.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-slate-200">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 text-slate-400">Attacker \ Defender</th>
              {ALL_TROOPS.map((defender) => (
                <th key={defender} className="px-2 py-2 text-center">
                  {defender}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_TROOPS.map((attacker) => (
              <tr key={attacker} className="border-b border-white/5 last:border-none">
                <th className="px-2 py-2 text-left text-slate-300">{attacker}</th>
                {ALL_TROOPS.map((defender) => {
                  const value = matrix[attacker][defender];
                  const display = attacker === defender ? "—" : value === 0 ? "0" : value;
                  return (
                    <td
                      key={defender}
                      className={`px-2 py-1 text-center font-semibold ${cellStyle(value)}`}
                      title={`${attacker} vs ${defender}: ${value >= 0 ? "+" : ""}${value}`}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
        <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-200">Attacker bonus</span>
        <span className="rounded bg-rose-500/10 px-2 py-1 text-rose-200">Defender bonus</span>
        <span className="rounded border border-white/10 px-2 py-1 text-slate-300">0 = even</span>
      </div>
    </section>
  );
}
