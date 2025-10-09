"use client";

import { FormEvent, useState } from "react";

import { selectIsLocked, useEditLockStore } from "@/lib/editLock";

export function EditLockBanner() {
  const isLocked = useEditLockStore(selectIsLocked);
  const unlock = useEditLockStore((state) => state.unlock);
  const lock = useEditLockStore((state) => state.lock);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      setError("Enter the password to enable editing.");
      return;
    }
    const success = unlock(password.trim());
    if (!success) {
      setError("Incorrect password. Try again.");
      return;
    }
    setPassword("");
    setError(null);
  };

  return (
    <section className="mx-auto mb-4 flex w-full max-w-7xl items-center justify-between gap-4 rounded-3xl bg-white/80 p-4 shadow-lg">
      <div>
        <h1 className="font-display text-xl text-ink">{isLocked ? "Read-only session" : "Editing enabled"}</h1>
        <p className="text-sm text-ink/70">
          {isLocked
            ? "Unlock editing with the shared password. Viewing data remains available while locked."
            : "Editing will remain active until you lock it again or refresh the page."}
        </p>
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
      </div>
      {isLocked ? (
        <form onSubmit={handleUnlock} className="flex flex-col gap-2 text-sm md:flex-row md:items-center">
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Password"
            className="rounded-full border border-ink/20 bg-white px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-2 font-semibold text-white transition hover:bg-accent-dark"
          >
            Unlock Editing
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            lock();
            setPassword("");
            setError(null);
          }}
          className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold transition hover:bg-ink/20"
        >
          Lock Editing
        </button>
      )}
    </section>
  );
}
