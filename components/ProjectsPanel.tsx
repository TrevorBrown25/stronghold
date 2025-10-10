"use client";

import { useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { selectors, useStrongholdStore } from "@/lib/store";
import type { ProjectInstance, ProjectTemplate } from "@/lib/types";

function formatCost(cost: ProjectTemplate["cost"]) {
  const parts = Object.entries(cost).map(([key, value]) => `${value} ${key}`);
  return parts.length ? parts.join(", ") : "—";
}

function tierLabel(tier: ProjectTemplate["tier"]) {
  switch (tier) {
    case "standard":
      return "Standard";
    case "advanced":
      return "Advanced";
    case "wonder":
      return "Wonder";
  }
}

export function ProjectsPanel() {
  const projects = useStrongholdStore((state) => state.projects);
  const startProject = useStrongholdStore((state) => state.startProject);
  const advanceProject = useStrongholdStore((state) => state.advanceProject);
  const rushProject = useStrongholdStore((state) => state.rushProject);
  const removeProject = useStrongholdStore((state) => state.removeProject);
  const available = selectors.availableProjects();
  const [selected, setSelected] = useState<string>(available[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const isLocked = useEditLockStore(selectIsLocked);

  const handleStart = () => {
    if (isLocked) return;
    const template = available.find((item) => item.id === selected);
    if (!template) return;
    try {
      startProject(template);
      setMessage(`Started ${template.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start project.");
    }
  };

  const handleAdvance = (project: ProjectInstance) => {
    if (isLocked) return;
    advanceProject(project.id);
    setMessage(`Advanced ${project.name}.`);
  };

  const handleRush = (project: ProjectInstance) => {
    if (isLocked) return;
    const result = rushProject(project.id);
    if (!result) {
      setMessage("Cannot rush this project right now.");
      return;
    }
    setMessage(
      result.success
        ? `Rush attempt rolled ${result.roll}. Success!`
        : `Rush attempt rolled ${result.roll}. No extra progress.`
    );
  };

  return (
    <section className="glass-panel flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-slate-100">Projects</h2>
          <p className="text-sm text-slate-400">
            Manage ongoing construction, upgrades, and wonders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="input-field rounded-full"
            disabled={isLocked}
          >
            {available.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({tierLabel(template.tier)})
              </option>
            ))}
          </select>
          <button
            onClick={handleStart}
            disabled={isLocked}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Project
          </button>
        </div>
      </header>
      {message && (
        <p className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">{message}</p>
      )}
      <div className="flex flex-col gap-3">
        {projects.length === 0 && (
          <p className="rounded-xl border border-white/5 bg-slate-900/50 p-4 text-sm text-slate-400">
            No active projects this turn. Use your Work Orders to begin new
            endeavors.
          </p>
        )}
        {projects.map((project) => {
          const progress = Math.round((project.progress / project.turnsRequired) * 100);
          return (
            <div
              key={project.id}
              className="glass-section flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-slate-400">Cost: {formatCost(project.cost)}</p>
                  <p className="text-xs text-slate-500">Effect: {project.effects}</p>
                  {project.completedTurn && (
                    <p className="text-xs font-semibold text-emerald-300">
                      Completed on Turn {project.completedTurn}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-slate-300">
                  <span className="text-slate-400">
                    Progress {project.progress}/{project.turnsRequired} turns
                  </span>
                  <div className="h-2 w-48 rounded-full bg-slate-800/60">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdvance(project)}
                      disabled={isLocked}
                      className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Advance
                    </button>
                    <button
                      onClick={() => handleRush(project)}
                      disabled={isLocked}
                      className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Rush
                    </button>
                    <button
                      onClick={() => removeProject(project.id)}
                      disabled={isLocked}
                      className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
