"use client";

import { useEffect, useMemo } from "react";
import { clsx } from "clsx";

import { ViewerDashboard } from "@/components/ViewerDashboard";
import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { subscribeToRefresh } from "@/lib/refreshChannel";
import { useSupabaseSync } from "@/lib/useSupabaseSync";
import { useStrongholdStore } from "@/lib/store";

export default function ViewerPage() {
  const lockEditing = useEditLockStore((state) => state.lock);
  const isLocked = useEditLockStore(selectIsLocked);
  const { status: syncStatus, error: syncError, lastSyncedAt, enabled: syncEnabled } =
    useSupabaseSync("viewer");

  const activePhase = useStrongholdStore((state) => state.activePhase);

  useEffect(() => {
    if (!isLocked) {
      lockEditing();
    }
  }, [isLocked, lockEditing]);

  useEffect(() => {
    const unsubscribe = subscribeToRefresh(() => {
      window.location.reload();
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
              Explore a comprehensive read-only dashboard of the current stronghold state.
            </p>
            <p className="text-xs text-slate-500">Currently tracking the {activePhase} phase.</p>
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
      <div className="mx-auto w-full max-w-7xl">
        <ViewerDashboard />
      </div>
    </main>
  );
}
