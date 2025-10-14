"use client";

import { useMemo, type ReactNode } from "react";
import { clsx } from "clsx";

import { selectors, useStrongholdStore } from "@/lib/store";
import {
  RESOURCE_TYPES,
  type ResourceType,
  type RecruitmentInstance,
  type ProjectInstance,
  type Mission,
  type EventEntry,
  type NoteEntry,
  type Captain,
  type Troop
} from "@/lib/types";

const RESOURCE_LABELS: Record<ResourceType, string> = {
  wealth: "Wealth",
  supplies: "Supplies",
  loyalty: "Loyalty"
};

function SummaryCard({
  title,
  value,
  detail
}: {
  title: string;
  value: string;
  detail?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-400">{detail}</p> : null}
    </div>
  );
}

function SectionShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-panel flex flex-col gap-4">
      <header>
        <h2 className="font-display text-2xl text-slate-100">{title}</h2>
        <p className="text-sm text-slate-400">{description}</p>
      </header>
      {children}
    </section>
  );
}

function MissionAssignment({
  mission,
  captains,
  troops
}: {
  mission: Mission;
  captains: Map<string, Captain>;
  troops: Map<string, Troop>;
}) {
  const captainName = mission.assignedCaptainId
    ? captains.get(mission.assignedCaptainId)?.name ?? "Unassigned"
    : "Unassigned";

  const assignedTroops = mission.assignedTroopIds
    .map((id) => troops.get(id)?.name ?? "Unknown unit")
    .join(", ");

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {mission.category}
          </p>
          <h4 className="text-lg font-semibold text-white">{mission.name}</h4>
        </div>
        <span className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
          {mission.scale}
        </span>
      </div>
      {mission.description ? (
        <p className="text-sm text-slate-300">{mission.description}</p>
      ) : null}
      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <p>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Captain: </span>
          {captainName}
        </p>
        <p>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Troops: </span>
          {assignedTroops || "None"}
        </p>
      </div>
      <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
        <p>Modifier: {mission.modifier >= 0 ? `+${mission.modifier}` : mission.modifier}</p>
        <p>Last Roll: {mission.roll ?? "—"}</p>
        <p>Turn: {mission.turn}</p>
      </div>
      {mission.result ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          <p className="font-semibold uppercase tracking-wide text-emerald-300">Result</p>
          <p className="text-emerald-100">{mission.result}</p>
          {mission.consequences ? (
            <p className="mt-1 text-xs text-emerald-200/80">Consequence: {mission.consequences}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function EventList({ title, events }: { title: string; events: EventEntry[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {events.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">No events.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                <span className="text-xs text-slate-400">Turn {event.turn}</span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{event.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NoteList({ notes }: { notes: NoteEntry[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Campaign Notes</h3>
      {notes.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
          No player notes recorded yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">{note.player}</span>
                <span>Turn {note.turn}</span>
              </div>
              <p className="mt-1 text-sm text-slate-300 whitespace-pre-line">{note.details}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TurnHistoryList({ history }: { history: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Turn Log</h3>
      {history.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
          No turn summaries yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {history.map((entry, index) => (
            <li
              key={`${entry}-${index}`}
              className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-300"
            >
              {entry}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectList({
  title,
  projects
}: {
  title: string;
  projects: ProjectInstance[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {projects.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
          No entries.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => {
            const progress = Math.round((project.progress / project.turnsRequired) * 100);
            return (
              <li
                key={project.id}
                className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{project.name}</h4>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tier: {project.tier}</p>
                  </div>
                  <span className="text-xs text-slate-400">Started Turn {project.startedTurn}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">Cost: {Object.entries(project.cost).length ? Object.entries(project.cost).map(([key, value]) => `${value} ${key}`).join(", ") : "—"}</p>
                <p className="text-xs text-slate-400">Effect: {project.effects}</p>
                {project.completedTurn ? (
                  <p className="mt-2 text-xs font-semibold text-emerald-200">
                    Completed on Turn {project.completedTurn}
                  </p>
                ) : (
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progress {project.progress}/{project.turnsRequired} turns</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800/60">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RecruitmentList({
  title,
  recruitments,
  badge
}: {
  title: string;
  recruitments: RecruitmentInstance[];
  badge?: (recruitment: RecruitmentInstance) => ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {recruitments.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
          No entries.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recruitments.map((recruitment) => (
            <li
              key={recruitment.id}
              className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-lg font-semibold text-white">{recruitment.name}</h4>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{recruitment.type}</p>
                </div>
                {badge ? badge(recruitment) : null}
              </div>
              <p className="mt-1 text-sm text-slate-300">Training Time: {recruitment.turnsRequired} turns</p>
              <p className="text-xs text-slate-400">Result: {recruitment.result}</p>
              {recruitment.completedTurn ? (
                <p className="mt-2 text-xs font-semibold text-emerald-200">
                  Completed on Turn {recruitment.completedTurn}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-400">
                  Progress {recruitment.progress}/{recruitment.turnsRequired} turns
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function statusBadgeClass(status: Troop["status"]) {
  return clsx(
    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
    {
      "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200": status === "active",
      "border border-sky-400/40 bg-sky-500/10 text-sky-200": status === "deployed",
      "border border-amber-400/40 bg-amber-500/10 text-amber-200": status === "recovering"
    }
  );
}

export function ViewerDashboard() {
  const turn = useStrongholdStore((state) => state.turn);
  const activePhase = useStrongholdStore((state) => state.activePhase);
  const festivalUsed = useStrongholdStore((state) => state.festivalUsed);
  const income = useStrongholdStore((state) => state.income);
  const incomeTurn = useStrongholdStore((state) => state.incomeTurn);
  const edict = useStrongholdStore((state) => state.edict);
  const edictTurn = useStrongholdStore((state) => state.edictTurn);
  const resources = useStrongholdStore((state) => state.resources);
  const projects = useStrongholdStore((state) => state.projects);
  const recruitments = useStrongholdStore((state) => state.recruitments);
  const captains = useStrongholdStore((state) => state.captains);
  const troops = useStrongholdStore((state) => state.troops);
  const missions = useStrongholdStore((state) => state.missions);
  const events = useStrongholdStore((state) => state.events);
  const notes = useStrongholdStore((state) => state.notes);
  const turnHistory = useStrongholdStore((state) => state.turnHistory);
  const workOrderSummary = useStrongholdStore(selectors.workOrderSummary);
  const recruitmentSummary = useStrongholdStore(selectors.recruitmentSummary);
  const readyForces = useStrongholdStore(selectors.readyForces);

  const troopById = useMemo(
    () => new Map(troops.map((troop) => [troop.id, troop])),
    [troops]
  );

  const activeProjects = useMemo(
    () => projects.filter((project) => !project.completedTurn),
    [projects]
  );
  const completedProjects = useMemo(
    () =>
      projects
        .filter((project) => project.completedTurn)
        .slice()
        .sort((a, b) => (b.completedTurn ?? 0) - (a.completedTurn ?? 0)),
    [projects]
  );

  const activeRecruitments = useMemo(
    () => recruitments.filter((recruitment) => !recruitment.completedTurn),
    [recruitments]
  );
  const completedRecruitments = useMemo(
    () =>
      recruitments
        .filter((recruitment) => recruitment.completedTurn)
        .slice()
        .sort((a, b) => (b.completedTurn ?? 0) - (a.completedTurn ?? 0)),
    [recruitments]
  );

  const readyRecruitments = useMemo(() => {
    const matchedFallback = new Set<string>();
    return completedRecruitments.filter((recruitment) => {
      if (recruitment.convertedTroopId) {
        const troop = troopById.get(recruitment.convertedTroopId);
        if (troop) {
          matchedFallback.add(troop.id);
        }
        return troop?.status === "active";
      }

      const fallbackTroop = troops.find((troop) => {
        if (matchedFallback.has(troop.id)) return false;
        return troop.name === recruitment.name && troop.tier === recruitment.type;
      });

      if (!fallbackTroop) {
        return false;
      }

      matchedFallback.add(fallbackTroop.id);
      return fallbackTroop.status === "active";
    });
  }, [completedRecruitments, troops, troopById]);

  const recruitmentStatuses = useMemo(() => {
    const matchedFallback = new Set<string>();
    return completedRecruitments.reduce<Map<string, Troop["status"] | "retired">>(
      (acc, recruitment) => {
        if (recruitment.convertedTroopId) {
          const troop = troopById.get(recruitment.convertedTroopId);
          if (troop) {
            matchedFallback.add(troop.id);
            acc.set(recruitment.id, troop.status);
          } else {
            acc.set(recruitment.id, "retired");
          }
          return acc;
        }

        const fallbackTroop = troops.find((troop) => {
          if (matchedFallback.has(troop.id)) return false;
          return troop.name === recruitment.name && troop.tier === recruitment.type;
        });

        if (fallbackTroop) {
          matchedFallback.add(fallbackTroop.id);
          acc.set(recruitment.id, fallbackTroop.status);
        } else {
          acc.set(recruitment.id, "retired");
        }

        return acc;
      },
      new Map()
    );
  }, [completedRecruitments, troops, troopById]);

  const statusCounts = useMemo(() => {
    return troops.reduce(
      (acc, troop) => {
        acc[troop.status] += 1;
        return acc;
      },
      { active: 0, deployed: 0, recovering: 0 }
    );
  }, [troops]);

  const tierCounts = useMemo(() => {
    return troops.reduce<Record<string, number>>((acc, troop) => {
      acc[troop.tier] = (acc[troop.tier] ?? 0) + 1;
      return acc;
    }, {});
  }, [troops]);

  const captainById = useMemo(
    () => new Map(captains.map((captain) => [captain.id, captain])),
    [captains]
  );
  const missionById = useMemo(
    () => new Map(missions.map((mission) => [mission.id, mission])),
    [missions]
  );

  const activeMissions = useMemo(
    () =>
      missions
        .filter((mission) => !mission.result)
        .slice()
        .sort((a, b) => b.turn - a.turn),
    [missions]
  );
  const resolvedMissions = useMemo(
    () =>
      missions
        .filter((mission) => mission.result)
        .slice()
        .sort((a, b) => b.turn - a.turn),
    [missions]
  );

  const unresolvedEvents = useMemo(
    () => events.filter((event) => !event.resolved),
    [events]
  );
  const resolvedEvents = useMemo(
    () =>
      events
        .filter((event) => event.resolved)
        .slice()
        .sort((a, b) => b.turn - a.turn),
    [events]
  );

  const sortedNotes = useMemo(
    () =>
      notes
        .slice()
        .sort((a, b) => {
          if (b.turn === a.turn) {
            return a.player.localeCompare(b.player);
          }
          return b.turn - a.turn;
        }),
    [notes]
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionShell
        title="Stronghold Status"
        description="Live overview of the campaign state."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Turn" value={`Turn ${turn}`} detail={`Current Phase: ${activePhase}`} />
          <SummaryCard
            title="Festival"
            value={festivalUsed ? "Celebrated" : "Available"}
            detail={festivalUsed ? "Festival has been used this turn." : "Festival can still be celebrated."}
          />
          <SummaryCard
            title="Income"
            value={income ?? "Not selected"}
            detail={incomeTurn ? `Applied on Turn ${incomeTurn}` : "Awaiting selection."}
          />
          <SummaryCard
            title="Edict"
            value={edict ?? "Not declared"}
            detail={edictTurn ? `Declared on Turn ${edictTurn}` : "No edict in effect."}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryCard
            title="Work Orders"
            value={`${workOrderSummary.used}/${workOrderSummary.capacity}`}
            detail="Projects currently consuming work order slots."
          />
          <SummaryCard
            title="Training Capacity"
            value={`${recruitmentSummary.inProgress}/${recruitmentSummary.capacity}`}
            detail={`Ready Recruits: ${recruitmentSummary.ready}`}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RESOURCE_TYPES.map((type) => (
            <SummaryCard
              key={type}
              title={`Resource — ${RESOURCE_LABELS[type]}`}
              value={resources[type].toString()}
              detail="Maximum 5"
            />
          ))}
          <SummaryCard
            title="Ready Forces"
            value={`${readyForces}`}
            detail="Troops currently available for missions."
          />
        </div>
      </SectionShell>

      <SectionShell
        title="Projects"
        description="Construction, research, and wonder progress."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ProjectList title="Active Projects" projects={activeProjects} />
          <ProjectList title="Completed Projects" projects={completedProjects} />
        </div>
      </SectionShell>

      <SectionShell
        title="Recruitment & Training"
        description="Current orders and available reinforcements."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <RecruitmentList title="Active Recruitment" recruitments={activeRecruitments} />
      <RecruitmentList
        title="Ready Recruits"
        recruitments={readyRecruitments}
        badge={(_recruitment) => (
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Ready for Duty
          </span>
        )}
      />
      <RecruitmentList
        title="Recruitment History"
        recruitments={completedRecruitments}
        badge={(recruitment) => {
          const status = recruitmentStatuses.get(recruitment.id);
          if (!status || status === "retired") {
            return (
              <span className="rounded-full border border-slate-500/40 bg-slate-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                Awaiting Muster
              </span>
            );
          }
          return (
            <span className={statusBadgeClass(status)}>
              {`Troop ${status}`}
            </span>
          );
        }}
      />
    </div>
  </SectionShell>

      <SectionShell
        title="Military Forces"
        description="Troop readiness and roster details."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard title="Active" value={`${statusCounts.active}`} detail="Standing forces ready to deploy." />
          <SummaryCard title="Deployed" value={`${statusCounts.deployed}`} detail="Units currently on missions." />
          <SummaryCard title="Recovering" value={`${statusCounts.recovering}`} detail="Units recuperating from losses." />
        </div>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400">
          {Object.entries(tierCounts).map(([tier, count]) => (
            <span key={tier} className="glass-badge">
              {tier} {count}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-200">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Advantages</th>
                <th className="px-3 py-2 text-center">Missions</th>
                <th className="px-3 py-2 text-right">Recovering Until</th>
              </tr>
            </thead>
            <tbody>
              {troops.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-center text-sm text-slate-400"
                  >
                    No troops enlisted yet.
                  </td>
                </tr>
              ) : (
                troops.map((troop) => (
                  <tr key={troop.id} className="border-b border-white/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-white">{troop.name}</td>
                    <td className="px-3 py-2 capitalize text-slate-300">{troop.tier}</td>
                    <td className="px-3 py-2">
                      <span className={statusBadgeClass(troop.status)}>{troop.status}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{troop.type}</td>
                    <td className="px-3 py-2 text-xs text-slate-400">{troop.advantages || "—"}</td>
                    <td className="px-3 py-2 text-center text-slate-300">{troop.missionsCompleted}</td>
                    <td className="px-3 py-2 text-right text-xs text-slate-400">
                      {troop.recoveringUntilTurn ? `Turn ${troop.recoveringUntilTurn}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionShell>

      <SectionShell
        title="Missions"
        description="Operations currently underway and recent outcomes."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Missions</h3>
            {activeMissions.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                No missions are currently in progress.
              </p>
            ) : (
              activeMissions.map((mission) => (
                <MissionAssignment
                  key={mission.id}
                  mission={mission}
                  captains={captainById}
                  troops={troopById}
                />
              ))
            )}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resolved Missions</h3>
            {resolvedMissions.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                No mission results yet.
              </p>
            ) : (
              resolvedMissions.map((mission) => (
                <MissionAssignment
                  key={mission.id}
                  mission={mission}
                  captains={captainById}
                  troops={troopById}
                />
              ))
            )}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        title="Command Staff"
        description="Captains and their current assignments."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {captains.length === 0 ? (
            <p className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
              No captains recruited yet.
            </p>
          ) : (
            captains.map((captain) => {
              const assignedMission =
                captain.assignedMissionId && missionById.get(captain.assignedMissionId);
              return (
                <div
                  key={captain.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{captain.name}</h4>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {captain.specialty}
                      </p>
                    </div>
                    {captain.traits?.length ? (
                      <span className="glass-badge text-[11px]">
                        {captain.traits.join(" • ")}
                      </span>
                    ) : null}
                  </div>
                  {captain.notes ? (
                    <p className="text-xs text-slate-400">{captain.notes}</p>
                  ) : null}
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assignment
                  </p>
                  <p className="text-sm text-slate-300">
                    {assignedMission ? assignedMission.name : "Unassigned"}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </SectionShell>

      <SectionShell
        title="Events & Campaign Log"
        description="Active threats, resolved incidents, and campaign history."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <EventList title="Active Events" events={unresolvedEvents} />
          <EventList title="Resolved Events" events={resolvedEvents} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <NoteList notes={sortedNotes} />
          <TurnHistoryList history={turnHistory} />
        </div>
      </SectionShell>
    </div>
  );
}
