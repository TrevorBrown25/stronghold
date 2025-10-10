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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-3xl bg-parchment p-6 shadow-2xl">
        <h2 id={titleId} className="font-display text-2xl">
          Reset Campaign
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-ink/70">
          This will erase all current progress and return every tracker to its starting
          state. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold hover:bg-ink/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Reset Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
