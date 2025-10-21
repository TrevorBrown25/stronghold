"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

import { CaptainsPanel } from "@/components/CaptainsPanel";
import { EditLockBanner } from "@/components/EditLockBanner";
import { DashboardPanel } from "@/components/DashboardPanel";
import { EventsPanel } from "@/components/EventsPanel";
import { IncomePanel } from "@/components/IncomePanel";
import { MissionsPanel } from "@/components/MissionsPanel";
import { PCNotesPanel } from "@/components/PCNotesPanel";
import { PhaseSidebar } from "@/components/PhaseSidebar";
import { ProjectsPanel } from "@/components/ProjectsPanel";
import { RecruitmentPanel } from "@/components/RecruitmentPanel";
import { ResourceTracker } from "@/components/ResourceTracker";
import { ResourceOverview } from "@/components/ResourceOverview";
import { TroopTable } from "@/components/TroopTable";
import { TroopMatchupsPanel } from "@/components/TroopMatchupsPanel";
import { TurnSummaryModal } from "@/components/TurnSummaryModal";
import { ResetConfirmationModal } from "@/components/ResetConfirmationModal";
import { SessionsPanel } from "@/components/SessionsPanel";
import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { subscribeToRefresh } from "@/lib/refreshChannel";
import { useSupabaseSync } from "@/lib/useSupabaseSync";
import { useStrongholdStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const activePhase = useStrongholdStore((state) => state.activePhase);
  const nextPhase = useStrongholdStore((state) => state.nextPhase);
  const completeTurn = useStrongholdStore((state) => state.completeTurn);
  const exportState = useStrongholdStore((state) => state.exportState);
  const resetCampaign = useStrongholdStore((state) => state.resetCampaign);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(true);
  const isLocked = useEditLockStore(selectIsLocked);
  const {
    status: syncStatus,
    error: syncError,
    lastSyncedAt,
    enabled: syncEnabled,
    pushUpdate,
    isUpdating
  } = useSupabaseSync("dm");

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const unsubscribe = subscribeToRefresh(() => {
      window.location.reload();
    });

    return () => {
      unsubscribe();
    };
  }, [isLocked]);

  const lastSyncedLabel = useMemo(() => {
    if (!lastSyncedAt) return null;
    return lastSyncedAt.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [lastSyncedAt]);

  const statusLabel = useMemo(() => {
    if (!syncEnabled) return "Sync Disabled";
    switch (syncStatus) {
      case "ready":
        return "Realtime Connected";
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
      return "Supabase credentials are missing. Changes will not be saved to the database.";
    }
    if (syncStatus === "error") {
      return syncError ?? "Realtime sync encountered an unknown error.";
    }
    if (syncStatus === "connecting") {
      return "Connecting to Supabase…";
    }
    if (lastSyncedLabel) {
      return `Last update at ${lastSyncedLabel}`;
    }
    return "Use Update Campaign to push your latest changes.";
  }, [lastSyncedLabel, syncEnabled, syncError, syncStatus]);

  const handleEndTurn = useCallback(() => {
    if (isLocked) return;
    setSummaryOpen(true);
  }, [isLocked]);

  const handleCloseSummary = useCallback(() => {
    setSummaryOpen(false);
  }, []);

  const handleConfirmTurn = useCallback(() => {
    if (isLocked) return;
    completeTurn();
    setSummaryOpen(false);
  }, [completeTurn, isLocked]);

  const handleExport = () => {
    if (isLocked) return;
    const data = exportState();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stronghold-save.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenResetConfirm = useCallback(() => {
    setResetConfirmOpen(true);
  }, []);

  const handleCloseResetConfirm = useCallback(() => {
    setResetConfirmOpen(false);
  }, []);

  const handleConfirmReset = useCallback(() => {
    resetCampaign();
    setResetConfirmOpen(false);
  }, [resetCampaign]);

  const handleNextPhase = () => {
    if (isLocked) return;
    nextPhase();
  };

  const handleManualUpdate = useCallback(async () => {
    if (isLocked || !pushUpdate) return;
    const result = await pushUpdate();
    if (!result.success && result.error) {
      console.error("Failed to update campaign:", result.error);
    }
  }, [isLocked, pushUpdate]);

  const handleSelectDm = useCallback(() => {
    setRoleModalOpen(false);
  }, []);

  const handleSelectPc = useCallback(() => {
    setRoleModalOpen(false);
    router.push("/viewer");
  }, [router]);

  const renderPhaseContent = () => {
    switch (activePhase) {
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
      case "Sessions":
        return <SessionsPanel />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6">
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900/90 p-6 text-center shadow-xl">
            <h2 className="text-xl font-semibold text-slate-100">Welcome to Stronghold</h2>
            <p className="mt-3 text-sm text-slate-300">
              Are you managing the campaign as the Dungeon Master or viewing it as a Player Character?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleSelectDm}
                className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-400"
              >
                I&apos;m the DM
              </button>
              <button
                onClick={handleSelectPc}
                className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-500/20"
              >
                I&apos;m a PC
              </button>
            </div>
          </div>
        </div>
      )}
      <EditLockBanner />
      <section className="mx-auto mb-4 w-full max-w-7xl">
        <div className="glass-panel flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
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
      </section>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
        <PhaseSidebar onCompleteTurn={handleEndTurn} />
        <div className="flex flex-1 flex-col gap-6">
          {activePhase === "Income & Edict" ? (
            <ResourceTracker />
          ) : activePhase !== "Dashboard" ? (
            <ResourceOverview />
          ) : null}
          {renderPhaseContent()}
          {activePhase === "Missions" && <CaptainsPanel />}
          {(activePhase === "Recruitment" || activePhase === "Missions") && (
            <>
              <TroopTable />
              <TroopMatchupsPanel />
            </>
          )}
          {!isLocked && (
            <div className="glass-panel flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                onClick={handleNextPhase}
                disabled={isLocked}
                className="rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(14,116,144,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next Phase
              </button>
              <button
                onClick={handleManualUpdate}
                disabled={isLocked || !pushUpdate || !syncEnabled || isUpdating}
                className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? "Updating…" : "Update Campaign"}
              </button>
              <button
                onClick={handleExport}
                disabled={isLocked}
                className="rounded-full border border-white/10 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export JSON
              </button>
              <button
                onClick={handleOpenResetConfirm}
                disabled={isLocked}
                className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset Campaign
              </button>
            </div>
          )}
        </div>
      </div>
      <TurnSummaryModal
        open={summaryOpen}
        onClose={handleCloseSummary}
        onConfirm={handleConfirmTurn}
      />
      <ResetConfirmationModal
        open={resetConfirmOpen}
        onCancel={handleCloseResetConfirm}
        onConfirm={handleConfirmReset}
      />
    </main>
  );
}
