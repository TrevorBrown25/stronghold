"use client";

import { useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";
import { useStrongholdStore } from "@/lib/store";

export function EventsPanel() {
  const events = useStrongholdStore((state) => state.events);
  const addEvent = useStrongholdStore((state) => state.addEvent);
  const toggleEventResolved = useStrongholdStore((state) => state.toggleEventResolved);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const isLocked = useEditLockStore(selectIsLocked);

  const handleAdd = () => {
    if (isLocked) return;
    if (!title) return;
    addEvent({ title, description, resolved: false });
    setTitle("");
    setDescription("");
  };

  return (
    <section className="glass-panel flex flex-col gap-3">
      <header>
        <h2 className="font-display text-2xl text-slate-100">Events</h2>
        <p className="text-sm text-slate-400">
          Track DM-triggered plot hooks or random happenings.
        </p>
      </header>
      <div className="glass-section flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Event title"
            className="input-field flex-1 rounded-full"
            readOnly={isLocked}
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Event details or outcomes"
            className="input-field flex-1"
            rows={2}
            readOnly={isLocked}
          />
          <button
            onClick={handleAdd}
            disabled={isLocked}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_-18px_rgba(79,70,229,0.8)] transition hover:from-indigo-400 hover:via-blue-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Event
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {events
          .slice()
          .reverse()
          .map((event) => (
            <div key={event.id} className="glass-section text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white">{event.title}</h3>
                  <p className="text-xs text-slate-500">Turn {event.turn}</p>
                </div>
                <button
                  onClick={() => toggleEventResolved(event.id)}
                  disabled={isLocked}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    event.resolved
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                      : "border-amber-400/60 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  {event.resolved ? "Resolved" : "Pending"}
                </button>
              </div>
              {event.description && <p className="mt-2 text-slate-300">{event.description}</p>}
            </div>
          ))}
        {events.length === 0 && (
          <p className="glass-section text-sm text-slate-400">
            Record notable developments that affect future turns.
          </p>
        )}
      </div>
    </section>
  );
}
