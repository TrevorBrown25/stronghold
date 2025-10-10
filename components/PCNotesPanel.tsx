"use client";

import { useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { useStrongholdStore } from "@/lib/store";

export function PCNotesPanel() {
  const notes = useStrongholdStore((state) => state.notes);
  const addNote = useStrongholdStore((state) => state.addNote);
  const [player, setPlayer] = useState("");
  const [details, setDetails] = useState("");
  const isLocked = useEditLockStore(selectIsLocked);

  const handleAdd = () => {
    if (isLocked) return;
    if (!player || !details) return;
    addNote({ player, details });
    setPlayer("");
    setDetails("");
  };

  return (
    <section className="glass-panel flex flex-col gap-3">
      <header>
        <h2 className="font-display text-2xl text-slate-100">PC Actions</h2>
        <p className="text-sm text-slate-400">Log what the party tackles this turn.</p>
      </header>
      <div className="glass-section flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={player}
            onChange={(event) => setPlayer(event.target.value)}
            className="input-field flex-1 rounded-full"
            placeholder="Player or PC name"
            readOnly={isLocked}
          />
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            className="input-field flex-1"
            placeholder="Action notes"
            rows={2}
            readOnly={isLocked}
          />
          <button
            onClick={handleAdd}
            disabled={isLocked}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Action
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {notes
          .slice()
          .reverse()
          .map((note) => (
            <div key={note.id} className="glass-section text-sm">
              <p className="font-semibold text-white">{note.player}</p>
              <p className="text-xs text-slate-500">Turn {note.turn}</p>
              <p className="text-slate-200">{note.details}</p>
            </div>
          ))}
        {notes.length === 0 && (
          <p className="glass-section text-sm text-slate-400">
            Record downtime actions, negotiations, or stronghold scenes here.
          </p>
        )}
      </div>
    </section>
  );
}
