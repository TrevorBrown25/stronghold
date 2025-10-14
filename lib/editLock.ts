"use client";

import { create } from "zustand";

const PASSWORD = process.env.NEXT_PUBLIC_EDIT_PASSWORD ?? "Gengar";

interface EditLockState {
  isLocked: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

export const useEditLockStore = create<EditLockState>((set) => ({
  isLocked: true,
  unlock: (password) => {
    if (password === PASSWORD) {
      set({ isLocked: false });
      return true;
    }
    return false;
  },
  lock: () => set({ isLocked: true })
}));

export const selectIsLocked = (state: EditLockState) => state.isLocked;
