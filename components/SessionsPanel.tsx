"use client";

import { FormEvent, useMemo, useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { useStrongholdStore } from "@/lib/store";

export function SessionsPanel() {
  const sessions = useStrongholdStore((state) => state.sessions);
  const addSessionRecap = useStrongholdStore((state) => state.addSessionRecap);
  const updateSessionRecap = useStrongholdStore(
    (state) => state.updateSessionRecap
  );
  const deleteSessionRecap = useStrongholdStore(
    (state) => state.deleteSessionRecap
  );
  const isLocked = useEditLockStore(selectIsLocked);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [recap, setRecap] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [editingRecap, setEditingRecap] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isLocked) return;

    const trimmedRecap = recap.trim();
    const trimmedTitle = title.trim();
    const trimmedDate = date.trim();

    if (!trimmedRecap) {
      return;
    }

    addSessionRecap({
      title: trimmedTitle,
      recap: trimmedRecap,
      date: trimmedDate ? trimmedDate : undefined
    });

    setTitle("");
    setDate("");
    setRecap("");
  };

  const sessionsById = useMemo(() => {
    const mapping = new Map<string, (typeof sessions)[number]>();
    for (const session of sessions) {
      mapping.set(session.id, session);
    }
    return mapping;
  }, [sessions]);

  const startEditing = (sessionId: string) => {
    if (isLocked) return;
    const session = sessionsById.get(sessionId);
    if (!session) return;
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
    setEditingDate(session.date ?? "");
    setEditingRecap(session.recap);
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditingTitle("");
    setEditingDate("");
    setEditingRecap("");
  };

  const handleUpdate = () => {
    if (!editingSessionId) return;
    const trimmedTitle = editingTitle.trim();
    const trimmedDate = editingDate.trim();
    const trimmedRecap = editingRecap.trim();
    if (!trimmedRecap) return;
    const session = sessionsById.get(editingSessionId);
    if (!session) return;
    updateSessionRecap(editingSessionId, {
      title: trimmedTitle || session.title,
      recap: trimmedRecap,
      date: trimmedDate ? trimmedDate : undefined
    });
    cancelEditing();
  };

  const handleDelete = (sessionId: string) => {
    if (isLocked) return;
    deleteSessionRecap(sessionId);
    if (editingSessionId === sessionId) {
      cancelEditing();
    }
  };

  return (
    <section className="glass-panel flex flex-col gap-3">
      <header>
        <h2 className="font-display text-2xl text-slate-100">Sessions</h2>
        <p className="text-sm text-slate-400">
          Keep a private recap of each play session to reference between games.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="glass-section flex flex-col gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Session title or number"
            className="input-field rounded-full"
            readOnly={isLocked}
          />
          <input
            value={date}
            onChange={(event) => setDate(event.target.value)}
            placeholder="Session date (optional)"
            className="input-field rounded-full"
            readOnly={isLocked}
          />
        </div>
        <textarea
          value={recap}
          onChange={(event) => setRecap(event.target.value)}
          placeholder="Recap notes, major NPCs, and loose threads"
          className="input-field"
          rows={6}
          readOnly={isLocked}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLocked}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(134,25,143,0.8)] transition hover:from-fuchsia-400 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Recap
          </button>
        </div>
      </form>
      <div className="flex flex-col gap-2">
        {sessions
          .slice()
          .reverse()
          .map((session) => (
            <div key={session.id} className="glass-section flex flex-col gap-2 text-sm">
              {editingSessionId === session.id ? (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      placeholder="Session title or number"
                      className="input-field rounded-full"
                      readOnly={isLocked}
                    />
                    <input
                      value={editingDate}
                      onChange={(event) => setEditingDate(event.target.value)}
                      placeholder="Session date (optional)"
                      className="input-field rounded-full"
                      readOnly={isLocked}
                    />
                  </div>
                  <textarea
                    value={editingRecap}
                    onChange={(event) => setEditingRecap(event.target.value)}
                    placeholder="Recap notes"
                    className="input-field"
                    rows={6}
                    readOnly={isLocked}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="text-xs font-semibold text-slate-400 transition hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={isLocked}
                      className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_8px_25px_-12px_rgba(129,140,248,0.7)] transition hover:from-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-white">{session.title}</p>
                      <p className="text-xs text-slate-500">Recorded on turn {session.turn}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.date ? (
                        <span className="text-xs text-slate-400">{session.date}</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => startEditing(session.id)}
                        disabled={isLocked}
                        className="text-xs font-semibold text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(session.id)}
                        disabled={isLocked}
                        className="text-xs font-semibold text-rose-400 transition hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-slate-200">{session.recap}</p>
                </>
              )}
            </div>
          ))}
        {sessions.length === 0 && (
          <p className="glass-section text-sm text-slate-400">
            Summarize the party&apos;s progress, track NPC reactions, and note hooks to revisit next time.
          </p>
        )}
      </div>
    </section>
  );
}
