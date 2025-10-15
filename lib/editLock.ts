"use client";

import { create } from "zustand";

const ALLOWED_PASSWORDS = new Set(["Gengar"]);

interface EditLockState {
  isLocked: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

export const useEditLockStore = create<EditLockState>((set) => ({
  isLocked: true,
  unlock: (password) => {
    if (ALLOWED_PASSWORDS.has(password)) {
      set({ isLocked: false });
      return true;
    }
    return false;
  },
  lock: () => set({ isLocked: true })
}));

export const selectIsLocked = (state: EditLockState) => state.isLocked;
