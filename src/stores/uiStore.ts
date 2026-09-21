import { create } from "zustand";

type TerminalRunRequest = {
  filePath: string;
  cwd?: string;
};

export type SidebarView = "explorer" | "search" | "git";

type UiState = {
  terminalOpen: boolean;
  terminalRunRequest: TerminalRunRequest | null;
  commandPaletteOpen: boolean;
  sidebarView: SidebarView;
  setTerminalOpen: (open: boolean) => void;
  toggleTerminal: () => void;
  runFileInTerminal: (filePath: string, cwd?: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setSidebarView: (view: SidebarView) => void;
};

export const useUiStore = create<UiState>((set) => ({
  terminalOpen: false,
  terminalRunRequest: null,
  commandPaletteOpen: false,
  sidebarView: "explorer",
  setTerminalOpen: (terminalOpen) =>
    set(() =>
      terminalOpen
        ? { terminalOpen }
        : { terminalOpen, terminalRunRequest: null },
    ),
  toggleTerminal: () =>
    set((state) => ({
      terminalOpen: !state.terminalOpen,
      terminalRunRequest: state.terminalOpen ? null : state.terminalRunRequest,
    })),
  runFileInTerminal: (filePath, cwd) =>
    set({ terminalOpen: true, terminalRunRequest: { filePath, cwd } }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setSidebarView: (sidebarView) => set({ sidebarView }),
}));
