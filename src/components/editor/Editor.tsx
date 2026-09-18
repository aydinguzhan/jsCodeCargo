import EditorTabs from "./EditorTabs";
import CodeEditor from "./CodeEditor";
import Terminal from "../terminal/Terminal";
import EditorEmptyState from "../layout/EditorEmptyState";
import { useUiStore } from "../../stores/uiStore";
import { useEditorStore } from "../../stores/editorStore";
import { useState } from "react";

export default function Editor() {
  const [codeOutput, setCodeOutPut] = useState<string[]>([]);
  const tabs = useEditorStore((state) => state.tabs);
  const activeTabId = useEditorStore((state) => state.activeTabId);
  const selectTab = useEditorStore((state) => state.selectTab);
  const closeTab = useEditorStore((state) => state.closeTab);
  const updateActiveTabContent = useEditorStore(
    (state) => state.updateActiveTabContent,
  );
  const createNewFile = useEditorStore((state) => state.createNewFile);
  const terminalOpen = useUiStore((state) => state.terminalOpen);
  const setTerminalOpen = useUiStore((state) => state.setTerminalOpen);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const handleRun = async () => {
    if (!activeTab) {
      return;
    }
    const result = await window.ipcRenderer.invoke(
      "terminal:run",
      `${activeTab.content}`,
    );
    setCodeOutPut((prev) => {
      return [...prev, result?.stdout ?? result?.stdin];
    });
  };
  const handleClearTerminal = () => {
    setCodeOutPut([]);
  };
  const handleChangeTabContent = (value: string | undefined) => {
    if (value === undefined) {
      return;
    }
    updateActiveTabContent(value);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Editor Tabs */}

      <EditorTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={selectTab}
        onCloseTab={closeTab}
        onNewTab={createNewFile}
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
          <EditorEmptyState />
        )}
      </div>
      {terminalOpen && (
        <Terminal
          key={codeOutput.length}
          onClose={() => setTerminalOpen(false)}
          outPut={codeOutput}
          onReset={handleClearTerminal}
        />
      )}
    </div>
  );
}
