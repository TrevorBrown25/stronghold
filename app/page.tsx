"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent
} from "react";
import Link from "next/link";
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
import { PHASES, useStrongholdStore } from "@/lib/store";
import type { PhaseKey, StrongholdData } from "@/lib/store";
import { RESOURCE_TYPES } from "@/lib/types";
import type { EdictType, IncomeType } from "@/lib/types";

const INCOME_TYPES: readonly IncomeType[] = [
  "Collect Taxes",
  "Trade Commodities",
  "Purchase Reserves",
  "Supply Expedition"
];

const EDICT_TYPES: readonly EdictType[] = [
  "Harvest",
  "Trade",
  "Town Hall",
  "Draft"
];

const PHASE_SET = new Set<PhaseKey>(PHASES);
const INCOME_TYPE_SET = new Set<IncomeType>(INCOME_TYPES);
const EDICT_TYPE_SET = new Set<EdictType>(EDICT_TYPES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateStrongholdData(value: unknown): StrongholdData {
  if (!isRecord(value)) {
    throw new Error("Imported JSON must describe a Stronghold snapshot object.");
  }

  const candidate = value as Partial<StrongholdData>;

  if (typeof candidate.turn !== "number" || !Number.isFinite(candidate.turn)) {
    throw new Error("The snapshot's turn value must be a number.");
  }

  if (typeof candidate.activePhase !== "string" || !PHASE_SET.has(candidate.activePhase as PhaseKey)) {
    throw new Error("The snapshot's active phase is not recognized.");
  }

  const resourcesCandidate = (value as Record<string, unknown>).resources;
  if (!isRecord(resourcesCandidate)) {
    throw new Error("Resources must be provided as an object.");
  }

  const resources = {} as Record<(typeof RESOURCE_TYPES)[number], number>;

  for (const resource of RESOURCE_TYPES) {
    const amount = (resourcesCandidate as Record<string, unknown>)[resource];
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      throw new Error(`Resource "${resource}" must be a number.`);
    }
    resources[resource] = amount;
  }

  if (typeof candidate.festivalUsed !== "boolean") {
    throw new Error("festivalUsed must be a boolean value.");
  }

  if (
    candidate.income !== undefined &&
    (typeof candidate.income !== "string" || !INCOME_TYPE_SET.has(candidate.income as IncomeType))
  ) {
    throw new Error("income must be one of the supported income options.");
  }

  if (
    candidate.edict !== undefined &&
    (typeof candidate.edict !== "string" || !EDICT_TYPE_SET.has(candidate.edict as EdictType))
  ) {
    throw new Error("edict must be one of the supported edict options.");
  }

  if (
    candidate.incomeTurn !== undefined &&
    (typeof candidate.incomeTurn !== "number" || !Number.isFinite(candidate.incomeTurn))
  ) {
    throw new Error("incomeTurn must be a number when provided.");
  }

  if (
    candidate.edictTurn !== undefined &&
    (typeof candidate.edictTurn !== "number" || !Number.isFinite(candidate.edictTurn))
  ) {
    throw new Error("edictTurn must be a number when provided.");
  }

  const {
    projects,
    recruitments,
    captains,
    troops,
    missions,
    events,
    notes,
    sessions,
    turnHistory
  } = candidate;

  if (!projects || !Array.isArray(projects)) {
    throw new Error("projects must be an array.");
  }
  if (!recruitments || !Array.isArray(recruitments)) {
    throw new Error("recruitments must be an array.");
  }
  if (!captains || !Array.isArray(captains)) {
    throw new Error("captains must be an array.");
  }
  if (!troops || !Array.isArray(troops)) {
    throw new Error("troops must be an array.");
  }
  if (!missions || !Array.isArray(missions)) {
    throw new Error("missions must be an array.");
  }
  if (!events || !Array.isArray(events)) {
    throw new Error("events must be an array.");
  }
  if (!notes || !Array.isArray(notes)) {
    throw new Error("notes must be an array.");
  }
  if (!sessions || !Array.isArray(sessions)) {
    throw new Error("sessions must be an array.");
  }
  if (!turnHistory || !Array.isArray(turnHistory)) {
    throw new Error("turnHistory must be an array of strings.");
  }
  if (!turnHistory.every((entry) => typeof entry === "string")) {
    throw new Error("turnHistory must contain only string entries.");
  }

  return {
    turn: candidate.turn,
    activePhase: candidate.activePhase as PhaseKey,
    resources,
    festivalUsed: candidate.festivalUsed,
    income: candidate.income as IncomeType | undefined,
    incomeTurn: candidate.incomeTurn,
    edict: candidate.edict as EdictType | undefined,
    edictTurn: candidate.edictTurn,
    projects: projects as StrongholdData["projects"],
    recruitments: recruitments as StrongholdData["recruitments"],
    captains: captains as StrongholdData["captains"],
    troops: troops as StrongholdData["troops"],
    missions: missions as StrongholdData["missions"],
    events: events as StrongholdData["events"],
    notes: notes as StrongholdData["notes"],
    sessions: sessions as StrongholdData["sessions"],
    turnHistory: turnHistory as StrongholdData["turnHistory"]
  };
}

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
  const [importFeedback, setImportFeedback] = useState<
    { type: "error" | "success"; message: string } | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleStartImport = useCallback(() => {
    if (isLocked) return;
    setImportFeedback(null);
    fileInputRef.current?.click();
  }, [isLocked]);

  const handleImportFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportFeedback(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result;
        if (typeof result !== "string") {
          throw new Error("Unable to read the selected file.");
        }
        const parsed = JSON.parse(result);
        const snapshot = validateStrongholdData(parsed);
        useStrongholdStore.getState().hydrateFromSnapshot(snapshot);
        setImportFeedback({
          type: "success",
          message:
            "Backup imported successfully. Review the campaign to confirm everything looks correct."
        });
      } catch (error) {
        console.error("Failed to import Stronghold snapshot:", error);
        setImportFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to import the selected file."
        });
      }
    };
    reader.onerror = () => {
      console.error("Failed to read Stronghold snapshot file:", reader.error);
      setImportFeedback({
        type: "error",
        message: "Unable to read the selected file."
      });
    };
    reader.readAsText(file);
    event.target.value = "";
  }, []);

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
              <Link
                href="/viewer"
                className="inline-flex items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-300 hover:bg-indigo-500/20"
              >
                Open Player View
              </Link>
              <button
                onClick={handleStartImport}
                disabled={isLocked}
                className="rounded-full border border-white/10 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Import JSON
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
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImportFile}
              />
              {importFeedback && (
                <p
                  className={clsx(
                    "text-xs sm:text-sm",
                    "sm:basis-full",
                    importFeedback.type === "error" ? "text-rose-300" : "text-emerald-300"
                  )}
                >
                  {importFeedback.message}
                </p>
              )}
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
