import { create } from "zustand";
import type { EditorTabData } from "../components/editor/EditorTab";

const initialTabs: EditorTabData[] = [
  {
    id: "app-tsx",
    name: "App.js",
    path: "/src/App.js",
    language: "javascript",
    content: "",
    modified: false,
  },
  {
    id: "main-tsx",
    name: "main.js",
    path: "/src/main.js",
    language: "javascript",
    content: "",
    modified: false,
  },
  {
    id: "index-css",
    name: "index.css",
    path: "/src/index.css",
    language: "css",
    content: "",
    modified: false,
  },
];

type EditorState = {
  tabs: EditorTabData[];
  activeTabId: string | null;
  selectTab: (id: string) => void;
  closeTab: (id: string) => void;
  closeActiveTab: () => void;
  updateActiveTabContent: (content: string) => void;
  createNewFile: () => void;
};

export const useEditorStore = create<EditorState>((set) => ({
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
        language: "typescript",
        content: "",
        modified: true,
      };

      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      };
    }),
}));
