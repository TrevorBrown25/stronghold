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
    <section className="flex flex-col gap-4 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Projects</h2>
          <p className="text-sm text-ink/70">
            Manage ongoing construction, upgrades, and wonders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="rounded-full border border-ink/20 bg-white px-3 py-2 text-sm"
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
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            Start Project
          </button>
        </div>
      </header>
      {message && (
        <p className="rounded-xl bg-ink/5 px-3 py-2 text-sm text-ink/80">{message}</p>
      )}
      <div className="flex flex-col gap-3">
        {projects.length === 0 && (
          <p className="rounded-xl bg-white/60 p-4 text-sm text-ink/70">
            No active projects this turn. Use your Work Orders to begin new
            endeavors.
          </p>
        )}
        {projects.map((project) => {
          const progress = Math.round((project.progress / project.turnsRequired) * 100);
          return (
            <div
              key={project.id}
              className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-ink/70">Cost: {formatCost(project.cost)}</p>
                  <p className="text-xs text-ink/60">Effect: {project.effects}</p>
                  {project.completedTurn && (
                    <p className="text-xs font-semibold text-emerald-700">
                      Completed on Turn {project.completedTurn}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 text-sm">
                  <span>
                    Progress {project.progress}/{project.turnsRequired} turns
                  </span>
                  <div className="h-2 w-48 rounded-full bg-ink/10">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdvance(project)}
                      disabled={isLocked}
                      className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold hover:bg-ink/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Advance
                    </button>
                    <button
                      onClick={() => handleRush(project)}
                      disabled={isLocked}
                      className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold hover:bg-ink/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Rush
                    </button>
                    <button
                      onClick={() => removeProject(project.id)}
                      disabled={isLocked}
                      className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
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
