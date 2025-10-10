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
  const { active, capacity: trainingCapacity } = useStrongholdStore(
    selectors.trainingSummary
  );

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
    <section className="flex flex-col gap-4 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Dashboard</h2>
          <p className="text-sm text-ink/70">
            Review the current state of your stronghold at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-ink/80">
          <span className="rounded-full bg-white/80 px-3 py-1">
            Work Orders {used}/{capacity}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1">
            Training {active}/{trainingCapacity}
          </span>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4">
          <h3 className="text-lg font-semibold text-ink">Resources</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {RESOURCE_TYPES.map((type) => (
              <div key={type} className="rounded-xl bg-white/70 px-3 py-2 text-sm">
                <p className="text-xs uppercase text-ink/60">
                  {RESOURCE_LABELS[type]}
                </p>
                <p className="text-xl font-semibold text-ink">{resources[type]}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4">
          <h3 className="text-lg font-semibold text-ink">Projects</h3>
          <div>
            <h4 className="text-xs font-semibold uppercase text-ink/60">
              In Progress
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {activeProjects.length === 0 && (
                <li className="rounded-xl bg-white/70 px-3 py-2 text-sm text-ink/70">
                  No active projects.
                </li>
              )}
              {activeProjects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-xl bg-white/70 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-ink">{project.name}</span>
                    <span className="text-xs text-ink/60">
                      {project.progress}/{project.turnsRequired} turns
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-ink/60">
              Completed
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {completedProjects.length === 0 && (
                <li className="rounded-xl bg-white/70 px-3 py-2 text-sm text-ink/70">
                  No completed projects yet.
                </li>
              )}
              {completedProjects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-xl bg-white/70 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-ink">{project.name}</span>
                    <span className="text-xs text-ink/60">
                      Turn {project.completedTurn}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4">
          <h3 className="text-lg font-semibold text-ink">Recruitment</h3>
          <div>
            <h4 className="text-xs font-semibold uppercase text-ink/60">
              Training
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {activeRecruitments.length === 0 && (
                <li className="rounded-xl bg-white/70 px-3 py-2 text-sm text-ink/70">
                  No units in training.
                </li>
              )}
              {activeRecruitments.map((recruitment) => (
                <li
                  key={recruitment.id}
                  className="rounded-xl bg-white/70 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-ink">
                      {recruitment.name}
                    </span>
                    <span className="text-xs text-ink/60">
                      {recruitment.progress}/{recruitment.turnsRequired} turns
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-ink/60">
              Ready Forces
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {completedRecruitments.length === 0 && (
                <li className="rounded-xl bg-white/70 px-3 py-2 text-sm text-ink/70">
                  No completed recruits yet.
                </li>
              )}
              {completedRecruitments.map((recruitment) => (
                <li
                  key={recruitment.id}
                  className="rounded-xl bg-white/70 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-ink">
                      {recruitment.name}
                    </span>
                    <span className="text-xs text-ink/60">
                      Turn {recruitment.completedTurn}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4">
          <h3 className="text-lg font-semibold text-ink">Recent Outcomes</h3>
          <div>
            <h4 className="text-xs font-semibold uppercase text-ink/60">
              Completed Missions
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {completedMissions.length === 0 && (
                <li className="rounded-xl bg-white/70 px-3 py-2 text-sm text-ink/70">
                  No completed missions recorded.
                </li>
              )}
              {completedMissions.map((mission) => (
                <li
                  key={mission.id}
                  className="rounded-xl bg-white/70 px-3 py-2 text-sm"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-ink">
                        {mission.name}
                      </span>
                      <span className="text-xs text-ink/60">Turn {mission.turn}</span>
                    </div>
                    {mission.result && (
                      <p className="text-xs text-ink/70">Result: {mission.result}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-ink/60">
              Resolved Events
            </h4>
            <ul className="mt-2 flex flex-col gap-2">
              {resolvedEvents.length === 0 && (
                <li className="rounded-xl bg-white/70 px-3 py-2 text-sm text-ink/70">
                  No events have been resolved.
                </li>
              )}
              {resolvedEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl bg-white/70 px-3 py-2 text-sm"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-ink">{event.title}</span>
                      <span className="text-xs text-ink/60">Turn {event.turn}</span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-ink/70">{event.description}</p>
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

