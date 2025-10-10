"use client";

import {
  useEffect,
  useId,
  type MouseEvent as ReactMouseEvent
} from "react";

interface ResetConfirmationModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetConfirmationModal({
  open,
  onCancel,
  onConfirm,
}: ResetConfirmationModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-[0_35px_70px_-35px_rgba(0,0,0,0.9)]">
        <h2 id={titleId} className="font-display text-2xl text-white">
          Reset Campaign
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-slate-300">
          This will erase all current progress and return every tracker to its starting
          state. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full border border-rose-500/50 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-400 hover:bg-rose-500/30"
          >
            Reset Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
