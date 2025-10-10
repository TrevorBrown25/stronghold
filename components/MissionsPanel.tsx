"use client";

import { useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { selectors, useStrongholdStore } from "@/lib/store";
import type { Mission, MissionCategory, MissionScale, Troop } from "@/lib/types";

const missionCategories: MissionCategory[] = [
  "Military",
  "Exploration",
  "Diplomacy",
  "Spy",
  "Trade"
];

const missionScales: MissionScale[] = ["Skirmish", "Raid", "Battle", "Siege"];

export function MissionsPanel() {
  const missions = useStrongholdStore((state) => state.missions);
  const addMission = useStrongholdStore((state) => state.addMission);
  const updateMission = useStrongholdStore((state) => state.updateMission);
  const resolveMissionRoll = useStrongholdStore((state) => state.resolveMissionRoll);
  const deleteMission = useStrongholdStore((state) => state.deleteMission);
  const toggleCaptainAssignment = useStrongholdStore((state) => state.toggleCaptainAssignment);
  const toggleTroopAssignment = useStrongholdStore((state) => state.toggleTroopAssignment);
  const captains = useStrongholdStore(selectors.availableCaptains);
  const troops = useStrongholdStore(selectors.availableTroops);

  const [form, setForm] = useState({
    name: "",
    category: missionCategories[0],
    scale: missionScales[0],
    description: "",
    modifier: 0
  });
  const [message, setMessage] = useState<string | null>(null);
  const isLocked = useEditLockStore(selectIsLocked);

  const handleCreate = () => {
    if (isLocked) return;
    if (!form.name) {
      setMessage("Give the mission a name.");
      return;
    }
    addMission({
      name: form.name,
      category: form.category,
      scale: form.scale,
      description: form.description,
      assignedCaptainId: undefined,
      assignedTroopIds: [],
      modifier: form.modifier,
      result: undefined,
      consequences: undefined,
      roll: undefined
    });
    setForm({
      name: "",
      category: missionCategories[0],
      scale: missionScales[0],
      description: "",
      modifier: 0
    });
    setMessage("Mission added to the roster.");
  };

  const handleRoll = (mission: Mission) => {
    if (isLocked) return;
    resolveMissionRoll(mission.id, mission.modifier);
    setMessage(`Rolled mission ${mission.name}.`);
  };

  const assignedTroops = (mission: Mission) =>
    mission.assignedTroopIds
      .map((id) => troops.find((troop) => troop.id === id))
      .filter((troop): troop is Troop => Boolean(troop));

  const assignedCaptain = (mission: Mission) =>
    captains.find((captain) => captain.id === mission.assignedCaptainId);

  return (
    <section className="glass-panel flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-slate-100">Missions</h2>
          <p className="text-sm text-slate-400">
            Plan sorties, diplomacy, and covert operations.
          </p>
        </div>
        <div className="glass-section flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex flex-col gap-1 text-sm text-slate-300">
            <label className="text-xs font-semibold uppercase text-slate-500">Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="input-field rounded-full"
              readOnly={isLocked}
            />
          </div>
          <div className="flex flex-col gap-1 text-sm text-slate-300">
            <label className="text-xs font-semibold uppercase text-slate-500">Category</label>
            <select
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value as MissionCategory })
              }
              className="input-field rounded-full"
              disabled={isLocked}
            >
              {missionCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm text-slate-300">
            <label className="text-xs font-semibold uppercase text-slate-500">Scale</label>
            <select
              value={form.scale}
              onChange={(event) =>
                setForm({ ...form, scale: event.target.value as MissionScale })
              }
              className="input-field rounded-full"
              disabled={isLocked}
            >
              {missionScales.map((scale) => (
                <option key={scale} value={scale}>
                  {scale}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm text-slate-300">
            <label className="text-xs font-semibold uppercase text-slate-500">Modifier</label>
            <input
              type="number"
              value={form.modifier}
              onChange={(event) =>
                setForm({ ...form, modifier: Number(event.target.value) })
              }
              className="input-field rounded-full"
              readOnly={isLocked}
            />
          </div>
          <div className="flex-1 text-sm text-slate-300">
            <label className="text-xs font-semibold uppercase text-slate-500">Details</label>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              rows={2}
              className="input-field w-full"
              readOnly={isLocked}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={isLocked}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create Mission
          </button>
        </div>
      </header>
      {message && (
        <p className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">{message}</p>
      )}
      <div className="flex flex-col gap-3">
        {missions.length === 0 && (
          <p className="rounded-xl border border-white/5 bg-slate-900/50 p-4 text-sm text-slate-400">
            No missions planned yet. Rally your captains and troops!
          </p>
        )}
        {missions.map((mission) => {
          const captain = assignedCaptain(mission);
          const troopsAssigned = assignedTroops(mission);
          return (
            <div key={mission.id} className="glass-section flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{mission.name}</h3>
                  <p className="text-sm text-slate-400">
                    {mission.category} · {mission.scale}
                  </p>
                  {mission.description && (
                    <p className="text-xs text-slate-500">{mission.description}</p>
                  )}
                  {mission.result && (
                    <p className="text-sm font-semibold text-emerald-300">
                      Result: {mission.result}{" "}
                      {mission.roll !== undefined && `(${mission.roll} roll)`}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-slate-300">
                  <label className="text-xs uppercase text-slate-500">Modifier</label>
                  <input
                    type="number"
                    value={mission.modifier}
                    onChange={(event) =>
                      updateMission(mission.id, { modifier: Number(event.target.value) })
                    }
                    className="input-field w-24 rounded-full text-right"
                    readOnly={isLocked}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoll(mission)}
                      disabled={isLocked}
                      className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Roll Mission
                    </button>
                    <button
                      onClick={() => deleteMission(mission.id)}
                      disabled={isLocked}
                      className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3">
                  <h4 className="text-sm font-semibold text-white">Captain</h4>
                  <p className="text-xs text-slate-500">
                    Assign a captain to lead this mission.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {captains.map((captainOption) => {
                      const isAssigned = captainOption.assignedMissionId === mission.id;
                      return (
                        <button
                          key={captainOption.id}
                          onClick={() => {
                            if (isLocked) return;
                            toggleCaptainAssignment(mission.id, captainOption.id);
                          }}
                          disabled={isLocked}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isAssigned
                              ? "border-indigo-400/70 bg-indigo-500/20 text-white"
                              : "border-white/10 bg-slate-900/50 text-slate-200 hover:border-indigo-400 hover:bg-slate-900/70 hover:text-white"
                          }`}
                        >
                          {captainOption.name}
                        </button>
                      );
                    })}
                  </div>
                  {captain && (
                    <p className="mt-2 text-xs text-slate-400">{captain.specialty}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3">
                  <h4 className="text-sm font-semibold text-white">Troops</h4>
                  <p className="text-xs text-slate-500">
                    Select which units participate. Successes increase mission experience.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {troops.map((troop) => {
                      const isAssigned = mission.assignedTroopIds.includes(troop.id);
                      return (
                        <button
                          key={troop.id}
                          onClick={() => {
                            if (isLocked) return;
                            toggleTroopAssignment(mission.id, troop.id);
                          }}
                          disabled={isLocked}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isAssigned
                              ? "border-indigo-400/70 bg-indigo-500/20 text-white"
                              : "border-white/10 bg-slate-900/50 text-slate-200 hover:border-indigo-400 hover:bg-slate-900/70 hover:text-white"
                          }`}
                          title={`Status: ${troop.status}`}
                        >
                          {troop.name}
                        </button>
                      );
                    })}
                  </div>
                  {troopsAssigned.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-xs text-slate-400">
                      {troopsAssigned.map((troop) => (
                        <li key={troop.id}>
                          {troop.name} · {troop.status} · {troop.advantages}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Outcome Notes
                </label>
                <textarea
                  value={mission.consequences ?? ""}
                  onChange={(event) =>
                    updateMission(mission.id, { consequences: event.target.value })
                  }
                  rows={2}
                  className="input-field mt-1 w-full"
                  readOnly={isLocked}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
