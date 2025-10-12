"use client";

import { selectors, useStrongholdStore } from "@/lib/store";
import { RESOURCE_TYPES, type ResourceType } from "@/lib/types";

const RESOURCE_LABELS: Record<ResourceType, string> = {
  wealth: "Wealth",
  supplies: "Supplies",
  loyalty: "Loyalty"
};

export function DashboardPanel() {
  const resources = useStrongholdStore((state) => state.resources);
  const projects = useStrongholdStore((state) => state.projects);
  const recruitments = useStrongholdStore((state) => state.recruitments);
  const missions = useStrongholdStore((state) => state.missions);
  const events = useStrongholdStore((state) => state.events);
  const { used, capacity } = useStrongholdStore(selectors.workOrderSummary);
  const { inProgress, ready: readyRecruits, capacity: recruitmentCapacity } =
    useStrongholdStore(selectors.recruitmentSummary);
  const readyForces = useStrongholdStore(selectors.readyForces);

  const activeProjects = projects.filter((project) => !project.completedTurn);
  const completedProjects = projects
    .filter((project) => project.completedTurn)
    .slice()
    .sort((a, b) => (b.completedTurn ?? 0) - (a.completedTurn ?? 0));

  const activeRecruitments = recruitments.filter(
    (recruitment) => !recruitment.completedTurn
  );
  const completedRecruitments = recruitments
    .filter((recruitment) => recruitment.completedTurn)
    .slice()
    .sort((a, b) => (b.completedTurn ?? 0) - (a.completedTurn ?? 0));

  const completedMissions = missions
    .filter((mission) => mission.result)
    .slice()
    .sort((a, b) => b.turn - a.turn);

  const resolvedEvents = events
    .filter((event) => event.resolved)
    .slice()
    .sort((a, b) => b.turn - a.turn);

  return (
    <section className="glass-panel flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-slate-100">Dashboard</h2>
          <p className="text-sm text-slate-400">
            Review the current state of your stronghold at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
          <span className="glass-badge text-xs">
            Work Orders {used}/{capacity}
          </span>
          <span className="glass-badge text-xs">
            Recruiting {inProgress}/{recruitmentCapacity}
          </span>
          <span className="glass-badge text-xs">Ready Forces {readyForces}</span>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-section flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Resources</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {RESOURCE_TYPES.map((type) => (
              <div
                key={type}
                className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-300"
              >
                <p className="text-xs uppercase text-slate-500">
                  {RESOURCE_LABELS[type]}
                </p>
                <p className="text-xl font-semibold text-white">{resources[type]}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="glass-section flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Projects</h3>
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-500">
              In Progress
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {activeProjects.length === 0 && (
                <li className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
                  No active projects.
                </li>
              )}
              {activeProjects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">{project.name}</span>
                    <span className="text-xs text-slate-500">
                      {project.progress}/{project.turnsRequired} turns
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-500">
              Completed
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {completedProjects.length === 0 && (
                <li className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
                  No completed projects yet.
                </li>
              )}
              {completedProjects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">{project.name}</span>
                    <span className="text-xs text-slate-500">
                      Turn {project.completedTurn}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="glass-section flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Recruitment</h3>
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-500">
              Recruiting
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {activeRecruitments.length === 0 && (
                <li className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
                  No active recruitment orders.
                </li>
              )}
              {activeRecruitments.map((recruitment) => (
                <li
                  key={recruitment.id}
                  className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">
                      {recruitment.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {recruitment.progress}/{recruitment.turnsRequired} turns
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-500">
              Ready Recruits ({readyRecruits})
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {completedRecruitments.length === 0 && (
                <li className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
                  No ready recruits yet.
                </li>
              )}
              {completedRecruitments.map((recruitment) => (
                <li
                  key={recruitment.id}
                  className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">
                      {recruitment.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      Turn {recruitment.completedTurn}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="glass-section flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Recent Outcomes</h3>
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-500">
              Completed Missions
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {completedMissions.length === 0 && (
                <li className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
                  No completed missions recorded.
                </li>
              )}
              {completedMissions.map((mission) => (
                <li
                  key={mission.id}
                  className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-white">
                        {mission.name}
                      </span>
                      <span className="text-xs text-slate-500">Turn {mission.turn}</span>
                    </div>
                    {mission.result && (
                      <p className="text-xs text-slate-400">Result: {mission.result}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-500">
              Resolved Events
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {resolvedEvents.length === 0 && (
                <li className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
                  No events have been resolved.
                </li>
              )}
              {resolvedEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-white">{event.title}</span>
                      <span className="text-xs text-slate-500">Turn {event.turn}</span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-slate-400">{event.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </section>
  );
}

