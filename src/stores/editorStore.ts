import { create } from "zustand";
import type { EditorTabData } from "../components/editor/EditorTab";

const extensionByLanguage: Record<NonNullable<EditorTabData["language"]>, string> = {
  typescript: "ts",
  javascript: "js",
  json: "json",
  css: "css",
  html: "html",
};

function languageFromFilePath(filePath: string): EditorTabData["language"] {
  const extension = filePath.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "ts":
    case "tsx":
      return "typescript";
    case "json":
      return "json";
    case "css":
      return "css";
    case "html":
    case "htm":
      return "html";
    default:
      return "javascript";
  }
}

const initialTabs: EditorTabData[] = [];

type EditorState = {
  tabs: EditorTabData[];
  activeTabId: string | null;
  selectTab: (id: string) => void;
  closeTab: (id: string) => void;
  closeActiveTab: () => void;
  updateActiveTabContent: (content: string) => void;
  createNewFile: () => void;
  openFile: () => Promise<boolean>;
  openFileFromPath: (filePath: string) => Promise<boolean>;
  saveActiveFile: () => Promise<boolean>;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: initialTabs,
  activeTabId: null,
  selectTab: (activeTabId) => set({ activeTabId }),
  closeTab: (id) =>
    set((state) => {
      const index = state.tabs.findIndex((tab) => tab.id === id);
      const tabs = state.tabs.filter((tab) => tab.id !== id);

      if (id !== state.activeTabId) {
        return { tabs };
      }

      const nextTab = tabs[index] ?? tabs[index - 1];
      return { tabs, activeTabId: nextTab?.id ?? null };
    }),
  closeActiveTab: () =>
    set((state) => {
      if (!state.activeTabId) {
        return state;
      }

      const index = state.tabs.findIndex(
        (tab) => tab.id === state.activeTabId,
      );
      const tabs = state.tabs.filter((tab) => tab.id !== state.activeTabId);
      const nextTab = tabs[index] ?? tabs[index - 1];

      return { tabs, activeTabId: nextTab?.id ?? null };
    }),
  updateActiveTabContent: (content) =>
    set((state) => {
      if (!state.activeTabId) {
        return state;
      }

      return {
        tabs: state.tabs.map((tab) =>
          tab.id === state.activeTabId
            ? { ...tab, content, modified: true }
            : tab,
        ),
      };
    }),
  createNewFile: () =>
    set((state) => {
      const untitledNumber =
        state.tabs.filter((tab) => tab.name.startsWith("Untitled-")).length + 1;
      const newTab: EditorTabData = {
        id: `untitled-${Date.now()}`,
        name: `Untitled-${untitledNumber}`,
        language: "javascript",
        content: "",
        modified: true,
      };

      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      };
    }),
  openFile: async () => {
    try {
      const result = await window.ipcRenderer.invoke("file:open");
      return addOpenedFile(result, set, get);
    } catch (error) {
      console.error("File open failed:", error);
      return false;
    }
  },
  openFileFromPath: async (filePath) => {
    const existingTab = get().tabs.find((tab) => tab.path === filePath);
    if (existingTab) {
      set({ activeTabId: existingTab.id });
      return true;
    }

    try {
      const result = await window.ipcRenderer.invoke("file:read", filePath);
      return addOpenedFile(result, set, get);
    } catch (error) {
      console.error("File open failed:", error);
      return false;
    }
  },
  saveActiveFile: async () => {
    const { activeTabId, tabs } = get();
    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    if (!activeTab) {
      return false;
    }

    try {
      if (activeTab.path) {
        await window.ipcRenderer.invoke(
          "write:file",
          activeTab.path,
          activeTab.content,
        );
      } else {
        const extension = extensionByLanguage[activeTab.language ?? "javascript"];
        const result = await window.ipcRenderer.invoke(
          "create:file",
          activeTab.name,
          extension,
          activeTab.content,
        );

        if (!result?.success || !result.filePath) {
          return false;
        }

        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === activeTab.id
              ? {
                  ...tab,
                  path: result.filePath,
                  name: result.filePath.split(/[\\/]/).pop() ?? tab.name,
                  modified: false,
                }
              : tab,
          ),
        }));
        return true;
      }

      set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === activeTab.id ? { ...tab, modified: false } : tab,
        ),
      }));
      return true;
    } catch (error) {
      console.error("File save failed:", error);
      return false;
    }
  },
}));

function addOpenedFile(
  result: { success?: boolean; filePath?: string; name?: string; content?: string } | undefined,
  set: (partial: Partial<EditorState> | ((state: EditorState) => Partial<EditorState>)) => void,
  get: () => EditorState,
) {
  if (!result?.success || !result.filePath || result.content === undefined) {
    return false;
  }

  const existingTab = get().tabs.find((tab) => tab.path === result.filePath);
  if (existingTab) {
    set({ activeTabId: existingTab.id });
    return true;
  }

  const newTab: EditorTabData = {
    id: `file-${Date.now()}`,
    name: result.name ?? result.filePath.split(/[\\/]/).pop() ?? "Untitled",
    path: result.filePath,
    language: languageFromFilePath(result.filePath),
    content: result.content,
    modified: false,
  };

  set((state) => ({
    tabs: [...state.tabs, newTab],
    activeTabId: newTab.id,
  }));
  return true;
}
