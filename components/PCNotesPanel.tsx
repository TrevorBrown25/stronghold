"use client";

import { useState } from "react";

import { useStrongholdStore } from "@/lib/store";

export function PCNotesPanel() {
  const notes = useStrongholdStore((state) => state.notes);
  const addNote = useStrongholdStore((state) => state.addNote);
  const [player, setPlayer] = useState("");
  const [details, setDetails] = useState("");

  const handleAdd = () => {
    if (!player || !details) return;
    addNote({ player, details });
    setPlayer("");
    setDetails("");
  };

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header>
        <h2 className="font-display text-2xl">PC Actions</h2>
        <p className="text-sm text-ink/70">Log what the party tackles this turn.</p>
      </header>
      <div className="flex flex-col gap-2 rounded-2xl bg-white/60 p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={player}
            onChange={(event) => setPlayer(event.target.value)}
            className="flex-1 rounded-full border border-ink/20 bg-white px-3 py-2 text-sm"
            placeholder="Player or PC name"
          />
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            className="flex-1 rounded-2xl border border-ink/20 bg-white px-3 py-2 text-sm"
            placeholder="Action notes"
            rows={2}
          />
          <button
            onClick={handleAdd}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
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
            <div key={note.id} className="rounded-2xl bg-white/60 p-3 text-sm">
              <p className="font-semibold">{note.player}</p>
              <p className="text-xs text-ink/70">Turn {note.turn}</p>
              <p>{note.details}</p>
            </div>
          ))}
        {notes.length === 0 && (
          <p className="rounded-2xl bg-white/60 p-3 text-sm text-ink/70">
            Record downtime actions, negotiations, or stronghold scenes here.
          </p>
        )}
      </div>
    </section>
  );
}
