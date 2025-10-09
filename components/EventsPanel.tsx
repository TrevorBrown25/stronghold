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
    <section className="flex flex-col gap-3 rounded-3xl bg-white/70 p-4 shadow-lg">
      <header>
        <h2 className="font-display text-2xl">Events</h2>
        <p className="text-sm text-ink/70">
          Track DM-triggered plot hooks or random happenings.
        </p>
      </header>
      <div className="flex flex-col gap-2 rounded-2xl bg-white/60 p-3">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Event title"
            className="flex-1 rounded-full border border-ink/20 bg-white px-3 py-2 text-sm"
            readOnly={isLocked}
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Event details or outcomes"
            className="flex-1 rounded-2xl border border-ink/20 bg-white px-3 py-2 text-sm"
            rows={2}
            readOnly={isLocked}
          />
          <button
            onClick={handleAdd}
            disabled={isLocked}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink/30"
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
            <div key={event.id} className="rounded-2xl bg-white/60 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-xs text-ink/70">Turn {event.turn}</p>
                </div>
                <button
                  onClick={() => toggleEventResolved(event.id)}
                  disabled={isLocked}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    event.resolved
                      ? "bg-emerald-200 text-emerald-900"
                      : "bg-amber-200 text-amber-900"
                  }`}
                >
                  {event.resolved ? "Resolved" : "Pending"}
                </button>
              </div>
              {event.description && <p className="mt-2 text-ink/80">{event.description}</p>}
            </div>
          ))}
        {events.length === 0 && (
          <p className="rounded-2xl bg-white/60 p-3 text-sm text-ink/70">
            Record notable developments that affect future turns.
          </p>
        )}
      </div>
    </section>
  );
}
