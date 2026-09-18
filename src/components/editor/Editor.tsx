import EditorTabs from "./EditorTabs";
import CodeEditor from "./CodeEditor";
import Terminal from "../terminal/Terminal";
import EditorEmptyState from "../layout/EditorEmptyState";
import { useUiStore } from "../../stores/uiStore";
import { useEditorStore } from "../../stores/editorStore";

export default function Editor() {
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
  // Aktif dosyayı bul
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const handleRun = () => {
    if (!activeTab) {
      return;
    }

    console.log("Running:", activeTab.name);
    console.log(activeTab.content);
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
      {terminalOpen && <Terminal onClose={() => setTerminalOpen(false)} />}
    </div>
  );
}
