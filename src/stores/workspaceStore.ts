import { create } from "zustand";

export type WorkspaceEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

type WorkspaceState = {
  rootPath: string | null;
  rootName: string | null;
  entries: WorkspaceEntry[];
  childrenByPath: Record<string, WorkspaceEntry[]>;
  loadingPaths: Record<string, boolean>;
  openWorkspace: () => Promise<boolean>;
  loadDirectory: (directoryPath: string) => Promise<void>;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  rootPath: null,
  rootName: null,
  entries: [],
  childrenByPath: {},
  loadingPaths: {},
  openWorkspace: async () => {
    try {
      const result = await window.ipcRenderer.invoke("workspace:open");

      if (!result?.success) {
        return false;
      }

      set({
        rootPath: result.rootPath,
        rootName: result.rootName,
        entries: result.entries,
        childrenByPath: {},
        loadingPaths: {},
      });
      return true;
    } catch (error) {
      console.error("Workspace open failed:", error);
      return false;
    }
  },
  loadDirectory: async (directoryPath) => {
    const { childrenByPath, loadingPaths } = get();
    if (childrenByPath[directoryPath] || loadingPaths[directoryPath]) {
      return;
    }

    set((state) => ({
      loadingPaths: { ...state.loadingPaths, [directoryPath]: true },
    }));

    try {
      const entries = await window.ipcRenderer.invoke(
        "workspace:read-directory",
        directoryPath,
      );
      set((state) => ({
        childrenByPath: { ...state.childrenByPath, [directoryPath]: entries },
        loadingPaths: { ...state.loadingPaths, [directoryPath]: false },
      }));
    } catch (error) {
      console.error("Directory read failed:", error);
      set((state) => ({
        loadingPaths: { ...state.loadingPaths, [directoryPath]: false },
      }));
    }
  },
}));
