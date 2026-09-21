import { create } from "zustand";

export type ShortcutId =
  | "toggleTerminal"
  | "newFile"
  | "openFile"
  | "openFolder"
  | "save"
  | "closeTab"
  | "commandPalette";

export type Shortcut = {
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  ctrl?: boolean;
};

export const DEFAULT_SHORTCUTS: Record<ShortcutId, Shortcut> = {
  toggleTerminal: { key: "j", meta: true },
  newFile: { key: "n", meta: true },
  openFile: { key: "o", meta: true },
  openFolder: { key: "o", meta: true, shift: true },
  save: { key: "s", meta: true },
  closeTab: { key: "w", meta: true },
  commandPalette: { key: "p", meta: true },
};

type ShortcutState = {
  shortcuts: Record<ShortcutId, Shortcut>;
  enabledShortcuts: Record<ShortcutId, boolean>;
  setShortcut: (id: ShortcutId, shortcut: Shortcut) => void;
  setShortcutEnabled: (id: ShortcutId, enabled: boolean) => void;
  resetShortcut: (id: ShortcutId) => void;
};

const enabledByDefault = Object.keys(DEFAULT_SHORTCUTS).reduce(
  (enabled, id) => ({ ...enabled, [id]: true }),
  {} as Record<ShortcutId, boolean>,
);

export const useShortcutStore = create<ShortcutState>((set) => ({
  shortcuts: DEFAULT_SHORTCUTS,
  enabledShortcuts: enabledByDefault,
  setShortcut: (id, shortcut) =>
    set((state) => ({
      shortcuts: { ...state.shortcuts, [id]: shortcut },
    })),
  setShortcutEnabled: (id, enabled) =>
    set((state) => ({
      enabledShortcuts: { ...state.enabledShortcuts, [id]: enabled },
    })),
  resetShortcut: (id) =>
    set((state) => ({
      shortcuts: { ...state.shortcuts, [id]: DEFAULT_SHORTCUTS[id] },
      enabledShortcuts: { ...state.enabledShortcuts, [id]: true },
    })),
}));
