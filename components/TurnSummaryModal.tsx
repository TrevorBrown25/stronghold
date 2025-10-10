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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-parchment p-6 shadow-2xl">
        <h2 className="font-display text-3xl">Turn Summary</h2>
        <p className="text-sm text-ink/70">
          Review the turn&rsquo;s highlights before advancing the calendar.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SummaryCard title="Resources">
            <ul className="text-sm text-ink/80">
              <li>Wealth: {resources.wealth}</li>
              <li>Supplies: {resources.supplies}</li>
              <li>Loyalty: {resources.loyalty}</li>
            </ul>
          </SummaryCard>
          <SummaryCard title="Missions">
            {missions.length === 0 ? (
              <p className="text-sm text-ink/70">No missions run this turn.</p>
            ) : (
              <ul className="text-sm text-ink/80">
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
              <p className="text-sm text-ink/70">No construction underway.</p>
            ) : (
              <ul className="text-sm text-ink/80">
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
              <p className="text-sm text-ink/70">No units in training.</p>
            ) : (
              <ul className="text-sm text-ink/80">
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
              <p className="text-sm text-ink/70">No new events logged.</p>
            ) : (
              <ul className="text-sm text-ink/80">
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
            className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold hover:bg-ink/20"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLocked}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink/30"
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
    <div className={`rounded-2xl bg-white/70 p-4 ${className ?? ""}`}>
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}
