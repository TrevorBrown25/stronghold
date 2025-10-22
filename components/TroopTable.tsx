"use client";

import { useMemo, useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { useStrongholdStore } from "@/lib/store";
import type { Troop, TroopStatus } from "@/lib/types";
import {
  ALL_TROOPS,
  buildMatchupMatrix,
  isTroopType,
  type Troop as TroopKind
} from "@/lib/matchups";

const STATUS_OPTIONS: TroopStatus[] = [
  "active",
  "resting",
  "deployed",
  "recovering"
];

export function TroopTable() {
  const troops = useStrongholdStore((state) => state.troops);
  const updateTroopStatus = useStrongholdStore((state) => state.updateTroopStatus);
  const removeTroop = useStrongholdStore((state) => state.removeTroop);
  const turn = useStrongholdStore((state) => state.turn);
  const [sortKey, setSortKey] = useState<"tier" | "status" | "name">("tier");
  const isLocked = useEditLockStore(selectIsLocked);
  const matchupMatrix = useMemo(() => buildMatchupMatrix(), []);

  const describeMatchups = (troop: Troop): string => {
    const troopType = troop.type;
    if (!isTroopType(troopType)) {
      return troop.advantages || "—";
    }

    const matchups = matchupMatrix[troopType];
    const positives: Array<[number, TroopKind[]]> = [];
    const negatives: Array<[number, TroopKind[]]> = [];

    for (const opponent of ALL_TROOPS) {
      if (opponent === troop.type) continue;
      const modifier = matchups[opponent];
      if (!modifier) continue;
      const bucket = modifier > 0 ? positives : negatives;
      const existing = bucket.find(([value]) => value === modifier);
      if (existing) {
        existing[1].push(opponent);
      } else {
        bucket.push([modifier, [opponent]]);
      }
    }

    const formatBucket = ([value, opponents]: [number, TroopKind[]]) => {
      const prefix = value > 0 ? `+${value}` : `${value}`;
      return `${prefix} vs ${opponents.join(", ")}`;
    };

    positives.sort((a, b) => b[0] - a[0]);
    negatives.sort((a, b) => a[0] - b[0]);

    const segments = [...positives, ...negatives].map(formatBucket);

    return segments.length > 0 ? segments.join(" • ") : "Balanced";
  };

  const sorted = useMemo(() => {
    return troops.slice().sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "status") return a.status.localeCompare(b.status);
      return a.tier.localeCompare(b.tier);
    });
  }, [troops, sortKey]);

  const handleStatusChange = (troop: Troop, status: TroopStatus) => {
    if (isLocked) return;
    const recoveringLocked =
      troop.status === "recovering" &&
      troop.recoveringUntilTurn !== undefined &&
      turn <= troop.recoveringUntilTurn;
    if (recoveringLocked && status !== "recovering") return;
    updateTroopStatus(troop.id, status);
  };

  const handleMissionSuccess = (troop: Troop) => {
    if (isLocked) return;
    updateTroopStatus(troop.id, "active", 1);
  };

  const handleMissionFailure = (troop: Troop) => {
    if (isLocked) return;
    updateTroopStatus(troop.id, "recovering", 1);
  };

  const handleTotalMissionFailure = (troop: Troop) => {
    if (isLocked) return;
    const confirmed = window.confirm(
      `Remove ${troop.name} from the roster? This cannot be undone.`
    );
    if (!confirmed) return;
    removeTroop(troop.id);
  };

  return (
    <section className="glass-panel flex flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-slate-100">Troops</h2>
          <p className="text-sm text-slate-400">
            Track unit status and mission history.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-300">Sort by:</span>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            className="input-field rounded-full px-3 py-1"
            disabled={isLocked}
          >
            <option value="tier">Tier</option>
            <option value="status">Status</option>
            <option value="name">Name</option>
          </select>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-200">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Matchups</th>
              <th className="px-3 py-2">Missions</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((troop) => {
              const recoveringLocked =
                troop.status === "recovering" &&
                troop.recoveringUntilTurn !== undefined &&
                turn <= troop.recoveringUntilTurn;

              return (
                <tr key={troop.id} className="border-b border-white/5 last:border-none">
                  <td className="px-3 py-2 font-semibold text-white">{troop.name}</td>
                  <td className="px-3 py-2 capitalize text-slate-300">{troop.tier}</td>
                  <td className="px-3 py-2">
                    <select
                      value={troop.status}
                      onChange={(event) =>
                        handleStatusChange(troop, event.target.value as TroopStatus)
                      }
                      className="input-field rounded-full px-2 py-1 text-xs"
                      disabled={isLocked || recoveringLocked}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    {describeMatchups(troop)}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-300">{troop.missionsCompleted}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {recoveringLocked && (
                        <span className="self-center rounded-full border border-amber-400/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                          Recovering (until end of Turn {troop.recoveringUntilTurn})
                        </span>
                      )}
                      <button
                        onClick={() => handleMissionSuccess(troop)}
                        disabled={isLocked || recoveringLocked}
                        className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Mark successful mission"
                      >
                        Mission Success
                      </button>
                      <button
                        onClick={() => handleMissionFailure(troop)}
                        disabled={isLocked || recoveringLocked}
                        className="rounded-full border border-amber-400/60 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:border-amber-300 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Mark failed mission"
                      >
                        Mission Failure
                      </button>
                      <button
                        onClick={() => handleTotalMissionFailure(troop)}
                        disabled={isLocked}
                        className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Remove troop from roster"
                      >
                        Total Mission Failure
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
