import { create } from "zustand";

type GitState = {
  historyVersion: number;
  changeCount: number;
  refreshHistory: () => void;
  setChangeCount: (count: number) => void;
};

export const useGitStore = create<GitState>((set) => ({
  historyVersion: 0,
  changeCount: 0,
  refreshHistory: () => set((state) => ({ historyVersion: state.historyVersion + 1 })),
  setChangeCount: (changeCount) => set({ changeCount }),
}));
