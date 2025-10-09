"use client";

import { useCallback, useState } from "react";

import { CaptainsPanel } from "@/components/CaptainsPanel";
import { EventsPanel } from "@/components/EventsPanel";
import { IncomePanel } from "@/components/IncomePanel";
import { MissionsPanel } from "@/components/MissionsPanel";
import { PCNotesPanel } from "@/components/PCNotesPanel";
import { PhaseSidebar } from "@/components/PhaseSidebar";
import { ProjectsPanel } from "@/components/ProjectsPanel";
import { RecruitmentPanel } from "@/components/RecruitmentPanel";
import { ResourceTracker } from "@/components/ResourceTracker";
import { TroopTable } from "@/components/TroopTable";
import { TurnSummaryModal } from "@/components/TurnSummaryModal";
import { ResetConfirmationModal } from "@/components/ResetConfirmationModal";
import { useStrongholdStore } from "@/lib/store";

export default function Home() {
  const activePhase = useStrongholdStore((state) => state.activePhase);
  const nextPhase = useStrongholdStore((state) => state.nextPhase);
  const completeTurn = useStrongholdStore((state) => state.completeTurn);
  const exportState = useStrongholdStore((state) => state.exportState);
  const resetCampaign = useStrongholdStore((state) => state.resetCampaign);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleEndTurn = useCallback(() => {
    setSummaryOpen(true);
  }, []);

  const handleCloseSummary = useCallback(() => {
    setSummaryOpen(false);
  }, []);

  const handleConfirmTurn = useCallback(() => {
    completeTurn();
    setSummaryOpen(false);
  }, [completeTurn]);

  const handleExport = () => {
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

  const renderPhaseContent = () => {
    switch (activePhase) {
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
  };

  return (
    <main className="min-h-screen bg-parchment p-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        <PhaseSidebar onCompleteTurn={handleEndTurn} />
        <div className="flex flex-1 flex-col gap-6">
          <ResourceTracker />
          {renderPhaseContent()}
          {activePhase === "Missions" && <CaptainsPanel />}
          <TroopTable />
          <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white/70 p-4 shadow-lg">
            <button
              onClick={nextPhase}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              Next Phase
            </button>
            <button
              onClick={handleExport}
              className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold hover:bg-ink/20"
            >
              Export JSON
            </button>
            <button
              onClick={handleOpenResetConfirm}
              className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Reset Campaign
            </button>
          </div>
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
