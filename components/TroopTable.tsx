"use client";

import { useMemo, useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { useStrongholdStore } from "@/lib/store";
import type { Troop, TroopStatus } from "@/lib/types";

const STATUS_OPTIONS: TroopStatus[] = ["active", "deployed", "recovering"];

export function TroopTable() {
  const troops = useStrongholdStore((state) => state.troops);
  const updateTroopStatus = useStrongholdStore((state) => state.updateTroopStatus);
  const removeTroop = useStrongholdStore((state) => state.removeTroop);
  const turn = useStrongholdStore((state) => state.turn);
  const [sortKey, setSortKey] = useState<"tier" | "status" | "name">("tier");
  const isLocked = useEditLockStore(selectIsLocked);

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
      troop.status === "recovering" && troop.recoveringUntilTurn === turn;
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
    <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Troops</h2>
          <p className="text-sm text-ink/70">
            Track unit status and mission history.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>Sort by:</span>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            className="rounded-full border border-ink/20 bg-white px-3 py-1"
            disabled={isLocked}
          >
            <option value="tier">Tier</option>
            <option value="status">Status</option>
            <option value="name">Name</option>
          </select>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink/60">
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Advantages</th>
              <th className="px-3 py-2">Missions</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((troop) => {
              const recoveringLocked =
                troop.status === "recovering" &&
                troop.recoveringUntilTurn === turn;

              return (
                <tr
                  key={troop.id}
                  className="border-b border-ink/10 last:border-none"
                >
                  <td className="px-3 py-2 font-semibold">{troop.name}</td>
                  <td className="px-3 py-2 capitalize">{troop.tier}</td>
                  <td className="px-3 py-2">
                    <select
                      value={troop.status}
                      onChange={(event) =>
                        handleStatusChange(troop, event.target.value as TroopStatus)
                      }
                      className="rounded-full border border-ink/20 bg-white px-2 py-1 text-xs"
                      disabled={isLocked || recoveringLocked}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-xs text-ink/70">{troop.advantages}</td>
                  <td className="px-3 py-2 text-center">{troop.missionsCompleted}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {recoveringLocked && (
                        <span className="self-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Recovering
                        </span>
                      )}
                      <button
                        onClick={() => handleMissionSuccess(troop)}
                        disabled={isLocked || recoveringLocked}
                        className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Mark successful mission"
                      >
                        Mission Success
                      </button>
                      <button
                        onClick={() => handleMissionFailure(troop)}
                        disabled={isLocked || recoveringLocked}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Mark failed mission"
                      >
                        Mission Failure
                      </button>
                      <button
                        onClick={() => handleTotalMissionFailure(troop)}
                        disabled={isLocked}
                        className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
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
