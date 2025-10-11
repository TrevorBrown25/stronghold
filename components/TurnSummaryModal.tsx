"use client";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { useStrongholdStore } from "@/lib/store";

interface TurnSummaryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TurnSummaryModal({ open, onClose, onConfirm }: TurnSummaryModalProps) {
  const missions = useStrongholdStore((state) => state.missions);
  const projects = useStrongholdStore((state) => state.projects);
  const recruitments = useStrongholdStore((state) => state.recruitments);
  const resources = useStrongholdStore((state) => state.resources);
  const events = useStrongholdStore((state) => state.events);
  const isLocked = useEditLockStore(selectIsLocked);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-[0_35px_70px_-35px_rgba(0,0,0,0.9)]">
        <h2 className="font-display text-3xl text-white">Turn Summary</h2>
        <p className="text-sm text-slate-300">
          Review the turn&rsquo;s highlights before advancing the calendar.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SummaryCard title="Resources">
            <ul className="text-sm text-slate-200">
              <li>Wealth: {resources.wealth}</li>
              <li>Supplies: {resources.supplies}</li>
              <li>Loyalty: {resources.loyalty}</li>
            </ul>
          </SummaryCard>
          <SummaryCard title="Missions">
            {missions.length === 0 ? (
              <p className="text-sm text-slate-400">No missions run this turn.</p>
            ) : (
              <ul className="text-sm text-slate-200">
                {missions.map((mission) => (
                  <li key={mission.id}>
                    {mission.name}: {mission.result ?? "Pending"}
                  </li>
                ))}
              </ul>
            )}
          </SummaryCard>
          <SummaryCard title="Projects">
            {projects.length === 0 ? (
              <p className="text-sm text-slate-400">No construction underway.</p>
            ) : (
              <ul className="text-sm text-slate-200">
                {projects.map((project) => (
                  <li key={project.id}>
                    {project.name}: {project.progress}/{project.turnsRequired} turns
                  </li>
                ))}
              </ul>
            )}
          </SummaryCard>
          <SummaryCard title="Recruitment">
            {recruitments.length === 0 ? (
              <p className="text-sm text-slate-400">No active recruitment.</p>
            ) : (
              <ul className="text-sm text-slate-200">
                {recruitments.map((rec) => (
                  <li key={rec.id}>
                    {rec.name}: {rec.progress}/{rec.turnsRequired}
                  </li>
                ))}
              </ul>
            )}
          </SummaryCard>
          <SummaryCard title="Events" className="md:col-span-2">
            {events.length === 0 ? (
              <p className="text-sm text-slate-400">No new events logged.</p>
            ) : (
              <ul className="text-sm text-slate-200">
                {events
                  .slice()
                  .reverse()
                  .map((event) => (
                    <li key={event.id}>
                      {event.title} — {event.resolved ? "Resolved" : "Pending"}
                    </li>
                  ))}
              </ul>
            )}
          </SummaryCard>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLocked}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Advance Turn
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  children,
  className
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-section ${className ?? ""}`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}
