"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { getSupabaseClient } from "./supabaseClient";
import { StrongholdData, useStrongholdStore } from "./store";

function createSnapshot(state: StrongholdData): StrongholdData {
  return JSON.parse(
    JSON.stringify({
      turn: state.turn,
      activePhase: state.activePhase,
      resources: state.resources,
      festivalUsed: state.festivalUsed,
      income: state.income,
      incomeTurn: state.incomeTurn,
      edict: state.edict,
      edictTurn: state.edictTurn,
      projects: state.projects,
      recruitments: state.recruitments,
      captains: state.captains,
      troops: state.troops,
      missions: state.missions,
      events: state.events,
      notes: state.notes,
      turnHistory: state.turnHistory
    })
  ) as StrongholdData;
}

function snapshotsMatch(a: StrongholdData | undefined, b: StrongholdData | undefined) {
  if (!b) {
    return true;
  }

  if (!a) {
    return false;
  }

  return JSON.stringify(a) === JSON.stringify(b);
}

export type SyncStatus = "disabled" | "connecting" | "ready" | "error";

export function useSupabaseSync(role: "dm" | "viewer") {
  const supabase = getSupabaseClient();
  const hydrate = useStrongholdStore((state) => state.hydrateFromSnapshot);
  const suppressNextPush = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [status, setStatus] = useState<SyncStatus>(supabase ? "connecting" : "disabled");
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const campaignId = process.env.NEXT_PUBLIC_SUPABASE_CAMPAIGN_ID ?? "primary";
  const tableName = process.env.NEXT_PUBLIC_SUPABASE_TABLE ?? "campaign_states";

  useEffect(() => {
    if (!supabase) {
      setStatus("disabled");
      setError(null);
      setLastSyncedAt(null);
      return;
    }

    let cancelled = false;
    setStatus("connecting");
    setError(null);

    const loadInitial = async () => {
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select("state, updated_at")
        .eq("id", campaignId)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setStatus("error");
        setError(fetchError.message);
        return;
      }

      if (data?.state) {
        suppressNextPush.current = true;
        hydrate(data.state as StrongholdData);
        setLastSyncedAt(
          data.updated_at ? new Date(data.updated_at) : new Date()
        );
      } else if (role === "dm") {
        const snapshot = useStrongholdStore.getState().getSnapshot();
        const { error: upsertError } = await supabase
          .from(tableName)
          .upsert(
            {
              id: campaignId,
              state: snapshot,
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );

        if (cancelled) return;

        if (upsertError) {
          setStatus("error");
          setError(upsertError.message);
          return;
        }

        setLastSyncedAt(new Date());
      }

      if (!cancelled) {
        setStatus("ready");
      }
    };

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, [campaignId, role, supabase, tableName, hydrate]);

  useEffect(() => {
    if (!supabase || status !== "ready") {
      return;
    }

    const channel = supabase
      .channel(`stronghold-${campaignId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: tableName, filter: `id=eq.${campaignId}` },
        (payload) => {
          const next = (payload.new as { state?: StrongholdData } | null)?.state;
          if (!next) {
            return;
          }
          suppressNextPush.current = true;
          hydrate(next);
          setLastSyncedAt(
            payload.commit_timestamp
              ? new Date(payload.commit_timestamp)
              : new Date()
          );
        }
      )
      .subscribe((event) => {
        if (event === "CHANNEL_ERROR") {
          setStatus("error");
          setError("Realtime subscription failed.");
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [campaignId, hydrate, status, supabase, tableName]);

  useEffect(() => {
    if (!supabase || role !== "dm" || status !== "ready") {
      return;
    }

    const unsubscribe = useStrongholdStore.subscribe(
      async (snapshot, previousSnapshot) => {
        if (suppressNextPush.current) {
          suppressNextPush.current = false;
          return;
        }

        if (snapshotsMatch(snapshot, previousSnapshot)) {
          return;
        }

        const { error: pushError } = await supabase
          .from(tableName)
          .upsert(
            {
              id: campaignId,
              state: snapshot,
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );

        if (pushError) {
          setStatus("error");
          setError(pushError.message);
          return;
        }

        setLastSyncedAt(new Date());
      },
      (state) => createSnapshot(state)
    );

    return unsubscribe;
  }, [campaignId, role, status, supabase, tableName]);

  return {
    status,
    error,
    lastSyncedAt,
    enabled: Boolean(supabase)
  };
}
