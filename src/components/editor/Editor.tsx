import { useState } from "react";
import EditorTabs from "./EditorTabs";
import type { EditorTabData } from "./EditorTab";
import CodeEditor from "./CodeEditor";
import Terminal from "../terminal/Terminal";
import { useKeyboardShortcut } from "../../hooks/useKeyboardShortcut";
import { SHORTCUTS } from "../../conf/shortcut";

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
type Props = {
  terminalOpen: boolean;
  handleTerminalClose: () => void;
};
export default function Editor({ terminalOpen, handleTerminalClose }: Props) {
  const [tabs, setTabs] = useState<EditorTabData[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  useKeyboardShortcut(SHORTCUTS.toggleTerminal, () => {
    handleTerminalClose();
  });
  // Aktif dosyayı bul
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const handleRun = () => {
    if (!activeTab) {
      return;
    }

    console.log("Running:", activeTab.name);
    console.log(activeTab.content);
  };
  // Tab seçildiğinde
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  // Tab kapatıldığında
  const handleCloseTab = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);

    const newTabs = tabs.filter((tab) => tab.id !== id);

    setTabs(newTabs);

    // Kapatılan tab aktif tab ise
    if (id === activeTabId) {
      const nextTab = newTabs[index] ?? newTabs[index - 1];

      setActiveTabId(nextTab?.id ?? null);
    }
  };
  const handleChangeTabContent = (value: string | undefined) => {
    if (value === undefined || !activeTabId) {
      return;
    }
    console.log(activeTabId);
    setTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              content: value,
              modified: true,
            }
          : tab,
      ),
    );
  };

  // Yeni tab
  const handleNewTab = () => {
    const newTab: EditorTabData = {
      id: `untitled-${Date.now()}`,
      name: "Untitled-1",
      language: "typescript",
      content: "",
      modified: true,
    };

    setTabs((currentTabs) => [...currentTabs, newTab]);

    setActiveTabId(newTab.id);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Editor Tabs */}

      <EditorTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onRun={handleRun}
      />

      {/* Editor Content */}

      <div className="min-h-0 flex-1">
        {activeTab ? (
          <CodeEditor
            key={activeTab.id}
            content={activeTab.content}
            language={activeTab.language}
            handleChange={handleChangeTabContent}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-foreground-muted">
              No file opened
            </span>
          </div>
        )}
      </div>
      {terminalOpen && <Terminal onClose={handleTerminalClose} />}
    </div>
  );
}
