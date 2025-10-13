"use client";

import { useEffect, useMemo } from "react";
import { clsx } from "clsx";

import { CaptainsPanel } from "@/components/CaptainsPanel";
import { DashboardPanel } from "@/components/DashboardPanel";
import { EventsPanel } from "@/components/EventsPanel";
import { IncomePanel } from "@/components/IncomePanel";
import { MissionsPanel } from "@/components/MissionsPanel";
import { PCNotesPanel } from "@/components/PCNotesPanel";
import { PhaseSidebar } from "@/components/PhaseSidebar";
import { ProjectsPanel } from "@/components/ProjectsPanel";
import { RecruitmentPanel } from "@/components/RecruitmentPanel";
import { ResourceOverview } from "@/components/ResourceOverview";
import { ResourceTracker } from "@/components/ResourceTracker";
import { TroopMatchupsPanel } from "@/components/TroopMatchupsPanel";
import { TroopTable } from "@/components/TroopTable";
import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { useSupabaseSync } from "@/lib/useSupabaseSync";
import { useStrongholdStore } from "@/lib/store";
import type { PhaseKey } from "@/lib/store";

function ViewerPhaseContent({ phase }: { phase: PhaseKey }) {
  switch (phase) {
    case "Dashboard":
      return <DashboardPanel />;
    case "Income & Edict":
      return <IncomePanel />;
    case "Projects":
      return <ProjectsPanel />;
    case "Recruitment":
      return <RecruitmentPanel />;
    case "PC Actions":
      return <PCNotesPanel />;
    case "Missions":
      return <MissionsPanel />;
    case "Events":
      return <EventsPanel />;
    default:
      return null;
  }
}

export default function ViewerPage() {
  const activePhase = useStrongholdStore((state) => state.activePhase);
  const lockEditing = useEditLockStore((state) => state.lock);
  const isLocked = useEditLockStore(selectIsLocked);
  const { status: syncStatus, error: syncError, lastSyncedAt, enabled: syncEnabled } =
    useSupabaseSync("viewer");

  useEffect(() => {
    if (!isLocked) {
      lockEditing();
    }
  }, [isLocked, lockEditing]);

  const lastSyncedLabel = useMemo(() => {
    if (!lastSyncedAt) return null;
    return lastSyncedAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [lastSyncedAt]);

  const statusLabel = useMemo(() => {
    if (!syncEnabled) return "Waiting";
    switch (syncStatus) {
      case "ready":
        return "Live";
      case "connecting":
        return "Connecting";
      case "error":
        return "Sync Error";
      default:
        return "Sync";
    }
  }, [syncEnabled, syncStatus]);

  const statusPillClass = useMemo(
    () =>
      clsx("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide", {
        "bg-slate-700/60 text-slate-300": !syncEnabled,
        "bg-emerald-500/20 text-emerald-200": syncEnabled && syncStatus === "ready",
        "bg-amber-500/20 text-amber-200": syncEnabled && syncStatus === "connecting",
        "bg-rose-500/20 text-rose-200": syncEnabled && syncStatus === "error"
      }),
    [syncEnabled, syncStatus]
  );

  const detailMessage = useMemo(() => {
    if (!syncEnabled) {
      return "Ask your DM to configure Supabase to enable live updates.";
    }
    if (syncStatus === "error") {
      return syncError ?? "Realtime sync encountered an unknown error.";
    }
    if (syncStatus === "connecting") {
      return "Connecting to the stronghold dashboard…";
    }
    if (lastSyncedLabel) {
      return `Last update at ${lastSyncedLabel}`;
    }
    return "Live view is ready.";
  }, [lastSyncedLabel, syncEnabled, syncError, syncStatus]);

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6">
      <section className="mx-auto mb-4 w-full max-w-7xl">
        <div className="glass-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl text-slate-100">Stronghold Viewer</h1>
            <p className="text-sm text-slate-400">
              Watch the stronghold change in real time while the DM controls the dashboard.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className={statusPillClass}>{statusLabel}</span>
            <span
              className={clsx(
                "text-xs sm:text-sm",
                syncEnabled && syncStatus === "error" ? "text-rose-300" : "text-slate-400"
              )}
            >
              {detailMessage}
            </span>
          </div>
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
        <PhaseSidebar onCompleteTurn={() => undefined} />
        <div className="flex flex-1 flex-col gap-6">
          {activePhase === "Income & Edict" ? (
            <ResourceTracker />
          ) : activePhase !== "Dashboard" ? (
            <ResourceOverview />
          ) : null}
          <ViewerPhaseContent phase={activePhase} />
          {activePhase === "Missions" && <CaptainsPanel />}
          {(activePhase === "Recruitment" || activePhase === "Missions") && (
            <>
              <TroopTable />
              <TroopMatchupsPanel />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
